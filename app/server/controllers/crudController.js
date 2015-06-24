"use strict"

// Module dependencies
var winston = require("winston");
var openVeoAPI = require("openveo-api");

// Get logger
var logger = winston.loggers.get("openveo");

/**
 * Gets a list of entities.
 * Expects the following url parameters :
 *  - type The type of entities to retrieve
 */
module.exports.getEntitiesAction = function(request, response, next){
  if(request.params.type){
    var model = getEntityModel(request.params.type);

    if(model){
      model.get(function(error, entities){
        if(error){
          logger.error(error.message);
          response.status(500).send();
        }
        else
          response.send({ entities : entities });
      });
    }
    
    // No model implemented for this type of entity
    else
      response.status(500).send();
  }
  
  // Missing the type of entities
  else
    response.status(400).send();
};

/**
 * Gets a specific entity.
 * Expects the following url parameters : 
 *  - type The type of the entity to retrieve
 *  - id The id of the entity to retrieve
 */
module.exports.getEntityAction = function(request, response, next){
  if(request.params.type && request.params.id){
    var model = getEntityModel(request.params.type);
    
    if(model){
      model.getOne(request.params.id, function(error, entity){
        if(error){
          logger.error(error.message);
          response.status(500).send();
        }
        else
          response.send({ entity : entity });
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
 * Updates an entity..
 * Expects the following url parameters : 
 *  - type The type of the entity to retrieve
 *  - id The id of the entity to update
 * Expects data in body.
 */
module.exports.updateEntityAction = function(request, response, next){
  if(request.params.type && request.params.id && request.body){
    var model = getEntityModel(request.params.type);
    
    if(model){
      model.update(request.params.id, request.body, function(error, numberOfUpdatedItems){
        if(error || numberOfUpdatedItems === 0){
          logger.error((error && error.message) || "Failed to update " + request.params.type + " with id " + request.params.id);
          response.status(500).send();
        }
        else
          response.send();
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
 * Adds an entity.
 * Expects the following url parameters : 
 *  - type The type of the entity to add
 * Expects entity data in body.
 */
module.exports.addEntityAction = function(request, response, next){
  if(request.params.type && request.body){
    var model = getEntityModel(request.params.type);
    
    if(model){
      model.add(request.body, function(error, entity){
        if(error){
          logger.error(error.message);
          response.status(500).send();
        }
        else
          response.send({entity  : entity});
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
 * Removes an entity.
 * Expects the following url parameters : 
 *  - type The type of the entity to remove
 *  - id The id of the entity to remove
 */
module.exports.removeEntityAction = function(request, response, next){
  if(request.params.type && request.params.id){
    var model = getEntityModel(request.params.type);
    
    if(model){
      model.remove(request.params.id, function(error, numberOfRemovedItems){
        if(error || numberOfRemovedItems === 0){
          logger.error((error && error.message) || "Failed to remove " + request.params.type + " with id " + request.params.id);
          response.status(500).send();
        }
        else
          response.send();
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