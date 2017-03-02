'use strict';

/**
 * @module core-servers
 */

var path = require('path');
var util = require('util');
var async = require('async');
var express = require('express');
var consolidate = require('consolidate');
var session = require('express-session');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var openVeoApi = require('@openveo/api');
var Server = process.require('app/server/servers/Server.js');
var routeLoader = process.require('app/server/loaders/routeLoader.js');
var permissionLoader = process.require('app/server/loaders/permissionLoader.js');
var entityLoader = process.require('app/server/loaders/entityLoader.js');
var namespaceLoader = process.require('app/server/loaders/namespaceLoader.js');
var DefaultController = process.require('app/server/controllers/DefaultController.js');
var ErrorController = process.require('app/server/controllers/ErrorController.js');
var expressThumbnail = process.require('app/server/servers/ExpressThumbnail.js');
var storage = process.require('app/server/storage.js');
var SocketServer = openVeoApi.socket.SocketServer;
var SocketNamespace = openVeoApi.socket.SocketNamespace;

var defaultController = new DefaultController();
var errorController = new ErrorController();

// Application's environment mode.
var env = (process.env.NODE_ENV == 'production') ? 'prod' : 'dev';

// Headers for static files
var staticHeaders = {
  'x-timestamp': Date.now(),
  'Access-Control-Allow-Origin': '*'
};

// Common options for all static servers delivering static files.
var staticServerOptions = {
  extensions: ['htm', 'html'],
  setHeaders: function(response) {
    response.set(staticHeaders);
  }
};

/**
 * Defines an HTTP server for the openveo application, which serves front and back end pages.
 *
 * @class ApplicationServer
 * @extends Server
 * @constructor
 * @param {Object} configuration Service configuration
 * @param {String} configuration.sessionSecret Hash to encrypt sessions
 * @param {Number} configuration.httpPort HTTP server port
 * @param {Number} configuration.socketPort Socket server port
 */
function ApplicationServer(configuration) {
  ApplicationServer.super_.call(this, configuration);

  Object.defineProperties(this, {

    /**
     * List of path holding template engine views.
     *
     * @property viewsFolders
     * @type Array
     */
    viewsFolders: {value: [], writable: true},

    /**
     * Image styles for image processing.
     *
     * @property imagesStyle
     * @type Object
     * @final
     */
    imagesStyle: {value: {}},

    /**
     * Back end menu description object.
     *
     * @property menu
     * @type Array
     */
    menu: {value: [], writable: true},

    /**
     * Migrations scripts to execute.
     *
     * @property migrations
     * @type Object
     * @final
     */
    migrations: {value: {}},

    /**
     * Socket server.
     *
     * @property socketServer
     * @type SocketServer
     * @final
     */
    socketServer: {value: new SocketServer()},

    /**
     * Database session storage.
     *
     * @property sessionStore
     * @type Object
     */
    sessionStore: {value: null, writable: true},

    /**
     * Express session middleware.
     *
     * @property sessionMiddleware
     * @type Object
     */
    sessionMiddleware: {value: null, writable: true}

  });

  // Apply favicon
  this.httpServer.use(favicon(process.root + '/assets/favicon.ico'));

  // Set mustache as the template engine
  this.httpServer.engine('html', consolidate.mustache);
  this.httpServer.set('view engine', 'html');

  // Log each request
  this.httpServer.use(openVeoApi.middlewares.logRequestMiddleware);

  // Save server configuration
  storage.setServerConfiguration(configuration);

}

module.exports = ApplicationServer;
util.inherits(ApplicationServer, Server);

/**
 * Prepares the express application.
 *
 * @method onDatabaseAvailable
 * @async
 * @param {Database} db The application database
 * @param {Function} callback Function to call when its done with:
 *  - **Error** An error if something went wrong
 */
