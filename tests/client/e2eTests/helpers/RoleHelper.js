'use strict';

var util = require('util');
var shortid = require('shortid');
var e2e = require('@openveo/test').e2e;
var Helper = e2e.helpers.Helper;

/**
 * Creates a new RoleHelper to help manipulate roles without interacting with the web browser.
 *
 * Each function is inserting in protractor's control flow.
 *
 * @param {RoleModel} model The entity model that will be used by the Helper
 */
function RoleHelper(model) {
  RoleHelper.super_.call(this, model);
  this.textSearchProperties = ['name'];
  this.sortProperties = [{
    name: 'name',
    type: 'string'
  }];
}

module.exports = RoleHelper;
util.inherits(RoleHelper, Helper);

/**
 * Adds multiple entities at the same time with automatic index.
 *
 * This method bypass the web browser to directly add entities into database.
 *
 * All created entities will have the same name suffixed by the index.
 *
 * @method addEntitiesAuto
 * @param {String} name Base name of the entities to add
 * @param {Number} total Number of entities to add
 * @param {Number} [offset=0] Index to start from for the name suffix
 * @return {Promise} Promise resolving with the added entities
 */
RoleHelper.prototype.addEntitiesAuto = function(name, total, offset) {
  var entities = [];
  offset = offset || 0;

  for (var i = offset; i < total; i++)
    entities.push({name: name + ' ' + i, permissions: []});

  return this.addEntities(entities);
};

/**
 * Gets entity object example to use with web service put /entityName.
 *
 * If the entity managed by the Helper is registered to be tested automatically by the core, it needs to implement
 * this method which will be used to perform a put /entityName.
 *
 * @method getAddExample
 * @return {Object} The data to add
 */
RoleHelper.prototype.getAddExample = function() {
  return {
    id: shortid.generate(),
    name: 'Role example',
    permissions: ['perm1', 'perm2']
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
RoleHelper.prototype.getUpdateExample = function() {
  return {
    name: 'Role example new name',
    permissions: ['perm3']
  };
};
