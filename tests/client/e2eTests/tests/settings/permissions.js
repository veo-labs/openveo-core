'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var SettingPage = process.require('tests/client/e2eTests/pages/SettingPage.js');
var SettingHelper = process.require('tests/client/e2eTests/helpers/SettingHelper.js');
var SettingProvider = process.require('app/server/providers/SettingProvider.js');
var storage = process.require('app/server/storage.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Settings page', function() {
  var page;
  var defaultSettings;
  var settingHelper;

  // Prepare page
  before(function() {
    var provider = new SettingProvider(storage.getDatabase());
    settingHelper = new SettingHelper(provider);
    page = new SettingPage();
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  describe('without access', function() {

    // Log with a user without access permission
    before(function() {
      return page.logAs(datas.users.coreGuest);
    });

    it('should not be able to access the page', function() {
      assert.isRejected(page.load());
      assert.eventually.equal(browser.getCurrentUrl(), process.protractorConf.baseUrl + 'be/');
    });

  });

  describe('without write permission', function() {

    // Log with a user without write permission
    before(function() {
      page.logAs(datas.users.coreSettingsNoWrite);
      settingHelper.getEntities().then(function(settings) {
        defaultSettings = settings;
      });
      page.load();
    });

    // Remove all extra settings after each test and reload the page
    afterEach(function() {
      settingHelper.removeAllEntities(defaultSettings);
      page.refresh();
    });

    it('should not be able to create setting by requesting the server directly', function() {
      var data = {
        id: 'Id',
        value: 'Value'
      };
      page.sendRequest('be/settings', 'put', data).then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

  describe('without update permission', function() {

    // Log with a user without update permission
    before(function() {
      page.logAs(datas.users.coreSettingsNoUpdate);
      settingHelper.getEntities().then(function(settings) {
        defaultSettings = settings;
      });
      page.load();
    });

    // Remove all extra setting after each test and reload the page
    afterEach(function() {
      settingHelper.removeAllEntities(defaultSettings);
      page.refresh();
    });

    it('should not be able to edit a setting by requesting the server directly', function() {
      var data = {
        id: 'Test setting edition without update permission',
        value: 'Whatever'
      };

      page.sendRequest('be/settings/someId', 'post', data).then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

  describe('without delete permission', function() {

    // Log with a user without delete permission
    before(function() {
      page.logAs(datas.users.coreSettingsNoDelete);
      settingHelper.getEntities().then(function(settings) {
        defaultSettings = settings;
      });
      page.load();
    });

    // Remove all extra settings after each test and reload the page
    afterEach(function() {
      settingHelper.removeAllEntities(defaultSettings);
      page.refresh();
    });

    it('should not be able to delete setting by requesting the server directly', function() {
      page.sendRequest('be/settings/someId', 'delete').then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

});
