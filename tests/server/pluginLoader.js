'use strict';

// Module dependencies
var path = require('path');
var assert = require('chai').assert;

// pluginLoader.js
describe('pluginLoader', function() {
  var pluginLoader;

  before(function() {
    pluginLoader = process.require('app/server/loaders/pluginLoader.js');
  });

  // loadPlugins method
  describe('loadPlugins', function() {

    it('Should load plugins example and subExample', function(done) {
      pluginLoader.loadPlugins(path.join(__dirname, 'plugins'), function(error, plugins) {
        assert.ok(!error && plugins);
        assert.isArray(plugins);
        assert.equal(plugins.length, 3);
        assert.equal(plugins[0].name, 'example');
        assert.equal(plugins[1].name, 'subExample');
        assert.equal(plugins[2].name, 'subExample2');
        done();
      });
    });

  });

  // loadPlugin method
  describe('loadPlugin', function() {

    it('Should load plugin example with a public router, an admin router and a webservice router', function(done) {
      pluginLoader.loadPlugin(path.join(__dirname, 'plugins', 'node_modules', '@openveo', 'example'), path.join(
        __dirname, 'plugins'), function(error, loadedPlugin) {
          assert.isObject(loadedPlugin);
          assert.isDefined(loadedPlugin.router);
          assert.isFunction(loadedPlugin.router);
          assert.isDefined(loadedPlugin.privateRouter);
          assert.isFunction(loadedPlugin.privateRouter);
          assert.equal(loadedPlugin.name, 'example');
          assert.equal(loadedPlugin.mountPath, '/example');
          assert.isDefined(loadedPlugin.assets);
          assert.isString(loadedPlugin.assets);
          assert.isDefined(loadedPlugin.i18nDirectory);
          assert.isString(loadedPlugin.i18nDirectory);
          assert.isDefined(loadedPlugin.routes);
          assert.isArray(loadedPlugin.routes);
          assert.isDefined(loadedPlugin.privateRoutes);
          assert.isArray(loadedPlugin.privateRoutes);
          assert.isDefined(loadedPlugin.webServiceRoutes);
          assert.isArray(loadedPlugin.webServiceRoutes);
          assert.isDefined(loadedPlugin.scriptLibFiles);
          assert.isObject(loadedPlugin.scriptLibFiles);
          assert.isDefined(loadedPlugin.scriptFiles);
          assert.isObject(loadedPlugin.scriptFiles);
          assert.isDefined(loadedPlugin.cssFiles);
          assert.isArray(loadedPlugin.cssFiles);
          assert.isDefined(loadedPlugin.webServiceScopes);
          assert.isObject(loadedPlugin.webServiceScopes);
          assert.isDefined(loadedPlugin.permissions);
          assert.isArray(loadedPlugin.permissions);
          assert.equal(loadedPlugin.routes.length, 4);
          assert.equal(loadedPlugin.privateRoutes.length, 6);
          assert.equal(loadedPlugin.webServiceRoutes.length, 6);
          done();
        }
      );
    });

    it('Should load plugin subExample', function(done) {
      pluginLoader.loadPlugin(path.join(__dirname, 'plugins', 'node_modules', '@openveo', 'subExample'), path.join(
        __dirname, 'plugins'), function(error, loadedPlugin) {
          assert.isObject(loadedPlugin);
          assert.isUndefined(loadedPlugin.router);
          assert.isUndefined(loadedPlugin.mountPath);
          assert.equal(loadedPlugin.name, 'subExample');
          done();
        }
      );
    });

    it('Should load plugin subExample2 as a sub plugin of subExample', function(done) {
      pluginLoader.loadPlugin(path.join(__dirname, 'plugins', 'node_modules', '@openveo', 'subExample', 'node_modules',
        '@openveo', 'subExample2'), path.join(__dirname, 'plugins'), function(error, loadedPlugin) {
          assert.isObject(loadedPlugin);
          assert.isUndefined(loadedPlugin.router);
          assert.isUndefined(loadedPlugin.mountPath);
          assert.equal(loadedPlugin.name, 'subExample2');
          done();
        }
      );
    });

  });

});
