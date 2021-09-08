'use strict';

/**
 * @module core/controllers/GroupController
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var GroupProvider = process.require('app/server/providers/GroupProvider.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoApi.controllers.EntityController;
var ResourceFilter = openVeoApi.storages.ResourceFilter;

/**
 * Defines an entity controller to handle requests relative to groups' entities.
 *
 * @class GroupController
 * @extends EntityController
 */
function GroupController() {
  GroupController.super_.call(this);
}

module.exports = GroupController;
util.inherits(GroupController, EntityController);

/**
 * Gets a list of groups.
 *
 * @example
 * // Response example
 * {
 *   "entities" : [ ... ],
 *   "pagination" : {
 *     "limit": ..., // The limit number of groups by page
 *     "page": ..., // The actual page
 *     "pages": ..., // The total number of pages
 *     "size": ... // The total number of groups
 * }
 *
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request's query parameters
 * @param {(String|Array)} [request.query.include] The list of fields to include from returned groups
 * @param {(String|Array)} [request.query.exclude] The list of fields to exclude from returned groups. Ignored if
 * include is also specified.
 * @param {String} [request.query.query] Search query to search on both group names and descriptions
 * @param {Number} [request.query.useSmartSearch=1] 1 to use a more advanced search mechanism, 0 to use a simple search
 * based on a regular expression
 * @param {Number} [request.query.page=0] The expected page in pagination system
 * @param {Number} [request.query.limit=10] The maximum number of expected results
 * @param {String} [request.query.sortBy="name"] The field to sort by (either "name" or "description")
 * @param {String} [request.query.sortOrder="desc"] The sort order (either "asc" or "desc")
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
GroupController.prototype.getEntitiesAction = function(request, response, next) {
  var params;
  var provider = this.getProvider(request);

  try {
    params = openVeoApi.util.shallowValidateObject(request.query, {
      include: {type: 'array<string>'},
      exclude: {type: 'array<string>'},
      query: {type: 'string'},
      useSmartSearch: {type: 'number', in: [0, 1], default: 1},
      limit: {type: 'number', gt: 0},
      page: {type: 'number', gte: 0, default: 0},
      sortBy: {type: 'string', in: ['name', 'description'], default: 'name'},
      sortOrder: {type: 'string', in: ['asc', 'desc'], default: 'desc'}
    });
  } catch (error) {
    return next(errors.GET_GROUPS_WRONG_PARAMETERS);
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
    else {
      var queryRegExp = new RegExp(openVeoApi.util.escapeTextForRegExp(params.query), 'i');
      filter.or([
        new ResourceFilter().regex('name', queryRegExp),
        new ResourceFilter().regex('description', queryRegExp)
      ]);
    }
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
    function(error, groups, pagination) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'getEntitiesAction'});
        next(errors.GET_GROUPS_ERROR);
      } else {
        response.send({
          entities: groups,
          pagination: pagination
        });
      }
    }
  );
};

/**
 * Gets an instance of the provider associated to the controller.
 *
 * @return {module:core/providers/GroupProvider~GroupProvider} The provider
 */
GroupController.prototype.getProvider = function() {
  return new GroupProvider(process.api.getCoreApi().getDatabase());
};
