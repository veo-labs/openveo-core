"use strict"

// Module dependencies
var winston = require("winston");
var openVeoAPI = require("openveo-api");
var errors = process.require("app/server/httpErrors.js");

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
          next(errors.GET_ENTITIES_ERROR);
        }
        else
          response.send({ entities : entities });
      });
    }
    
    // No model implemented for this type of entity
    else{
      next(errors.GET_ENTITIES_UNKNOWN);
    }
  }
  
  // Missing the type of entities
  else{
    next(errors.GET_ENTITIES_MISSING_PARAMETERS);
  }
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
          next(errors.GET_ENTITY_ERROR);
        }
        else
          response.send({ entity : entity });
      });      
    }
    
    // No model implemented for this type of entity
    else{
      next(errors.GET_ENTITY_UNKNOWN);
    }
  }
  
  // Missing type and / or id of the entity
  else{
    next(errors.GET_ENTITY_MISSING_PARAMETERS);
  }
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
          next(errors.UPDATE_ENTITY_ERROR);
        }
        else
          response.send();
      });
    }
    
    // No model implemented for this type of entity
    else{
      next(errors.UPDATE_ENTITY_UNKNOWN);
    }
  }
  
  // Missing type and / or id of the entity
  else{
    next(errors.UPDATE_ENTITY_MISSING_PARAMETERS);
  }
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
          next(errors.ADD_ENTITY_ERROR);
        }
        else
          response.send({entity  : entity});
      });
    }
    
    // No model implemented for this type of entity
    else{
      next(errors.ADD_ENTITY_UNKNOWN);
    }
  }
  
  // Missing type and / or body
  else{
    next(errors.ADD_ENTITY_MISSING_PARAMETERS);
  }
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
          next(errors.REMOVE_ENTITY_ERROR);
        }
        else
          response.send();
      });
    }
    
    // No model implemented for this type of entity
    else{
      next(errors.REMOVE_ENTITY_UNKNOWN);
    }
  }
  
  // Missing type and / or id of the entity
  else{
    next(errors.REMOVE_ENTITY_MISSING_PARAMETERS);
  }
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