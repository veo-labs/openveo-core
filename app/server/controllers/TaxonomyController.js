"use strict"

/** 
 * @module core-controllers
 */

/**
 * Provides route actions to manage taxonomies.
 *
 * @class taxonomyController
 */

// Module dependencies
var winston = require("winston");
var openVeoAPI = require("openveo-api");
var errors = process.require("app/server/httpErrors.js");

var TaxonomyModel = process.require("app/server/models/TaxonomyModel.js");
var taxonomyModel = new TaxonomyModel();
var applicationStorage = openVeoAPI.applicationStorage;

// Retrieve logger
var logger = winston.loggers.get("openveo");

/**
 * Gets information about a taxonomy.
 *
 * Expects one GET parameter :
 * - **id** The id of the taxonomy
 *
 * Return information about the taxonomy as a JSON object.
 *
 * @example
 *     {
 *       "taxonomy" : {
 *         "id" : 123456789,
 *         ...
 *       }
 *     }
 *
 * @method getTaxonomyAction
 * @static
 */
module.exports.getTaxonomyAction = function(request, response, next){
  if(request.params.name){
    taxonomyModel.getByName(request.params.name, function(error, taxonomy){
      if(error){
        next(errors.GET_TAXONOMY_ERROR);
      }
      else{
        if (taxonomy === undefined) taxonomy = {name:request.params.name, tree:[]}
        response.send({ taxonomy : taxonomy });
      }
    });
  }

  // Missing id of the taxonomy
  else
    next(errors.GET_TAXONOMY_MISSING_PARAMETERS);
};