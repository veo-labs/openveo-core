'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoApi.controllers.EntityController;
var ResourceFilter = openVeoApi.storages.ResourceFilter;

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
 * @example
 *
 *     // Response example
 *     {
 *       "entities" : [ ... ],
 *       "pagination" : {
 *         "limit": ..., // The limit number of users by page
 *         "page": ..., // The actual page
 *         "pages": ..., // The total number of pages
 *         "size": ... // The total number of users
 *     }
 *
 * @method getEntitiesAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request's query parameters
 * @param {String|Array} [request.query.include] The list of fields to include from returned users
 * @param {String|Array} [request.query.exclude] The list of fields to exclude from returned users. Ignored if
 * include is also specified.
 * @param {String} [request.query.query] Search query to search in user names
 * @param {Number} [request.query.page=0] The expected page in pagination system
 * @param {Number} [request.query.limit=10] The maximum number of expected results
 * @param {String} [request.query.sortBy="name"] The field to sort by (only "name" is available right now)
 * @param {String} [request.query.sortOrder="desc"] The sort order (either "asc" or "desc")
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
UserController.prototype.getEntitiesAction = function(request, response, next) {
  var provider = this.getProvider();
  var params;

  try {
    params = openVeoApi.util.shallowValidateObject(request.query, {
      include: {type: 'array<string>'},
      exclude: {type: 'array<string>'},
      query: {type: 'string'},
      limit: {type: 'number', gt: 0},
      page: {type: 'number', gte: 0, default: 0},
      sortBy: {type: 'string', in: ['name'], default: 'name'},
      sortOrder: {type: 'string', in: ['asc', 'desc'], default: 'desc'},
      origin: {type: 'string', in: Object.values(openVeoApi.passport.STRATEGIES).concat(['all']), default: 'all'}
    });
  } catch (error) {
    return next(errors.GET_USERS_WRONG_PARAMETERS);
  }

  // Build sort
  var sort = {};
  sort[params.sortBy] = params.sortOrder;

  // Build filter
  var filter = new ResourceFilter();

  // Add search query
  if (params.query) filter.search('"' + params.query + '"');

  // Add origin filter
  if (params.origin !== 'all') filter.equal('origin', params.origin);

  // Remove "password" field from included fields
  if (params.include) {
    var passwordPosition = params.include.indexOf('password');
    if (passwordPosition > -1) params.include.splice(passwordPosition, 1);
  }

  // Add "password" field to the existing excluded fields
  if (params.exclude && params.exclude.indexOf('password') === -1) params.exclude.push('password');

  // Exclude "password" field
  if (!params.include && !params.exclude) params.exclude = ['password'];

  provider.get(
    filter,
    {
      exclude: params.exclude,
      include: params.include
    },
    params.limit,
    params.page,
    sort,
    function(error, users, pagination) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'getEntitiesAction'});
        next(errors.GET_USERS_ERROR);
      } else {
        response.send({
          entities: users,
          pagination: pagination
        });
      }
    }
  );
};

/**
 * Updates a user.
 *
 * @example
 *
 *     // Response example
 *     {
 *       "total": 1
 *     }
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
    var provider = this.getProvider(request);
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

    provider.updateOne(
      new ResourceFilter().equal('id', entityId),
      params,
      function(error, total) {
        if (error) {
          process.logger.error(
            (error && error.message) || 'Fail updating',
            {method: 'updateEntityAction', entity: entityId}
          );
          next(errors.UPDATE_USER_ERROR);
        } else {
          response.send({total: total});
        }
      }
    );
  } else {

    // Missing id of the user or the datas
    next(errors.UPDATE_USER_MISSING_PARAMETERS);

  }
};

/**
 * Gets an instance of the provider associated to the controller.
 *
 * @method getProvider
 * @return {UserProvider} The provider
 */
UserController.prototype.getProvider = function() {
  return new UserProvider(process.api.getCoreApi().getDatabase());
};
