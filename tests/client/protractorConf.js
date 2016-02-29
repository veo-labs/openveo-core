'use strict';

require('../../processRequire.js');
var path = require('path');
var async = require('async');
var childProcess = require('child_process');
var openVeoAPI = require('@openveo/api');
var e2e = require('@openveo/test').e2e;
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
var screenshotPlugin = e2e.plugins.screenshotPlugin;
var configurationDirectoryPath = path.join(openVeoAPI.fileSystem.getConfDir(), 'core');
var serverConfPath = path.join(configurationDirectoryPath, 'serverTestConf.json');
var loggerConfPath = path.join(configurationDirectoryPath, 'loggerTestConf.json');
var databaseConf = require(path.join(configurationDirectoryPath, 'databaseTestConf.json'));
var serverConf = require(serverConfPath);
var applicationStorage = openVeoAPI.applicationStorage;
var db;
var server;

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
  plugins: [
    {
      outdir: 'build/screenshots',
      inline: screenshotPlugin
    }
  ],
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
        server = childProcess.fork(path.join(process.root, '/server.js'), [
          '--serverConf', serverConfPath,
          '--loggerConf', loggerConfPath,
          '--databaseConf', path.join(configurationDirectoryPath, 'databaseTestConf.json')
        ]);

        // Listen to messages from server process
        server.on('message', function(data) {
          if (data) {
            if (data.status === 'started') {
              process.logger.info('Server started');
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
      }

    ], function(error) {
      deferred.fulfill();
    });

    return flow.execute(function() {
      return deferred.promise;
    });
  },
  onCleanUp: function() {
    process.logger.info('Tests finished, exit server and close connection to the database');
    server.kill('SIGINT');
    db.close();
  }
};
