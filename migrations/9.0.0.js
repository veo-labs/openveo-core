'use strict';

var async = require('async');
var storage = process.require('app/server/storage.js');
var ClientProvider = process.require('app/server/providers/ClientProvider.js');
var GroupProvider = process.require('app/server/providers/GroupProvider.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var TaxonomyProvider = process.require('app/server/providers/TaxonomyProvider.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');

module.exports.update = function(callback) {
  process.logger.info('Core 9.0.0 migration launched.');
  var db = storage.getDatabase();
  var clientProvider = new ClientProvider(db);
  var groupProvider = new GroupProvider(db);
  var roleProvider = new RoleProvider(db);
  var taxonomyProvider = new TaxonomyProvider(db);
  var userProvider = new UserProvider(db);

  async.series([

    /**
     * Re-creates text indexes of all collections using it with the language defined in configuration as the default
     * language.
     */
    function(callback) {
      async.series([

        // Drop indexes
        function(callback) {
          var asyncFunctions = [];

          [clientProvider, groupProvider, roleProvider, taxonomyProvider, userProvider].forEach(function(provider) {
            asyncFunctions.push(function(callback) {
              provider.dropIndex('querySearch', function(error) {
                if (error) {
                  process.logger.warn(
                    'Dropping "querySearch" index failed on collection ' +
                    provider.location + ' with message: ' + error.message
                  );
                }
                callback();
              });
            });
          });
          async.parallel(asyncFunctions, callback);
        },

        // Re-create indexes
        function(callback) {
          var asyncFunctions = [];

          [clientProvider, groupProvider, roleProvider, taxonomyProvider, userProvider].forEach(function(provider) {
            asyncFunctions.push(function(callback) {
              provider.createIndexes(callback);
            });
          });
          async.series(asyncFunctions, callback);
        }

      ], callback);
    }

  ], function(error, results) {
    if (error) return callback(error);
    process.logger.info('Core 9.0.0 migration done.');
    callback();
  });
};
