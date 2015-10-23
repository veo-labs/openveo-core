'use strict';

/**
 * @module core-servers
 */

// Module dependencies
var path = require('path');
var util = require('util');
var express = require('express');
var consolidate = require('consolidate');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var openVeoAPI = require('@openveo/api');
var logger = openVeoAPI.logger.get('openveo');
var Server = process.require('app/server/servers/Server.js');
var configDir = openVeoAPI.fileSystem.getConfDir();
var serverConf = require(path.join(configDir, 'core/serverConf.json')).app;
var conf = process.require('conf.json');
var routeLoader = process.require('app/server/loaders/routeLoader.js');
var permissionLoader = process.require('app/server/loaders/permissionLoader.js');
var defaultController = process.require('app/server/controllers/defaultController.js');
var errorController = process.require('app/server/controllers/errorController.js');
var applicationStorage = openVeoAPI.applicationStorage;
var expressThumbnail = process.require('app/server/servers/ExpressThumbnail.js');

var favicon = require('serve-favicon');
var mongostoreInstance;

/**
 * Application's environment mode.
 *
 * @property env
 * @type String
 * @private
 */
var env = (process.env.NODE_ENV == 'production') ? 'prod' : 'dev';

/**
 * Common options for all static servers delivering static files.
 *
 * @property staticServerOptions
 * @type Object
 * @private
 */
var staticServerOptions = {
  extensions: ['htm', 'html'],
  maxAge: '1d',
  setHeaders: function(response) {
    response.set('x-timestamp', Date.now());
  }
};

/**
 * ApplicationServer creates an HTTP server for the openveo application,
 * which serves front and back end pages.
 *
 * @class ApplicationServer
 * @constructor
 * @extends Server
 */
function ApplicationServer() {
  var self = this;
  this.viewsFolders = [];
  this.assets = [];
  this.imagesFolders = [];
  this.imagesStyle = {};
  this.menu = conf['backOffice']['menu'] || [];
  this.permissions = conf['permissions'] || [];

  Server.prototype.init.call(this);

  // Create public and private routers
  this.router = express.Router();
  this.privateRouter = express.Router();

  // Add core views folders to the list of folders
  conf['viewsFolders'].forEach(function(folder) {
    self.viewsFolders.push(path.normalize(process.root + '/' + folder));
  });

  // Add core image folder
  conf['imageProcessing']['imagesFolders'].forEach(function(folder) {
    self.imagesFolders.push(path.normalize(process.root + '/' + folder));
  });
  self.imagesStyle = conf['imageProcessing']['imagesStyle'] || {};

  // Apply favicon
  this.app.use(favicon(process.root + '/assets/favicon.ico'));

  // Set mustache as the template engine
  this.app.engine('html', consolidate.mustache);
  this.app.set('view engine', 'html');

  // Log each request method, path and headers
  this.app.use(function(request, response, next) {
    logger.info({
      method: request.method,
      path: request.url,
      headers: request.headers
    });
    next();
  });
}

module.exports = ApplicationServer;
util.inherits(ApplicationServer, Server);

/**
 * Applies all routes, found in configuration, to the public and
 * the private routers.
 *
 * @method onDatabaseAvailable
 * @param {Database} db The application database
 */
