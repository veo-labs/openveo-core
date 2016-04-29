'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoAPI.controllers.EntityController;

/**
 * Provides route actions to manage taxonomies.
 *
 * @class TaxonomyController
 * @constructor
 * @extends EntityController
 */
function TaxonomyController() {
  EntityController.call(this, openVeoAPI.TaxonomyModel);
}

module.exports = TaxonomyController;
util.inherits(TaxonomyController, EntityController);

/**
 * Gets a list of taxonomies.
 *
 * Parameters :
 *  - **query** Search query to search on taxonomy name
 *  - **page** The expected page
 *  - **limit** The expected limit
 *  - **sortBy** To sort taxonomies by name
 *  - **sortOrder** Sort order (either asc or desc)
 *
 * @method getEntitiesAction
 */
TaxonomyController.prototype.getEntitiesAction = function(request, response, next) {
  var model = new this.Entity(request.user);
  var orderedTaxonomies = ['name'];
  var params;

  try {
    params = openVeoAPI.util.shallowValidateObject(request.query, {
      query: {type: 'string'},
      limit: {type: 'number', gt: 0},
      page: {type: 'number', gt: 0, default: 1},
      sortBy: {type: 'string', in: orderedTaxonomies, default: 'name'},
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

  model.getPaginatedFilteredEntities(
    filter,
    params.limit,
    params.page,
    sort,
    null,
    function(error, taxonomies, pagination) {
      if (error) {
        process.logger.error(error);
        next(errors.GET_TAXONOMIES_ERROR);
      } else {
        response.send({
          entities: taxonomies,
          pagination: pagination
        });
      }
    }
  );
};
