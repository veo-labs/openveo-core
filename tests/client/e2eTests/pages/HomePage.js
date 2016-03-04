'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var BackEndPage = e2e.pages.BackEndPage;
var browserExt = e2e.browser;

/**
 * Creates a new HomePage representing the back end home page.
 */
function HomePage() {
  HomePage.super_.call(this);

  // Page path
  this.path = 'be';

  // Element finders specific to this page
  this.pageTitleElement = element(by.binding('HOME.TITLE'));
  this.pageDescriptionElement = element(by.binding('HOME.DESCRIPTION'));
  this.versionButtonElement = element(by.css('#content button'));
  this.closeVersionsButtonElement = element(by.css('.modal-content .close'));
  this.versionElements = element.all(by.repeater('item in items'));
}

module.exports = HomePage;
util.inherits(HomePage, BackEndPage);

/**
 * Checks if the home page is loaded.
 *
 * @return {Promise} Promise that the page is fully loaded
 */
HomePage.prototype.onLoaded = function() {
  return browser.wait(this.EC.presenceOf(this.pageTitleElement), 5000, 'Missing home page title');
};

/**
 * Opens the list of versions.
 *
 * @return {Promise} Promise resolving when the list of versions is opened
 */
HomePage.prototype.openVersions = function() {
  var self = this;

  // Check if version dialog close button is present
  return this.closeVersionsButtonElement.isPresent().then(function(isPresent) {
    if (isPresent) {

      // Dialog is already displayed
      return protractor.promise.fulfilled();

    } else {

      // Open dialog
      browserExt.click(self.versionButtonElement);
      return browser.wait(self.EC.presenceOf(self.closeVersionsButtonElement), 1000, 'Missing versions close button');

    }
  }).then(function() {
    return protractor.promise.fulfilled();
  });
};

/**
 * Closes the list of versions.
 *
 * @return {Promise} Promise resolving when the list of versions is closed
 */
HomePage.prototype.closeVersions = function(callback) {
  var self = this;

  // Check if version dialog close button is present
  return this.closeVersionsButtonElement.isPresent().then(function(isPresent) {
    if (!isPresent) {

      // Dialog is already closed
      return protractor.promise.fulfilled();

    } else {

      // Close dialog
      browserExt.click(self.closeVersionsButtonElement);
      return browser.wait(self.EC.stalenessOf(self.closeVersionsButtonElement), 1000, 'Versions close button ' +
                          'still visible');

    }
  }).then(function() {
    return protractor.promise.fulfilled();
  });
};
