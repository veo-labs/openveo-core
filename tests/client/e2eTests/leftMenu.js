'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var i18n = process.require('tests/client/e2eTests/i18n/i18n.js');
var MenuPage = process.require('tests/client/e2eTests/pages/MenuPage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Left menu', function() {
  var page, translations;

  before(function() {
    page = new MenuPage();
    page.logAsAdmin();
    page.load().then(function() {

      // Load dictionaries
      translations = i18n.getBackEndTranslations(page.language.code);

    });
  });

  after(function() {
    page.logout();
  });

  it('should be able to open and close the menu', function() {
    page.openMenu();
    page.leftMenuElement.isDisplayed();
    assert.eventually.ok(page.leftMenuElement.isDisplayed(), 'Left menu should be opened');
    page.closeMenu();
    assert.eventually.notOk(page.leftMenuElement.isDisplayed(), 'Left menu should be closed');
  });

  it('should be able to open rights sub menu', function() {
    page.openSubMenu(translations.MENU.RIGHTS);
    page.getLevel1MenuItems(translations.MENU.RIGHTS).then(function(menuItems) {
      assert.eventually.ok(menuItems[0].element(by.css('.sub-menu')).isDisplayed());
    });
  });

  it('should have users and roles menu items under rights menu', function() {
    page.getLevel1MenuItems(translations.MENU.RIGHTS).then(function(menuItems) {
      menuItems[0].all(by.css('.sub-menu > li > a')).each(function(element, index) {
        switch (index) {
          case 0:
            assert.eventually.equal(element.getText(), translations.MENU.USERS);
            assert.eventually.equal(element.getAttribute('href'), process.protractorConf.baseUrl + 'be/users');
            break;
          case 1:
            assert.eventually.equal(element.getText(), translations.MENU.ROLES);
            assert.eventually.equal(element.getAttribute('href'), process.protractorConf.baseUrl + 'be/roles');
            break;
          default:
            break;
        }
      });
    });
  });

  it('should be able to close rights sub menu', function() {
    page.closeSubMenu(translations.MENU.RIGHTS);
    page.getLevel1MenuItems(translations.MENU.RIGHTS).then(function(menuItems) {
      assert.eventually.notOk(menuItems[0].element(by.css('.sub-menu')).isDisplayed());
    });
  });

  it('should be able to open Web Service sub menu', function() {
    page.openSubMenu(translations.MENU.WEB_SERVICE);
    page.getLevel1MenuItems(translations.MENU.WEB_SERVICE).then(function(menuItems) {
      assert.eventually.ok(menuItems[0].element(by.css('.sub-menu')).isDisplayed());
    });
  });

  it('should have applications menu item under web service menu', function() {
    page.getLevel1MenuItems(translations.MENU.WEB_SERVICE).then(function(menuItems) {
      menuItems[0].all(by.css('.sub-menu > li > a')).each(function(element, index) {
        switch (index) {
          case 0:
            assert.eventually.equal(element.getText(), translations.MENU.APPLICATIONS);
            assert.eventually.equal(element.getAttribute('href'), process.protractorConf.baseUrl + 'be/applications');
            break;
          default:
            break;
        }
      });
    });
  });

  it('should be able to close Web Service sub menu', function() {
    page.closeSubMenu(translations.MENU.WEB_SERVICE);
    page.getLevel1MenuItems(translations.MENU.WEB_SERVICE).then(function(menuItems) {
      assert.eventually.notOk(menuItems[0].element(by.css('.sub-menu')).isDisplayed());
    });
  });

});
