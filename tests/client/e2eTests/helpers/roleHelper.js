'use strict';

var RoleModel = process.require('app/server/models/RoleModel.js');

/**
 * Gets all roles from database.
 *
 * @return {Promise} Promise resolving with the list of roles
 */
module.exports.getRoles = function() {
  return browser.waitForAngular().then(function() {
    var deferred = protractor.promise.defer();
    var roleModel = new RoleModel();
    roleModel.get(function(error, roles) {
      if (error)
        throw error;

      deferred.fulfill(roles);
    });

    return browser.controlFlow().execute(function() {
      return deferred.promise;
    });
  });
};

/**
 * Removes all roles from database.
 *
 * @param {Array} safeRoles A list of roles to keep safe
 * @return {Promise} Promise resolving when all roles are removed
 */
module.exports.removeAllRoles = function(safeRoles) {
  return browser.waitForAngular().then(function() {
    var deferred = protractor.promise.defer();
    var roleModel = new RoleModel();
    roleModel.get(function(error, roles) {
      var ids = [];

      if (error)
        throw error;

      // Keep safe roles out of the list of roles to remove
      roles = roles.filter(function(role) {
        for (var i = 0; i < safeRoles.length; i++) {
          if (role.id === safeRoles[i].id)
            return false;
        }

        return true;
      });

      for (var i = 0; i < roles.length; i++)
        ids.push(roles[i].id);

      if (ids.length) {
        roleModel.remove(ids, function(error) {
          if (error)
            throw error;
          else
            deferred.fulfill();
        });
      } else
        deferred.fulfill();
    });

    return browser.controlFlow().execute(function() {
      return deferred.promise;
    });
  });
};
