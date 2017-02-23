'use strict';

/**
 * @module core-models
 */

/**
 * Defines a TaxonomyModel to manipulate taxonomies.
 *
 * @class TaxonomyModel
 * @extends EntityModel
 */

var util = require('util');
var openVeoApi = require('@openveo/api');

/**
 * Creates a TaxonomyModel.
 *
 * @constructor
 * @param {TaxonomyProvider} provider The entity provider
 */
function TaxonomyModel(provider) {
  TaxonomyModel.super_.call(this, provider);
}

module.exports = TaxonomyModel;
util.inherits(TaxonomyModel, openVeoApi.models.EntityModel);
