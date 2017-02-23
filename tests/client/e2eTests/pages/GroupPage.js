'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var Field = e2e.fields.Field;
var TablePage = e2e.pages.TablePage;
var browserExt = e2e.browser;

/**
 * Creates a new GroupPage representing the groups back end page.
 */
function GroupPage(model) {
  GroupPage.super_.call(this, model);

  // Page path
  this.path = 'be/groups-list';

  // Element finders specific to this page
  this.pageTitleElement = element(by.binding('CORE.GROUPS.TITLE'));
  this.pageDescriptionElement = element(by.binding('CORE.GROUPS.INFO'));
  this.addFormLabelElement = element(by.binding('CORE.GROUPS.ADD_GROUP'));
}

module.exports = GroupPage;
util.inherits(GroupPage, TablePage);

/**
 * Checks if the groups page is loaded.
 *
 * @return {Promise} Promise resolving when page is fully loaded
 */
GroupPage.prototype.onLoaded = function() {
  return browser.wait(this.EC.presenceOf(this.pageTitleElement), 5000, 'Missing groups page title');
};

/**
 * Gets search engine fields.
 *
 * @param {ElementFinder} Search engine element holding fields
 * @return {Object} The list of fields
 */
GroupPage.prototype.getSearchFields = function(form) {
  var fields = {};

  // Query field
  fields.query = Field.get({
    type: 'text',
    name: this.translations.CORE.GROUPS.QUERY_FILTER,
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
GroupPage.prototype.getAddFormFields = function(form) {
  var fields = {};

  // Name field
  fields.name = Field.get({
    type: 'text',
    name: this.translations.CORE.GROUPS.FORM_ADD_NAME,
    baseElement: form
  });

  // Description field
  fields.description = Field.get({
    type: 'text',
    name: this.translations.CORE.GROUPS.FORM_ADD_DESCRIPTION,
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
GroupPage.prototype.getEditFormFields = function(form) {
  var fields = {};

  // Name field
  fields.name = Field.get({
    type: 'text',
    name: this.translations.CORE.GROUPS.ATTR_NAME,
    baseElement: form
  });

  // Description field
  fields.description = Field.get({
    type: 'text',
    name: this.translations.CORE.GROUPS.ATTR_DESCRIPTION,
    baseElement: form
  });

  return fields;
};

/**
 * Adds a new group.
 *
 * User must be logged and have permission to create groups.
 *
 * @param {String} name Group name
 * @param {String} data Group description
 * @return {Promise} Promise resolving when the group has been added
 */
GroupPage.prototype.addLine = function(name, data) {
  var self = this;

  // Open add form
  return this.openAddForm().then(function() {
    var fields = self.getAddFormFields(self.addFormElement);

    // Set group name
    fields.name.setValue(name);

    // Set group description
    fields.description.setValue(data);

    // Click the add button
    browserExt.click(self.addButtonElement);

    // Close add form
    return self.closeAddForm();

  });
};

/**
 * Edits group.
 *
 * User must be logged and have permission to update groups.
 *
 * @param {String} name Group name
 * @param {String} data Group new name and description
 * @return {Promise} Promise resolving when the group has been saved
 */
GroupPage.prototype.editGroup = function(name, data) {
  var self = this;

  // Close eventually opened line
  return this.closeLine().then(function() {
    var formElement = self.lineDetailElement.element(by.css('.detail'));
    var fields = self.getEditFormFields(formElement);

    // Open line
    self.openLine(name);

    // Click on edit button
    browserExt.click(self.lineDetailElement.element(by.binding('CORE.UI.FORM_EDIT')));

    // Set group name
    if (data.name !== undefined)
      fields.name.setValue(data.name);

    // Set group description
    if (data.description !== undefined)
      fields.description.setValue(data.description);

    // Click on save button
    return browserExt.click(self.lineDetailElement.element(by.binding('CORE.UI.FORM_SAVE')));
  });
};
