'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var BackEndPage = e2e.pages.BackEndPage;
var browserExt = e2e.browser;

/**
 * Creates a new MenuPage representing a simple back end page.
 */
function MenuPage() {
  MenuPage.super_.call(this);

  // Page path
  this.path = 'be';

  // Element finders specific to this page
  this.homeLinkElement = element(by.css('.header a[href="/be"]'));
  this.languageOptionsElement = element(by.css('.nav .language .dropdown-menu'));
}

module.exports = MenuPage;
util.inherits(MenuPage, BackEndPage);

/**
 * Checks if the page is loaded.
 *
 * @return {Promise} Promise resolving when the page is fully loaded
 */
MenuPage.prototype.onLoaded = function() {
  return browser.wait(this.EC.presenceOf(this.profileLinkElement), 5000, 'Missing link to the profile page');
};

/**
 * Moves the cursor over the profile link to display the popover.
 *
 * @return {Promise} Promise resolving when the mouse is over the profile link
 */
MenuPage.prototype.setProfileLinkMouseOver = function() {
  var self = this;
  return browser.actions().mouseMove(this.profileLinkElement).perform().then(function() {
    return browser.wait(self.EC.presenceOf(self.popoverElement), 1000, 'Missing dialog over profile link');
  }).then(function() {
    return protractor.promise.fulfilled();
  });
};

/**
 * Moves the cursor over the language link to display the popover.
 *
 * @return {Promise} Promise resolving when the mouse is over the language link
 */
MenuPage.prototype.setLanguageLinkMouseOver = function() {
  var self = this;
  return browser.actions().mouseMove(this.languageLinkElement).perform().then(function() {
    return browser.wait(self.EC.presenceOf(self.popoverElement), 1000, 'Missing dialog over language link');
  }).then(function() {
    return protractor.promise.fulfilled();
  });
};

/**
 * Moves the cursor over the logout link to display the popover.
 *
 * @return {Promise} Promise resolving when the mouse is over the logout link
 */
MenuPage.prototype.setLogoutLinkMouseOver = function() {
  var self = this;
  return browser.actions().mouseMove(this.logoutLinkElement).perform().then(function() {
    return browser.wait(self.EC.presenceOf(self.popoverElement), 1000, 'Missing dialog over logout link');
  }).then(function() {
    return protractor.promise.fulfilled();
  });
};

/**
 * Opens the list of languages.
 *
 * @return {Promise} Promise resolving when the list of languages is opened
 */
MenuPage.prototype.openLanguages = function() {
  var self = this;

  // Test if the list of languages is opened
  return this.languageOptionsElement.isDisplayed().then(function(isDisplayed) {
    if (isDisplayed) {

      // Language options are already displayed
      return protractor.promise.fulfilled();

    } else {

      // Open language options
      browserExt.click(self.languageLinkElement);
      return browser.wait(self.EC.visibilityOf(self.languageOptionsElement), 1000, 'Missing languages dialog');

    }
  }).then(function() {
    return protractor.promise.fulfilled();
  });
};

/**
 * Closes the list of languages.
 *
 * @return {Promise} Promise resolving when the list of languages is closed
 */
MenuPage.prototype.closeLanguages = function() {
  var self = this;

  // Test if the list of languages is opened
  return this.languageOptionsElement.isDisplayed().then(function(isDisplayed) {
    if (!isDisplayed) {

      // Language options are already closed
      return protractor.promise.fulfilled();

    } else {

      // Close language options
      browserExt.click(self.languageLinkElement);
      return browser.wait(self.EC.invisibilityOf(self.languageOptionsElement), 1000, 'Languages dialog still visible');

    }
  }).then(function() {
    return protractor.promise.fulfilled();
  });
};