ApplicationServer.prototype.onDatabaseAvailable = function(db, callback) {
  this.sessionStore = db.getStore('core_sessions');

  // Update Session store with opened database connection
  // Allowed server to restart without loosing any session
  this.sessionMiddleware = session({
    secret: this.configuration.sessionSecret,
    saveUninitialized: true,
    resave: true,
    store: this.sessionStore
  });
  this.httpServer.use(this.sessionMiddleware);

  // The cookieParser and session middlewares are required
  // by passport
  this.httpServer.use(cookieParser());
  this.httpServer.use(bodyParser.urlencoded({
    extended: true
  }));
  this.httpServer.use(bodyParser.json());

  // passport Initialize : Need to be done after session settings DB
  this.httpServer.use(passport.initialize());
  this.httpServer.use(passport.session());

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
  process.logger.info('Start loading plugin ' + plugin.name);

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
      self.httpServer.use(plugin.mountPath, expressThumbnail.register(folder + '/', {
        imagesStyle: imagesStyles,
        headers: staticHeaders
      }));
    });
  }

  // If plugin has an assets directory, it will be loaded as a static server
  if (plugin.assets && plugin.mountPath) {
    process.logger.info('Mount ' + plugin.assets + ' on ' + plugin.mountPath);
    this.httpServer.use(plugin.mountPath, express.static(plugin.assets, staticServerOptions));

    if (env === 'dev') {
      var frontJSPath = path.normalize(plugin.assets + '/../app/client/front/js');
      var adminJSPath = path.normalize(plugin.assets + '/../app/client/admin/js');
      this.httpServer.use(plugin.mountPath, express.static(frontJSPath, staticServerOptions));
      this.httpServer.use(plugin.mountPath, express.static(adminJSPath, staticServerOptions));
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
    this.httpServer.use(plugin.mountPath, plugin.router);
  }

  // Mount plugin private router to the plugin private mount path
  if (plugin.privateRouter && plugin.mountPath) {
    process.logger.info('Mount ' + plugin.name + ' private router on ' + plugin.mountPath);
    this.httpServer.use('/be' + plugin.mountPath, plugin.privateRouter);
  }

  // Found back end menu configuration for the plugin
  if (plugin.menu)
    this.menu = this.menu.concat(plugin.menu);

  // Found a list of folders containing views for the plugin
  if (plugin.viewsFolders)
    this.viewsFolders = this.viewsFolders.concat(plugin.viewsFolders);

  // Update migration script to apply
  if (plugin.migrations)
    this.migrations[plugin.name] = plugin.migrations;

  // Found namespaces for the plugin
  if (plugin.namespaces) {

    /*
     * Mounts namespaces on the socket server.
     *
     * @param {Object} namespaces Namespaces with the namespaces names as the key and the list
     * of namespaces messages as the value
     * @param {Boolean} isPrivate true to make each namespace private requiring a back end
     * authentication
     */
    var mountNamespaces = function(namespaces, isPrivate) {
      for (var namespaceName in namespaces) {
        var messagesDescriptors = namespaces[namespaceName];
        var mountPath = (plugin.mountPath === '/') ? namespaceName : plugin.mountPath + '/' + namespaceName;
        var socketNamespace = null;

        // Namespaces names must be unique
        if (!self.socketServer.getNamespace(mountPath)) {

          // Namespace not registered yet
          // Mount it
          socketNamespace = new SocketNamespace();
          process.logger.info('Mount ' + plugin.name + ' "' + namespaceName + '" namespace on ' + mountPath);

          // Attaches messages' handlers to namespace
          namespaceLoader.addHandlers(socketNamespace, messagesDescriptors, plugin.path);

          if (isPrivate) {

            // Use HTTP session middleware to populate socket request with HTTP session information
            socketNamespace.use(function(socket, next) {
              self.sessionMiddleware(socket.request, socket.request.res, next);
            });

            // Add middleware to check that the user is authenticated to the back end
            // Add a middleware to all routes on the namespace to control the back end authentication
            // depending on the requested route
            socketNamespace.use(function(socket, next) {
              if (socket.request.session && socket.request.session.passport && socket.request.session.passport.user)
                next();
              else
                next({error: 'Not authenticated'});
            });
          }

          // Add namespace to socket server
          self.socketServer.addNamespace(mountPath, socketNamespace);
        }
      }
    };

    // Mount public namespaces on the socket server
    if (plugin.namespaces.public)
      mountNamespaces(plugin.namespaces.public);

    // Mount private namespaces on the socket server
    if (plugin.namespaces.private)
      mountNamespaces(plugin.namespaces.private, true);

  }

  process.logger.info(plugin.name + ' plugin loaded');
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
  var plugins = process.api.getPlugins();
  var entities = storage.getEntities();

  // Set views folders for template engine
  this.httpServer.set('views', this.viewsFolders);

  storage.setMenu(this.menu);

  // Handle not found and errors
  this.httpServer.all('/be*', defaultController.defaultAction);
  this.httpServer.all('*', errorController.notFoundPageAction);

  // Handle errors
  this.httpServer.use(errorController.errorAction);

  // Build permissions
  permissionLoader.buildPermissions(entities, plugins, function(error, permissions) {
    if (error)
      return callback(error);

    // Store application's permissions
    storage.setPermissions(permissions);

    callback();
  });
};

/**
 * Starts the HTTP and socket servers.
 *
 * @method startServer
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
ApplicationServer.prototype.startServer = function(callback) {
  var self = this;

  async.series([

    // Start HTTP server
    function(callback) {
      self.httpServer.listen(self.configuration.httpPort, function(error) {
        process.logger.info('HTTP Server listening on port ' + self.configuration.httpPort);
        callback(error);
      });
    },

    // Start socket server
    function(callback) {
      self.socketServer.listen(self.configuration.socketPort, function() {
        process.logger.info('Socket server listening on port ' + self.configuration.socketPort);
        callback();
      });
    }
  ], function(error, results) {

    // If process is a child process, send an event to parent process informing that the server has started
    if (process.connected)
      process.send({status: 'started'});

    callback(error);
  });

};
