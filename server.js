'use strict';

require('./processRequire.js');
var path = require('path');
var async = require('async');
var nopt = require('nopt');

var openVeoAPI = require('@openveo/api');
var conf = process.require('conf.json');
var applicationStorage = openVeoAPI.applicationStorage;
var configurationDirectoryPath = path.join(openVeoAPI.fileSystem.getConfDir(), 'core');
var loggerConfPath = path.join(configurationDirectoryPath, 'loggerConf.json');
var serverConfPath = path.join(configurationDirectoryPath, 'serverConf.json');
var databaseConfPath = path.join(configurationDirectoryPath, 'databaseConf.json');
var loggerConf;
var serverConf;
var databaseConf;

var migrationProcess = process.require('app/server/migration/migrationProcess.js');

// Process arguments
var knownProcessOptions = {
  ws: [Boolean],
  serverConf: [String, null],
  databaseConf: [String, null],
  loggerConf: [String, null]
};

// Parse process arguments
var processOptions = nopt(knownProcessOptions, null, process.argv);

// Load configuration files
try {
  loggerConf = require(processOptions.loggerConf || loggerConfPath);
  serverConf = require(processOptions.serverConf || serverConfPath);
  databaseConf = require(processOptions.databaseConf || databaseConfPath);
} catch (error) {
  throw new Error('Invalid configuration file : ' + error.message);
}

var entities = {};
var webServiceScopes = conf['webServiceScopes'] || [];
var server;

if (processOptions['ws']) {
  process.logger = openVeoAPI.logger.add('openveo', loggerConf.ws);
  var WebServiceServer = process.require('app/server/servers/WebServiceServer.js');
  server = new WebServiceServer(serverConf.ws);
} else {
  process.logger = openVeoAPI.logger.add('openveo', loggerConf.app);
  var ApplicationServer = process.require('app/server/servers/ApplicationServer.js');
  server = new ApplicationServer(serverConf.app);
}

// Loaders
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
var entityLoader = process.require('app/server/loaders/entityLoader.js');

async.series([

  // Establish a connection to the database
  function(callback) {

    // Get a Database instance
    var db = openVeoAPI.Database.getDatabase(databaseConf);

    // Establish connection to the database
    db.connect(function(error) {
      if (error) {
        process.logger.error(error && error.message);
        throw new Error(error);
      }

      applicationStorage.setDatabase(db);
      server.onDatabaseAvailable(db);

      // Build core entities
      var decodedEntities = entityLoader.decodeEntities(process.root + '/', conf['entities']);

      if (decodedEntities) {
        for (var type in decodedEntities)
          entities[type] = new decodedEntities[type]();
      }

      callback();
    });
  },

  // Load openveo plugins under node_modules directory
  function(callback) {

    pluginLoader.loadPlugins(path.join(process.root), function(error, plugins) {

      // An error occurred when loading plugins
      // The server must not be launched, exit process
      if (error) {
        process.logger.error(error && error.message);
        throw new Error(error);
      } else {
        applicationStorage.setPlugins(plugins);

        plugins.forEach(function(loadedPlugin) {

          server.onPluginAvailable(loadedPlugin);

          // Found a list of web service scopes for the plugin
          if (loadedPlugin.webServiceScopes) {
            for (var scopeName in loadedPlugin.webServiceScopes)
              webServiceScopes = webServiceScopes.concat(loadedPlugin.webServiceScopes[scopeName]);
          }

          // Found a list of entities for the plugin
          if (loadedPlugin.entities) {
            for (var type in loadedPlugin.entities)
              entities[type] = new loadedPlugin.entities[type]();
          }

          server.onPluginLoaded(loadedPlugin);
          process.logger.info('Plugin ' + loadedPlugin.name + ' successfully loaded');
        });

        applicationStorage.setWebServiceScopes(webServiceScopes);
        applicationStorage.setEntities(entities);
      }

      callback();
    });
  },

 // Execute migrations script
  function(callback) {
    var migrations = server.migrations;
    migrationProcess.executeMigrationScript(migrations, callback);
  },

  // Handle errors
  function(callback) {
    server.onPluginsLoaded();
    server.startServer();
    callback();
  }]
);

