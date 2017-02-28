'use strict';

var util = require('util');
var assert = require('chai').assert;
var openVeoApi = require('@openveo/api');
var api = process.require('app/server/api.js');
var Plugin = openVeoApi.plugin.Plugin;

// api.js
describe('api', function() {

  // getApi method
  describe('getApi', function() {
    var GetPlugin;

    // Mocks
    before(function() {
      GetPlugin = function() {
        GetPlugin.super_.call(this);
        this.name = 'get';
        this.api = {};
      };

      util.inherits(GetPlugin, Plugin);
    });

    it('should return the plugin\'s API', function() {
      var getPlugin = new GetPlugin();
      api.addPlugin(getPlugin);
      assert.strictEqual(api.getApi('get'), getPlugin.api);
    });

    it('should return null if no name is provided', function() {
      assert.isNull(api.getApi());
    });

  });

  // getCoreApi method
  describe('getCoreApi', function() {
    var CorePlugin;

    // Mocks
    before(function() {
      CorePlugin = function() {
        CorePlugin.super_.call(this);
        this.name = 'core';
        this.api = {};
      };

      util.inherits(CorePlugin, Plugin);
    });

    it('should return the core\'s API', function() {
      api.addPlugin(new CorePlugin());
      assert.strictEqual(api.getCoreApi(), api.getPlugin('core').api);
    });

  });

  // addPlugin method
  describe('addPlugin', function() {
    var AddPlugin;

    // Mocks
    before(function() {
      AddPlugin = function() {
        AddPlugin.super_.call(this);
        this.name = 'add';
        this.api = {};
      };

      util.inherits(AddPlugin, Plugin);
    });

    it('should be able to add a new plugin', function() {
      var addPlugin = new AddPlugin();
      var totalPlugins = api.getPlugins().length;
      api.addPlugin(addPlugin);
      assert.equal(api.getPlugins().length, totalPlugins + 1);
    });

    it('should not be able to add a plugin without a name', function() {
      assert.throws(function() {
        api.addPlugin({});
      }, TypeError);
    });

    it('should not be able to add a plugin which is not an instance of Plugin', function() {
      var fakePlugin = {name: 'test'};
      assert.throws(function() {
        api.addPlugin(fakePlugin);
      }, Error);
    });

    it('should not be able to modify a plugin when added', function() {
      var addPlugin = api.getPlugin('add');

      if (!addPlugin) {
        addPlugin = new AddPlugin();
        api.addPlugin(addPlugin);
      }

      assert.throws(function() {
        addPlugin.name = 'another name';
      }, TypeError);
    });

  });

  // getPlugin method
  describe('getPlugin', function() {
    var GetPlugin;
    var getPlugin;

    // Mocks
    before(function() {
      GetPlugin = function() {
        GetPlugin.super_.call(this);
        this.name = 'get';
        this.api = {};
      };

      util.inherits(GetPlugin, Plugin);
    });

    beforeEach(function() {
      getPlugin = api.getPlugin('get');

      if (!getPlugin) {
        getPlugin = new GetPlugin();
        api.addPlugin(getPlugin);
      }
    });

    it('should be able to get a plugin by its name', function() {
      assert.strictEqual(getPlugin, api.getPlugin(getPlugin.name));
    });

    it('should return null if plugin does not exist', function() {
      assert.isNull(api.getPlugin('wrong name'));
    });

    it('should return null if no name is provided', function() {
      assert.isNull(api.getPlugin());
    });

  });

});
