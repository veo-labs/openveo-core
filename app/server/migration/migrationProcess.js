'use strict';

/**
 * Provides functions to execute migration script.
 *
 * @module core/migration/migrationProcess
 */

var semver = require('semver');
var async = require('async');
var openVeoApi = require('@openveo/api');
var storage = process.require('app/server/storage.js');
var ResourceFilter = openVeoApi.storages.ResourceFilter;

/**
 * Saves in core_system table the last migration successfull done.
 *
 * @param {String} name Name of module (core, publish...)
 * @param {String} version Version of the script successfully executed
 * @param {Object} db DB instance to update value
 * @param {callback} callback A function to call when its done
 */
function saveMigrationVersion(name, version, db, callback) {

  // Find plugin information
  db.getOne('core_system', new ResourceFilter().equal('name', name), null, function(error, pluginInformation) {
    if (error) return callback(error);

    if (!pluginInformation) {

      // Plugin information not found
      // Create it
      db.add(
        'core_system',
        [
          {
            name: name,
            version: version
          }
        ],
        function(error) {
          callback(error);
        }
      );

    } else {

      // Plugin information found
      // Update it
      db.updateOne('core_system', new ResourceFilter().equal('name', name), {version: version}, function(error) {
        callback(error);
      });

    }
  });
}

/**
 * Creates async series according to migration script order.
 *
 * @example
 * {
 *   1.1.0 : 'path/to/migration/1.1.0.js',
 *   1.2.0 : 'path/to/migration/1.2.0.js'
 * }
 *
 * @private
 * @param {Object} module Script collection to execute
 * @param {String} name Name of module (core, publish...)
 * @return {Array} Array of synchronous function to execute
 */
function createMigrationSeries(module, name) {
  var series = [];
  var db = storage.getDatabase();
  Object.keys(module).sort(semver.compare).forEach(function(version) {
    series.push(function(callback) {

      var migrationUpdate = require(module[version]);
      migrationUpdate.update(function(error) {
        if (error) {
          callback(error);
          return;
        }

        // Call saveMigrationVersion when a migration is successfull
        saveMigrationVersion(name, version, db, callback);
      });
    });
  });
  return series;
}

/**
 * Executes a collection of migration script.
 *
 * @example
 * {
 *   core:{
 *     1.1.0: 'path/to/migration/1.1.0.js',
 *     2.0.0: 'path/to/migration/2.0.0.js'
 *   },
 *   publish:{
 *     1.2.0: 'path/to/migration/1.2.0.js',
 *     1.3.0: 'path/to/migration/1.3.0.js',
 *   }
 * }
 *
 * @param {Object} migrations migrations object to execute
 * @param {callback} callback A function to call when its done
 */
module.exports.executeMigrationScript = function(migrations, callback) {
  var series = [];

  // Update Core first
  if (migrations.core) {
    var coreSeries = createMigrationSeries(migrations.core, 'core');
    series = series.concat(coreSeries);
    delete migrations.core;
  }

  // For each module
  Object.keys(migrations).forEach(function(moduleKey) {
    var pluginSeries = createMigrationSeries(migrations[moduleKey], moduleKey);
    series = series.concat(pluginSeries);
  });

  async.series(series, function(error) {
    if (error) {
      process.logger.error(error && error.message);
      throw new Error(error);
    }

    if (series.length) process.logger.info('All migration done with success');
    else process.logger.info('No migration needed - Database is up to date');
    callback();
  });
};
