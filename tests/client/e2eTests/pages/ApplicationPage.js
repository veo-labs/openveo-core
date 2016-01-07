'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var Field = e2e.Field;
var TablePage = e2e.TablePage;
var browserExt = e2e.browser;

/**
 * Creates a new ApplicationPage representing the applications back end page.
 */
function ApplicationPage(model) {
  ApplicationPage.super_.call(this, model);

  // Page path
  this.path = 'be/applications';

  // Element finders specific to this page
  this.pageTitleElement = element(by.binding('APPLICATIONS.TITLE'));
  this.pageDescriptionElement = element(by.binding('APPLICATIONS.INFO'));
  this.addFormLabelElement = element(by.binding('APPLICATIONS.ADD_APPLICATION'));
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

  // Name field
  fields.name = Field.get({
    type: 'text',
    name: this.translations.APPLICATIONS.TITLE_FILTER,
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
    name: this.translations.APPLICATIONS.FORM_ADD_NAME,
    baseElement: form
  });

  // Scopes field
  fields.scopes = Field.get({
    type: 'checkboxes',
    name: this.translations.APPLICATIONS.FORM_ADD_SCOPES,
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
    name: this.translations.APPLICATIONS.ATTR_NAME,
    baseElement: form
  });

  // Scopes field
  fields.scopes = Field.get({
    type: 'checkboxes',
    name: this.translations.APPLICATIONS.ATTR_SCOPES,
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

    // For now no scopes are defined in core

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
 * @param {String} name Application name
 * @param {Array} data The list of scopes labels
 * @return {Promise} Promise resolving when the application has been saved
 */
ApplicationPage.prototype.editApplication = function(name, data) {
  var self = this;

  // Close eventually opened line
  return this.closeLine().then(function() {
    var formElement = self.lineDetailElement.element(by.css('.detail'));
    var fields = self.getEditFormFields(formElement);

    // Open line
    self.openLine(name);

    // Click on edit button
    browserExt.click(self.lineDetailElement.element(by.binding('UI.FORM_EDIT')));

    // Set application name
    if (data.name !== undefined)
      fields.name.setValue(data.name);

    // For now no scopes are defined in core

    // Click on save button
    return browserExt.click(self.lineDetailElement.element(by.binding('UI.FORM_SAVE')));
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
      name: self.translations.APPLICATIONS.ATTR_ID,
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
      name: self.translations.APPLICATIONS.ATTR_SECRET,
      baseElement: self.lineDetailElement
    });
    return field.getText();
  }).then(function(clientKey) {
    return protractor.promise.fulfilled(clientKey);
  });
};

/**
 * Gets scopes of an application.
 *
 * @param {String} name Application name
 * @return {Promise} Promise resolving with the application client scopes
 */
ApplicationPage.prototype.getApplicationClientScopes = function(name) {
  var self = this;

  // Close eventually opened line
  return this.closeLine().then(function() {

    // Open line
    self.openLine(name);

    // Get application scopes
    var field = Field.get({
      type: 'text',
      name: self.translations.APPLICATIONS.ATTR_SCOPES,
      baseElement: self.lineDetailElement
    });
    return field.getText();
  }).then(function(scopes) {
    return protractor.promise.fulfilled(scopes);
  });
};
