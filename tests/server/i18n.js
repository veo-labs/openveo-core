'use strict';

// Module dependencies
var path = require('path');
var assert = require('chai').assert;
var openVeoAPI = require('@openveo/api');
var applicationStorage = openVeoAPI.applicationStorage;

// i18n.js
describe('i18n', function() {
  var i18n;

  before(function() {
    applicationStorage.setPlugins(
      [
        {
          name: 'example',
          i18nDirectory: path.normalize(path.join(__dirname, '/i18n'))
        }
      ]
      );
    i18n = process.require('app/server/i18n.js');
  });

  // getTranslations method
  describe('getTranslations', function() {

    it('Should return a JSON object', function(done) {
      i18n.getTranslations('languages', 'fr', null, function(translations) {
        assert.isDefined(translations);
        assert.isObject(translations);
        assert.equal(translations.ENGLISH, 'anglais');
        done();
      });
    });

    it('Should return null if no translation found', function(done) {
      i18n.getTranslations('no-translation', 'fr', null, function(translations) {
        assert.isNull(translations);
        done();
      });
    });

    it('Should return null if dictionary is not specified', function(done) {
      i18n.getTranslations(null, 'fr', null, function(translations) {
        assert.isNull(translations);
        done();
      });
    });

    it('Should be able to get translation of a particular language', function(done) {
      i18n.getTranslations('login', 'en', null, function(translations) {
        assert.equal(translations.LOGIN, 'User');
        done();
      });
    });

    it('Should be able to get a translation by language and country code', function(done) {
      i18n.getTranslations('canadian', 'en-CA', null, function(translations) {
        assert.equal(translations.DOLLAR, 'Loonie');
        done();
      });
    });

    it('Should be able to get both plugin translations and openveo translations (merged)', function(done) {
      i18n.getTranslations('back-office', 'en', 'admin-', function(translations) {
        assert.equal(translations.MENU.DASHBOARD, 'Dashboard');
        assert.equal(translations.MENU.EXAMPLE, 'Example');
        done();
      });
    });

  });

});
