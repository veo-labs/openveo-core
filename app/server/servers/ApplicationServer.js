"use scrict"

// Module dependencies
var path = require("path");
var util = require("util");
var express = require("express");
var consolidate = require("consolidate");
var mustache = require("mustache");
var session = require("express-session");
var passport = require("passport");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var openVeoAPI = require("openveo-api");
var logger = openVeoAPI.logger.get("openveo");
var Server = process.require("app/server/servers/Server.js");
var serverConf = process.require("config/serverConf.json").app;
var conf = process.require("conf.json");
var routeLoader = process.require("app/server/loaders/routeLoader.js");
var permissionLoader = process.require("app/server/loaders/permissionLoader.js");
var defaultController = process.require("app/server/controllers/defaultController.js"); 
var errorController = process.require("app/server/controllers/errorController.js"); 
var applicationStorage = openVeoAPI.applicationStorage;

/**
 * Application's environment mode.
 */
var env = (process.env.NODE_ENV == "production") ? "prod" : "dev";

/**
 * Common options for all static servers delivering static files.
 */
var staticServerOptions = {
  extensions: ["htm", "html"],
  maxAge: "1d",
  setHeaders: function(response, path, stat){
    response.set("x-timestamp", Date.now());
  }
};

/**
 * Creates an ApplicationServer.
 * Initialize the express application and routers.
 */
function ApplicationServer(){
  var self = this;
  this.viewsFolders = [];
  this.publicDirectories = [];
  this.menu = conf["backOffice"]["menu"] || [];
  this.permissions = conf["permissions"] || [];
  
  Server.prototype.init.call(this);
  
  // Create public and admin routers
  this.router = express.Router();
  this.adminRouter = express.Router();
  
  // Add core views folders to the list of folders
  conf["viewsFolders"].forEach(function(folder){
    self.viewsFolders.push(path.normalize(process.root + "/" + folder));
  });
  
  // Set mustache as the template engine
  this.app.engine("html", consolidate.mustache);
  this.app.set("view engine", "html");
  
  // Log each request method, path and headers
  this.app.use(function(request, response, next){
    logger.info({method : request.method, path : request.url, headers : request.headers});
    next();
  });

  // Load all middlewares which need to operate
  // on each request
  // The cookieParser and session middlewares are required 
  // by passport
  this.app.use(cookieParser());
  this.app.use(bodyParser.urlencoded({extended: true}));
  this.app.use(bodyParser.json());
  this.app.use(session({ secret: serverConf["sessionSecret"], saveUninitialized: true, resave: true }));
  this.app.use(passport.initialize());
  this.app.use(passport.session());

  // Mount routers
  this.app.use("/admin", this.adminRouter);
  this.app.use("/", this.router);
}

module.exports = ApplicationServer;
util.inherits(ApplicationServer, Server);

/**
 * Applies all routes, found in configuration, to the public and
 * the admin routers.
 *
 * @param Database db The application database 
 */
ApplicationServer.prototype.onDatabaseAvailable = function(db){

  // Initialize passport (authentication manager)
  process.require("app/server/passport.js");

  // Load and apply main routes from configuration to public, back 
  // end routers
  routeLoader.applyRoutes(routeLoader.decodeRoutes(process.root, conf["routes"]["public"]), this.router);
  routeLoader.applyRoutes(routeLoader.decodeRoutes(process.root, conf["routes"]["admin"]), this.adminRouter);
  
};

/**
 * Mounts plugin.
 * Mounts plugin's public directories, public router, admin router, menu
 * views folders and permissions.
 *
 * @param Object plugin The available openveo plugin
 * e.g.
 * {
 *   router: [Function],
 *   adminRouter: [Function],
 *   webServiceRouter: [Function],
 *   mountPath: "/publish",
 *   name: "publish",
 *   publicDirectory: "/home/veo-labs/openveo/node_modules/openveo-publish/public",
 *   i18nDirectory: "/home/veo-labs/openveo/node_modules/openveo-publish/i18n",
 *   custom: [Object],
 *   webServiceScopes: [Object],
 *   permissions: [Array],
 *   viewsFolders: [Array],
 *   routes: [Array],
 *   adminRoutes: [Array],
 *   webServiceRoutes: [Array],
 *   entities: [Object],
 *   menu: [Array],
 *   scriptLibFiles: [Array],
 *   scriptFiles: [Array],
 *   cssFiles: [Array]
 * }
 */
