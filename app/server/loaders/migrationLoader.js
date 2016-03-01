'use strict';

/**
 * @module core-loaders
 */

/**
 * Provides functions to load migration script.
 *
 * @class migrationLoader
 */

var fs = require('fs');
var path = require('path');
var semver = require('semver');
var async = require('async');

module.exports.getDiffMigrationScript = function(migrationPath, lastVersion, callback) {

  var migrations = {};
  async.series([

    function(callback) {
      fs.exists(migrationPath, function(exists) {
        if (exists) {

          fs.readdir(migrationPath, function(error, resources) {
            if (error) {
              callback(error);
              return;
            }

            var pendingFilesNumber = resources.length;

            // No more pending resources, done for this directory
            if (!pendingFilesNumber) {
              callback();
              return;
            }

            resources.forEach(function(resource) {
              migrations[path.basename(resource, '.js')] = migrationPath + '/' + resource;
            });

            callback();
          });

        } else callback();
      });
    },

    function(callback) {
      for (var key in migrations) {
        if (semver.gte(lastVersion, key)) delete migrations[key];
      }
      callback();
    }
  ],
  function(error) {

    if (callback)
      callback(error, migrations);
  });
};


