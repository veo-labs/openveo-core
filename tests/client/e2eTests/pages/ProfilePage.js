'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var BackEndPage = e2e.pages.BackEndPage;
var browserExt = e2e.browser;

/**
 * Creates a new ProfilePage representing the profile back end page.
 */
function ProfilePage() {
  ProfilePage.super_.call(this);

  // Page path
  this.path = 'be/profile';

  // Element finders specific to this page
  this.pageTitleElement = element(by.binding('CORE.PROFILES.TITLE'));
  this.pageDescriptionElement = element(by.binding('CORE.PROFILES.INFO'));
  this.accountTitleElement = element(by.binding('CORE.PROFILES.ATTR_USER_ACCOUNT'));
  this.userNameLabelElement = element(by.repeater('field in fields').row(0)).element(by.css('label'));
  this.userNameElement = element(by.repeater('field in fields').row(0)).element(by.css('.literal span'));
  this.userNameInputElement = element(by.repeater('field in fields').row(0)).element(by.css('input'));
  this.userNameErrorElement = element(by.repeater('field in fields').row(0)).element(by.css('.has-error > div'));
  this.userEmailLabelElement = element(by.repeater('field in fields').row(1)).element(by.css('label'));
  this.userEmailElement = element(by.repeater('field in fields').row(1)).all(by.css('div > div > div')).first();
  this.userRolesLabelElement = element(by.repeater('field in fields').row(2)).element(by.css('label'));
  this.userRolesElement = element(by.repeater('field in fields').row(2)).all(by.css('div > div > div')).first();
  this.editUserElement = element(by.css('.user-info')).element(by.binding('CORE.UI.FORM_EDIT'));
  this.submitUserElement = element(by.css('.user-info')).element(by.binding('CORE.UI.FORM_SAVE'));
  this.cancelUserElement = element(by.css('.user-info')).element(by.binding('CORE.UI.FORM_CANCEL'));
  this.passwordTitleElement = element(by.binding('CORE.PROFILES.ATTR_MODIFY_PASSWORD'));
  this.passwordLabelElement = element(by.binding('CORE.PROFILES.ATTR_PASSWORD'));
  this.passwordElement = element(by.model('password'));
  this.confirmPasswordLabelElement = element(by.binding('CORE.PROFILES.ATTR_CONFIRM_PASSWORD'));
  this.confirmPasswordElement = element(by.model('confirmPassword'));
  this.submitPasswordElement = element(by.css('.password')).element(by.binding('CORE.UI.FORM_SAVE'));
  this.cancelPasswordElement = element(by.css('.password')).element(by.binding('CORE.UI.FORM_CANCEL'));
}

module.exports = ProfilePage;
util.inherits(ProfilePage, BackEndPage);

/**
 * Checks if the profile page is loaded.
 *
 * @return {Promise} Promise resolving when the page is fully loaded
 */
ProfilePage.prototype.onLoaded = function() {
  return browser.wait(this.EC.and(this.EC.presenceOf(this.pageTitleElement)), 5000, 'Missing profile page title');
};

/**
 * Navigate to profile page.
 *
 * It uses the link in top menu.
 *
 * @return {Promise} Promise resolving when profile link has been clicked
 */
ProfilePage.prototype.navigate = function() {
  var self = this;

  // Click on profile link
  return this.clickProfile().then(function() {
    return self.onLoaded();
  }).then(function() {
    var languages = self.getLanguages();
    return self.selectLanguage(languages[0]);
  });
};

/**
 * Activates account edition.
 *
 * @return {Promise} Promise resolving when user information is in edition
 */
ProfilePage.prototype.activateEdition = function() {
  var self = this;

  // Test if account edition is activated
  return this.userNameInputElement.isDisplayed().then(function(isDisplayed) {
    if (isDisplayed) {

      // Edition is already activated
      return protractor.promise.fulfilled();

    } else {

      // Activate edition
      browserExt.click(self.editUserElement);
      return browser.wait(self.EC.visibilityOf(self.userNameInputElement), 1000, 'Missing edition form');

    }
  }).then(function() {
    return protractor.promise.fulfilled();
  });
};

/**
 * Cancels account edition.
 *
 * It uses the cancel button.
 *
 * @return {Promise} Promise resolving when user information is not in edition
 */
ProfilePage.prototype.cancelEdition = function() {
  var self = this;

  // Test if account edition is activated
  return this.userNameInputElement.isDisplayed().then(function(isDisplayed) {
    if (!isDisplayed) {

      // Edition is already deactivated
      return protractor.promise.fulfilled();

    } else {

      // Cancel edition
      browserExt.click(self.cancelUserElement);

      return browser.wait(self.EC.invisibilityOf(self.userNameInputElement), 1000, 'Edition form still visible');
    }
  }).then(function() {
    return protractor.promise.fulfilled();
  });
};

/**
 * Sets user account name and save it.
 *
 * @param {String} userName New user name
 * @return {Promise} Promise resolving when user name has been saved
 */
ProfilePage.prototype.setNameAndSave = function(userName) {
  var self = this;

  return this.setName(userName).then(function() {
    return browserExt.click(self.submitUserElement);
  });
};

/**
 * Sets user account name.
 *
 * @param {String} userName New user name
 * @return {Promise} Promise resolving when user name has been set
 */
ProfilePage.prototype.setName = function(userName) {
  var self = this;

  // Activate account edition
  return this.activateEdition().then(function() {

    // Set user name
    self.userNameInputElement.clear();
    return self.userNameInputElement.sendKeys(userName || '');

  });
};

/**
 * Changes user password.
 *
 * @param {String} password New password
 * @return {Promise} Promise resolving when user password has been changed
 */
ProfilePage.prototype.changePassword = function(password) {
  var self = this;

  return this.setPassword(password).then(function() {
    self.setConfirmPassword(password);
    return browserExt.click(self.submitPasswordElement);
  });
};

/**
 * Sets password field.
 *
 * @return {Promise} Promise resolving when password field is set
 */
ProfilePage.prototype.setPassword = function(password) {
  var self = this;
  return this.passwordElement.clear().then(function() {
    return self.passwordElement.sendKeys(password);
  });
};

/**
 * Sets confirm password field.
 *
 * @return {Promise} Promise resolving when confirm password field is set
 */
ProfilePage.prototype.setConfirmPassword = function(password) {
  var self = this;

  return this.confirmPasswordElement.clear().then(function() {
    return self.confirmPasswordElement.sendKeys(password);
  });
};

/**
 * Cancels password form.
 *
 * @return {Promise} Promise resolving when cancel button has been clicked
 */
ProfilePage.prototype.cancelPasswordForm = function(password) {
  return browserExt.click(this.cancelPasswordElement);
};