ApplicationServer.prototype.onPluginAvailable = function(plugin){
  
  // If plugin has a public directory, load it as a static server
  if(plugin.publicDirectory)
    this.publicDirectories.push(plugin.publicDirectory);

  // Mount plugin public router to the plugin front end mount path
  if(plugin.router && plugin.mountPath)
    this.app.use(plugin.mountPath, plugin.router);

  // Mount the admin router to the plugin back end mount path
  if(plugin.adminRouter && plugin.mountPath)
    this.app.use("/admin" + plugin.mountPath, plugin.adminRouter);

  // Found back end menu configuration for the plugin
  if(plugin.menu)
    this.menu = this.menu.concat(plugin.menu);

  // Found a list of folders containing views for the plugin
  if(plugin.viewsFolders)
    this.viewsFolders = this.viewsFolders.concat(plugin.viewsFolders);
  
  // Found a list of permissions for the plugin
  if(plugin.permissions)
    this.permissions = this.permissions.concat(plugin.permissions);  

};

/**
 * Starts the plugin when loaded.
 *
 * @param Object plugin The available openveo plugin
 * e.g.
 * {
 *   router: [Function],
 *   adminRouter: [Function],
 *   webServiceRouter: [Function],
 *   mountPath: "/publish",
 *   name: "publish",
 *   publicDirectory: "/home/veo-labs/openveo/node_modules/openveo-publish/public",
 *   i18nDirectory: "/home/veo-labs/openveo/node_modules/openveo-publish/i18n",
 *   custom: [Object],
 *   webServiceScopes: [Object],
 *   permissions: [Array],
 *   viewsFolders: [Array],
 *   routes: [Array],
 *   adminRoutes: [Array],
 *   webServiceRoutes: [Array],
 *   entities: [Object],
 *   menu: [Array],
 *   scriptLibFiles: [Array],
 *   scriptFiles: [Array],
 *   cssFiles: [Array]
 * } 
 */
ApplicationServer.prototype.onPluginLoaded = function(plugin){
  
  // Starts plugin
  if(plugin.start)
    plugin.start();
  
};

/**
 * Finalizes the ApplicationServer initialization.
 * Mounts the public directories of core and plugins, sets views
 * folders, sets permissions and set default route and error handling.
 * Default route must load the main view due to AngularJS single 
 * application.
 */
ApplicationServer.prototype.onPluginsLoaded = function(plugin){
  var self = this;
  
  // Set main public directory to be served first as the static server
  this.app.use(express.static(path.normalize(process.root + "/public"), staticServerOptions));
  
  if(env === "dev"){
    this.app.use(express.static(path.normalize(process.root + "/app/client/admin/js"), staticServerOptions));
  }

  // Set plugins public directories as additionnal static servers
  this.publicDirectories.forEach(function(publicDirectory){
    self.app.use(express.static(publicDirectory, staticServerOptions));

    /**
     * TODO **************************************
     * HACK en attendant que les fichiers custom soient concaténés.
     */
    self.app.use(express.static(path.normalize(publicDirectory + "/../app/client/front/js"), staticServerOptions));
    
    /**
     * HACK en attendant que les fichiers custom soient concaténés.
     * TODO **************************************
     */
    if(env === "dev"){
      self.app.use(express.static(path.normalize(publicDirectory + "/../app/client/admin/js"), staticServerOptions));
    }
  });

  // Set views folders for template engine
  this.app.set("views", this.viewsFolders);
  
  // Generate permissions for entities
  var entities = applicationStorage.getEntities();
  var crudPermissions = permissionLoader.generateCRUDPermissions(entities);

  // Add crud permissions to the list of permissions
  this.permissions = crudPermissions.concat(this.permissions);
  
  // Store application's permissions
  applicationStorage.setPermissions(permissionLoader.groupOrphanedPermissions(this.permissions));
  applicationStorage.setMenu(this.menu);
  
  // Handle not found and errors
  this.app.all("/admin*", defaultController.defaultAction);
  this.app.all("*", defaultController.defaultAction);
  
  // Handle errors
  this.app.use(errorController.errorAction);
  
};

/**
 * Starts the HTTP server.
 */
ApplicationServer.prototype.startServer = function(){
  
  // Start server
  var server = this.app.listen(serverConf.port, function(){
    logger.info("Server listening at http://%s:%s", server.address().address, server.address().port);
  });
  
};