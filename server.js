"use strict"

// Module dependencies
var consolidate = require("consolidate");
var mustache = require("mustache");
var express = require("express");
var session = require("express-session");
var passport = require("passport");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var jsonPath = require('JSONPath');
var winston = require("winston");
var path = require("path");
var async = require("async");
var openVeoAPI = require("openveo-api");
var applicationStorage = openVeoAPI.applicationStorage;

// Set module root directory and define a custom require function
process.root = __dirname;
process.require = function(filePath){
  return require(path.normalize(process.root + "/" + filePath));
};

var oAuth = process.require("app/server/oauth/oAuth.js");

// Initialize logger
process.require("app/server/logger.js");

// Module files
var pluginLoader = process.require("app/server/loaders/pluginLoader.js");
var routeLoader = process.require("app/server/loaders/routeLoader.js");
var entityLoader = process.require("app/server/loaders/entityLoader.js");
var defaultController = process.require("app/server/controllers/defaultController.js");
var oAuthController = process.require("app/server/controllers/oAuthController.js");

// Configuration files
var serverConf = process.require("config/serverConf.json");
var databaseConf = process.require("config/databaseConf.json");
var conf = process.require("conf.json");

var server;
var env = ( process.env.NODE_ENV == 'production')?'prod':'dev';

// Retrieve initialized logger
var logger = winston.loggers.get("openveo");

// Retrieve back office menu and views folders from configuration
var menu = conf["backOffice"]["menu"] || [];
var webServiceScopes = conf["webServiceScopes"] || {};
var entities = {};
var viewsFolders = [];

conf["viewsFolders"].forEach(function(folder){
  viewsFolders.push(path.normalize(process.root + "/" + folder));
});

// Create express application and main routers
// One router for the font end "/"
// One router for the back end "/admin"
// One router for the web service "/ws"
var app = express();
var router = express.Router();
var adminRouter = express.Router();
var webServiceRouter = express.Router();

// Remove x-powered-by http header
app.set("x-powered-by", false);

// Set mustache as the template engine
app.engine("html", consolidate.mustache);
app.set("view engine", "html");

// Common options for all static servers
// delivering static files
var staticServerOptions = {
  extensions: ["htm", "html"],
  maxAge: "1d",
  setHeaders: function(response, path, stat){
    response.set("x-timestamp", Date.now());
  }
};

// Log each request method, path and headers
app.use(function(request, response, next){
  logger.info({method : request.method, path : request.url, headers : request.headers});
  next();
});

// Load all middlewares which need to operate
// on each request
// The cookieParser and session middlewares are required 
// by passport
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({ secret: serverConf["sessionSecret"], saveUninitialized: true, resave: true }));
app.use(passport.initialize());
app.use(passport.session());

// Web service routes
webServiceRouter.use(oAuth.inject());
webServiceRouter.post("/token", oAuth.controller.token);
webServiceRouter.all("*", oAuth.middleware.bearer);
webServiceRouter.all("*", oAuthController.validateScopesAction);

// Mount routers
app.use("/ws", webServiceRouter);
app.use("/admin", adminRouter);
app.use("/", router);

