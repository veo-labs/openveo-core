'use strict';

/**
 * @module core-controllers
 */

/**
 * Provides route actions to deal with errors.
 *
 * @class errorController
 */

// Module dependencies
var winston = require('winston');
var errors = process.require('app/server/httpErrors.js');

// Get logger
var logger = winston.loggers.get('openveo');

/**
 * Handles requests which does not correspond to anything.
 *
 * @method notFoundAction
 * @static
 */
module.exports.notFoundAction = function(request, response, next) {
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
module.exports.errorAction = function(error, request, response) {
  if (!error)
    error = errors.UNKNOWN_ERROR;

  if (!error.module)
    error.module = 'core';

  logger.error('Error', {
    code: error.code,
    module: error.module,
    method: request.method,
    path: request.url,
    headers: request.headers
  });

   // Send response with HTML content
  if (request.accepts('html') && (error.httpCode == '401' || error.httpCode == '403')) {
    response.status(error.httpCode);
    response.render(error.httpCode, {
      url: request.url
    });
    return;
  }

  // Send response with JSON content or HTML but not 401 or 403 errorCode
  response.status(error.httpCode);
  response.send({error: {
    code: error.code,
    module: error.module
  }});
};

/**
 * Handles forgotten requests.
 *
 * Depending on request Accept HTTP header, either an HTML content,
 * a JSON content or a text content will be returned with a 404 code.
 *
 * @method notFoundPageAction
 * @static
 */
module.exports.notFoundPageAction = function(request, response) {
  logger.warn('404 Not Found', {
    method: request.method,
    path: request.url,
    headers: request.headers
  });

  response.status(404);

  // HTML content
  if (request.accepts('html')) {
    response.render('404', {
      url: request.url
    });
    return;
  }

  // JSON content
  if (request.accepts('json')) {
    response.send({
      error: 'Not found',
      url: request.url
    });
    return;
  }

  // Text content
  response.type('txt').send(request.url + ' not found');

};
