'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var ClientModel = process.require('app/server/models/ClientModel.js');
var ClientProvider = process.require('app/server/providers/ClientProvider.js');
var errors = process.require('app/server/httpErrors.js');
var storage = process.require('app/server/storage.js');
var EntityController = openVeoApi.controllers.EntityController;

/**
 * Defines an entity controller to handle requests relative to the Web Service client applications and scopes.
 *
 * @class ApplicationController
 * @extends EntityController
 * @constructor
 */
function ApplicationController() {
  ApplicationController.super_.call(this);
}

module.exports = ApplicationController;
util.inherits(ApplicationController, EntityController);

/**
 * Gets the list of scopes and return it as a JSON object.
 *
 * @method getScopesAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Response} response ExpressJS HTTP Response
 */
ApplicationController.prototype.getScopesAction = function(request, response) {
  var scopes = storage.getWebServiceScopes();
  var lightScopes = [];
  for (var i = 0; i < scopes.length; i++) {
    var scope = scopes[i];
    lightScopes.push({
      id: scope.id,
      name: scope.name,
      description: scope.description
    });
  }
  response.send({
    scopes: lightScopes
  });
};

/**
 * Gets a list of applications.
 *
 * @method getEntitiesAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request's query parameters
 * @param {String} [request.query.query] Search query to search on application name
 * @param {Number} [request.query.page=1] The expected page in pagination system
 * @param {Number} [request.query.limit] The maximum number of expected results
 * @param {String} [request.query.sortBy=name] To sort by property name (only "name" is available right now)
 * @param {String} [request.query.sortOrder=desc] The sort order (either "asc" or "desc")
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
ApplicationController.prototype.getEntitiesAction = function(request, response, next) {
  var model = this.getModel(request);
  var params;

  try {
    params = openVeoApi.util.shallowValidateObject(request.query, {
      query: {type: 'string'},
      limit: {type: 'number', gt: 0},
      page: {type: 'number', gte: 0, default: 0},
      sortBy: {type: 'string', in: ['name'], default: 'name'},
      sortOrder: {type: 'string', in: ['asc', 'desc'], default: 'desc'}
    });
  } catch (error) {
    return next(errors.GET_APPLICATIONS_WRONG_PARAMETERS);
  }

  // Build sort
  var sort = {};
  sort[params.sortBy] = params.sortOrder === 'asc' ? 1 : -1;

  // Build filter
  var filter = {};

  // Add search query
  if (params.query) {
    filter.$text = {
      $search: '"' + params.query + '"'
    };
  }

  model.getPaginatedFilteredEntities(
    filter,
    params.limit,
    params.page,
    sort,
    null,
    function(error, entities, pagination) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'getEntitiesAction'});
        next(errors.GET_APPLICATIONS_ERROR);
      } else {
        response.send({
          entities: entities,
          pagination: pagination
        });
      }
    }
  );
};

/**
 * Gets an instance of the entity model associated to the controller.
 *
 * @method getModel
 * @return {EntityModel} The entity model
 */
ApplicationController.prototype.getModel = function() {
  return new ClientModel(new ClientProvider(process.api.getCoreApi().getDatabase()));
};
