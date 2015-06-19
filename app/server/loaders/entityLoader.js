"use scrict"

// Module dependencies
var path = require("path");
var util = require("util");
var winston = require("winston");
var openVeoAPI = require("openveo-api");

// Get logger
var logger = winston.loggers.get("openveo");

/**
 * Gets the list of entities from a route configuration object with,
 * for each one, its type and its associated Model Object.
 *
 * @param String pluginPath The root path of the plugin associated to 
 * the routes
 * @param Object entities An object of routes as follow : 
 * {
 *   "application" : "app/server/models/ClientModel"
 * }
 * @return Object The list of entities models by types
 * {
 *   "application" : [EntityModel object]
 * }
 */
module.exports.decodeEntities = function(pluginPath, entities){
  var decodedEntities = {};
  
  if(entities){
    for(type in entities){

      try{
        var model = require(path.join(pluginPath, entities[type] + ".js"));
        decodedEntities[type] = model;
      }
      catch(e){
        logger.warn(e.message, {action : "decodeEntities"});
      }

    }
  }

  return decodedEntities;
};