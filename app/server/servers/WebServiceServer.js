
'use strict';

/**
 * @module core-servers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var bodyParser = require('body-parser');
var Server = process.require('app/server/servers/Server.js');
var oAuth = process.require('app/server/oauth/oAuth.js');
var routeLoader = process.require('app/server/loaders/routeLoader.js');
var entityLoader = process.require('/app/server/loaders/entityLoader.js');
var OAuthController = process.require('app/server/controllers/OAuthController.js');
var ErrorController = process.require('app/server/controllers/ErrorController.js');
var expressThumbnail = process.require('app/server/servers/ExpressThumbnail.js');

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
  Server.call(this, configuration);

  /**
   * migrations Script description object.
   *
   * @property migrations
   * @type Object
   */
  this.migrations = {};

  // Log each request
  this.app.use(openVeoAPI.middlewares.logRequestMiddleware);

  // Load all middlewares which need to operate
  // on each request
  this.app.use(bodyParser.urlencoded({
    extended: true
  }));
  this.app.use(bodyParser.json());

  // Web service routes
  this.app.use(oAuth.inject());
  this.app.post('/token', oAuth.controller.token);

  // no need to authent, validateScope nor disable cache for request url ending by
  // .jpg || .jpeg || .jpg?thumb=param || .jpeg?thumb=param with param up to 10 chars.
  var allPathExceptImages = /^(?!.*[\.](jpg|jpeg)(\?thumb=.{1,10})?$)/;
  this.app.all(allPathExceptImages, oAuth.middleware.bearer);
  this.app.all(allPathExceptImages, oAuthController.validateScopesAction);

  // Disable cache on get requests
  this.app.get(allPathExceptImages, openVeoAPI.middlewares.disableCacheMiddleware);
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
  callback();
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
  var self = this;

  // Build web service routes
  if (plugin.webServiceRouter && plugin.webServiceRoutes && plugin.mountPath) {
    routeLoader.applyRoutes(routeLoader.decodeRoutes(plugin.path, plugin.webServiceRoutes), plugin.webServiceRouter);
  }

  // Build routes for entities
  if (plugin.webServiceRouter && plugin.entities) {
    var entitiesRoutes = entityLoader.buildEntitiesRoutes(plugin.entities);
    routeLoader.applyRoutes(routeLoader.decodeRoutes(plugin.path, entitiesRoutes), plugin.webServiceRouter);
  }

  // Mount plugin Web Service router to the plugin mount path
  if (plugin.webServiceRouter) {
    process.logger.info('Mount ' + plugin.name + ' web service router on ' + plugin.mountPath);
    this.app.use(plugin.mountPath, plugin.webServiceRouter);
  }

  // Update migation script to apply
  if (plugin.migrations)
    this.migrations[plugin.name] = plugin.migrations;

  // Found images folders to process
  if (plugin.imagesFolders) {
    var imagesStyles = {};

    if (plugin.imagesStyle) {
      for (var attrname in plugin.imagesStyle)
        imagesStyles[attrname] = plugin.imagesStyle[attrname];
    }

    // Set thumbnail generator on image folders
    plugin.imagesFolders.forEach(function(folder) {
      process.logger.info('Mount ' + folder + ' thumbnail generator on ' + plugin.mountPath);
      self.app.use(plugin.mountPath, expressThumbnail.register(folder + '/', {
        imagesStyle: imagesStyles
      }));
    });
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
