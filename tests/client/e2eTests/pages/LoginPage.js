'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var Page = e2e.Page;
var BackEndPage = e2e.BackEndPage;
var browserExt = e2e.browser;

/**
 * Creates a new LoginPage representing the back end login page.
 */
function LoginPage() {
  LoginPage.super_.call(this);

  // Page path
  this.path = 'be/login';

  // Element finders specific to this page
  this.languageSelectElement = element(by.model('language'));
  this.userLabelElement = element(by.binding('LOGIN.LOGIN'));
  this.passwordLabelElement = element(by.binding('LOGIN.PASSWORD'));
  this.userInputElement = element(by.model('userEmail'));
  this.passwordInputElement = element(by.model('password'));
  this.buttonElement = element(by.binding('LOGIN.SUBMIT'));
  this.errorMessageElement = element(by.binding('LOGIN.ERROR'));
}

module.exports = LoginPage;
util.inherits(LoginPage, BackEndPage);

/**
 * Checks if the login page is loaded.
 *
 * @return {Promise} Promise that the page is fully loaded
 */
LoginPage.prototype.onLoaded = function() {
  return browser.wait(
    this.EC.and(
      this.EC.presenceOf(this.userInputElement),
      this.EC.presenceOf(this.passwordInputElement),
      this.EC.presenceOf(this.languageSelectElement)
    ), 5000, 'Missing one or several login fields'
  );
};

/**
 * Selects a language.
 *
 * @example
 *
 *     // Example of a language
 *     {
 *       code: 'en',
 *       translationCode: 'ENGLISH'
 *     }
 *
 * @param {Object} language The language to select
 * @return {Promise} Promise resolving when the language has been selected
 */
LoginPage.prototype.selectLanguage = function(language) {
  var self = this;

  // Expected language is the same as the actual one
  if (this.language && (this.language.code === language.code))
    return protractor.promise.fulfilled();

  // Select the language
  return this.getLanguageOption(language.code).click().then(function() {

    // Save language
    self.language = language;

    Page.prototype.load.call(self);

    return self.onLoaded();
  }).then(function() {
    return protractor.promise.fulfilled();
  });
};

/**
 * Gets language select option.
 *
 * @param {String} language The languade code (e.g. en)
 * @return {ElementFinder} The select option element
 */
LoginPage.prototype.getLanguageOption = function(language) {
  return element(by.css('select option[value="string:' + language + '"]'));
};

/**
 * Submits the login form.
 *
 * @return {Promise} Promise resolving when the login form has been submitted
 */
LoginPage.prototype.submit = function() {
  return browserExt.click(this.buttonElement);
};

/**
 * Fills the user email field.
 *
 * @param {String} email The email to enter
 * @return {Promise} Promise resolving when the field has been filled
 */
LoginPage.prototype.setEmail = function(email) {
  return this.userInputElement.sendKeys(email);
};

/**
 * Fills the user password field.
 *
 * @param {String} password The password to enter
 * @return {Promise} Promise resolving when the field has been filled
 */
LoginPage.prototype.setPassword = function(password) {
  return this.passwordInputElement.sendKeys(password);
};
