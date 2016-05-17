'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var ClientModel = process.require('app/server/models/ClientModel.js');
var errors = process.require('app/server/httpErrors.js');
var applicationStorage = openVeoAPI.applicationStorage;
var EntityController = openVeoAPI.controllers.EntityController;

/**
 * Provides route actions for all requests relative to the Web Service client applications and scopes.
 *
 * @class ApplicationController
 * @constructor
 * @extends EntityController
 */
function ApplicationController() {
  EntityController.call(this, ClientModel);
}

module.exports = ApplicationController;
util.inherits(ApplicationController, EntityController);

/**
 * Gets the list of scopes and return it as a JSON object.
 *
 * @example
 *     {
 *       "videos" : {
 *         "name" : "Name of the scope",
 *         "description" : "Scope description"
 *       }
 *     }
 *
 * @method getScopesAction
 */
ApplicationController.prototype.getScopesAction = function(request, response) {
  var scopes = applicationStorage.getWebServiceScopes();
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
 * Parameters :
 *  - **query** Search query to search by application name
 *  - **page** The expected page
 *  - **limit** The expected limit
 *  - **sortOrder** Sort order (either asc or desc)
 *
 * @method getEntitiesAction
 */
ApplicationController.prototype.getEntitiesAction = function(request, response, next) {
  var model = new this.Entity(request.user);
  var params;

  try {
    params = openVeoAPI.util.shallowValidateObject(request.query, {
      query: {type: 'string'},
      limit: {type: 'number', gt: 0},
      page: {type: 'number', gt: 0, default: 1},
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
      $search: params.query
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
