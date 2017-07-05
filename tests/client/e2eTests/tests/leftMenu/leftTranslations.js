'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var MenuPage = process.require('tests/client/e2eTests/pages/MenuPage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Left menu translations', function() {
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

  /**
   * Checks translations.
   *
   * @param {Number} [index] Index of the language to test in the list of languages
   * @return {Promise} Promise resolving when translations have been tested
   */
  function checkTranslations(index) {
    index = index || 0;
    var languages = page.getLanguages();
    var menu = process.protractorConf.getMenu();

    if (index < languages.length) {
      return page.selectLanguage(languages[index]).then(function() {

        // Check level 1 menu items labels
        page.getLevel1MenuItems().then(function(items) {
          var index = 0;
          items.forEach(function(item) {
            assert.eventually.equal(item.getText(), eval('page.translations.' + menu[index].label));
            index++;
          });
        });

        // Check sub menus items labels
        menu.forEach(function(menu) {
          if (menu.subMenu) {
            page.getLevel2MenuItems(eval('page.translations.' + menu.label)).then(function(items) {
              var index = 0;
              items.forEach(function(item) {
                assert.eventually.equal(item.getText(), eval('page.translations.' + menu.subMenu[index].label));
                index++;
              });
            });
          }
        });

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
