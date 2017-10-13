'use strict';

/**
 * @module core-models
 */

var util = require('util');
var openVeoApi = require('@openveo/api');

/**
 * Defines a SettingModel to manipulate settings.
 *
 * @class SettingModel
 * @extends EntityModel
 * @constructor
 * @param {SettingProvider} provider The entity provider
 */
function SettingModel(provider) {
  SettingModel.super_.call(this, provider);
}

module.exports = SettingModel;
util.inherits(SettingModel, openVeoApi.models.EntityModel);

/**
 * Adds a new setting.
 *
 * If setting already exists with the given id, no addition is performed.
 *
 * @method add
 * @async
 * @param {Object} data Setting data
 * @param {String} data.id Setting id
 * @param {Mixed} data.value Setting value
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of items inserted
 *   - **Object** The added setting
 */
SettingModel.prototype.add = function(data, callback) {
  var self = this;

  this.getOne(data.id, null, function(error, setting) {
    if (error) return callback(error);
    if (setting) return callback(null, 0, setting);

    self.provider.add({
      id: data.id,
      value: data.value
    }, function(error, insertCount, documents) {
      if (callback) {
        if (error)
          callback(error);
        else
          callback(null, insertCount, documents[0]);
      }
    });
  });
};

/**
 * Updates a setting.
 *
 * If setting does not exist it is automatically created.
 *
 * @method update
 * @async
 * @param {String} id The id of setting to update
 * @param {Object} data Setting data
 * @param {Mixed} data.value Setting value
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated / added items
 */
SettingModel.prototype.update = function(id, data, callback) {
  var self = this;

  this.provider.update(id, data, function(error, updatedCount) {
    if (!updatedCount) {
      self.add({
        id: id,
        value: data.value
      }, function(addError) {
        if (addError) return callback(error);
        callback(null, 1);
      });
    } else
      callback(error, updatedCount);
  });
};
