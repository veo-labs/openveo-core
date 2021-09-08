'use strict';

/**
 * @module core/providers/TaxonomyProvider
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
 * @param {String} name The taxonomy name
 * @param {module:core/providers/TaxonomyProvider~TaxonomyProvider~getTaxonomyTermsCallback} callback Function to call
 * when it's done
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
 * @param {ResourceFilter} [filter] Rules to filter the taxonomy to update
 * @param {Object} data The modifications to perform
 * @param {String} [data.name] The taxonomy name
 * @param {Array} [data.tree] The list of terms in the taxonomy with for each term:
 * @param {String} data.tree[].id Term id
 * @param {String} data.tree[].title Term title
 * @param {Array} data.tree[].items Term sub terms
 * @param {module:core/providers/TaxonomyProvider~TaxonomyProvider~updateOneCallback} [callback] The function to call
 * when it's done
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
 * @param {Array} taxonomies The list of taxonomies to store with for each taxonomy:
 * @param {String} taxonomies[].name The taxonomy name
 * @param {String} taxonomies[].id The taxonomy id, generated if not specified
 * @param {Array} taxonomies[].tree The list of terms in the taxonomy with for each term:
 * @param {String} taxonomies[].tree[].id Term id
 * @param {String} taxonomies[].tree[].title Term title
 * @param {Array} taxonomies[].tree[].items Term sub terms
 * @param {module:core/providers/TaxonomyProvider~TaxonomyProvider~addCallback} [callback] The function to call when
 * it's done
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
 * @param {callback} callback Function to call when it's done
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
 * @param {String} indexName The name of the index to drop
 * @param {callback} callback Function to call when it's done
 */
TaxonomyProvider.prototype.dropIndex = function(indexName, callback) {
  this.storage.dropIndex(this.location, indexName, function(error, result) {
    if (result && result.ok)
      process.logger.debug('Index "' + indexName + '" dropped');

    callback(error);
  });
};

/**
 * @callback module:core/providers/TaxonomyProvider~TaxonomyProvider~getTaxonomyTermsCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Array|Undefined)} terms The taxonomy terms
 */

/**
 * @callback module:core/providers/TaxonomyProvider~TaxonomyProvider~updateOneCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total 1 if everything went fine
 */

/**
 * @callback module:core/providers/TaxonomyProvider~TaxonomyProvider~addCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total The total amount of taxonomies inserted
 * @param {(Array|Undefined)} taxonomies The list of added taxonomies
 */
