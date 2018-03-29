'use strict';

var async = require('async');
var openVeoApi = require('@openveo/api');
var storage = process.require('app/server/storage.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var ResourceFilter = openVeoApi.storages.ResourceFilter;

module.exports.update = function(callback) {
  process.logger.info('Core 4.2.0 migration launched.');
  var db = storage.getDatabase();
  var userProvider = new UserProvider(db);

  async.series([

    /**
     * Updates all users to add the origin property.
     *
     * "origin" property has been introduced to differenciate users coming from third party providers
     * and local users. See require('@openveo/api').passport.STRATEGIES for available values.
     * As third party providers have been added in this version, users already in database are local users.
     */
    function(callback) {
      userProvider.getAll(
        null,
        {
          include: ['id']
        },
        {
          id: 'desc'
        },
        function(error, users) {
          if (error) return callback(error);
          var asyncActions = [];

          // No need to change anything
          if (!users || !users.length) return callback();

          users.forEach(function(user) {
            asyncActions.push(function(callback) {
              db.updateOne(
                userProvider.location,
                new ResourceFilter().equal('id', user.id),
                {
                  origin: openVeoApi.passport.STRATEGIES.LOCAL
                },
                callback
              );
            });
          });

          async.series(asyncActions, callback);
        }
      );
    }

  ], function(error, results) {
    if (error) return callback(error);
    process.logger.info('Core 4.2.0 migration done.');
    callback();
  });
};
