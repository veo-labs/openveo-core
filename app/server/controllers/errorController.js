"use strict"

// Module dependencies
var winston = require("winston");
var errors = process.require("app/server/httpErrors.js");

// Get logger
var logger = winston.loggers.get("openveo");

/**
 * Handles requests which does not correspond to anything.
 * Send back an error with an HTTP 404.
 */
module.exports.notFoundAction = function(request, response, next){  
  next(errors.PATH_NOT_FOUND);
};

/**
 * Handles all errors.
 * @param Object error An error object with error code, HTTP code and
 * the error module
 * e.g.
 * {
 *   code: 1,
 *   httpCode: 500,
 *   module: "core"
 * }
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