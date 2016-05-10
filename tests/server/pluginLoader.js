'use strict';

var path = require('path');
var assert = require('chai').assert;
var openVeoAPI = require('@openveo/api');
var ut = require('@openveo/test').unit;
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');

// pluginLoader.js
describe('pluginLoader', function() {

  before(function() {
    ut.generator.generateSuccessDatabase();
  });

  // loadPlugins method
  describe('loadPlugins', function() {

    it('should be able to load plugins', function(done) {
      pluginLoader.loadPlugins(path.join(__dirname, 'plugins'), function(error, plugins) {
        assert.isNull(error, 'Unexpected error : ' + (error && error.message));
        assert.isArray(plugins, 'Expected an array of plugins');
        assert.equal(plugins.length, 2, 'Expected 2 plugins to be find');
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
      pluginLoader.loadPlugin(path.join(__dirname, 'plugins/node_modules/@openveo/example'), path.join(
        __dirname, 'plugins'), function(error, loadedPlugin) {
          assert.instanceOf(loadedPlugin, openVeoAPI.Plugin, 'Expected plugin to be a Plugin');
          assert.isDefined(loadedPlugin.router, 'Expected a public router');
          assert.isDefined(loadedPlugin.privateRouter, 'Expected a private router');
          assert.equal(loadedPlugin.name, 'example');
          assert.equal(loadedPlugin.mountPath, '/example');
          assert.isDefined(loadedPlugin.assets, 'Expected assets');
          assert.isDefined(loadedPlugin.i18nDirectory, 'Expected an i18n directory');
          assert.isDefined(loadedPlugin.routes, 'Expected public routes');
          assert.isDefined(loadedPlugin.privateRoutes, 'Expected private routes');
          assert.isDefined(loadedPlugin.webServiceRoutes, 'Expected web sservice routes');
          assert.isDefined(loadedPlugin.scriptLibFiles, 'Expected library script files');
          assert.isDefined(loadedPlugin.scriptFiles, 'Expected library javascript files');
          assert.isDefined(loadedPlugin.cssFiles, 'Expected css files');
          assert.isDefined(loadedPlugin.webServiceScopes, 'Expected web service scopes');
          assert.isDefined(loadedPlugin.permissions, 'Expected permissions');
          done();
        }
      );
    });

    it('should throw an exception if plugin path is not a valid string', function() {
      var invalidValues = [undefined, null, 42, {}, []];

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          pluginLoader.loadPlugin(invalidValue, path.join(__dirname, 'plugins'), function() {});
        }, TypeError, null, 'Expected exception when starting path is ' + typeof invalidValue);
      });
    });

  });

});
