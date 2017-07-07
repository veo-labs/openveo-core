'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var Field = e2e.fields.Field;
var TablePage = e2e.pages.TablePage;
var browserExt = e2e.browser;

/**
 * Creates a new ApplicationPage representing the applications back end page.
 */
function ApplicationPage(model) {
  ApplicationPage.super_.call(this, model);

  // Page path
  this.path = 'be/applications-list';

  // Element finders specific to this page
  this.pageTitleElement = element(by.binding('CORE.APPLICATIONS.TITLE'));
  this.pageDescriptionElement = element(by.binding('CORE.APPLICATIONS.INFO'));
  this.addFormLabelElement = element(by.binding('CORE.APPLICATIONS.ADD_APPLICATION'));
}

module.exports = ApplicationPage;
util.inherits(ApplicationPage, TablePage);

/**
 * Checks if the applications page is loaded.
 *
 * @return {Promise} Promise resolving when page is fully loaded
 */
ApplicationPage.prototype.onLoaded = function() {
  return browser.wait(this.EC.presenceOf(this.pageTitleElement), 5000, 'Missing applications page title');
};

/**
 * Gets search engine fields.
 *
 * @param {ElementFinder} Search engine element holding fields
 * @return {Object} The list of fields
 */
ApplicationPage.prototype.getSearchFields = function(form) {
  var fields = {};

  // Query field
  fields.query = Field.get({
    type: 'text',
    name: this.translations.CORE.APPLICATIONS.QUERY_FILTER,
    baseElement: form
  });

  return fields;
};

/**
 * Gets add form fields.
 *
 * @param {ElementFinder} Add form element
 * @return {Object} The list of fields
 */
ApplicationPage.prototype.getAddFormFields = function(form) {
  var fields = {};

  // Name field
  fields.name = Field.get({
    type: 'text',
    name: this.translations.CORE.APPLICATIONS.FORM_ADD_NAME,
    baseElement: form
  });

  // Scopes field
  fields.scopes = Field.get({
    type: 'checkboxes',
    name: this.translations.CORE.APPLICATIONS.FORM_ADD_SCOPES,
    baseElement: form
  });

  return fields;
};

/**
 * Gets edit form fields.
 *
 * @param {ElementFinder} Edit form element
 * @return {Obect} The list of fields
 */
ApplicationPage.prototype.getEditFormFields = function(form) {
  var fields = {};

  // Name field
  fields.name = Field.get({
    type: 'text',
    name: this.translations.CORE.APPLICATIONS.ATTR_NAME,
    baseElement: form
  });

  // Scopes field
  fields.scopes = Field.get({
    type: 'checkboxes',
    name: this.translations.CORE.APPLICATIONS.ATTR_SCOPES,
    baseElement: form
  });

  return fields;
};

/**
 * Adds a new application.
 *
 * User must be logged and have permission to create applications.
 *
 * @param {String} name Application name
 * @param {Array} data The list of scopes labels
 * @return {Promise} Promise resolving when the application has been added
 */
ApplicationPage.prototype.addLine = function(name, data) {
  var self = this;

  // Open add form
  return this.openAddForm().then(function() {
    var fields = self.getAddFormFields(self.addFormElement);

    // Set application name
    fields.name.setValue(name);

    // Set application scopes
    fields.scopes.setValue(data);

    // Click the add button
    browserExt.click(self.addButtonElement);

    // Close add form
    return self.closeAddForm();

  });
};

/**
 * Edits application.
 *
 * User must be logged and have permission to update applications.
 *
 * @param {String} name Application name to edit
 * @param {Object} data The new values
 * @param {String} [data.name] The new name
 * @param {Array} [data.scopes] The new scopes
 * @param {Boolean} cancel true to cancel the edition instead of saving
 * @return {Promise} Promise resolving when the application has been saved
 */
ApplicationPage.prototype.editApplication = function(name, data, cancel) {
  var self = this;

  // Close eventually opened line
  return this.closeLine().then(function() {
    var formElement = self.lineDetailElement.element(by.css('.detail'));
    var fields = self.getEditFormFields(formElement);

    // Open line
    self.openLine(name);

    // Click on edit button
    browserExt.click(self.lineDetailElement.element(by.binding('CORE.UI.FORM_EDIT')));

    // Set application name
    if (data.name !== undefined)
      fields.name.setValue(data.name);

    // Set application scopes
    if (data.scopes)
      fields.scopes.setValue(data.scopes);

    // Click on save or cancel button
    if (cancel)
      return browserExt.click(self.lineDetailElement.element(by.binding('CORE.UI.FORM_CANCEL')));
    else
      return browserExt.click(self.lineDetailElement.element(by.binding('CORE.UI.FORM_SAVE')));
  });
};

/**
 * Gets client id of an application.
 *
 * @param {String} name Application name
 * @return {Promise} Promise resolving with the application client id
 */
ApplicationPage.prototype.getApplicationClientId = function(name) {
  var self = this;

  // Close eventually opened line
  return this.closeLine().then(function() {

    // Open line
    self.openLine(name);

    // Get application client id
    var field = Field.get({
      type: 'text',
      name: self.translations.CORE.APPLICATIONS.ATTR_ID,
      baseElement: self.lineDetailElement
    });
    return field.getText();
  }).then(function(clientId) {
    return protractor.promise.fulfilled(clientId);
  });
};

/**
 * Gets client key of an application.
 *
 * @param {String} name Application name
 * @return {Promise} Promise resolving with the application client key
 */
ApplicationPage.prototype.getApplicationClientKey = function(name) {
  var self = this;

  // Close eventually opened line
  return this.closeLine().then(function() {

    // Open line
    self.openLine(name);

    // Get application client key
    var field = Field.get({
      type: 'text',
      name: self.translations.CORE.APPLICATIONS.ATTR_SECRET,
      baseElement: self.lineDetailElement
    });
    return field.getText();
  }).then(function(clientKey) {
    return protractor.promise.fulfilled(clientKey);
  });
};

/**
 * Gets available scopes from add form.
 *
 * @return {Promise} Promise resolving with the list of scopes
 */
ApplicationPage.prototype.getAvailableScopes = function() {
  var self = this;

  return this.openAddForm().then(function() {
    return self.getAddFormFields(self.addFormElement).scopes.getOptions();
  });
};
