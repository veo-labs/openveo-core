'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var MenuPage = process.require('tests/client/e2eTests/pages/MenuPage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Left menu translations', function() {
  var page;

  before(function() {
    page = new MenuPage();
    page.logAsAdmin();
    page.load();
  });

  after(function() {
    page.logout();
  });

  /**
   * Checks translations.
   *
   * @param {Number} [index] Index of the language to test in the list of languages
   * @return {Promise} Promise resolving when translations have been tested
   */
  function checkTranslations(index) {
    index = index || 0;
    var languages = page.getLanguages();

    if (index < languages.length) {
      return page.selectLanguage(languages[index]).then(function() {

        // Open left menu
        page.openMenu();

        // Check rights label
        page.getLevel1MenuItems(page.translations.MENU.RIGHTS).then(function(menuItems) {
          assert.eventually.equal(menuItems[0].element(by.xpath('./a')).getText(), page.translations.MENU.RIGHTS);
        });

        // Check web service label
        page.getLevel1MenuItems(page.translations.MENU.WEB_SERVICE).then(function(menuItems) {
          assert.eventually.equal(menuItems[0].element(by.xpath('./a')).getText(), page.translations.MENU.WEB_SERVICE);
        });

        // Open rights sub menu
        page.openSubMenu(page.translations.MENU.RIGHTS);

        // Check rights sub menu
        page.getLevel1MenuItems(page.translations.MENU.RIGHTS).then(function(menuItems) {
          menuItems[0].all(by.css('.sub-menu > li > a')).each(function(element, index) {
            switch (index) {
              case 0:
                assert.eventually.equal(element.getText(), page.translations.MENU.USERS);
                break;
              case 1:
                assert.eventually.equal(element.getText(), page.translations.MENU.ROLES);
                break;
              default:
                break;
            }
          });
        });

        // Open web service sub menu
        page.openSubMenu(page.translations.MENU.WEB_SERVICE);

        // Check web service sub menu
        page.getLevel1MenuItems(page.translations.MENU.WEB_SERVICE).then(function(menuItems) {
          menuItems[0].all(by.css('.sub-menu > li > a')).each(function(element, index) {
            switch (index) {
              case 0:
                assert.eventually.equal(element.getText(), page.translations.MENU.APPLICATIONS);
                break;
              default:
                break;
            }
          });
        });

        // Close left menu
        return page.closeMenu();

      }).then(function() {
        return checkTranslations(++index);
      });
    } else {
      return protractor.promise.fulfilled();
    }
  }

  it('should be available in different languages', function() {
    return checkTranslations();
  });

});
