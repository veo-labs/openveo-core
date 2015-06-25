"use scrict"

// Module dependencies
var util = require("util");
var openVeoAPI = require("openveo-api");

var TaxonomyProvider = process.require("app/server/providers/TaxonomyProvider.js");

/**
 * Creates a TaxonomyModel.
 */
function TaxonomyModel(){
  openVeoAPI.EntityModel.prototype.init.call(this, new TaxonomyProvider(openVeoAPI.applicationStorage.getDatabase()));
}

module.exports = TaxonomyModel;
util.inherits(TaxonomyModel, openVeoAPI.EntityModel);

/**
 * get taxonomy by its name.
 * @param Object data A taxonomy object
 * e.g.
 * {
 *   "name" : "Name of the taxonomy",
 *   "tree" : 
 * }
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 */
TaxonomyModel.prototype.getByName = function(name, callback){
  this.provider.getByFilter({name: name}, function(error, taxonomy){
    if(callback)
      callback(error, taxonomy);
  });
}