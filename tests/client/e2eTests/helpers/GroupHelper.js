'use strict';

var util = require('util');
var nanoid = require('nanoid').nanoid;
var e2e = require('@openveo/test').e2e;
var Helper = e2e.helpers.Helper;

/**
 * Creates a new GroupHelper to help manipulate groups without interacting with the web browser.
 *
 * Each function is inserting in protractor's control flow.
 *
 * @param {GroupProvider} provider The entity provider that will be used by the Helper
 */
function GroupHelper(provider) {
  GroupHelper.super_.call(this, provider);
  this.textSearchProperties = ['name', 'description'];
  this.sortProperties = [
    {
      name: 'name',
      type: 'string'
    },
    {
      name: 'description',
      type: 'string'
    }
  ];
}

module.exports = GroupHelper;
util.inherits(GroupHelper, Helper);

/**
 * Adds multiple entities at the same time with automatic index.
 *
 * Groups require a description.
 *
 * @method addEntitiesAuto
 * @param {String} name Base name of the entities to add
 * @param {Number} total Number of entities to add
 * @param {Number} [offset=0] Index to start from for the name suffix
 * @return {Promise} Promise resolving with the added entities
 */
GroupHelper.prototype.addEntitiesAuto = function(name, total, offset) {
  var entities = [];
  offset = offset || 0;

  for (var i = offset; i < total; i++) {
    entities.push({
      name: name + ' ' + i,
      description: name + ' description ' + i
    });
  }

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
GroupHelper.prototype.getAddExample = function() {
  return {
    id: nanoid(),
    name: 'Group example',
    description: 'Group example description'
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
GroupHelper.prototype.getUpdateExample = function() {
  return {
    name: 'Group example new name',
    description: 'Group example new description'
  };
};
