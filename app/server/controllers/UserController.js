'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var UserModel = process.require('app/server/models/UserModel.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoApi.controllers.EntityController;
var AccessError = openVeoApi.errors.AccessError;

/**
 * Defines an entity controller to handle requests relative to users' entities.
 *
 * @class UserController
 * @extends EntityController
 * @constructor
 */
function UserController() {
  UserController.super_.call(this);
}

module.exports = UserController;
util.inherits(UserController, EntityController);

/**
 * Gets a list of users.
 *
 * @method getEntitiesAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request's query parameters
 * @param {String} [request.query.query] Search query to search in user names
 * @param {Number} [request.query.page=1] The expected page in pagination system
 * @param {Number} [request.query.limit] The maximum number of expected results
 * @param {String} [request.query.sortBy=name] To sort by property name (only "name" is available right now)
 * @param {String} [request.query.sortOrder=desc] The sort order (either "asc" or "desc")
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
UserController.prototype.getEntitiesAction = function(request, response, next) {
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
 * @method updateEntityAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.params Request's parameters
 * @param {String} request.params.id Id of the user to update
 * @param {Object} [request.body] Request's body
 * @param {String} [request.body.name] User's name
 * @param {String} [request.body.email] User's email
 * @param {String} [request.body.password] User's password
 * @param {String} [request.body.passwordValidate] User's password validation
 * @param {Array} [request.body.roles] User's roles
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
UserController.prototype.updateEntityAction = function(request, response, next) {
  if (request.params.id && request.body) {
    var model = this.getModel(request);
    var entityId = request.params.id;
    var params;

    try {
      params = openVeoApi.util.shallowValidateObject(request.body, {
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
        process.logger.error(
          (error && error.message) || 'Fail updating',
          {method: 'updateEntityAction', entity: entityId}
        );
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

/**
 * Gets an instance of the entity model associated to the controller.
 *
 * @method getModel
 * @return {EntityModel} The entity model
 */
UserController.prototype.getModel = function() {
  return new UserModel(new UserProvider(process.api.getCoreApi().getDatabase()));
};
