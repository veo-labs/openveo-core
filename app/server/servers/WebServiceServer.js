
'use strict';

/**
 * @module core-servers
 */

var path = require('path');
var util = require('util');
var express = require('express');
var openVeoAPI = require('@openveo/api');
var bodyParser = require('body-parser');
var Server = process.require('app/server/servers/Server.js');
var oAuth = process.require('app/server/oauth/oAuth.js');
var routeLoader = process.require('app/server/loaders/routeLoader.js');
var migrationLoader = process.require('/app/server/loaders/migrationLoader.js');
var entityLoader = process.require('/app/server/loaders/entityLoader.js');
var OAuthController = process.require('app/server/controllers/OAuthController.js');
var ErrorController = process.require('app/server/controllers/ErrorController.js');
var expressThumbnail = process.require('app/server/servers/ExpressThumbnail.js');
var conf = process.require('conf.js');

var oAuthController = new OAuthController();
var errorController = new ErrorController();

/**
 * Creates an HTTP server for the openveo web service.
 *
 * @class WebServiceServer
 * @constructor
 * @extends Server
 * @param {Object} configuration Service configuration
 */
function WebServiceServer(configuration) {
  var self = this;
  Server.call(this, configuration);

  /**
   * Back end public express router.
   *
   * @property router
   * @type Router
   */
  this.router = express.Router();

  /**
   * List of path holding images needing processing.
   *
   * @property imagesFolders
   * @type Array
   */
  this.imagesFolders = [];

  /**
   * Image styles for image processing.
   *
   * @property imagesStyle
   * @type Object
   */
  this.imagesStyle = {};

  /**
   * migrations Script description object.
   *
   * @property migrations
   * @type Object
   */
  this.migrations = {};

  // Add core image folder
  conf['imageProcessing']['imagesFolders'].forEach(function(folder) {
    self.imagesFolders.push(path.normalize(process.root + '/' + folder));
  });
  this.imagesStyle = conf['imageProcessing']['imagesStyle'] || {};

  // Log each request
  this.app.use(openVeoAPI.middlewares.logRequestMiddleware);

  // Load all middlewares which need to operate
  // on each request
  this.app.use(bodyParser.urlencoded({
    extended: true
  }));
  this.app.use(bodyParser.json());

  // Web service routes
  this.router.use(oAuth.inject());
  this.router.post('/token', oAuth.controller.token);

  // no need to authent, validateScope nor disable cache for request url ending by
  // .jpg || .jpeg || .jpg?thumb=param || .jpeg?thumb=param with param up to 10 chars.
  var allPathExceptImages = /^(?!.*[\.](jpg|jpeg)(\?thumb=.{1,10})?$)/;
  this.router.all(allPathExceptImages, oAuth.middleware.bearer);
  this.router.all(allPathExceptImages, oAuthController.validateScopesAction);

  // Disable cache on get requests
  this.app.get(allPathExceptImages, openVeoAPI.middlewares.disableCacheMiddleware);

  // Mount router
  this.app.use('/', this.router);
}

module.exports = WebServiceServer;
util.inherits(WebServiceServer, Server);

/**
 * Applies all routes, found in configuration, to the router.
 *
 * @method onDatabaseAvailable
 * @async
 * @param {Database} db The application database
 * @param {Function} callback Function to call when its done with:
 *  - **Error** An error if something went wrong
 */
WebServiceServer.prototype.onDatabaseAvailable = function(db, callback) {
  var self = this;

  // Load and apply routes to router
  routeLoader.applyRoutes(routeLoader.decodeRoutes(process.root, conf['routes']['ws']), this.router);

  // Build routes for entities
  if (conf['entities']) {
    var entitiesRoutes = entityLoader.buildEntitiesRoutes(conf['entities']);
    routeLoader.applyRoutes(routeLoader.decodeRoutes(process.root, entitiesRoutes), this.router);
  }

  // Load Core migrations script
  db.get('core-system', {name: 'core'}, null, null, function(error, value) {
    var lastVersion = '0.0.0';
    if (value && value.length) lastVersion = value[0].version;

    migrationLoader.getDiffMigrationScript(
      path.join(process.root + '/migrations'),
      lastVersion,
      function(error, migrations) {
        if (!error && migrations && Object.keys(migrations).length > 0)
          self.migrations['core'] = migrations;
      }
    );
    callback();
  });
};

/**
 * Loads plugin.
 *
 * @method onPluginLoaded
 * @param {Object} plugin The openveo plugin
 * @param {Function} callback Function to call when its done with:
 *  - **Error** An error if something went wrong
 */
WebServiceServer.prototype.onPluginLoaded = function(plugin, callback) {

  // Mount plugin Web Service router to the plugin
  // Web Service mount path
  if (plugin.webServiceRouter && plugin.webServiceRoutes && plugin.mountPath) {
    routeLoader.applyRoutes(routeLoader.decodeRoutes(plugin.path, plugin.webServiceRoutes), plugin.webServiceRouter);
    this.app.use(plugin.mountPath, plugin.webServiceRouter);
  }

  // Build routes for entities
  if (plugin.webServiceRouter && plugin.entities) {
    var entitiesRoutes = entityLoader.buildEntitiesRoutes(plugin.entities);
    routeLoader.applyRoutes(routeLoader.decodeRoutes(plugin.path, entitiesRoutes), plugin.webServiceRouter);
  }

  // Update migation script to apply
  if (plugin.migrations)
    this.migrations[plugin.name] = plugin.migrations;

  // Found images folders to process
  if (plugin.imagesFolders) {
    this.imagesFolders = this.imagesFolders.concat(plugin.imagesFolders);

    if (plugin.imagesStyle) {
      for (var attrname in plugin.imagesStyle) {
        this.imagesStyle[attrname] = plugin.imagesStyle[attrname];
      }
    }
  }

  callback();
};

/**
 * Sets errors routes.
 *
 * Sets errors routes when all plugins are loaded to handle not found
 * endpoints and errors.
 *
 * @method onPluginsLoaded
 * @method async
 * @param {Function} callback Function to call when its done with:
 *  - **Error** An error if something went wrong
 */
WebServiceServer.prototype.onPluginsLoaded = function(callback) {
  var self = this;

  // Set Thumbnail generator on image folder
  this.imagesFolders.forEach(function(folder) {
    self.app.use(expressThumbnail.register(folder + '/', {
      imagesStyle: self.imagesStyle
    }));
  });

  // Handle not found and errors
  this.app.all('*', errorController.notFoundAction);
  this.app.use(errorController.errorAction);

  callback();
};

/**
 * Starts the HTTP server.
 *
 * @method startServer
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
WebServiceServer.prototype.startServer = function(callback) {

  // Start server
  var server = this.app.listen(this.configuration.port, function(error) {
    process.logger.info('Server listening at http://%s:%s', server.address().address, server.address().port);

    // If process is a child process, send an event to parent process informing that the server has started
    if (process.connected)
      process.send({status: 'started'});

    callback(error);
  });

};
