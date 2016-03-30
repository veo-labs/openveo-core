'use strict';

require('../../processRequire.js');
var path = require('path');
var async = require('async');
var childProcess = require('child_process');
var openVeoAPI = require('@openveo/api');
var e2e = require('@openveo/test').e2e;
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
var ClientModel = process.require('app/server/models/ClientModel.js');
var UserModel = process.require('app/server/models/UserModel.js');
var screenshotPlugin = e2e.plugins.screenshotPlugin;
var configurationDirectoryPath = path.join(openVeoAPI.fileSystem.getConfDir(), 'core');
var serverConfPath = path.join(configurationDirectoryPath, 'serverTestConf.json');
var loggerConfPath = path.join(configurationDirectoryPath, 'loggerTestConf.json');
var databaseConfPath = path.join(configurationDirectoryPath, 'databaseTestConf.json');
var confPath = path.join(configurationDirectoryPath, 'conf.json');
var databaseConf = require(databaseConfPath);
var serverConf = require(serverConfPath);
var conf = require(confPath);
var applicationStorage = openVeoAPI.applicationStorage;
var db;
var applicationServer;
var webServiceServer;
var webServiceApplications;
var users;

// Load a console logger
process.logger = openVeoAPI.logger.get('openveo');

// Load suites
var suites = process.require('tests/client/e2eTests/suites/suites.json');

exports.config = {
  seleniumServerJar: process.env.SELENIUM_JAR,
  chromeDriver: process.env.CHROME_DRIVER,
  framework: 'mocha',
  mochaOpts: {
    timeout: 200000,
    bail: false
  },
  suites: suites,
  baseUrl: 'http://127.0.0.1:' + serverConf.app.port + '/',
  webServiceUrl: 'http://127.0.0.1:' + serverConf.ws.port + '/',
  plugins: [
    {
      outdir: 'build/screenshots',
      inline: screenshotPlugin
    }
  ],
  getWebServiceApplication: function(applicationName) {
    for (var i = 0; i < webServiceApplications.length; i++) {
      if (webServiceApplications[i].name === applicationName)
        return webServiceApplications[i];
    }
    return null;
  },
  getUser: function(userName) {
    for (var i = 0; i < users.length; i++) {
      if (users[i].name === userName)
        return users[i];
    }
    return null;
  },
  onPrepare: function() {
    var deferred = protractor.promise.defer();
    var flow = browser.controlFlow();

    // Init process configuration
    e2e.browser.deactivateAnimations();
    e2e.browser.init();

    // Set browser size
    e2e.browser.setSize(1920, 1080);

    // Get a Database instance to the test database
    db = openVeoAPI.Database.getDatabase(databaseConf);

    async.series([

      // Launch openveo server
      function(callback) {

        // Executes server as a child process
        applicationServer = childProcess.fork(path.join(process.root, '/server.js'), [
          '--serverConf', serverConfPath,
          '--loggerConf', loggerConfPath,
          '--databaseConf', databaseConfPath
        ]);

        // Listen to messages from server process
        applicationServer.on('message', function(data) {
          if (data) {
            if (data.status === 'started') {
              process.logger.info('Server started');
              callback();
            }
          }
        });

      },

      // Launch openveo web service server
      function(callback) {

        // Executes server as a child process
        webServiceServer = childProcess.fork(path.join(process.root, '/server.js'), [
          '--ws',
          '--serverConf', serverConfPath,
          '--loggerConf', loggerConfPath,
          '--databaseConf', databaseConfPath
        ]);

        // Listen to messages from server process
        webServiceServer.on('message', function(data) {
          if (data) {
            if (data.status === 'started') {
              process.logger.info('Web service server started');
              callback();
            }
          }
        });

      },

      // Establish connection to the database
      function(callback) {
        db.connect(function(error) {
          if (error)
            throw new Error(error);

          applicationStorage.setDatabase(db);

          // Set super administrator and anonymous user id from configuration
          applicationStorage.setSuperAdminId(conf.superAdminId || '0');
          applicationStorage.setAnonymousUserId(conf.anonymousUserId || '1');

          callback();
        });
      },

      // Load openveo plugins
      function(callback) {
        pluginLoader.loadPlugins(path.join(process.root), function(error, plugins) {
          if (error) {
            throw new Error(error);
          } else {
            applicationStorage.setPlugins(plugins);
            callback();
          }
        });
      },

      // Get the list of available client applications and expose it to plugins
      function(callback) {
        var clientModel = new ClientModel();
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
        var userModel = new UserModel();
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
    applicationServer.kill('SIGINT');
    webServiceServer.kill('SIGINT');
    db.close();
  }
};
