'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var TaxonomyModel = process.require('app/server/models/TaxonomyModel.js');
var TaxonomyProvider = process.require('app/server/providers/TaxonomyProvider.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoApi.controllers.EntityController;
var AccessError = openVeoApi.errors.AccessError;

/**
 * Defines an entity controller to handle requests relative to taxonomies' entities.
 *
 * @class TaxonomyController
 * @extends EntityController
 * @constructor
 */
function TaxonomyController() {
  TaxonomyController.super_.call(this);
}

module.exports = TaxonomyController;
util.inherits(TaxonomyController, EntityController);

/**
 * Gets a list of taxonomies.
 *
 * @method getEntitiesAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request's query parameters
 * @param {String} [request.query.query] Search query to search on taxonomy name
 * @param {Number} [request.query.page=1] The expected page in pagination system
 * @param {Number} [request.query.limit] The maximum number of expected results
 * @param {String} [request.query.sortBy=name] To sort by property name (only "name" is available right now)
 * @param {String} [request.query.sortOrder=desc] The sort order (either "asc" or "desc")
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
TaxonomyController.prototype.getEntitiesAction = function(request, response, next) {
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
      $search: '"' + params.query + '"'
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
 * @method getTaxonomyTermsAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.params Request's parameters
 * @param {String} request.params.id The id of the taxonomy to get terms from
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
TaxonomyController.prototype.getTaxonomyTermsAction = function(request, response, next) {
  if (request.params.id) {
    var model = this.getModel(request);
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

/**
 * Gets an instance of the entity model associated to the controller.
 *
 * @method getModel
 * @return {EntityModel} The entity model
 */
TaxonomyController.prototype.getModel = function() {
  return new TaxonomyModel(new TaxonomyProvider(process.api.getCoreApi().getDatabase()));
};
