'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var nanoid = require('nanoid').nanoid;
var openVeoApi = require('@openveo/api');
var ResourceFilter = openVeoApi.storages.ResourceFilter;
var NotFoundError = openVeoApi.errors.NotFoundError;

/**
 * Defines a TaxonomyProvider to get and save taxonomies.
 *
 * @class TaxonomyProvider
 * @extends EntityProvider
 * @constructor
 * @param {Database} database The database to interact with
 */
function TaxonomyProvider(database) {
  TaxonomyProvider.super_.call(this, database, 'core_taxonomies');
}

module.exports = TaxonomyProvider;
util.inherits(TaxonomyProvider, openVeoApi.providers.EntityProvider);

/**
 * Gets the list of terms of a taxonomy.
 *
 * @method getTaxonomyTerms
 * @async
 * @param {String} name The taxonomy name
 * @param {Function} callback Function to call when it's done
 *  - **Error** An error if something went wrong
 *  - **Array** The taxonomy terms
 */
TaxonomyProvider.prototype.getTaxonomyTerms = function(name, callback) {
  this.getOne(
    new ResourceFilter().search(name),
    null,
    function(error, taxonomy) {
      if (error)
        return callback(error);
      else if (!taxonomy)
        return callback(new NotFoundError(name));
      else
        return callback(null, taxonomy.tree);
    }
  );
};

/**
 * Updates a taxonomy.
 *
 * @method updateOne
 * @async
 * @param {ResourceFilter} [filter] Rules to filter the taxonomy to update
 * @param {Object} data The modifications to perform
 * @param {String} [data.name] The taxonomy name
 * @param {Array} [data.tree] The list of terms in the taxonomy with for each term:
 *   - **String** id Term id
 *   - **String** title Term title
 *   - **Array** items Term sub terms
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** 1 if everything went fine
 */
TaxonomyProvider.prototype.updateOne = function(filter, data, callback) {
  var modifications = {};
  if (data.name) modifications.name = data.name;
  if (data.tree) modifications.tree = data.tree;

  TaxonomyProvider.super_.prototype.updateOne.call(this, filter, modifications, callback);
};

/**
 * Adds taxonomies.
 *
 * @method add
 * @async
 * @param {Array} taxonomies The list of taxonomies to store with for each taxonomy:
 *   - **String** name The taxonomy name
 *   - **Array** tree The list of terms in the taxonomy with for each term:
 *     - **String** id Term id
 *     - **String** title Term title
 *     - **Array** items Term sub terms
 *   - **String** id The taxonomy id, generated if not specified
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of taxonomies inserted
 *   - **Array** The list of added taxonomies
 */
TaxonomyProvider.prototype.add = function(taxonomies, callback) {
  var taxonomiesToAdd = [];

  for (var i = 0; i < taxonomies.length; i++) {
    var taxonomy = taxonomies[i];

    if (!taxonomy.name)
      return this.executeCallback(callback, new TypeError('Requires a name to create a taxonomy'));

    taxonomiesToAdd.push({
      id: taxonomy.id || nanoid(),
      name: taxonomy.name,
      tree: taxonomy.tree || []
    });
  }

  TaxonomyProvider.super_.prototype.add.call(this, taxonomiesToAdd, callback);
};

/**
 * Creates taxonomies indexes.
 *
 * @method createIndexes
 * @async
 * @param {Function} callback Function to call when it's done with:
 *  - **Error** An error if something went wrong, null otherwise
 */
TaxonomyProvider.prototype.createIndexes = function(callback) {
  var language = process.api.getCoreApi().getContentLanguage();

  this.storage.createIndexes(this.location, [
    {key: {name: 1}, name: 'byName'},

    // eslint-disable-next-line camelcase
    {key: {name: 'text'}, weights: {name: 1}, default_language: language, name: 'querySearch'}

  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create taxonomies indexes : ' + result.note);

    callback(error);
  });
};

/**
 * Drops an index from database collection.
 *
 * @method dropIndex
 * @async
 * @param {String} indexName The name of the index to drop
 * @param {Function} callback Function to call when it's done with:
 *  - **Error** An error if something went wrong, null otherwise
 */
TaxonomyProvider.prototype.dropIndex = function(indexName, callback) {
  this.storage.dropIndex(this.location, indexName, function(error, result) {
    if (result && result.ok)
      process.logger.debug('Index "' + indexName + '" dropped');

    callback(error);
  });
};
