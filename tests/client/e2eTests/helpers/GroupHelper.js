'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var Helper = e2e.helpers.Helper;

/**
 * Creates a new GroupHelper to help manipulate groups without interacting with the web browser.
 *
 * Each function is inserting in protractor's control flow.
 *
 * @param {GroupModel} model The entity model that will be used by the Helper
 */
function GroupHelper(model) {
  GroupHelper.super_.call(this, model);
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
