'use strict';

var ClientModel = process.require('app/server/models/ClientModel.js');

/**
 * Gets all applications from database.
 *
 * @return {Promise} Promise resolving with the list of applications
 */
module.exports.getApplications = function() {
  return browser.waitForAngular().then(function() {
    var deferred = protractor.promise.defer();
    var clientModel = new ClientModel();
    clientModel.get(function(error, applications) {
      if (error)
        throw error;

      deferred.fulfill(applications);
    });

    return browser.controlFlow().execute(function() {
      return deferred.promise;
    });
  });
};

/**
 * Removes all applications from database.
 *
 * @param {Array} safeApplications A list of applications to keep safe
 * @return {Promise} Promise resolving when all applications are removed
 */
module.exports.removeAllApplications = function(safeApplications) {
  return browser.waitForAngular().then(function() {
    var deferred = protractor.promise.defer();
    var clientModel = new ClientModel();
    clientModel.get(function(error, applications) {
      var ids = [];

      if (error)
        throw error;

      // Keep safe applications out of the list of applications to remove
      applications = applications.filter(function(application) {
        for (var i = 0; i < safeApplications.length; i++) {
          if (application.id === safeApplications[i].id)
            return false;
        }

        return true;
      });

      for (var i = 0; i < applications.length; i++)
        ids.push(applications[i].id);

      if (ids.length) {
        clientModel.remove(ids, function(error) {
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
