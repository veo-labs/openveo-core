"use strict"

/** 
 * @module core-loaders
 */

/**
 * Provides functions to interpret entities definition from core and 
 * plugin's configuration.
 *
 * @class entityLoader
 */

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
 * @example
 *     var entityLoader= process.require("app/server/loaders/entityLoader.js");
 *     var entities = { 
 *       "application": "app/server/models/ClientModel" 
 *     };
 *
 *     console.log(entityLoader.decodeEntities("/", entities));
 *     // {
 *     //  "application" : [EntityModel object]
 *     // }
 *
 * @method decodeEntities
 * @static  
 * @param {String} pluginPath The root path of the plugin associated to 
 * the routes
 * @param {Object} entities An object of routes
 * @return {Object} The list of entities models by types
 */
module.exports.decodeEntities = function(pluginPath, entities){
  var decodedEntities = {};
  
  if(entities){
    for(var type in entities){

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