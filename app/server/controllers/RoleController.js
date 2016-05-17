'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var RoleModel = process.require('app/server/models/RoleModel.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoAPI.controllers.EntityController;

/**
 * Provides all route actions to deal with roles.
 *
 * @class RoleController
 * @constructor
 * @extends EntityController
 */
function RoleController() {
  EntityController.call(this, RoleModel);
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
 */
RoleController.prototype.getEntitiesAction = function(request, response, next) {
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
