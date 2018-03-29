'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var Field = e2e.fields.Field;
var TablePage = e2e.pages.TablePage;
var browserExt = e2e.browser;

/**
 * Creates a new UserPage representing the users back end page.
 */
function UserPage(provider) {
  UserPage.super_.call(this, provider);

  // Page path
  this.path = 'be/users-list';

  // Element finders specific to this page
  this.pageTitleElement = element(by.binding('CORE.USERS.TITLE'));
  this.pageDescriptionElement = element(by.binding('CORE.USERS.INFO'));
  this.addFormLabelElement = element(by.binding('CORE.USERS.ADD_USER'));
}

module.exports = UserPage;
util.inherits(UserPage, TablePage);

/**
 * Checks if the users page is loaded.
 *
 * @async
 * @method onLoaded
 * @return {Promise} Promise resolving when page is fully loaded
 */
UserPage.prototype.onLoaded = function() {
  return browser.wait(this.EC.presenceOf(this.pageTitleElement), 5000, 'Missing users page title');
};

/**
 * Gets search form fields.
 *
 * @async
 * @method getSearchFields
 * @param {ElementFinder} Search engine element
 * @return {Object} The list of fields
 */
UserPage.prototype.getSearchFields = function(form) {
  var fields = {};

  // Query field
  fields.query = Field.get({
    type: 'text',
    name: this.translations.CORE.USERS.QUERY_FILTER,
    baseElement: form
  });

  // Origin field
  fields.origin = Field.get({
    type: 'select',
    name: this.translations.CORE.USERS.ORIGIN_FILTER,
    baseElement: form
  });

  return fields;
};

/**
 * Gets add form fields.
 *
 * @method getAddFormFields
 * @param {ElementFinder} Add form element
 * @return {Object} The list of fields
 */
UserPage.prototype.getAddFormFields = function(form) {
  var fields = {};

  // Name field
  fields.name = Field.get({
    type: 'text',
    name: this.translations.CORE.USERS.FORM_ADD_NAME,
    baseElement: form
  });

  // Email field
  fields.email = Field.get({
    type: 'text',
    name: this.translations.CORE.USERS.FORM_ADD_EMAIL,
    baseElement: form
  });

  // Password field
  fields.password = Field.get({
    type: 'text',
    name: this.translations.CORE.USERS.FORM_ADD_PASSWORD,
    baseElement: form
  });

  // Password validate field
  fields.passwordValidate = Field.get({
    type: 'text',
    name: this.translations.CORE.USERS.FORM_ADD_PASSWORD_VALIDATE,
    baseElement: form
  });

  // Roles field
  fields.roles = Field.get({
    type: 'checkboxes',
    name: this.translations.CORE.USERS.FORM_ADD_ROLE,
    baseElement: form
  });

  return fields;
};

/**
 * Gets edit form fields.
 *
 * @method getEditFormFields
 * @param {ElementFinder} Edit form element
 * @return {Object} The list of fields
 */
UserPage.prototype.getEditFormFields = function(form) {
  var fields = {};

  // Name field
  fields.name = Field.get({
    type: 'text',
    name: this.translations.CORE.USERS.ATTR_NAME,
    baseElement: form
  });

  // Email field
  fields.email = Field.get({
    type: 'text',
    name: this.translations.CORE.USERS.ATTR_EMAIL,
    baseElement: form
  });

  // Roles field
  fields.roles = Field.get({
    type: 'checkboxes',
    name: this.translations.CORE.USERS.ATTR_ROLE,
    baseElement: form
  });

  // Origin field
  fields.origin = Field.get({
    type: 'fake',
    name: this.translations.CORE.USERS.ATTR_ORIGIN,
    baseElement: form
  });

  return fields;
};

/**
 * Adds a new user.
 *
 * User must be logged and have permission to create users.
 *
 * @async
 * @method addLine
 * @param {String} name User name
 * @param {Array} data User's email, password and roles
 * @return {Promise} Promise resolving when the user has been added
 */
UserPage.prototype.addLine = function(name, data) {
  var self = this;

  // Open add form
  return this.openAddForm().then(function() {
    var fields = self.getAddFormFields(self.addFormElement);

    // Set name, email, password and roles
    fields.name.setValue(data.name || name);
    fields.email.setValue(data.email);
    fields.password.setValue(data.password);
    fields.passwordValidate.setValue(data.passwordValidate);
    fields.roles.setValue(data.roles || []);

    // Click the add button
    browserExt.click(self.addButtonElement);

    // Close add form
    return self.closeAddForm();

  });
};

/**
 * Gets roles of a user.
 *
 * @async
 * @method getUserRoles
 * @param {String} name User name
 * @return {Promise} Promise resolving with the list of roles
 */
UserPage.prototype.getUserRoles = function(name) {
  return this.getLineFieldText(name, 'roles').then(function(roles) {
    return protractor.promise.fulfilled(roles.split(', '));
  });
};

/**
 * Edits user.
 *
 * @async
 * @method editUser
 * @param {String} name User name
 * @param {Array} data User's email, password and roles
 * @param {Boolean} cancel true to cancel the edition instead of saving
 * @return {Promise} Promise resolving when the save button is clicked
 */
UserPage.prototype.editUser = function(name, data, cancel) {
  var self = this;

  // Close eventually opened line
  return this.closeLine().then(function() {
    var formElement = self.lineDetailElement.element(by.css('.detail'));
    var fields = self.getEditFormFields(formElement);

    // Open line
    self.openLine(name);

    // Click on edit button
    browserExt.click(self.lineDetailElement.element(by.binding('CORE.UI.FORM_EDIT')));

    // Set user name
    if (data.name !== undefined)
      fields.name.setValue(data.name);

    // Set user email
    if (data.email !== undefined)
      fields.email.setValue(data.email);

    // Set user roles
    if (data.roles !== undefined)
      fields.roles.setValue(data.roles);

    // Click on save or cancel button
    if (cancel)
      return browserExt.click(self.lineDetailElement.element(by.binding('CORE.UI.FORM_CANCEL')));
    else
      return browserExt.click(self.lineDetailElement.element(by.binding('CORE.UI.FORM_SAVE')));
  });
};

/**
 * Gets the list of available roles from add form.
 *
 * @method getAvailableRoles
 * @return {Promise} Promise resolving with the list of roles names
 */
UserPage.prototype.getAvailableRoles = function() {
  var self = this;

  // Open add form
  return this.openAddForm().then(function() {
    return self.getAddFormFields(self.addFormElement).roles.getOptions();
  });
};
