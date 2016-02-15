'use strict';

/**
 * @module core-models
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');

var TaxonomyProvider = process.require('app/server/providers/TaxonomyProvider.js');

/**
 * Defines a TaxonomyModel class to manipulate taxonomies.
 *
 * @class TaxonomyModel
 * @constructor
 * @extends EntityModel
 */
function TaxonomyModel() {
  openVeoAPI.EntityModel.prototype.init.call(this, new TaxonomyProvider(openVeoAPI.applicationStorage.getDatabase()));
}

module.exports = TaxonomyModel;
util.inherits(TaxonomyModel, openVeoAPI.EntityModel);

/**
 * Gets taxonomy by its name.
 *
 * @method getByName
 * @async
 * @param {Object} data A taxonomy object
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The taxonomy
 */
TaxonomyModel.prototype.getByName = function(name, callback) {
  this.provider.getByFilter({
    name: name
  },
  function(error, taxonomy) {
    if (callback)
      callback(error, taxonomy);
  });
};
