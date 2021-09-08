
'use strict';

/**
 * @module core/servers/WebServiceServer
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var bodyParser = require('body-parser');
var Server = process.require('app/server/servers/Server.js');
var oAuth = process.require('app/server/oauth/oAuth.js');
var routeLoader = process.require('app/server/loaders/routeLoader.js');
var entityLoader = process.require('/app/server/loaders/entityLoader.js');
var OAuthController = process.require('app/server/controllers/OAuthController.js');
var ErrorController = process.require('app/server/controllers/ErrorController.js');
var storage = process.require('app/server/storage.js');
var permissionLoader = process.require('app/server/loaders/permissionLoader.js');

var oAuthController = new OAuthController();
var errorController = new ErrorController();

/**
 * Defines an HTTP server for the web service.
 *
 * @class WebServiceServer
 * @extends Server
 * @constructor
 * @param {Object} configuration Service configuration
 * @param {Number} configuration.port Web service HTTP server port
 */
function WebServiceServer(configuration) {
  WebServiceServer.super_.call(this, configuration);

  Object.defineProperties(this,

    /** @lends module:core/servers/WebServiceServer~WebServiceServer */
    {

      /**
       * migrations Script description object.
       *
       * @type {Object}
       * @instance
       * @readonly
       */
      migrations: {value: {}}

    }

  );

  // Log each request
  this.httpServer.use(openVeoApi.middlewares.logRequestMiddleware);

  // Load all middlewares which need to operate
  // on each request
  this.httpServer.use(bodyParser.urlencoded({
    extended: true
  }));
  this.httpServer.use(bodyParser.json());

  // Web service routes
  this.httpServer.use(oAuth.inject());
  this.httpServer.post('/token', oAuth.controller.token);

  // Add oauth authentication
  this.httpServer.use(oAuth.middleware.bearer);
  this.httpServer.use(oAuthController.validateScopesAction);

  // Disable cache on get requests
  this.httpServer.get('*', openVeoApi.middlewares.disableCacheMiddleware);

  // Save server configuration
  storage.setServerConfiguration(configuration);
}

module.exports = WebServiceServer;
util.inherits(WebServiceServer, Server);

/**
 * Loads plugin.
 *
 * @param {Object} plugin The openveo plugin
 * @param {callback} callback Function to call when its done
 */
WebServiceServer.prototype.onPluginLoaded = function(plugin, callback) {
  process.logger.info('Start loading plugin ' + plugin.name);

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
    this.httpServer.use(plugin.mountPath, plugin.webServiceRouter);
  }

  // Update migation script to apply
  if (plugin.migrations)
    this.migrations[plugin.name] = plugin.migrations;

  process.logger.info(plugin.name + ' plugin loaded');
  callback();
};

/**
 * Sets errors routes.
 *
 * Sets errors routes when all plugins are loaded to handle not found
 * endpoints and errors.
 *
 * @param {callback} callback Function to call when its done with:
 */
WebServiceServer.prototype.onPluginsLoaded = function(callback) {
  var plugins = process.api.getPlugins();
  var entities = storage.getEntities();

  // Handle not found and errors
  this.httpServer.all('*', errorController.notFoundAction);
  this.httpServer.use(errorController.errorAction);

  // Build permissions
  permissionLoader.buildPermissions(entities, plugins, function(error, permissions) {
    if (error) return callback(error);

    // Store application's permissions
    storage.setPermissions(permissions);

    callback();
  });
};

/**
 * Starts the HTTP server.
 *
 * @param {callback} callback Function to call when it's done
 */
WebServiceServer.prototype.startServer = function(callback) {

  // Start server
  var server = this.httpServer.listen(this.configuration.port, function(error) {
    process.logger.info('HTTP Server listening on port ' + server.address().port);

    // If process is a child process, send an event to parent process informing that the server has started
    if (process.connected)
      process.send({status: 'started'});

    callback(error);
  });

};
