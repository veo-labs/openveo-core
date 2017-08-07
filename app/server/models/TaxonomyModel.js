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

/**
 * Gets the list of terms of a taxonomy.
 *
 * @method getTaxonomyTerms
 * @param {String} name The taxonomy name
 * @param {Function} callback Function to call when it's done
 *  - **Error** An error if something went wrong
 *  - **Object** The taxonomy terms
 */
TaxonomyModel.prototype.getTaxonomyTerms = function(name, callback) {
  this.get(
    {
      $text: {
        $search: name
      }
    },
    function(error, taxonomies) {
      if (error)
        return callback(error);
      else if (!taxonomies.length)
        return callback(new Error('Taxonomy : "' + name + '" not found'));
      else
        return callback(null, taxonomies[0].tree);
    }
  );
};
