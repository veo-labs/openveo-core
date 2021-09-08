'use strict';

/**
 * @module core/controllers/TaxonomyController
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var TaxonomyProvider = process.require('app/server/providers/TaxonomyProvider.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoApi.controllers.EntityController;
var ResourceFilter = openVeoApi.storages.ResourceFilter;

/**
 * Defines an entity controller to handle requests relative to taxonomies' entities.
 *
 * @class TaxonomyController
 * @extends EntityController
 */
function TaxonomyController() {
  TaxonomyController.super_.call(this);
}

module.exports = TaxonomyController;
util.inherits(TaxonomyController, EntityController);

/**
 * Gets a list of taxonomies.
 *
 * @example
 * // Response example
 * {
 *   "entities" : [ ... ],
 *   "pagination" : {
 *     "limit": ..., // The limit number of taxonomies by page
 *     "page": ..., // The actual page
 *     "pages": ..., // The total number of pages
 *     "size": ... // The total number of taxonomies
 * }
 *
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request's query parameters
 * @param {(String|Array)} [request.query.include] The list of fields to include from returned taxonomies
 * @param {(String|Array)} [request.query.exclude] The list of fields to exclude from returned taxonomies. Ignored if
 * include is also specified.
 * @param {String} [request.query.query] Search query to search on taxonomy name
 * @param {Number} [request.query.useSmartSearch=1] 1 to use a more advanced search mechanism, 0 to use a simple search
 * based on a regular expression
 * @param {Number} [request.query.page=0] The expected page in pagination system
 * @param {Number} [request.query.limit=10] The maximum number of expected results
 * @param {String} [request.query.sortBy="name"] The field to sort by (only "name" is available right now)
 * @param {String} [request.query.sortOrder="desc"] The sort order (either "asc" or "desc")
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
TaxonomyController.prototype.getEntitiesAction = function(request, response, next) {
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
    return next(errors.GET_TAXONOMIES_WRONG_PARAMETERS);
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
 * @example
 * // Response example
 * {
 *   "terms" : [ ... ]
 * }
 *
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.params Request's parameters
 * @param {String} request.params.id The id of the taxonomy to get terms from
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
TaxonomyController.prototype.getTaxonomyTermsAction = function(request, response, next) {
  if (request.params.id) {
    var provider = this.getProvider();
    var taxonomyId = request.params.id;

    provider.getOne(
      new ResourceFilter().equal('id', taxonomyId),
      null,
      function(error, taxonomy) {
        if (error) {
          process.logger.error(error.message, {error: error, method: 'getTaxonomyTermsAction', entity: taxonomyId});
          next(errors.GET_TAXONOMY_ERROR);
        } else if (!taxonomy) {
          process.logger.warn('Not found', {method: 'getTaxonomyTermsAction', entity: taxonomyId});
          next(errors.GET_TAXONOMY_NOT_FOUND);
        } else {
          response.send({
            terms: taxonomy.tree || []
          });
        }
      }
    );
  } else {

    // Missing id of the taxonomy
    next(errors.GET_TAXONOMY_TERMS_MISSING_PARAMETERS);

  }
};

/**
 * Gets an instance of the provider associated to the controller.
 *
 * @return {module:core/providers/TaxonomyProvider~TaxonomyProvider} The provider
 */
TaxonomyController.prototype.getProvider = function() {
  return new TaxonomyProvider(process.api.getCoreApi().getDatabase());
};
