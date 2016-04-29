'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var errors = process.require('app/server/httpErrors.js');
var DefaultController = process.require('app/server/controllers/DefaultController.js');
var Controller = openVeoAPI.controllers.Controller;
var defaultController = new DefaultController();

/**
 * Provides route actions to deal with errors.
 *
 * @class ErrorController
 * @constructor
 * @extends Controller
 */
function ErrorController() {
  Controller.call(this);
}

module.exports = ErrorController;
util.inherits(ErrorController, Controller);

/**
 * Handles requests which does not correspond to anything.
 *
 * @method notFoundAction
 */
ErrorController.prototype.notFoundAction = function(request, response, next) {
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
 * @param {Object} error An error object with error code, HTTP code
 * and the module associated to the error
 */
ErrorController.prototype.errorAction = function(error, request, response, next) {
  if (!error || !error.code)
    error = errors.UNKNOWN_ERROR;

  if (!error.module)
    error.module = 'core';

  process.logger.error('Error', {
    code: error.code,
    module: error.module,
    method: request.method,
    path: request.url,
    headers: request.headers
  });

   // Send response with HTML content
  if (request.accepts('html') && (error.httpCode == '401' || error.httpCode == '403')) {
    response.status(error.httpCode);
    defaultController.defaultAction(request, response, next);
    return;
  }

  // Send response with JSON content or HTML but not 401 or 403 errorCode
  response.status(error.httpCode);
  response.send({
    error: {
      code: error.code,
      module: error.module,
      message: error.message
    }
  });
};

/**
 * Handles forgotten requests.
 *
 * Depending on request Accept HTTP header, either an HTML content,
 * a JSON content or a text content will be returned with a 404 code.
 *
 * @method notFoundPageAction
 */
ErrorController.prototype.notFoundPageAction = function(request, response) {
  process.logger.warn('404 Not Found', {
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