async.series([
  
  // Establish a connection to the database
  function(callback){
    
    // Get a Database instance
    var db = openVeoAPI.Database.getDatabase(databaseConf);
    
    // Establish connection to the database
    db.connect(function(error){
      if(error)
        process.exit(0);
      
      applicationStorage.setDatabase(db);
      
      // Initialize passport (authentication manager)
      process.require("app/server/passport.js");

      // Load and apply main routes from configuration to
      // public, back end and webservice routers
      applyRoutes(routeLoader.decodeRoutes(process.root, conf["routes"]["public"]), router);
      applyRoutes(routeLoader.decodeRoutes(process.root, conf["routes"]["admin"]), adminRouter);
      applyRoutes(routeLoader.decodeRoutes(process.root, conf["routes"]["ws"]), webServiceRouter);

      // Build core entities
      var decodedEntities = entityLoader.decodeEntities(process.root + "/", conf["entities"]);

      if(decodedEntities){
        for(var type in decodedEntities)
          entities[type] = new decodedEntities[type]();
      }

      callback();
    });
  },

  // Load openveo sub plugins under node_modules directory
  function(callback){
    
    pluginLoader.loadPlugins(path.join(process.root, "node_modules"), function(error, plugins){
      
      // An error occurred when loading plugins
      // The server must not be launched, exit process
      if(error){
        logger.error(error && error.message);
        process.exit(0);
      }
      else{
        var publicDirectories = [];
        applicationStorage.setPlugins(plugins);
        
        plugins.forEach(function(loadedPlugin){

          // If plugin has a public directory, load it as a 
          // static server
          if(loadedPlugin.publicDirectory)
            publicDirectories.push(loadedPlugin.publicDirectory);

          // Mount plugin public router to the plugin front end mount path
          if(loadedPlugin.router && loadedPlugin.mountPath){
            
            // Found routes for the plugin
            // Apply routes to the public router
            if(loadedPlugin.routes)
              applyRoutes(loadedPlugin.routes, loadedPlugin.router);
            
            // Mount public router to the express application
            app.use(loadedPlugin.mountPath, loadedPlugin.router);
          }

          // Mount the admin router to the plugin back end mount path
          if(loadedPlugin.adminRouter && loadedPlugin.mountPath){

            // Found admin routes for the plugin
            // Apply routes to the admin router
            if(loadedPlugin.adminRoutes)
              applyRoutes(loadedPlugin.adminRoutes, loadedPlugin.adminRouter);

            // Mount admin router to the express application
            app.use("/admin" + loadedPlugin.mountPath, loadedPlugin.adminRouter);
          }

          // Mount plugin web service router to the plugin
          // web service mount path
          if(loadedPlugin.webServiceRouter && loadedPlugin.mountPath){

            // Found routes for the plugin
            // Apply routes to the web service router
            if(loadedPlugin.webServiceRoutes)
              applyRoutes(loadedPlugin.webServiceRoutes, loadedPlugin.webServiceRouter);

            // Mount web service router to the express application
            app.use("/ws" + loadedPlugin.mountPath, loadedPlugin.webServiceRouter);
          }
          
          // Found back end menu configuration for the plugin
          if(loadedPlugin.menu)
            menu = menu.concat(loadedPlugin.menu);
          
          // Found a list of folders containing views for the plugin
          if(loadedPlugin.viewsFolders)
            viewsFolders = viewsFolders.concat(loadedPlugin.viewsFolders);

          // Found a list of web service scopes for the plugin
          if(loadedPlugin.webServiceScopes){
            for(var scopeName in loadedPlugin.webServiceScopes)
              webServiceScopes[scopeName] = loadedPlugin.webServiceScopes[scopeName];
          }

          // Found a list of entities for the plugin
          if(loadedPlugin.entities){
            for(var type in loadedPlugin.entities)
              entities[type] = new loadedPlugin.entities[type]();
          }

          logger.info("Plugin " + loadedPlugin.name + " successfully loaded");
          
        });
        
        // Set main public directory to be served first as the static server

        app.use(express.static(path.normalize(process.root + "/public"), staticServerOptions));
        if(env=="dev"){
          app.use(express.static(path.normalize(process.root + "/app/client/assets/js"), staticServerOptions));
        }
        
        // Set plugins public directories as additionnal static servers
        publicDirectories.forEach(function(publicDirectory){
          app.use(express.static(publicDirectory, staticServerOptions));
        });

        // Set views folders for template engine
        app.set("views", viewsFolders);

        applicationStorage.setMenu(menu);
        applicationStorage.setWebServiceScopes(webServiceScopes);
        applicationStorage.setEntities(entities);

      }

      callback();
    });

  },

  // Handle default actions and errors
  function(callback){

    // Handle default action
    app.all("/admin*", defaultController.defaultAction);
    
    // Handle not found files
    app.all("*", defaultController.defaultAction);
    
    // Handle server errors
    app.use(function(error, request, response, next){
      logger.error(error && error.message);
      response.status(500).send();
    });
    
    // Start server
    server = app.listen(serverConf.port, function(){
      logger.info("Server listening at http://%s:%s", server.address().address, server.address().port);
    });

    callback();
  }
]);

/**
 * Applies a list of routes to a router.
 * @param Array routes The list of routes to apply
 * @param Object router An express router to attach the routes to
 */
function applyRoutes(routes, router){
  if(routes && routes.length && router){
    routes.forEach(function(route){
      logger.debug("Route loaded", {"route" : route.method + " " + route.path});
      router[route.method](route.path, route.action);
    });
  }
}