ApplicationServer.prototype.onDatabaseAvailable = function(db) {

  // Load all middlewares which need to operate
  // on each request
  if (!mongostoreInstance) {
    mongostoreInstance = new MongoStore({
      db: db.db
    });
  }

  // Update Session store with opened database connection
  // Allowed server to restart without loosing any session
  this.app.use(session({
    secret: serverConf['sessionSecret'],
    saveUninitialized: true,
    resave: true,
    store: mongostoreInstance
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

  // Set main assets directory to be served first as the static server
  this.app.use(express.static(path.normalize(process.root + '/assets'), staticServerOptions));

  if (env === 'dev')
    this.app.use(express.static(path.normalize(process.root + '/app/client/admin/js'), staticServerOptions));

  // Mount routers (Need to be done after passport initialize, session and authent)
  this.app.use('/be', this.privateRouter);
  this.app.use('/', this.router);

  // Load and apply main routes from configuration to public and private routers
  routeLoader.applyRoutes(routeLoader.decodeRoutes(process.root, conf['routes']['public']), this.router);
  routeLoader.applyRoutes(routeLoader.decodeRoutes(process.root, conf['routes']['private']), this.privateRouter);

};

/**
 * Mounts plugin.
 *
 * Mounts plugin's assets directories, public router, private router, menu
 * views folders and permissions.
 *
 * @method onPluginAvailable
 * @param {Object} plugin The available openveo plugin
 */
ApplicationServer.prototype.onPluginAvailable = function(plugin) {

  // If plugin has an assets directory, it will be loaded as a static server
  if (plugin.assets && plugin.mountPath) {
    logger.info('Mount ' + plugin.assets + ' on ' + plugin.mountPath);
    this.app.use(plugin.mountPath, express.static(plugin.assets, staticServerOptions));

    if (env === 'dev') {
      var frontJSPath = path.normalize(plugin.assets + '/../app/client/front/js');
      var adminJSPath = path.normalize(plugin.assets + '/../app/client/admin/js');
      this.app.use(plugin.mountPath, express.static(frontJSPath, staticServerOptions));
      this.app.use(plugin.mountPath, express.static(adminJSPath, staticServerOptions));
    }

  }

  // Mount plugin router to the plugin mount path
  if (plugin.router && plugin.mountPath) {
    logger.info('Mount routes on path %s', plugin.mountPath);
    this.app.use(plugin.mountPath, plugin.router);
  }

  // Mount the private router to the plugin private mount path
  if (plugin.privateRouter && plugin.mountPath) {
    logger.info('Mount routes on path /be%s', plugin.mountPath);
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
    this.imagesFolders = this.imagesFolders.concat(plugin.imagesFolders);

    if (plugin.imagesStyle) {
      for (var attrname in plugin.imagesStyle) {
        this.imagesStyle[attrname] = plugin.imagesStyle[attrname];
      }
    }
  }

  // Found a list of permissions for the plugin
  if (plugin.permissions)
    this.permissions = this.permissions.concat(plugin.permissions);

};

/**
 * Starts the plugin when loaded.
 *
 * @method onPluginLoaded
 * @param {Object} plugin The available openveo plugin
 */
ApplicationServer.prototype.onPluginLoaded = function(plugin) {

  // Starts plugin
  if (plugin.start)
    plugin.start();

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
 * @param {Object} plugin The available openveo plugin
 */
ApplicationServer.prototype.onPluginsLoaded = function() {
  var self = this;

  // Set views folders for template engine
  this.app.set('views', this.viewsFolders);

  // Set Thumbnail generator on image folder
  this.imagesFolders.forEach(function(folder) {
    self.app.use(expressThumbnail.register(folder + '/', {
      imagesStyle: self.imagesStyle
    }));
  });

  // Generate permissions for entities
  var entities = applicationStorage.getEntities();
  var crudPermissions = permissionLoader.generateCRUDPermissions(entities);

  // Add crud permissions to the list of permissions
  this.permissions = crudPermissions.concat(this.permissions);

  // Store application's permissions
  applicationStorage.setPermissions(permissionLoader.groupOrphanedPermissions(this.permissions));
  applicationStorage.setMenu(this.menu);

  // Handle not found and errors
  this.app.all('/be*', defaultController.defaultAction);
  this.app.all('*', errorController.notFoundPageAction);

  // Handle errors
  this.app.use(errorController.errorAction);

};

/**
 * Starts the HTTP server.
 *
 * @method startServer
 */
ApplicationServer.prototype.startServer = function() {

  // Start server
  var server = this.app.listen(serverConf.port, function() {
    logger.info('Server listening at http://%s:%s', server.address().address, server.address().port);
  });

};
