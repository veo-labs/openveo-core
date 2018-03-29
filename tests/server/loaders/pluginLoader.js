'use strict';

var path = require('path');
var assert = require('chai').assert;
var mock = require('mock-require');
var openVeoApi = require('@openveo/api');

// pluginLoader.js
describe('pluginLoader', function() {
  var storage;
  var database;
  var pluginLoader;

  // Mocks
  beforeEach(function() {
    database = {
      getOne: function(location, filter, fields, callback) {
        callback();
      }
    };
    storage = {
      getDatabase: function() {
        return database;
      }
    };

    mock(path.join(process.root, 'app/server/storage.js'), storage);
  });

  // Initializes tests
  beforeEach(function() {
    pluginLoader = mock.reRequire(path.join(process.root, 'app/server/loaders/pluginLoader.js'));
  });

  // Stop mocks
  afterEach(function() {
    mock.stopAll();
  });

  // getPluginPaths method
  describe('getPluginPaths', function() {

    it('should find all potential plugins\' paths inside a directory', function(done) {
      var expectedDir = path.join(__dirname, 'resources/plugins');
      var dir = 'node_modules/@openveo/';
      var expectedPaths = [
        path.join(expectedDir, 'node_modules/openveo-contrib-not-plugin'),
        path.join(expectedDir, 'node_modules/openveo-contrib-plugin-example'),
        path.join(expectedDir, 'node_modules/openveo-contrib-plugin-same'),
        path.join(expectedDir, dir + 'official-plugin-same'),
        path.join(expectedDir, dir + 'official-plugin-example'),
        path.join(expectedDir, dir + 'official-plugin-example/node_modules/openveo-contrib-plugin-subExample'),
        path.join(expectedDir, dir + 'official-plugin-example/node_modules/openveo-contrib-plugin-same'),
        path.join(expectedDir, dir + 'official-plugin-example/node_modules/@openveo/official-plugin-subExample'),
        path.join(expectedDir, dir + 'official-plugin-example/node_modules/@openveo/official-plugin-same'),
        path.join(expectedDir, dir + 'official-plugin-example2'),
        path.join(expectedDir, dir + 'official-plugin-example2/node_modules/openveo-contrib-plugin-subExample2'),
        path.join(expectedDir, dir + 'official-plugin-example2/node_modules/@openveo/official-plugin-subExample2')
      ];
      pluginLoader.getPluginPaths(expectedDir, function(error, pluginsPaths) {
        assert.sameMembers(pluginsPaths, expectedPaths, 'Wrong paths');
        done();
      });
    });

    it('should execute callback with an empty list of plugins\' path if starting path does not exist', function(done) {
      pluginLoader.getPluginPaths('/unknown/path', function(error, pluginsPaths) {
        assert.isNull(error, 'Unexpected error');
        assert.equal(pluginsPaths.length, 0, 'Unexpected paths');
        done();
      });
    });

    it('should throw an exception if starting path is not a valid string', function() {
      var invalidValues = [undefined, null, 42, {}, []];

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          pluginLoader.getPluginPaths(invalidValue, function() {});
        }, TypeError, null, 'Expected exception when starting path is ' + typeof invalidValue);
      });
    });

  });

  // loadPlugins method
  describe('loadPlugins', function() {

    it('should be able to load plugins', function(done) {
      pluginLoader.loadPlugins(path.join(__dirname, 'resources/plugins'), function(error, plugins) {
        assert.isNull(error, 'Unexpected error : ' + (error && error.message));
        assert.equal(plugins.length, 3, 'Expected 3 plugins to be find');
        done();
      });
    });

    it('should throw an exception if starting path is not a valid string', function() {
      var invalidValues = [undefined, null, 42, {}, []];

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          pluginLoader.loadPlugins(invalidValue, function() {});
        }, TypeError, null, 'Expected exception when starting path is ' + typeof invalidValue);
      });
    });

  });

  // loadPlugin method
  describe('loadPlugin', function() {

    it('should be able to load a plugin', function(done) {
      pluginLoader.loadPlugin(
        path.join(__dirname, 'resources/plugins/node_modules/@openveo/official-plugin-example'),
        function(error, loadedPlugin) {
          assert.instanceOf(loadedPlugin, openVeoApi.plugin.Plugin, 'Expected plugin to be a Plugin');
          assert.isDefined(loadedPlugin.router, 'Expected a public router');
          assert.isDefined(loadedPlugin.privateRouter, 'Expected a private router');
          assert.equal(loadedPlugin.name, 'official-plugin-example');
          assert.equal(loadedPlugin.mountPath, '/official-plugin-example');
          assert.isDefined(loadedPlugin.assets, 'Expected assets');
          assert.isDefined(loadedPlugin.i18nDirectory, 'Expected an i18n directory');
          assert.isDefined(loadedPlugin.routes, 'Expected public routes');
          assert.isDefined(loadedPlugin.privateRoutes, 'Expected private routes');
          assert.isDefined(loadedPlugin.webServiceRoutes, 'Expected web sservice routes');
          assert.isDefined(loadedPlugin.namespaces, 'Expected namespaces');
          assert.isDefined(loadedPlugin.scriptLibFiles, 'Expected library script files');
          assert.isDefined(loadedPlugin.scriptFiles, 'Expected library javascript files');
          assert.isDefined(loadedPlugin.cssFiles, 'Expected css files');
          assert.isDefined(loadedPlugin.webServiceScopes, 'Expected web service scopes');
          assert.isDefined(loadedPlugin.permissions, 'Expected permissions');
          done();
        }
      );
    });

    it('should execute callback with an error if loading the module failed', function(done) {
      pluginLoader.loadPlugin('/unknown/plugin/path', function(error, loadedPlugin) {
        assert.instanceOf(error, Error);
        done();
      });
    });

    it('should execute callback with an error if module is not an instance of Plugin', function(done) {
      pluginLoader.loadPlugin(
        path.join(__dirname, 'resources/plugins/node_modules/openveo-contrib-not-plugin'),
        function(error, loadedPlugin) {
          assert.instanceOf(error, Error);
          done();
        }
      );
    });

  });

});
