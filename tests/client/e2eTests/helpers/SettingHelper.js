'use strict';

var util = require('util');
var nanoid = require('nanoid').nanoid;
var e2e = require('@openveo/test').e2e;
var Helper = e2e.helpers.Helper;

/**
 * Creates a new SettingHelper to help manipulate settings without interacting with the web browser.
 *
 * Each function is inserting in protractor's control flow.
 *
 * @param {SettingProvider} provider The entity provider that will be used by the Helper
 */
function SettingHelper(provider) {
  SettingHelper.super_.call(this, provider);
}

module.exports = SettingHelper;
util.inherits(SettingHelper, Helper);

/**
 * Gets setting object example to use with web service put /settings.
 *
 * @method getAddExample
 * @return {Object} The data to add
 */
SettingHelper.prototype.getAddExample = function() {
  var id = nanoid();
  return {
    id: id,
    value: 'value'
  };
};

