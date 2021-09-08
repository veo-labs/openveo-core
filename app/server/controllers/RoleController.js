'use strict';

/**
 * @module core/controllers/RoleController
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoApi.controllers.EntityController;
var ResourceFilter = openVeoApi.storages.ResourceFilter;

/**
 * Defines an entity controller to handle requests relative to roles' entities.
 *
 * @class RoleController
 * @extends EntityController
 */
function RoleController() {
  RoleController.super_.call(this);
}

module.exports = RoleController;
util.inherits(RoleController, EntityController);

/**
 * Gets a list of roles.
 *
 * @example
 * // Response example
 * {
 *   "entities" : [ ... ],
 *   "pagination" : {
 *     "limit": ..., // The limit number of roles by page
 *     "page": ..., // The actual page
 *     "pages": ..., // The total number of pages
 *     "size": ... // The total number of roles
 * }
 *
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request's query parameters
 * @param {(String|Array)} [request.query.include] The list of fields to include from returned roles
 * @param {(String|Array)} [request.query.exclude] The list of fields to exclude from returned roles. Ignored if
 * include is also specified.
 * @param {String} [request.query.query] Search query to search on role names
 * @param {Number} [request.query.useSmartSearch=1] 1 to use a more advanced search mechanism, 0 to use a simple search
 * based on a regular expression
 * @param {Number} [request.query.limit=10] The maximum number of expected results
 * @param {Number} [request.query.page=0] The expected page in pagination system
 * @param {String} [request.query.sortBy="name"] The field to sort by (only "name" is available)
 * @param {String} [request.query.sortOrder="desc"] The sort order (either "asc" or "desc")
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
RoleController.prototype.getEntitiesAction = function(request, response, next) {
  var provider = this.getProvider();
  var params;

  try {
    params = openVeoApi.util.shallowValidateObject(request.query, {
      include: {type: 'array<string>'},
      exclude: {type: 'array<string>'},
      query: {type: 'string'},
      useSmartSearch: {type: 'number', in: [0, 1], default: 1},
      limit: {type: 'number', gt: 0},
      page: {type: 'number', gte: 0, default: 0},
      sortBy: {type: 'string', in: ['name'], default: 'name'},
      sortOrder: {type: 'string', in: ['asc', 'desc'], default: 'desc'}
    });
  } catch (error) {
    return next(errors.GET_ROLES_WRONG_PARAMETERS);
  }

  // Build sort
  var sort = {};
  sort[params.sortBy] = params.sortOrder;

  // Build filter
  var filter = new ResourceFilter();

  // Add search query
  if (params.query) {
    if (params.useSmartSearch)
      filter.search('"' + params.query + '"');
    else
      filter.regex('name', new RegExp(openVeoApi.util.escapeTextForRegExp(params.query), 'i'));
  }

  provider.get(
    filter,
    {
      exclude: params.exclude,
      include: params.include
    },
    params.limit,
    params.page,
    sort,
    function(error, roles, pagination) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'getEntitiesAction'});
        next(errors.GET_ROLES_ERROR);
      } else {
        response.send({
          entities: roles,
          pagination: pagination
        });
      }
    }
  );
};

/**
 * Gets an instance of the provider associated to the controller.
 *
 * @return {module:core/providers/RoleProvider~RoleProvider} The provider
 */
RoleController.prototype.getProvider = function() {
  return new RoleProvider(process.api.getCoreApi().getDatabase());
};
