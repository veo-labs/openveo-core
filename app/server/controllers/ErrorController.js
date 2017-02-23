'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var errors = process.require('app/server/httpErrors.js');
var DefaultController = process.require('app/server/controllers/DefaultController.js');
var Controller = openVeoApi.controllers.Controller;
var defaultController = new DefaultController();

/**
 * Defines a controller to handle errors.
 *
 * @class ErrorController
 * @extends Controller
 * @constructor
 */
function ErrorController() {
  ErrorController.super_.call(this);
}

module.exports = ErrorController;
util.inherits(ErrorController, Controller);

/**
 * Handles requests which does not correspond to anything.
 *
 * @method notFoundAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
ErrorController.prototype.notFoundAction = function(request, response, next) {
  next(errors.PATH_NOT_FOUND);
};

/**
 * Handles all errors.
 *
 * @method errorAction
 * @param {Object} error An error object
 * @param {Number} error.httCode The code HTTP to return for this error
 * @param {Number} error.message The message with the error
 * @param {Number} [error.code=UNKNOWN_ERROR] The error code
 * @param {Number} [error.module=core] The name of the plugin the error belongs to
 * @param {Request} request ExpressJS HTTP Request
 * @param {Request} request.method Request's HTTP method
 * @param {Request} request.url Request's url
 * @param {Request} request.headers Request's headers
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
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
 * @param {Request} request ExpressJS HTTP Request
 * @param {Request} request.method Request's HTTP method
 * @param {Request} request.url Request's url
 * @param {Request} request.headers Request's headers
 * @param {Response} response ExpressJS HTTP Response
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
