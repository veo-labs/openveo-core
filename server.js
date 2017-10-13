'use strict';

require('./processRequire.js');
var path = require('path');
var async = require('async');
var nopt = require('nopt');

var openVeoApi = require('@openveo/api');
var CorePlugin = process.require('app/server/plugin/CorePlugin.js');
var storage = process.require('app/server/storage.js');
var api = process.require('app/server/api.js');
var configurationDirectoryPath = path.join(openVeoApi.fileSystem.getConfDir(), 'core');
var loggerConfPath = path.join(configurationDirectoryPath, 'loggerConf.json');
var serverConfPath = path.join(configurationDirectoryPath, 'serverConf.json');
var databaseConfPath = path.join(configurationDirectoryPath, 'databaseConf.json');
var loggerConf;
var serverConf;
var databaseConf;
var coreConf;
var corePlugin;

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
  coreConf = require(path.join(configurationDirectoryPath, 'conf.json'));
  loggerConf = require(processOptions.loggerConf || loggerConfPath);
  serverConf = require(processOptions.serverConf || serverConfPath);
  databaseConf = require(processOptions.databaseConf || databaseConfPath);
} catch (error) {
  throw new Error('Invalid configuration file : ' + error.message);
}

// Exposes APIs
process.api = api;

var server;

if (processOptions['ws']) {
  process.isWebService = true;
  process.logger = openVeoApi.logger.add('openveo', loggerConf.ws);
  var WebServiceServer = process.require('app/server/servers/WebServiceServer.js');
  server = new WebServiceServer(serverConf.ws);
} else {
  process.logger = openVeoApi.logger.add('openveo', loggerConf.app);
  var ApplicationServer = process.require('app/server/servers/ApplicationServer.js');
  server = new ApplicationServer(serverConf.app);
}

// Loaders
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
var entityLoader = process.require('app/server/loaders/entityLoader.js');
var permissionLoader = process.require('app/server/loaders/permissionLoader.js');
var migrationProcess = process.require('app/server/migration/migrationProcess.js');

// Store configuration
storage.setConfiguration({
  superAdminId: '0',
  anonymousId: '1',
  cdn: coreConf.cdn
});

/**
 * Executes a plugin function on all plugins in parallel.
 *
 * @param {String} functionToExecute The name of the function to execute on each plugin
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
function executePluginFunction(functionToExecute, callback) {
  var plugins = process.api.getPlugins();
  var asyncFunctions = [];

  plugins.forEach(function(plugin) {
    if (plugin[functionToExecute] && typeof plugin[functionToExecute] === 'function')
      asyncFunctions.push(function(callback) {
        plugin[functionToExecute](callback);
      });
  });

  if (asyncFunctions.length)
    async.parallel(asyncFunctions, callback);
  else
    callback();
}

async.series([

  // Establish a connection to the database
  function(callback) {

    // Get a Database instance
    var db = openVeoApi.database.factory.get(databaseConf);

    // Establish connection to the database
    db.connect(function(error) {
      if (error) {
        process.logger.error(error && error.message);
        throw new Error(error);
      }

      storage.setDatabase(db);
      callback();
    });
  },

  // Inform server that database is loaded and available
  function(callback) {
    server.onDatabaseAvailable(storage.getDatabase(), function() {
      callback();
    });
  },

  // Load Core plugin
  function(callback) {
    corePlugin = new CorePlugin();
    pluginLoader.loadPluginMetadata(corePlugin, function(error) {
      if (error)
        return callback(error);

      // Add core plugin and exposes its APIs before loading other plugins
      // as some plugins could use its APIs
      process.api.addPlugin(corePlugin);

      callback();
    });
  },

  // Load openveo plugins
  function(callback) {
    pluginLoader.loadPlugins(process.root, function(error, plugins) {

      // An error occurred when loading plugins
      // The server must not be launched, exit process
      if (error) {
        process.logger.error(error && error.message);
        throw new Error(error);
      } else {
        var asyncFunctions = [];

        // Inform that core plugin is loaded
        asyncFunctions.push(function(callback) {
          server.onPluginLoaded(corePlugin, callback);
        });

        plugins.forEach(function(loadedPlugin) {
          process.api.addPlugin(loadedPlugin);

          asyncFunctions.push(function(callback) {
            server.onPluginLoaded(loadedPlugin, callback);
          });
        });

        async.series(asyncFunctions, function(error, results) {
          callback();
        });
      }

    });
  },

  // Load entities
  function(callback) {
    var entities = entityLoader.buildEntities(process.api.getPlugins());
    storage.setEntities(entities);
    callback();
  },

  // Load web service scopes
  function(callback) {
    var scopes = permissionLoader.buildScopes(storage.getEntities(), process.api.getPlugins());
    storage.setWebServiceScopes(scopes);
    callback();
  },

  // Execute migrations script
  function(callback) {
    var migrations = server.migrations;
    migrationProcess.executeMigrationScript(migrations, callback);
  },

  // Intitializes plugins
  function(callback) {
    process.logger.debug('Launch plugins "init" step');
    executePluginFunction('init', callback);
  },

  // Start plugins
  function(callback) {
    process.logger.debug('Launch plugins "start" step');
    executePluginFunction('start', callback);
  },

  // Inform server that all plugins are loaded
  function(callback) {
    server.onPluginsLoaded(callback);
  },

  // Start server
  function(callback) {
    server.startServer(callback);
  }
],
function(error) {
  if (error)
    throw error;
});
