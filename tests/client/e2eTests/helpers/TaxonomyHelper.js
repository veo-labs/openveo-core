'use strict';

var util = require('util');
var e2e = require('@openveo/test').e2e;
var Helper = e2e.helpers.Helper;

/**
 * Creates a new TaxonomyHelper to help manipulate taxonomies without interacting with the web browser.
 *
 * Each function is inserting in protractor's control flow.
 *
 * @param {TaxonomyModel} model The entity model that will be used by the Helper
 */
function TaxonomyHelper(model) {
  TaxonomyHelper.super_.call(this, model);
}

module.exports = TaxonomyHelper;
util.inherits(TaxonomyHelper, Helper);
