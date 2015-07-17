"use strict"

/**
 * Provides functions to manage loggers.
 *
 * @module logger
 * @class logger
 * @main logger
 */

// Module dependencies
var winston = require("winston");

/**
 * Gets a new logger by its name or initializes one.
 * 
 * @example
 *     var loggerAPI = require("openveo-api").logger;
 *     
 *     var conf =  {
 *      "fileName" : "/tmp/openveo/logs/openveo.log",
 *      "level" : "debug",
 *      "maxFileSize" : 1048576,
 *      "maxFiles" : 2  
 *      };
 *     
 *     // Initializes logger "openveo"
 *     var logger = loggerAPI.get("openveo", conf);
 *     
 *     // Log something
 *     logger.info("A simple log");
 *
 * @example 
 *     var loggerAPI = require("openveo-api").logger;
 *     
 *     // Retrieve logger "openveo" which have already been initialized
 *     var logger = loggerAPI.get("openveo");
 *
 * @method get
 * @param {String} name The name of the logger
 * @param {Object} conf Logger configuration to initialize a new logger
 * Available debug levels are : 
 *  - silly
 *  - debug
 *  - verbose
 *  - info
 *  - warn
 *  - error
 */
module.exports.get = function(name, conf){
  if(conf){
    
    // Create logger
    winston.loggers.add(name, {
      file: {
        level: conf.level,
        filename: conf.fileName,
        maxsize : conf.maxFileSize,
        maxFiles : conf.maxFiles
      }
    });
    
  }
  
  return winston.loggers.get(name);
};