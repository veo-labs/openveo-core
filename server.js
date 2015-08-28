"use strict"

// Module dependencies
var path = require("path");
var async = require("async");
var openVeoAPI = require("openveo-api");
var applicationStorage = openVeoAPI.applicationStorage;

// Set module root directory and define a custom require function
process.root = __dirname;
process.require = function(filePath){
  return require(path.normalize(process.root + "/" + filePath));
};

// Configuration
var conf = process.require("conf.json");
var databaseConf = process.require("config/databaseConf.json");
var loggerConf = process.require("config/loggerConf.json");

var entities = {};
var webServiceScopes = conf["webServiceScopes"] || [];
var server;
var logger;

// Web Service
if((process.argv.length > 2 && (process.argv[2] === "-ws" || process.argv[2] === "--ws"))){
  logger = openVeoAPI.logger.get("openveo", loggerConf.ws);
  var WebServiceServer = process.require("app/server/servers/WebServiceServer.js");
  server = new WebServiceServer();
}

// Application
else{
  logger = openVeoAPI.logger.get("openveo", loggerConf.app);
  var ApplicationServer = process.require("app/server/servers/ApplicationServer.js");
  server = new ApplicationServer();
}

// Loaders
var pluginLoader = process.require("app/server/loaders/pluginLoader.js");
var entityLoader = process.require("app/server/loaders/entityLoader.js");

async.series([

  // Establish a connection to the database
  function(callback){

    // Get a Database instance
    var db = openVeoAPI.Database.getDatabase(databaseConf);

    // Establish connection to the database
    db.connect(function(error){
      if(error){
        logger.error(error && error.message);
        process.exit(0);
      }

      applicationStorage.setDatabase(db);
      server.onDatabaseAvailable(db);

      // Build core entities
      var decodedEntities = entityLoader.decodeEntities(process.root + "/", conf["entities"]);

      if(decodedEntities){
        for(var type in decodedEntities)
          entities[type] = new decodedEntities[type]();
      }

      callback();
    });
  },

  // Load openveo plugins under node_modules directory
  function(callback){

    pluginLoader.loadPlugins(path.join(process.root, "node_modules"), function(error, plugins){

      // An error occurred when loading plugins
      // The server must not be launched, exit process
      if(error){
        logger.error(error && error.message);
        process.exit(0);
      }
      else{
        applicationStorage.setPlugins(plugins);

        plugins.forEach(function(loadedPlugin){
          server.onPluginAvailable(loadedPlugin);

          // Found a list of web service scopes for the plugin
          if(loadedPlugin.webServiceScopes){
            for(var scopeName in loadedPlugin.webServiceScopes)
              webServiceScopes = webServiceScopes.concat(loadedPlugin.webServiceScopes[scopeName]);
          }            

          // Found a list of entities for the plugin
          if(loadedPlugin.entities){
            for(var type in loadedPlugin.entities)
              entities[type] = new loadedPlugin.entities[type]();
          }
        
          server.onPluginLoaded(loadedPlugin);
          logger.info("Plugin " + loadedPlugin.name + " successfully loaded");            
        });

        applicationStorage.setWebServiceScopes(webServiceScopes);
        applicationStorage.setEntities(entities);
      }

      callback();
    });

  },

  // Handle errors
  function(callback){
    server.onPluginsLoaded();
    server.startServer();
    callback();
  }
]);