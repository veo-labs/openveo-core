'use strict';

require('../../processRequire.js');
var path = require('path');
var async = require('async');
var childProcess = require('child_process');
var openVeoApi = require('@openveo/api');
var e2e = require('@openveo/test').e2e;
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
var entityLoader = process.require('app/server/loaders/entityLoader.js');
var permissionLoader = process.require('app/server/loaders/permissionLoader.js');
var ClientModel = process.require('app/server/models/ClientModel.js');
var ClientProvider = process.require('app/server/providers/ClientProvider.js');
var UserModel = process.require('app/server/models/UserModel.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var CorePlugin = process.require('app/server/plugin/CorePlugin.js');
var storage = process.require('app/server/storage.js');
var api = process.require('app/server/api.js');
var screenshotPlugin = e2e.plugins.screenshotPlugin;
var configurationDirectoryPath = path.join(openVeoApi.fileSystem.getConfDir(), 'core');
var serverConfPath = path.join(configurationDirectoryPath, 'serverTestConf.json');
var loggerConfPath = path.join(configurationDirectoryPath, 'loggerTestConf.json');
var databaseConfPath = path.join(configurationDirectoryPath, 'databaseTestConf.json');
var confPath = path.join(configurationDirectoryPath, 'conf.json');
var databaseConf = require(databaseConfPath);
var serverConf = require(serverConfPath);
var coreConf = require(confPath);
var db;
var servers = {};
var webServiceApplications;
var users;
var corePlugin;

// Load a console logger
process.logger = openVeoApi.logger.add('openveo');

// Exposes API
process.api = api;

// Load suites
var suites = process.require('tests/client/e2eTests/build/suites.json');

exports.config = {
  framework: 'mocha',
  mochaOpts: {
    timeout: 200000,
    bail: false
  },
  suites: suites,
  baseUrl: 'http://127.0.0.1:' + serverConf.app.httpPort + '/',
  webServiceUrl: 'http://127.0.0.1:' + serverConf.ws.port + '/',
  plugins: [
    {
      outdir: 'build/screenshots',
      inline: screenshotPlugin
    }
  ],

  /**
   * Gets Web Service application configuration by application id.
   *
   * @param {String} applicationId The application id as defined in data.json file
   * @return {Object} The description object of the application
   */
  getWebServiceApplication: function(applicationId) {
    for (var i = 0; i < webServiceApplications.length; i++) {
      if (webServiceApplications[i].name === applicationId)
        return webServiceApplications[i];
    }
    return null;
  },

  /**
   * Gets user configuration by user id.
   *
   * @param {String} userId The user id as defined in data.json file
   * @return {Object} The description object of the user
   */
  getUser: function(userId) {
    for (var i = 0; i < users.length; i++) {
      if (users[i].name === userId)
        return users[i];
    }
    return null;
  },

  /**
   * Gets back end menu ordered by weight.
   *
   * @return {Array} The menu and sub menus
   */
  getMenu: function() {
    var plugins = process.api.getPlugins();
    var menu = [];

    function sortByWeight(item1, item2) {
      if (!item1.weight) return -1;
      if (!item2.weight) return 1;
      return (item1.weight < item2.weight) ? -1 : 1;
    }

    plugins.forEach(function(plugin) {
      if (plugin.menu) {
        menu = menu.concat(plugin.menu);
        menu = menu.sort(sortByWeight);

        if (menu.subMenu)
          menu.subMenu = menu.subMenu.sort(sortByWeight);
      }
    });

    return menu;
  },

  /**
   * Starts OpenVeo as a sub process.
   *
   * @param {Boolean} ws true to start OpenVeo Web Service, false to start OpenVeo
   * @param {Boolean} doNotWaitForAngular true to not wait for angular application
   * @return {Promise} Promise resolved when OpenVeo has started
   */
  startOpenVeo: function(ws, doNotWaitForAngular) {
    var flow = browser.controlFlow();

    function start() {
      return flow.execute(function() {
        var server = (ws) ? 'webServiceServer' : 'applicationServer';

        if (servers[server] && servers[server].connected)
          return protractor.promise.fulfilled();

        var deferred = protractor.promise.defer();
        var options = [
          '--serverConf', serverConfPath,
          '--loggerConf', loggerConfPath,
          '--databaseConf', databaseConfPath
        ];
        if (ws) options.push('--ws');

        // Executes server as a child process
        servers[server] = childProcess.fork(path.join(process.root, '/server.js'), options);

        // Listen to messages from sub process
        servers[server].on('message', function(data) {
          if (data)
            if (data.status === 'started') deferred.fulfill();
        });

        return deferred.promise;
      });
    }

    if (doNotWaitForAngular) {
      return start();
    } else {
      return browser.waitForAngular().then(function() {
        return start();
      });
    }
  },

  /**
   * Stops OpenVeo sub process.
   *
   * @param {Boolean} ws true to stop OpenVeo Web Service, false to stop OpenVeo
   * @return {Promise} Promise resolved when OpenVeo has stopped
   */
  stopOpenVeo: function(ws) {
    var flow = browser.controlFlow();

    return browser.waitForAngular().then(function() {
      return flow.execute(function() {
        var server = (ws) ? 'webServiceServer' : 'applicationServer';

        if (!servers[server] || !servers[server].connected)
          return protractor.promise.fulfilled();

        var deferred = protractor.promise.defer();
        servers[server].on('exit', function(code, signal) {
          deferred.fulfill();
        });

        servers[server].kill('SIGINT');
        return deferred.promise;
      });
    });
  },

  /**
   * Restarts OpenVeo sub process.
   *
   * @param {Boolean} ws true to restart OpenVeo Web Service, false to restart OpenVeo
   * @param {Boolean} doNotWaitForAngular true to not wait for angular application
   * @return {Promise} Promise resolved when OpenVeo has restarted
   */
  restartOpenVeo: function(ws, doNotWaitForAngular) {
    exports.config.stopOpenVeo(ws);
    exports.config.startOpenVeo(ws);
  },

  /**
   * Prepares tests environment.
   *
   * Prepare browser before executing tests, spawn an OpenVeo server, spawn an OpenVeo Web Service
   * server, establish connection to the database, expose the list of plugins, expose the list of
   * users, expose the list of applications.
   *
   * @return {Promise} Promise resolved when environment is prepared
   */
  onPrepare: function() {
    var deferred = protractor.promise.defer();
    var flow = browser.controlFlow();

    // Init process configuration
    e2e.browser.deactivateAnimations();
    e2e.browser.init();

    // Set browser size
    e2e.browser.setSize(1920, 1080);

    // Get a Database instance to the test database
    db = openVeoApi.database.factory.get(databaseConf);

    async.series([

      // Launch openveo server as a sub process
      function(callback) {

        exports.config.startOpenVeo(false, true).then(function() {
          callback();
        });
      },

      // Launch openveo web service server as a sub process
      function(callback) {

        exports.config.startOpenVeo(true, true).then(function() {
          callback();
        });

      },

      // Establish connection to the database
      function(callback) {
        db.connect(function(error) {
          if (error)
            throw new Error(error);

          storage.setDatabase(db);

          // Set super administrator and anonymous user id from configuration
          storage.setConfiguration({
            superAdminId: '0',
            anonymousId: '1',
            cdn: coreConf.cdn
          });

          callback();
        });
      },

      // Load Core plugin
      function(callback) {
        corePlugin = new CorePlugin();
        pluginLoader.loadPluginMetadata(corePlugin, callback);
      },

      // Load openveo plugins
      function(callback) {
        pluginLoader.loadPlugins(path.join(process.root), function(error, plugins) {
          if (error) {
            throw new Error(error);
          } else {
            plugins.unshift(corePlugin);

            plugins.forEach(function(plugin) {
              process.api.addPlugin(plugin);
            });

            callback();
          }
        });
      },

      // Load entities
      function(callback) {
        var entities = entityLoader.buildEntities(process.api.getPlugins());
        storage.setEntities(entities);
        callback();
      },

      // Load permissions
      function(callback) {
        var entities = storage.getEntities();
        var plugins = process.api.getPlugins();
        permissionLoader.buildPermissions(entities, plugins, function(error, permissions) {
          if (error)
            return callback(error);

          // Store application's permissions
          storage.setPermissions(permissions);

          callback();
        });
      },

      // Get the list of available client applications and expose it to plugins
      function(callback) {
        var clientModel = new ClientModel(new ClientProvider(storage.getDatabase()));
        clientModel.get(null, function(error, entities) {
          if (error) {
            throw new Error(error);
          } else {
            webServiceApplications = entities;
            callback(error);
          }
        });
      },

      // Get the list of available users and expose it to plugins
      function(callback) {
        var userModel = new UserModel(new UserProvider(storage.getDatabase()));
        userModel.get(null, function(error, entities) {
          if (error) {
            throw new Error(error);
          } else {
            users = entities;
            callback(error);
          }
        });
      }

    ], function(error) {
      deferred.fulfill();
    });

    return flow.execute(function() {
      return deferred.promise;
    });
  },
  onCleanUp: function() {
    process.logger.info('Tests finished, exit servers and close connection to the database');
    servers['applicationServer'].kill('SIGINT');
    servers['webServiceServer'].kill('SIGINT');
    db.close();
  }
};
