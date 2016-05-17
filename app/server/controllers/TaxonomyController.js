'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var TaxonomyModel = process.require('app/server/models/TaxonomyModel.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoAPI.controllers.EntityController;
var AccessError = openVeoAPI.errors.AccessError;

/**
 * Provides route actions to manage taxonomies.
 *
 * @class TaxonomyController
 * @constructor
 * @extends EntityController
 */
function TaxonomyController() {
  EntityController.call(this, TaxonomyModel);
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
    return next(errors.GET_TAXONOMIES_WRONG_PARAMETERS);
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
        process.logger.error(error.message, {error: error, method: 'getEntitiesAction'});
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

/**
 * Gets the list of terms of a taxonomy.
 *
 * Parameters :
 *  - **id** The id of the taxonomy
 *
 * @method getTaxonomyTermsAction
 */
TaxonomyController.prototype.getTaxonomyTermsAction = function(request, response, next) {
  if (request.params.id) {
    var model = new this.Entity(request.user);
    var entityId = request.params.id;

    model.getOne(entityId, null, function(error, entity) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'getTaxonomyTermsAction', entity: entityId});
        next((error instanceof AccessError) ? errors.GET_TAXONOMY_FORBIDDEN : errors.GET_TAXONOMY_ERROR);
      } else if (!entity) {
        process.logger.warn('Not found', {method: 'getTaxonomyTermsAction', entity: entityId});
        next(errors.GET_TAXONOMY_NOT_FOUND);
      } else {
        response.send({
          terms: entity.tree || []
        });
      }
    });
  } else {

    // Missing id of the taxonomy
    next(errors.GET_TAXONOMY_TERMS_MISSING_PARAMETERS);

  }
};
