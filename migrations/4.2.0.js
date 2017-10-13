'use strict';

var async = require('async');
var openVeoApi = require('@openveo/api');
var storage = process.require('app/server/storage.js');

module.exports.update = function(callback) {
  process.logger.info('Core 4.2.0 migration launched.');
  var db = storage.getDatabase();

  async.series([

    /**
     * Updates all users to add the origin property.
     *
     * "origin" property has been introduced to differenciate users coming from third party providers
     * and local users. See require('@openveo/api').passport.STRATEGIES for available values.
     * As third party providers have been added in this version, users already in database are local users.
     */
    function(callback) {
      db.get('core_users', null, null, null, function(error, users) {
        if (error)
          return callback(error);

        // No need to change anything
        if (!users || !users.length)
          return callback();
        else
          db.update('core_users', {}, {origin: openVeoApi.passport.STRATEGIES.LOCAL}, callback);
      });
    }

  ], function(error, results) {
    if (error)
      return callback(error);

    process.logger.info('Core 4.2.0 migration done.');
    callback();
  });
};
