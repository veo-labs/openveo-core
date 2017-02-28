'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var RoleModel = process.require('app/server/models/RoleModel.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoApi.controllers.EntityController;

/**
 * Defines an entity controller to handle requests relative to roles' entities.
 *
 * @class RoleController
 * @extends EntityController
 * @constructor
 */
function RoleController() {
  RoleController.super_.call(this);
}

module.exports = RoleController;
util.inherits(RoleController, EntityController);

/**
 * Gets a list of roles.
 *
 * Parameters :
 *  - **query** Search query to search in role names
 *  - **page** The expected page
 *  - **limit** The expected limit
 *  - **sortOrder** Sort order (either asc or desc)
 *
 * @method getEntitiesAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request's query parameters
 * @param {Number} [request.query.limit=1] The maximum number of expected results
 * @param {Number} [request.query.page] The expected page in pagination system
 * @param {String} [request.query.sortBy=name] The name of the property on which to sort (only "name" is available)
 * @param {String} [request.query.sortOrder=desc] The sort order (either "asc" or "desc")
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
RoleController.prototype.getEntitiesAction = function(request, response, next) {
  var model = this.getModel(request);
  var params;

  try {
    params = openVeoApi.util.shallowValidateObject(request.query, {
      query: {type: 'string'},
      limit: {type: 'number', gt: 0},
      page: {type: 'number', gt: 0, default: 1},
      sortBy: {type: 'string', in: ['name'], default: 'name'},
      sortOrder: {type: 'string', in: ['asc', 'desc'], default: 'desc'}
    });
  } catch (error) {
    return next(errors.GET_ROLES_WRONG_PARAMETERS);
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
        next(errors.GET_ROLES_ERROR);
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
RoleController.prototype.getModel = function() {
  return new RoleModel(new RoleProvider(process.api.getCoreApi().getDatabase()));
};
