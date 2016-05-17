'use strict';

/**
 * @module models
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var EntityModel = openVeoAPI.EntityModel;
var TaxonomyProvider = process.require('app/server/providers/TaxonomyProvider.js');
var applicationStorage = openVeoAPI.applicationStorage;

/**
 * Defines a TaxonomyModel class to manipulate taxonomies.
 *
 * @example
 *
 *     // Example for implementing a new TaxonomyModel named "CustomModel"
 *
 *     // CustomModel.js
 *
 *     var util = require('util');
 *     var api = require('@openveo/api');
 *     var CustomProvider = process.require('CustomProvider.js');
 *
 *     function CustomModel() {
 *
 *       // Initialize the taxonomy model with a dedicated provider
 *       api.TaxonomyModel.call(this, new CustomProvider(api.applicationStorage.getDatabase()));
 *
 *     }
 *
 *     // CustomModel must extends TaxonomyModel
 *     module.exports = CustomModel;
 *     util.inherits(CustomModel, api.TaxonomyModel);
 *
 * @example
 *
 *     // Example for how to use CustomModel defined in previous example
 *
 *     var api = require('@openveo/api');
 *
 *     var CustomModel = process.require('CustomModel.js');
 *     var model = new CustomModel();
 *
 * @class TaxonomyModel
 * @constructor
 * @extends EntityModel
 */
function TaxonomyModel() {
  EntityModel.call(this, new TaxonomyProvider(applicationStorage.getDatabase()));
}

module.exports = TaxonomyModel;
util.inherits(TaxonomyModel, EntityModel);
