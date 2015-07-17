"use strict"

/** 
 * @module core-controllers
 */

/**
 * Provides route actions to deal with errors.
 *
 * @class errorController
 */

// Module dependencies
var winston = require("winston");
var errors = process.require("app/server/httpErrors.js");

// Get logger
var logger = winston.loggers.get("openveo");

/**
 * Handles requests which does not correspond to anything.
 *
 * @method notFoundAction
 * @static  
 */
module.exports.notFoundAction = function(request, response, next){  
  next(errors.PATH_NOT_FOUND);
};

/**
 * Handles all errors.
 *
 * @example
 *     {
 *       "code" : 1,
 *       "httpCode" : 500,
 *       "module" : "core"
 *     }
 * 
 * @method errorAction
 * @static  
 * @param {Object} error An error object with error code, HTTP code 
 * and the error module
 */
module.exports.errorAction = function(error, request, response, next){
  if(!error)
    error = errors.UNKNOWN_ERROR;
  
  if(!error.module)
    error.module = "core";
  
  logger.error("Error", {code: error.code, module: error.module, method: request.method, path: request.url, headers: request.headers});
  
  // Send response
  response.status(error.httpCode);
  response.send({ error: {
    code: error.code,
    module: error.module
  }});
};