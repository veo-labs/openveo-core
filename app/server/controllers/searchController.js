"use strict"

// Module dependencies
var winston = require("winston");
var openVeoAPI = require("openveo-api");

// Get logger
var logger = winston.loggers.get("openveo");


/**
 * Updates an entity..
 * Expects the following url parameters : 
 *  - type The type of the entity to retrieve
 *  - id The id of the entity to update
 * Expects data in body.
 */
module.exports.searchEntitiesAction = function(request, response, next){
  if(request.params.type){
    var model = getEntityModel(request.params.type);
    var options = request.body;
    if(model){
      model.getPaginatedFilteredEntities(options.filter, options.count, options.page, options.sort, function(error, rows, paginate){
        if(error){
          logger.error((error && error.message) || "An error in request filter occured. Please verify your parameters.");
          response.status(500).send();
        }
        else{
          //TODO Add Header,
          //Add paginations
          response.send({"rows" : rows, "pagination": paginate});
        }
      });
    }
    
    // No model implemented for this type of entity
    else
      response.status(500).send();
  }
  
  // Missing type and / or id of the entity
  else
    response.status(400).send();
};

/**
 * Gets entity model.
 * @param String type The type of entity
 * @return EntityModel An instance of an EntityModel
 */
var getEntityModel = function(type){
  var entities = openVeoAPI.applicationStorage.getEntities();

  if(type)
    return entities[type];
}