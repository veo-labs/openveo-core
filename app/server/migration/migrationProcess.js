'use strict';

/**
 * @module core-migration
 */

/**
 * Provides functions to execute migration script.
 *
 * @class
 * @type {type} migrationProcess
 */

var semver = require('semver');
var async = require('async');
var openVeoAPI = require('@openveo/api');

/** Save in core_system table the last migration successfull done
 *
 * @method saveMigrationVersion
 * @private
 * @static
 * @param {String} name Name of module (core, publish...)
 * @param {String} version Version of the script successfully executed
 * @param {Object} db DB instance to update value
 * @param {Function} callback callback A callback with 1 arguments :
 *    - **Error** An Error object or null
 */
function saveMigrationVersion(name, version, db, callback) {
  db.get('core_system', {name: name}, null, null, function(error, value) {
    if (error) {
      callback(error);
      return;
    }
    if (!value || !value.length) db.insert('core_system', [{name: name, version: version}], function(error) {
      callback(error);
    });
    else db.update('core_system', {name: name}, {version: version}, function(error) {
      callback(error);
    });
  });
}

/**
 * Create async series according to migration script order
 * @method createMigrationSeries
 * @private
 * @static
 * @param {Object} module Script collection to execute
 *  exemple: {
 *    1.1.0 : 'path/to/migration/1.1.0.js',
 *    1.2.0 : 'path/to/migration/1.2.0.js'
 *  }
 * @param {String} name Name of module (core, publish...)
 * @return {Array} Array of synchronous function to execute
 */
function createMigrationSeries(module, name) {
  var series = [];
  var db = openVeoAPI.applicationStorage.getDatabase();
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
 * Execute a collection of migration script
 * @method executeMigrationScript
 * @param {Object} migrations migrations object to execute
 *  exemple:
 *  {
 *    core:{
 *      1.1.0: 'path/to/migration/1.1.0.js',
 *      2.0.0: 'path/to/migration/2.0.0.js'
 *    },
 *    publish:{
 *      1.2.0: 'path/to/migration/1.2.0.js',
 *      1.3.0: 'path/to/migration/1.3.0.js',
 *    }
 *  }
 * @param {Function} callback A callback with 1 arguments :
 *    - **Error** An Error object or null
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
