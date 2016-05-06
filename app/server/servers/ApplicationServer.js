'use strict';

/**
 * @module core-servers
 */

var path = require('path');
var util = require('util');
var express = require('express');
var consolidate = require('consolidate');
var session = require('express-session');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var openVeoAPI = require('@openveo/api');
var Server = process.require('app/server/servers/Server.js');
var routeLoader = process.require('app/server/loaders/routeLoader.js');
var permissionLoader = process.require('app/server/loaders/permissionLoader.js');
var entityLoader = process.require('app/server/loaders/entityLoader.js');
var DefaultController = process.require('app/server/controllers/DefaultController.js');
var ErrorController = process.require('app/server/controllers/ErrorController.js');
var expressThumbnail = process.require('app/server/servers/ExpressThumbnail.js');
var applicationStorage = openVeoAPI.applicationStorage;

var defaultController = new DefaultController();
var errorController = new ErrorController();

// Application's environment mode.
var env = (process.env.NODE_ENV == 'production') ? 'prod' : 'dev';

// Common options for all static servers delivering static files.
var staticServerOptions = {
  extensions: ['htm', 'html'],
  setHeaders: function(response) {
    response.set('x-timestamp', Date.now());
  }
};

/**
 * Creates an HTTP server for the openveo application, which serves front and back end pages.
 *
 * @class ApplicationServer
 * @constructor
 * @extends Server
 * @param {Object} configuration Service configuration
 */
function ApplicationServer(configuration) {
  Server.call(this, configuration);

  /**
   * List of path holding template engine views.
   *
   * @property viewsFolders
   * @type Array
   */
  this.viewsFolders = [];

  /**
   * Image styles for image processing.
   *
   * @property imagesStyle
   * @type Object
   */
  this.imagesStyle = {};

  /**
   * Back end menu description object.
   *
   * @property menu
   * @type Array
   */
  this.menu = [];

  /**
   * migrations Script description object.
   *
   * @property migrations
   * @type Object
   */
  this.migrations = {};

  // Apply favicon
  this.app.use(favicon(process.root + '/assets/favicon.ico'));

  // Set mustache as the template engine
  this.app.engine('html', consolidate.mustache);
  this.app.set('view engine', 'html');

  // Log each request
  this.app.use(openVeoAPI.middlewares.logRequestMiddleware);

}

module.exports = ApplicationServer;
util.inherits(ApplicationServer, Server);

/**
 * Applies all routes, found in configuration, to the public and
 * the private routers.
 *
 * @method onDatabaseAvailable
 * @async
 * @param {Database} db The application database
 * @param {Function} callback Function to call when its done with:
 *  - **Error** An error if something went wrong
 */
ApplicationServer.prototype.onDatabaseAvailable = function(db, callback) {

  // Update Session store with opened database connection
  // Allowed server to restart without loosing any session
  this.app.use(session({
    secret: this.configuration.sessionSecret,
    saveUninitialized: true,
    resave: true,
    store: db.getStore()
  }));

  // The cookieParser and session middlewares are required
  // by passport
  this.app.use(cookieParser());
  this.app.use(bodyParser.urlencoded({
    extended: true
  }));
  this.app.use(bodyParser.json());

  // passport Initialize : Need to be done after session settings DB
  this.app.use(passport.initialize());
  this.app.use(passport.session());

  // Initialize passport (authentication manager)
  process.require('app/server/passport.js');

  callback();
};

/**
 * Loads plugin.
 *
 * Mounts plugin's assets directories, public router, private router, menu
 * views folders and permissions.
 *
 * @method onPluginLoaded
 * @async
 * @param {Object} plugin The openveo plugin
 * @param {Function} callback Function to call when its done with:
 *  - **Error** An error if something went wrong
 */
