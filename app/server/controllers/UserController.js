'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var UserModel = process.require('app/server/models/UserModel.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoAPI.controllers.EntityController;
var AccessError = openVeoAPI.errors.AccessError;

/**
 * Provides all route actions to deal with users.
 *
 * @class UserController
 * @constructor
 * @extends EntityController
 */
function UserController() {
  EntityController.call(this, UserModel);
}

module.exports = UserController;
util.inherits(UserController, EntityController);

/**
 * Gets a list of users.
 *
 * Parameters :
 *  - **query** Search query to search in user names
 *  - **page** The expected page
 *  - **limit** The expected limit
 *  - **sortOrder** Sort order (either asc or desc)
 *
 * @method getEntitiesAction
 */
UserController.prototype.getEntitiesAction = function(request, response, next) {
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
    return next(errors.GET_USERS_WRONG_PARAMETERS);
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
        next(errors.GET_USERS_ERROR);
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
 * Updates a user.
 *
 * Parameters :
 *  - **id** The id of the user to update
 *
 * Also expects data in body.
 *
 * @method updateEntityAction
 */
UserController.prototype.updateEntityAction = function(request, response, next) {
  if (request.params.id && request.body) {
    var model = new this.Entity(request.user);
    var entityId = request.params.id;
    var params;

    try {
      params = openVeoAPI.util.shallowValidateObject(request.body, {
        name: {type: 'string'},
        email: {type: 'string'},
        password: {type: 'string'},
        passwordValidate: {type: 'string'},
        roles: {type: 'array<string>'}
      });
    } catch (error) {
      return next(errors.UPDATE_USER_WRONG_PARAMETERS);
    }

    model.update(entityId, params, function(error, updateCount) {
      if (error && (error instanceof AccessError))
        next(errors.UPDATE_USER_FORBIDDEN);
      else if (error) {
        process.logger.error((error && error.message) || 'Fail updating',
                             {method: 'updateEntityAction', entity: entityId});
        next(errors.UPDATE_USER_ERROR);
      } else {
        response.send({error: null, status: 'ok'});
      }
    });
  } else {

    // Missing id of the user or the datas
    next(errors.UPDATE_USER_MISSING_PARAMETERS);

  }
};
