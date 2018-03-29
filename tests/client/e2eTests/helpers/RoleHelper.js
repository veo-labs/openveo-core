'use strict';

var util = require('util');
var shortid = require('shortid');
var e2e = require('@openveo/test').e2e;
var permissionLoader = process.require('app/server/loaders/permissionLoader.js');
var Helper = e2e.helpers.Helper;

/**
 * Creates a new RoleHelper to help manipulate roles without interacting with the web browser.
 *
 * Each function is inserting in protractor's control flow.
 *
 * @param {RoleProvider} provider The entity provider that will be used by the Helper
 */
function RoleHelper(provider) {
  RoleHelper.super_.call(this, provider);
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

/**
 * Gets the translated labels of permissions groups.
 *
 * @async
 * @method getPermissionsGroups
 * @param {Object} dictionary The dictionary of translations to translate labels
 * @return {Promise} A promise resolving with the list of translated group labels
 */
RoleHelper.prototype.getPermissionsGroups = function(dictionary) {
  var self = this;

  return browser.waitForAngular().then(function() {
    return self.flow.execute(function() {
      var plugins = process.api.getPlugins();
      var entities = process.api.getCoreApi().getEntities();
      var deferred = protractor.promise.defer();

      // Get the full list of permissions ordered by groups
      permissionLoader.buildPermissions(entities, plugins, function(error, permissions) {
        if (error)
          deferred.reject(error);
        else {
          var groups = [];

          permissions.forEach(function(permission) {

            // A group is a permission with a label and sub permissions
            if (permission.permissions && permission.label)
              groups.push(self.translate(permission.label, dictionary));

          });

          deferred.fulfill(groups);
        }
      });

      return deferred.promise;
    });
  });
};

/**
 * Gets the translated names of permissions within a group.
 *
 * @async
 * @method getGroupPermissions
 * @param {String} expectedGroup The group to fetch permissions from
 * @param {Object} dictionary The dictionary of translations to translate names
 * @return {Promise} A promise resolving with the list of translated permissions for the group
 */
RoleHelper.prototype.getGroupPermissions = function(expectedGroup, dictionary) {
  var self = this;

  return browser.waitForAngular().then(function() {
    return self.flow.execute(function() {
      var plugins = process.api.getPlugins();
      var entities = process.api.getCoreApi().getEntities();
      var deferred = protractor.promise.defer();

      // Get the full list of permissions ordered by groups
      permissionLoader.buildPermissions(entities, plugins, function(error, groups) {
        if (error)
          deferred.reject(error);
        else {
          var permissions = [];

          for (var i = 0; i < groups.length; i++) {
            var group = groups[i];
            var label = self.translate(group.label, dictionary);

            if (label === expectedGroup) {

              // Found the group

              // Get permissions
              group.permissions.forEach(function(permission) {
                permissions.push(self.translate(permission.name, dictionary));
              });

              break;
            }
          }

          deferred.fulfill(permissions);
        }
      });

      return deferred.promise;
    });
  });
};

/**
 * Gets permissions descriptors (Objects with permission name and group).
 *
 * @async
 * @method getPermissions
 * @param {Object} dictionary The dictionary of translations to translate names of groups and permissions
 * @return {Promise} A promise resolving with permissions descriptors
 */
RoleHelper.prototype.getPermissions = function(dictionary) {
  var self = this;

  return browser.waitForAngular().then(function() {
    return self.flow.execute(function() {
      var plugins = process.api.getPlugins();
      var entities = process.api.getCoreApi().getEntities();
      var deferred = protractor.promise.defer();

      // Get the full list of permissions ordered by groups
      permissionLoader.buildPermissions(entities, plugins, function(error, groups) {
        if (error)
          deferred.reject(error);
        else {
          var permissions = [];

          groups.forEach(function(group) {
            var groupName = self.translate(group.label, dictionary);

            group.permissions.forEach(function(permission) {
              permissions.push({
                name: self.translate(permission.name, dictionary),
                group: groupName
              });
            });
          });

          deferred.fulfill(permissions);
        }
      });

      return deferred.promise;
    });
  });
};


/**
 * Gets roles names.
 *
 * @async
 * @method getRoles
 * @return {Promise} A promise resolving with the list of roles names
 */
RoleHelper.prototype.getRoles = function() {
  var self = this;

  return browser.waitForAngular().then(function() {
    return self.flow.execute(function() {
      var deferred = protractor.promise.defer();

      self.provider.getAll(null, null, {id: 'desc'}, function(error, roles) {
        if (error)
          deferred.reject(error);
        else {
          var names = [];
          roles.forEach(function(role) {
            names.push(role.name);
          });

          deferred.fulfill(names);
        }
      });

      return deferred.promise;
    });
  });
};
