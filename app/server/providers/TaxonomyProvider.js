"use scrict"

// Module dependencies
var util = require("util");
var openVeoAPI = require("openveo-api");

/**
 * Creates a TaxonomyProvider.
 * @param Database database The database to interact with
 */
function TaxonomyProvider(database){
  openVeoAPI.EntityProvider.prototype.init.call(this, database, "taxonomy");
}

module.exports = TaxonomyProvider;
util.inherits(TaxonomyProvider, openVeoAPI.EntityProvider);
