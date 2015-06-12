"use strict"

// Module dependencies
var path = require("path");
var assert = require("chai").assert;

// Set module root directory
process.root = path.join(__dirname, "../../");
process.require = function(filePath){
  return require(path.normalize(process.root + "/" + filePath));
};

// Module files
var pluginLoader = require("../../app/server/loaders/pluginLoader.js");

describe("pluginLoader", function(){
  
  describe("loadPlugins", function(){

    it("Should load plugins example and subExample", function(done){
      pluginLoader.loadPlugins(path.join(__dirname, "plugins", "node_modules"), function(error, plugins){
        assert.ok(!error && plugins);
        assert.isArray(plugins);
        assert.equal(plugins.length, 2);
        assert.equal(plugins[0].name, "example");
        assert.equal(plugins[1].name, "subExample");
        done();
      });
    });

  });
  
  describe("loadPlugin", function(){

    it("Should load plugin example with a public router, an admin router and a webservice router", function(done){
      pluginLoader.loadPlugin(path.join(__dirname, "plugins", "node_modules", "openveo-example"), function(error, loadedPlugin){
        assert.isObject(loadedPlugin);
        assert.isDefined(loadedPlugin.router);
        assert.isFunction(loadedPlugin.router);
        assert.isDefined(loadedPlugin.adminRouter);
        assert.isFunction(loadedPlugin.adminRouter);        
        assert.equal(loadedPlugin.name, "example");
        assert.equal(loadedPlugin.mountPath, "/example");
        assert.isDefined(loadedPlugin.publicDirectory);
        assert.isString(loadedPlugin.publicDirectory);
        assert.isDefined(loadedPlugin.i18nDirectory);
        assert.isString(loadedPlugin.i18nDirectory);
        assert.isDefined(loadedPlugin.routes);
        assert.isArray(loadedPlugin.routes);
        assert.isDefined(loadedPlugin.adminRoutes);
        assert.isArray(loadedPlugin.adminRoutes);
        assert.isDefined(loadedPlugin.webServiceRoutes);
        assert.isArray(loadedPlugin.webServiceRoutes);
        assert.isDefined(loadedPlugin.scriptLibFiles);
        assert.isArray(loadedPlugin.scriptLibFiles);   
        assert.isDefined(loadedPlugin.scriptFiles);
        assert.isArray(loadedPlugin.scriptFiles);          
        assert.isDefined(loadedPlugin.cssFiles);
        assert.isArray(loadedPlugin.cssFiles);                
        assert.equal(loadedPlugin.routes.length, 4);
        assert.equal(loadedPlugin.adminRoutes.length, 6);
        assert.equal(loadedPlugin.webServiceRoutes.length, 6);
        done();
      });
    });
    
    it("Should load plugin subExample", function(done){
      pluginLoader.loadPlugin(path.join(__dirname, "plugins", "node_modules", "openveo-subExample"), function(error, loadedPlugin){
        assert.isObject(loadedPlugin);
        assert.isUndefined(loadedPlugin.router);
        assert.isUndefined(loadedPlugin.mountPath);
        assert.equal(loadedPlugin.name, "subExample");
        done();
      });
    });

  });

});