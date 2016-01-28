'use strict';

/**
 * @module core-servers
 */

// Module dependencies
var util = require('util');
var path = require('path');
var express = require('express');
var openVeoAPI = require('@openveo/api');
var bodyParser = require('body-parser');
var Server = process.require('app/server/servers/Server.js');
var oAuth = process.require('app/server/oauth/oAuth.js');
var routeLoader = process.require('app/server/loaders/routeLoader.js');
var oAuthController = process.require('app/server/controllers/oAuthController.js');
var errorController = process.require('app/server/controllers/errorController.js');
var configDir = openVeoAPI.fileSystem.getConfDir();
var serverConf = require(path.join(configDir, 'core/serverConf.json')).ws;
var conf = process.require('conf.json');

/**
 * WebServiceServer creates an HTTP server for the openveo web service.
 *
 * @class WebServiceServer
 * @constructor
 * @extends Server
 */
function WebServiceServer() {
  Server.prototype.init.call(this);

  // Create router
  this.router = express.Router();

  // Log each request method, path and headers
  this.app.use(function(request, response, next) {
    process.logger.info({
      method: request.method,
      path: request.url,
      headers: request.headers
    });
    next();
  });

  // Load all middlewares which need to operate
  // on each request
  this.app.use(bodyParser.urlencoded({
    extended: true
  }));
  this.app.use(bodyParser.json());

  // Web service routes
  this.router.use(oAuth.inject());
  this.router.post('/token', oAuth.controller.token);
  this.router.all('*', oAuth.middleware.bearer);
  this.router.all('*', oAuthController.validateScopesAction);

  // Deactivate user agent cache for all get requests
  // Cache-Control : no-cache to force caches to request the original server
  // Cache-Control : no-store to force caches not to keep any copy of the response
  // Cache-Control : must-revalidate to force caches to ask original server validation of a stale response
  // Pragma : no-cache to be backward compatible with HTTP/1.0 caches
  // Expires : 0 to mark all responses as staled
  this.app.get('*', function(request, response, next) {
    response.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0
    });
    next();
  });

  // Mount router
  this.app.use('/', this.router);
}

module.exports = WebServiceServer;
util.inherits(WebServiceServer, Server);

/**
 * Applies all routes, found in configuration, to the router.
 *
 * @method onDatabaseAvailable
 * @param {Database} db The application database
 */
WebServiceServer.prototype.onDatabaseAvailable = function() {

  // Load and apply routes to router
  routeLoader.applyRoutes(routeLoader.decodeRoutes(process.root, conf['routes']['ws']), this.router);

};

/**
 * Mounts plugin's router.
 *
 * @method onPluginAvailable
 * @param {Object} plugin The available openveo plugin
 */
WebServiceServer.prototype.onPluginAvailable = function(plugin) {

  // Mount plugin Web Service router to the plugin
  // Web Service mount path
  if (plugin.webServiceRouter && plugin.mountPath)
    this.app.use(plugin.mountPath, plugin.webServiceRouter);

};

/**
 * Sets errors routes.
 *
 * Sets errors routes when all plugins are loaded to handle not found
 * endpoints and errors.
 *
 * @method onPluginsLoaded
 */
WebServiceServer.prototype.onPluginsLoaded = function() {

  // Handle not found and errors
  this.app.all('*', errorController.notFoundAction);
  this.app.use(errorController.errorAction);

};

/**
 * Starts the HTTP server.
 *
 * @method startServer
 */
WebServiceServer.prototype.startServer = function() {

  // Start server
  var server = this.app.listen(serverConf.port, function() {
    process.logger.info('Server listening at http://%s:%s', server.address().address, server.address().port);
  });

};
