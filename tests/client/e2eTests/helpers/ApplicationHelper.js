'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var Helper = e2e.helpers.Helper;

/**
 * Creates a new ApplicationHelper to help manipulate applications without interacting with the web browser.
 *
 * Each function is inserting in protractor's control flow.
 *
 * @param {ClientModel} model The entity model that will be used by the Helper
 */
function ApplicationHelper(model) {
  ApplicationHelper.super_.call(this, model);
}

module.exports = ApplicationHelper;
util.inherits(ApplicationHelper, Helper);
