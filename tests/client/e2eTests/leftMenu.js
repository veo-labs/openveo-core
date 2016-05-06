'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var MenuPage = process.require('tests/client/e2eTests/pages/MenuPage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Left menu', function() {
  var page;

  // Prepare page
  before(function() {
    page = new MenuPage();
    page.logAsAdmin();
    page.load();
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  // Reload page after each test
  afterEach(function() {
    page.refresh();
  });

  it('should be able to open and close the menu', function() {
    page.openMenu();
    page.leftMenuElement.isDisplayed();
    assert.eventually.ok(page.leftMenuElement.isDisplayed(), 'Left menu should be opened');
    page.closeMenu();
    assert.eventually.notOk(page.leftMenuElement.isDisplayed(), 'Left menu should be closed');
  });

  it('should be able to open rights sub menu', function() {
    page.openSubMenu(page.translations.CORE.MENU.RIGHTS);
    page.getLevel1MenuItems(page.translations.CORE.MENU.RIGHTS).then(function(menuItems) {
      assert.eventually.ok(menuItems[0].element(by.css('.sub-menu')).isDisplayed());
    });
  });

  it('should have users and roles menu items under rights menu', function() {
    page.openSubMenu(page.translations.CORE.MENU.RIGHTS);
    page.getLevel1MenuItems(page.translations.CORE.MENU.RIGHTS).then(function(menuItems) {
      menuItems[0].all(by.css('.sub-menu > li > a')).each(function(element, index) {
        switch (index) {
          case 0:
            assert.eventually.equal(element.getText(), page.translations.CORE.MENU.USERS);
            assert.eventually.equal(element.getAttribute('href'), process.protractorConf.baseUrl + 'be/users-list');
            break;
          case 1:
            assert.eventually.equal(element.getText(), page.translations.CORE.MENU.ROLES);
            assert.eventually.equal(element.getAttribute('href'), process.protractorConf.baseUrl + 'be/roles-list');
            break;
          default:
            break;
        }
      });
    });
  });

  it('should be able to close rights sub menu', function() {
    page.closeSubMenu(page.translations.CORE.MENU.RIGHTS);
    page.getLevel1MenuItems(page.translations.CORE.MENU.RIGHTS).then(function(menuItems) {
      assert.eventually.notOk(menuItems[0].element(by.css('.sub-menu')).isDisplayed());
    });
  });

  it('should be able to open Web Service sub menu', function() {
    page.openSubMenu(page.translations.CORE.MENU.WEB_SERVICE);
    page.getLevel1MenuItems(page.translations.CORE.MENU.WEB_SERVICE).then(function(menuItems) {
      assert.eventually.ok(menuItems[0].element(by.css('.sub-menu')).isDisplayed());
    });
  });

  it('should have applications menu item under web service menu', function() {
    page.openSubMenu(page.translations.CORE.MENU.WEB_SERVICE);
    page.getLevel1MenuItems(page.translations.CORE.MENU.WEB_SERVICE).then(function(menuItems) {
      menuItems[0].all(by.css('.sub-menu > li > a')).each(function(element, index) {
        switch (index) {
          case 0:
            assert.eventually.equal(element.getText(), page.translations.CORE.MENU.APPLICATIONS);
            assert.eventually.equal(element.getAttribute('href'), process.protractorConf.baseUrl +
                                    'be/applications-list');
            break;
          default:
            break;
        }
      });
    });
  });

  it('should be able to close Web Service sub menu', function() {
    page.closeSubMenu(page.translations.CORE.MENU.WEB_SERVICE);
    page.getLevel1MenuItems(page.translations.CORE.MENU.WEB_SERVICE).then(function(menuItems) {
      assert.eventually.notOk(menuItems[0].element(by.css('.sub-menu')).isDisplayed());
    });
  });

});
