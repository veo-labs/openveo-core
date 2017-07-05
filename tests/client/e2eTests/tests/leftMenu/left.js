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

  it('should have first level menu items as described in configuration files', function() {
    var menu = process.protractorConf.getMenu();

    page.getLevel1MenuItems().then(function(items) {
      var index = 0;
      items.forEach(function(item) {
        assert.eventually.equal(item.getText(), eval('page.translations.' + menu[index].label));
        index++;
      });
    });
  });

  it('should have second level menu items as described in configuration files', function() {
    var menu = process.protractorConf.getMenu();

    menu.forEach(function(menuItems) {
      if (menuItems.subMenu) {
        page.getLevel2MenuItems(eval('page.translations.' + menuItems.label)).then(function(items) {
          var index = 0;
          items.forEach(function(item) {
            assert.eventually.equal(item.getText(), eval('page.translations.' + menuItems.subMenu[index].label));
            index++;
          });
        });
      }
    });
  });

  it('should be able to open / close menus containing a sub menu', function() {
    var menu = process.protractorConf.getMenu();

    menu.forEach(function(menuItems) {
      if (menuItems.subMenu) {
        var menuName = eval('page.translations.' + menuItems.label);
        page.openSubMenu(menuName);
        assert.eventually.ok(page.isSubMenuOpened(menuName));
        page.closeSubMenu(menuName);
        assert.eventually.notOk(page.isSubMenuOpened(menuName));
      }
    });
  });

  it('should close current opened sub menu while opening another sub menu', function() {
    page.openSubMenu(page.translations.CORE.MENU.RIGHTS);
    page.openSubMenu(page.translations.CORE.MENU.WEB_SERVICE);
    assert.eventually.notOk(page.isSubMenuOpened(page.translations.CORE.MENU.RIGHTS));
    assert.eventually.ok(page.isSubMenuOpened(page.translations.CORE.MENU.WEB_SERVICE));
  });

});
