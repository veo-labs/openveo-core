'use strict';

var UserModel = process.require('app/server/models/UserModel.js');

/**
 * Gets all users from database.
 *
 * @return {Promise} Promise resolving with the list of users
 */
module.exports.getUsers = function() {
  return browser.waitForAngular().then(function() {
    var deferred = protractor.promise.defer();
    var userModel = new UserModel();
    userModel.get(function(error, users) {
      if (error)
        throw error;

      deferred.fulfill(users);
    });

    return browser.controlFlow().execute(function() {
      return deferred.promise;
    });
  });
};

/**
 * Removes all users from database.
 *
 * @param {Array} safeUsers A list of users to keep safe
 * @return {Promise} Promise resolving when all users are removed
 */
module.exports.removeAllUsers = function(safeUsers) {
  return browser.waitForAngular().then(function() {
    var deferred = protractor.promise.defer();
    var userModel = new UserModel();
    userModel.get(function(error, users) {
      var ids = [];

      if (error)
        throw error;

      // Keep safe users out of the list of users to remove
      users = users.filter(function(user) {
        for (var i = 0; i < safeUsers.length; i++) {
          if (user.id === safeUsers[i].id)
            return false;
        }

        return true;
      });

      for (var i = 0; i < users.length; i++) {
        ids.push(users[i].id);
      }

      if (ids.length) {
        userModel.remove(ids, function(error) {
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
