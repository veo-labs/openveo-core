'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var GroupModel = process.require('app/server/models/GroupModel.js');
var GroupProvider = process.require('app/server/providers/GroupProvider.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoApi.controllers.EntityController;

/**
 * Defines an entity controller to handle requests relative to groups' entities.
 *
 * @class GroupController
 * @extends EntityController
 * @constructor
 */
function GroupController() {
  GroupController.super_.call(this);
}

module.exports = GroupController;
util.inherits(GroupController, EntityController);

/**
 * Gets a list of groups.
 *
 * @method getEntitiesAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request's query parameters
 * @param {String} [request.query.query] Search query to search on both group's name and description
 * @param {Number} [request.query.page=1] The expected page in pagination system
 * @param {Number} [request.query.limit] The maximum number of expected results
 * @param {String} [request.query.sortBy=name] To sort by property name (either "name" or "description")
 * @param {String} [request.query.sortOrder=desc] The sort order (either "asc" or "desc")
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
GroupController.prototype.getEntitiesAction = function(request, response, next) {
  var params;
  var model = this.getModel(request);

  try {
    params = openVeoApi.util.shallowValidateObject(request.query, {
      query: {type: 'string'},
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
        next(errors.GET_GROUPS_ERROR);
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
GroupController.prototype.getModel = function() {
  return new GroupModel(new GroupProvider(process.api.getCoreApi().getDatabase()));
};
