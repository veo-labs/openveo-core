"use scrict"

/** 
 * @module core-providers 
 */

// Module dependencies
var util = require("util");
var openVeoAPI = require("openveo-api");

/**
 * Defines a TaxonomyProvider class to get and save taxonomies.
 *
 * @class TaxonomyProvider
 * @constructor
 * @extends EntityProvider
 * @param {Database} database The database to interact with
 */
function TaxonomyProvider(database){
  openVeoAPI.EntityProvider.prototype.init.call(this, database, "taxonomy");
}

module.exports = TaxonomyProvider;
util.inherits(TaxonomyProvider, openVeoAPI.EntityProvider);
