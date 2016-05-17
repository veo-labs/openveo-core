'use strict';

var util = require('util');
var shortid = require('shortid');
var e2e = require('@openveo/test').e2e;
var Helper = e2e.helpers.Helper;

/**
 * Creates a new ApplicationHelper to help manipulate applications without interacting with the web browser.
 *
 * Each function is inserting in protractor's control flow.
 *
 * @param {ClientModel} model The entity model that will be used by the Helper
 */
function ApplicationHelper(model) {
  ApplicationHelper.super_.call(this, model);
  this.textSearchProperties = ['name'];
  this.sortProperties = [{
    name: 'name',
    type: 'string'
  }];
}

module.exports = ApplicationHelper;
util.inherits(ApplicationHelper, Helper);

/**
 * Gets entity object example to use with web service put /entityName.
 *
 * If the entity managed by the Helper is registered to be tested automatically by the core, it needs to implement
 * this method which will be used to perform a put /entityName.
 *
 * @method getAddExample
 * @return {Object} The data to add
 */
ApplicationHelper.prototype.getAddExample = function() {
  return {
    id: shortid.generate(),
    name: 'Application example',
    scopes: ['scope1', 'scope2']
  };
};

/**
 * Gets entity object example to use with web service post /entityName.
 *
 * If the entity managed by the Helper is registered to be tested automatically by the core, it needs to implement
 * this method which will be used to perform a post /entityName.
 *
 * @method getUpdateExample
 * @return {Object} The data to perform the update
 */
ApplicationHelper.prototype.getUpdateExample = function() {
  return {
    name: 'Application example new name',
    scopes: ['scope3']
  };
};
