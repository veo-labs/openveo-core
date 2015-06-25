"use strict"

// Module dependencies
var winston = require("winston");
var openVeoAPI = require("openveo-api");

var TaxonomyModel = process.require("app/server/models/TaxonomyModel.js");
var taxonomyModel = new TaxonomyModel();
var applicationStorage = openVeoAPI.applicationStorage;

// Retrieve logger
var logger = winston.loggers.get("openveo");

/**
 * Gets information about a taxonomy.
 * Expects one GET parameter :
 *  - id The id of the taxonomy
 * Return information about the taxonomy as a JSON object :
 * {
 *   taxonomy : {
 *     id : 123456789,
 *     ...
 *   }
 * }
 */
module.exports.getTaxonomyAction = function(request, response, next){
  console.log('-------------------');
   console.log(request.params.name);
  if(request.params.name){
    taxonomyModel.getByName(request.params.name, function(error, taxonomy){
      if(error){
        logger.error(error && error.message);
        response.status(500).send();
      }
      else{       
        if (taxonomy === undefined) taxonomy = {name:request.params.name, tree:[]}
        response.send({ taxonomy : taxonomy });
      }
    });
  }

  // Missing id of the taxonomy
  else
    response.status(400).send();
};
