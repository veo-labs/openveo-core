'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');

/**
 * Defines a SettingProvider to get and save settings.
 *
 * @class SettingProvider
 * @extends EntityProvider
 * @constructor
 * @param {Database} database The database to interact with
 */
function SettingProvider(database) {
  SettingProvider.super_.call(this, database, 'core_settings');
}

module.exports = SettingProvider;
util.inherits(SettingProvider, openVeoApi.providers.EntityProvider);
