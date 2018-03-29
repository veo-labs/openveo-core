'use strict';

var util = require('util');
var path = require('path');
var assert = require('chai').assert;
var openVeoApi = require('@openveo/api');
var CorePluginApi = process.require('app/server/plugin/CorePluginApi.js');
var storage = process.require('app/server/storage.js');

// CorePluginApi.js
describe('CorePluginApi', function() {
  var coreApi;
  var TestPlugin;

  // Mocks
  beforeEach(function() {
    TestPlugin = function() {
      TestPlugin.super_.call(this);
    };

    util.inherits(TestPlugin, openVeoApi.plugin.Plugin);

    storage.setDatabase(new openVeoApi.storages.Database({}));
  });

  // Add core plugin
  beforeEach(function() {
    var examplePlugin = new TestPlugin();
    examplePlugin.name = 'example';
    examplePlugin.i18nDirectory = path.join(__dirname, 'resources', 'example');

    var example2Plugin = new TestPlugin();
    example2Plugin.name = 'example2';
    example2Plugin.i18nDirectory = path.join(__dirname, 'resources', 'example2');

    process.api.addPlugin(examplePlugin);
    process.api.addPlugin(example2Plugin);

    coreApi = new CorePluginApi();
  });

  afterEach(function() {
    process.api.removePlugins();
    storage.setDatabase(null);
  });

  // getTranslations method
  describe('getTranslations', function() {

    it('should be able to get translation of a particular language', function(done) {
      coreApi.getTranslations('french', 'fr', function(error, translations) {
        assert.isNull(error, 'Getting translations failed : ' + (error && error.message));
        assert.equal(translations.EXAMPLE.FRENCH, 'Français');
        done();
      });
    });

    it('should be able to get a translation of a particular language and country', function(done) {
      coreApi.getTranslations('canadian', 'en-CA', function(error, translations) {
        assert.equal(translations.EXAMPLE.DOLLAR, 'Loonie');
        done();
      });
    });

    it('should not wrap translations if already wrapped', function(done) {
      coreApi.getTranslations('wrapped', 'en', function(error, translations) {
        assert.equal(translations.EXAMPLE.WRAPPED, 'wrapped');
        done();
      });
    });

    it('should return null if no translation found', function(done) {
      coreApi.getTranslations('no-translation', 'fr', function(error, translations) {
        assert.isNull(translations);
        done();
      });
    });

    it('should return null if dictionary is not specified', function(done) {
      coreApi.getTranslations(null, 'fr', function(error, translations) {
        assert.isNull(translations);
        done();
      });
    });

    it('should return translations in english if no language is not specified', function(done) {
      coreApi.getTranslations('english', null, function(error, translations) {
        assert.equal(translations.EXAMPLE.ENGLISH, 'English');
        done();
      });
    });

    it('should be able to get translations for all plugins (merged)', function(done) {
      coreApi.getTranslations('common', 'en', function(error, translations) {
        assert.equal(translations.EXAMPLE.COMMON, 'Common');
        assert.equal(translations.EXAMPLE2.COMMON, 'Common');
        done();
      });
    });

  });

});
