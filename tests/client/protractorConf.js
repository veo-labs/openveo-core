'use strict';

var path = require('path');
var async = require('async');
var openVeoAPI = require('@openveo/api');
var e2e = require('@openveo/test').e2e;
var screenshotPlugin = e2e.plugins.screenshotPlugin;
var configDir = openVeoAPI.fileSystem.getConfDir();
var databaseConf = require(path.join(configDir, 'core/databaseTestConf.json'));
var applicationStorage = openVeoAPI.applicationStorage;
var db;

// Set module root directory
process.root = path.join(__dirname, '../../');
process.require = function(filePath) {
  return require(path.normalize(process.root + '/' + filePath));
};
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');

// Load a console logger
process.logger = openVeoAPI.logger.get('openveo');

// Load suites
var suites = process.require('tests/client/e2eTests/suites/suites.json');

exports.config = {
  seleniumServerJar: process.env.SELENIUM_JAR,
  chromeDriver: process.env.CHROME_DRIVER,
  framework: 'mocha',
  mochaOpts: {
    timeout: 80000,
    bail: false
  },
  suites: suites,
  baseUrl: 'http://127.0.0.1:3000/',
  plugins: [
    {
      outdir: 'build/screenshots',
      inline: screenshotPlugin
    }
  ],
  onPrepare: function() {
    var e2e = require('@openveo/test').e2e;
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

      function(callback) {
        db.connect(function(error) {
          if (error)
            throw new Error(error);

          applicationStorage.setDatabase(db);
          callback();
        });
      },

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
    db.close();
  }
};
