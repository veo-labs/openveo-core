'use strict';

var util = require('util');
var shortid = require('shortid');
var e2e = require('@openveo/test').e2e;
var Helper = e2e.helpers.Helper;

/**
 * Creates a new UserHelper to help manipulate users without interacting with the web browser.
 *
 * Each function is inserting in protractor's control flow.
 *
 * @param {UserProvider} provider The entity provider that will be used by the Helper
 */
function UserHelper(provider) {
  UserHelper.super_.call(this, provider);
  this.textSearchProperties = ['name'];
  this.sortProperties = [{
    name: 'name',
    type: 'string'
  }];
}

module.exports = UserHelper;
util.inherits(UserHelper, Helper);

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
UserHelper.prototype.addEntitiesAuto = function(name, total, offset) {
  var entities = [];
  offset = offset || 0;

  for (var i = offset; i < total; i++) {
    entities.push({
      name: name + ' ' + i,
      email: 'generated-email-' + i + '@veo-labs.com',
      password: 'generated-password',
      passwordValidate: 'generated-password'
    });
  }

  return this.addEntities(entities);
};

/**
 * Adds a third party user.
 *
 * This method bypass the web browser to directly add entity into database.
 *
 * @method addThirdPartyUser
 * @param {Object} user The third party user to add
 * @return {Promise} Promise resolving when the user has been added
 */
UserHelper.prototype.addThirdPartyUser = function(user) {
  var self = this;

  return browser.waitForAngular().then(function() {
    return self.flow.execute(function() {
      var deferred = protractor.promise.defer();

      self.provider.addThirdPartyUsers([
        {
          name: user.name,
          email: user.email,
          roles: user.roles,
          origin: user.origin,
          originId: user.originId,
          originGroups: user.originGroups
        }
      ], function(error, total, addedUsers) {
        if (error)
          deferred.reject(error);
        else
          deferred.fulfill(addedUsers[0]);
      });

      return deferred.promise;
    });
  });
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
UserHelper.prototype.getAddExample = function() {
  var id = shortid.generate();
  return {
    id: id,
    name: 'User example',
    email: 'peter.venkman' + id.toLowerCase() + '@ghosts.com',
    password: 'peter',
    passwordValidate: 'peter',
    roles: ['role1', 'role2']
  };
};

/**
 * Prepares an entity to be tested against an entity coming from a get /entityName/:id.
 *
 * All properties of the returned object must match properties from a get /entityName/:id.
 *
 * If the entity managed by the Helper is registered to be tested automatically by the core, it needs to implement
 * this method which will be used to perform a post /entityName.
 *
 * @method getValidationExample
 * @return {Object} The entity which will validate a get /entityName/:id response
 */
UserHelper.prototype.getValidationExample = function(entity) {
  var excludedProperties = ['password', 'passwordValidate'];
  var validationEntity = {};

  for (var property in entity)
    if (excludedProperties.indexOf(property) === -1)
      validationEntity[property] = entity[property];

  return validationEntity;
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
UserHelper.prototype.getUpdateExample = function() {
  return {
    name: 'User example new name',
    email: 'peter.venkman@ghosts.com',
    roles: ['role3']
  };
};
