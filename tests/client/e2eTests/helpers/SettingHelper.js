'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var Helper = e2e.helpers.Helper;

/**
 * Creates a new SettingHelper to help manipulate settings without interacting with the web browser.
 *
 * Each function is inserting in protractor's control flow.
 *
 * @param {SettingModel} model The entity model that will be used by the Helper
 */
function SettingHelper(model) {
  SettingHelper.super_.call(this, model);
}

module.exports = SettingHelper;
util.inherits(SettingHelper, Helper);
