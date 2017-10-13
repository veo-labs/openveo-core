'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var BackEndPage = e2e.pages.BackEndPage;
var browserExt = e2e.browser;

/**
 * Creates a new SettingPage representing the back end configuration page.
 */
function SettingPage() {
  SettingPage.super_.call(this);

  // Page path
  this.path = 'be/openveo-settings';

  // Element finders specific to this page
  this.pageTitleFinder = element(by.binding('CORE.SETTINGS.TITLE'));
  this.pageDescriptionFinder = element(by.binding('CORE.SETTINGS.INFO'));
  this.saveButtonFinder = element(by.binding('CORE.UI.FORM_SAVE'));
  this.fieldsFinder = element.all(by.repeater('field in fields'));
  this.formFinder = element.all(by.css('form'));
}

module.exports = SettingPage;
util.inherits(SettingPage, BackEndPage);

/**
 * Checks if the configuration page is loaded.
 *
 * @return {Promise} Promise that the page is fully loaded
 */
SettingPage.prototype.onLoaded = function() {
  return browser.wait(this.EC.presenceOf(this.pageTitleFinder), 5000, 'Missing settings page title');
};

/**
 * Gets a match field.
 *
 * @param {String} fieldLabel The translated name of the field label
 * @param {Array} availableRoles The list of available roles with for each role a name and a value
 * @return {ElementFinder} The match field
 */
SettingPage.prototype.getMatchField = function(fieldLabel, availableRoles) {
  return e2e.fields.Field.get({
    type: 'match',
    name: fieldLabel,
    baseElement: this.formFinder,
    availableOptions: availableRoles
  });
};

/**
 * Checks if a section exists.
 *
 * @param {String} section The translated name of the section to look for
 * @return {Promise} Promise resolving with true if the section exists, false otherwise
 */
SettingPage.prototype.isSectionPresent = function(section) {
  var deferred = protractor.promise.defer();
  var found = false;
  var sendError = function(error) {
    deferred.reject(error);
  };

  this.fieldsFinder.each(function(finder, index) {
    finder.element(by.css('h3')).isPresent().then(function(isPresent) {
      if (isPresent) {
        finder.getText().then(function(text) {
          if (text === section) found = true;
        }, sendError);
      }
    }, sendError);
  }).then(function() {
    deferred.fulfill(found);
  }, sendError);

  return deferred.promise;
};

/**
 * Sets value of a match field.
 *
 * @param {String} fieldLabel The translated name of the field label
 * @param {Array} matches Match field value
 * @param {Array} availableRoles The list of available roles with for each role a name and a value
 * @return {Promise} Promise resolving with the field in the section
 */
SettingPage.prototype.setMatchFieldValue = function(fieldLabel, matches, availableRoles) {
  return this.getMatchField(fieldLabel, availableRoles).setValue(matches);
};

/**
 * Sets value of a match field using auto completion.
 *
 * @param {String} fieldLabel The translated name of the field label
 * @param {Array} matches Match field value
 * @param {Array} availableRoles The list of available roles with for each role a name and a value
 * @return {Promise} Promise resolving with the field in the section
 */
SettingPage.prototype.setMatchFieldValueUsingAutoCompletion = function(fieldLabel, matches, availableRoles) {
  return this.getMatchField(fieldLabel, availableRoles).setValueUsingAutoCompletion(matches);
};

/**
 * Saves the settings form.
 *
 * @return {Promise} Promise resolving when settings are saved
 */
SettingPage.prototype.saveSettings = function() {
  return browserExt.click(this.saveButtonFinder);
};

/**
 * Gets value of a match field.
 *
 * @param {String} fieldLabel The translated name of the field label
 * @return {Promise} Promise resolving with the field value
 */
SettingPage.prototype.getMatchFieldValue = function(fieldLabel) {
  return this.getMatchField(fieldLabel).getValue();
};

/**
 * Clears value of a match field.
 *
 * @param {String} fieldLabel The translated name of the field label
 * @return {Promise} Promise resolving when the field is cleared
 */
SettingPage.prototype.clearMatchField = function(fieldLabel) {
  return this.getMatchField(fieldLabel).clear();
};
