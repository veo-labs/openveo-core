'use strict';

require('./processRequire.js');
var path = require('path');
var async = require('async');
var nopt = require('nopt');

var openVeoAPI = require('@openveo/api');
var ClientProvider = process.require('app/server/providers/ClientProvider.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var TokenProvider = process.require('app/server/providers/TokenProvider.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var GroupProvider = process.require('app/server/providers/GroupProvider.js');
var CorePlugin = process.require('app/server/CorePlugin.js');
var TaxonomyProvider = openVeoAPI.TaxonomyProvider;
var applicationStorage = openVeoAPI.applicationStorage;
var configurationDirectoryPath = path.join(openVeoAPI.fileSystem.getConfDir(), 'core');
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

var server;

if (processOptions['ws']) {
  process.isWebService = true;
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
var permissionLoader = process.require('app/server/loaders/permissionLoader.js');
var migrationProcess = process.require('app/server/migration/migrationProcess.js');

// Set super administrator and anonymous user id from configuration
applicationStorage.setSuperAdminId(coreConf.superAdminId || '0');
applicationStorage.setAnonymousUserId(coreConf.anonymousUserId || '1');

/**
 * Executes a plugin function on all plugins in parallel.
 *
 * @param {String} functionToExecute The name of the function to execute on each plugin
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
function executePluginFunction(functionToExecute, callback) {
  var plugins = applicationStorage.getPlugins();
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
    var db = openVeoAPI.Database.getDatabase(databaseConf);

    // Establish connection to the database
    db.connect(function(error) {
      if (error) {
        process.logger.error(error && error.message);
        throw new Error(error);
      }

      applicationStorage.setDatabase(db);
      callback();
    });
  },

  // Inform server that database is loaded and available
  function(callback) {
    server.onDatabaseAvailable(applicationStorage.getDatabase(), callback);
  },

  // Load Core plugin
  function(callback) {
    corePlugin = new CorePlugin();
    pluginLoader.loadPluginMetadata(corePlugin, callback);
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
        plugins.unshift(corePlugin);
        applicationStorage.setPlugins(plugins);

        plugins.forEach(function(loadedPlugin) {
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
    var entities = entityLoader.buildEntities(applicationStorage.getPlugins());
    applicationStorage.setEntities(entities);
    callback();
  },

  // Load web service scopes
  function(callback) {
    var webServiceScopes = permissionLoader.generateEntityScopes(applicationStorage.getEntities());
    applicationStorage.setWebServiceScopes(webServiceScopes);
    callback();
  },

  // Execute migrations script
  function(callback) {
    var migrations = server.migrations;
    migrationProcess.executeMigrationScript(migrations, callback);
  },

  // Create core indexes
  function(callback) {
    var database = openVeoAPI.applicationStorage.getDatabase();
    var asyncFunctions = [];
    var providers = [
      new ClientProvider(database),
      new RoleProvider(database),
      new TaxonomyProvider(database),
      new TokenProvider(database),
      new UserProvider(database),
      new GroupProvider(database)
    ];

    providers.forEach(function(provider) {
      if (provider.createIndexes) {
        asyncFunctions.push(function(callback) {
          provider.createIndexes(callback);
        });
      }
    });

    async.parallel(asyncFunctions, function(error, results) {
      callback(error);
    });
  },

  // Intitializes plugins
  function(callback) {
    executePluginFunction('init', callback);
  },

  // Start plugins
  function(callback) {
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
