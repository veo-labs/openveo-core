'use strict';

/**
 * @module core-controllers
 */

/**
 * Provides route actions for all requests relative to groups.
 *
 * @class groupController
 */

var openVeoAPI = require('@openveo/api');
var GroupModel = process.require('app/server/models/GroupModel.js');
var errors = process.require('app/server/httpErrors.js');

var groupModel = new GroupModel();

/**
 * Gets a group.
 *
 * Expects one GET parameter :
 *  - **id** The id of the group
 *
 * @method getGroupAction
 * @static
 */
module.exports.getGroupAction = function(request, response, next) {
  if (request.params.id) {
    groupModel.getOne(request.params.id, null, function(error, group) {
      if (error)
        next(errors.GET_GROUP_ERROR);
      else
        response.send({
          group: group
        });
    });
  } else {

    // Missing type and / or id of the group
    next(errors.GET_GROUP_MISSING_PARAMETERS);

  }
};

/**
 * Gets a list of groups.
 *
 * Parameters :
 *  - **query** Search query to search on both group name and description
 *  - **page** The expected page
 *  - **limit** The expected limit
 *  - **sortBy** To sort groups by name or description (default is name)
 *  - **sortOrder** Sort order (either asc or desc)
 *
 * @method getGroupsAction
 * @static
 */
module.exports.getGroupsAction = function(request, response, next) {
  var orderedGroups = ['name', 'description'];
  var params;

  try {
    params = openVeoAPI.util.shallowValidateObject(request.query, {
      query: {type: 'string'},
      limit: {type: 'number', gt: 0},
      page: {type: 'number', gt: 0, default: 1},
      sortBy: {type: 'string', in: orderedGroups, default: 'name'},
      sortOrder: {type: 'string', in: ['asc', 'desc'], default: 'desc'}
    });
  } catch (error) {
    return response.status(500).send({
      error: {
        message: error.message
      }
    });
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

  groupModel.getPaginatedFilteredEntities(
    filter,
    params.limit,
    params.page,
    sort,
    null,
    function(error, groups, pagination) {
      if (error) {
        process.logger.error(error);
        next(errors.GET_GROUPS_ERROR);
      } else {
        response.send({
          groups: groups,
          pagination: pagination
        });
      }
    }
  );
};
