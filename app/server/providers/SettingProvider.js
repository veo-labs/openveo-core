'use strict';

/**
 * @module core/providers/SettingProvider
 */

var util = require('util');
var async = require('async');
var openVeoApi = require('@openveo/api');
var ResourceFilter = openVeoApi.storages.ResourceFilter;

/**
 * Defines a SettingProvider to get and save settings.
 *
 * @class SettingProvider
 * @extends EntityProvider
 * @param {Database} database The database to interact with
 */
function SettingProvider(database) {
  SettingProvider.super_.call(this, database, 'core_settings');
}

module.exports = SettingProvider;
util.inherits(SettingProvider, openVeoApi.providers.EntityProvider);

/**
 * Adds settings.
 *
 * If a setting already exists, an update is performed.
 *
 * @param {Array} settings The list of settings to store with for each setting:
 * @param {String} settings[].id The setting key
 * @param {Mixed} settings[].value The setting value
 * @param {module:core/providers/SettingProvider~SettingProvider~addCallback} [callback] The function to call when
 * it's done
 */
SettingProvider.prototype.add = function(settings, callback) {
  var self = this;
  var settingsToAdd = [];
  var settingsToUpdate = [];
  var asyncFunctions = [];
  var settingIds = [];

  for (var i = 0; i < settings.length; i++) {
    if (!settings[i].id)
      return this.executeCallback(callback, new TypeError('An id is required to create a setting'));

    settingIds.push(settings[i].id);
  }

  // Find all settings with the given ids
  this.get(
    new ResourceFilter().in('id', settingIds),
    {
      include: ['id']
    },
    settingIds.length,
    null,
    null,
    function(getError, fetchedSettings) {
      if (getError) return self.executeCallback(callback, getError);

      // Validate settings
      // Dissociate settings that will be added and settings that will be updated
      for (var i = 0; i < settings.length; i++) {
        var setting = settings[i];
        var exists = false;

        for (var j = 0; j < fetchedSettings.length; j++) {
          if (setting.id === fetchedSettings[j].id) {

            // Setting already exists
            // Add it to the list of settings to update
            settingsToUpdate.push({
              id: setting.id,
              value: setting.value
            });

            exists = true;
            break;
          }
        }

        if (exists) continue;

        // Setting does not exist yet
        // Add it to the list of settings to insert
        settingsToAdd.push({
          id: setting.id,
          value: setting.value
        });
      }

      // Prepare function to add settings
      asyncFunctions.push(function(callback) {
        if (!settingsToAdd.length) return callback();
        SettingProvider.super_.prototype.add.call(self, settingsToAdd, callback);
      });

      // Prepare functions to update settings
      settingsToUpdate.forEach(function(settingToUpdate) {
        asyncFunctions.push(function(callback) {
          self.updateOne(
            new ResourceFilter().equal('id', settingToUpdate.id),
            {
              value: settingToUpdate.value
            },
            callback
          );
        });
      });

      // Add / update settings
      async.parallel(asyncFunctions, function(error, results) {
        var totalAddedSettings = (results[0] && results[0][0]) || 0;
        var addedSettings = (results[0] && results[0][1]) || [];
        var total = settingsToUpdate.length + totalAddedSettings;
        self.executeCallback(callback, error, total, addedSettings.concat(settingsToUpdate));
      });
    }
  );
};

/**
 * Updates a setting.
 *
 * @param {ResourceFilter} [filter] Rules to filter the setting to update
 * @param {Object} data The modifications to perform
 * @param {Mixed} data.value The setting value
 * @param {module:core/providers/SettingProvider~SettingProvider~updateOneCallback} [callback] The function to call
 * when it's done
 */
SettingProvider.prototype.updateOne = function(filter, data, callback) {
  var modifications = {};
  modifications.value = data.value;

  SettingProvider.super_.prototype.updateOne.call(this, filter, modifications, callback);
};

/**
 * Creates users indexes.
 *
 * @param {callback} callback Function to call when it's done
 */
SettingProvider.prototype.createIndexes = function(callback) {
  this.storage.createIndexes(this.location, [
    {key: {id: 1}, name: 'byId'}
  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create settings indexes : ' + result.note);

    callback(error);
  });
};

/**
 * @callback module:core/providers/SettingProvider~SettingProvider~addCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total The total amount of settings inserted / updated
 * @param {(Array|Undefined)} settings The list of added / updated settings
 */

/**
 * @callback module:core/providers/SettingProvider~SettingProvider~updateOneCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total 1 if everything went fine
 */