ApplicationServer.prototype.onPluginLoaded = function(plugin, callback) {
  var self = this;

  // If plugin has an assets directory, it will be loaded as a static server
  if (plugin.assets && plugin.mountPath) {
    process.logger.info('Mount ' + plugin.assets + ' on ' + plugin.mountPath);
    this.app.use(plugin.mountPath, express.static(plugin.assets, staticServerOptions));

    if (env === 'dev') {
      var frontJSPath = path.normalize(plugin.assets + '/../app/client/front/js');
      var adminJSPath = path.normalize(plugin.assets + '/../app/client/admin/js');
      this.app.use(plugin.mountPath, express.static(frontJSPath, staticServerOptions));
      this.app.use(plugin.mountPath, express.static(adminJSPath, staticServerOptions));
    }

  }

  // Build plugin public routes
  if (plugin.router && plugin.routes && plugin.mountPath)
    routeLoader.applyRoutes(routeLoader.decodeRoutes(plugin.path, plugin.routes), plugin.router);

  // Build plugin private routes
  if (plugin.privateRouter && plugin.privateRoutes && plugin.mountPath)
    routeLoader.applyRoutes(routeLoader.decodeRoutes(plugin.path, plugin.privateRoutes), plugin.privateRouter);

  // Build routes for entities
  if (plugin.privateRouter && plugin.entities) {
    var entitiesRoutes = entityLoader.buildEntitiesRoutes(plugin.entities);
    routeLoader.applyRoutes(routeLoader.decodeRoutes(plugin.path, entitiesRoutes), plugin.privateRouter);
  }

  // Mount plugin public router to the plugin mount path
  if (plugin.router && plugin.mountPath) {
    process.logger.info('Mount ' + plugin.name + ' public router on ' + plugin.mountPath);
    this.app.use(plugin.mountPath, plugin.router);
  }

  // Mount plugin private router to the plugin private mount path
  if (plugin.privateRouter && plugin.mountPath) {
    process.logger.info('Mount ' + plugin.name + ' private router on ' + plugin.mountPath);
    this.app.use('/be' + plugin.mountPath, plugin.privateRouter);
  }

  // Found back end menu configuration for the plugin
  if (plugin.menu)
    this.menu = this.menu.concat(plugin.menu);

  // Found a list of folders containing views for the plugin
  if (plugin.viewsFolders)
    this.viewsFolders = this.viewsFolders.concat(plugin.viewsFolders);

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

  // Update migration script to apply
  if (plugin.migrations)
    this.migrations[plugin.name] = plugin.migrations;

  callback();
};

/**
 * Finalizes the ApplicationServer initialization.
 *
 * Mounts the assets directories of core and plugins, sets views
 * folders, sets permissions and set default route and error handling.
 * Default route must load the main view due to AngularJS single
 * application.
 *
 * @method onPluginsLoaded
 * @method async
 * @param {Function} callback Function to call when its done with:
 *  - **Error** An error if something went wrong
 */
ApplicationServer.prototype.onPluginsLoaded = function(callback) {
  var plugins = applicationStorage.getPlugins();
  var entities = applicationStorage.getEntities();

  // Set views folders for template engine
  this.app.set('views', this.viewsFolders);

  applicationStorage.setMenu(this.menu);

  // Handle not found and errors
  this.app.all('/be*', defaultController.defaultAction);
  this.app.all('*', errorController.notFoundPageAction);

  // Handle errors
  this.app.use(errorController.errorAction);

  // Build permissions
  permissionLoader.buildPermissions(entities, plugins, function(error, permissions) {
    if (error)
      return callback(error);

    // Store application's permissions
    applicationStorage.setPermissions(permissions);

    callback();
  });
};

/**
 * Starts the HTTP server.
 *
 * @method startServer
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
ApplicationServer.prototype.startServer = function(callback) {

  // Start server
  var server = this.app.listen(this.configuration.port, function(error) {
    process.logger.info('Server listening at http://%s:%s', server.address().address, server.address().port);

    // If process is a child process, send an event to parent process informing that the server has started
    if (process.connected)
      process.send({status: 'started'});

    callback(error);
  });

};
