'use strict';

/**
 * @module core-controllers
 */

/**
 * Provides route actions to manage taxonomies.
 *
 * @class taxonomyController
 */

var openVeoAPI = require('@openveo/api');
var errors = process.require('app/server/httpErrors.js');
var taxonomyModel = new openVeoAPI.TaxonomyModel();

/**
 * Gets information about a taxonomy.
 *
 * Expects one GET parameter :
 * - **id** The id of the taxonomy
 *
 * Return information about the taxonomy as a JSON object.
 *
 * @example
 *     {
 *       "taxonomy" : {
 *         "name" : 123456789,
 *         ...
 *       }
 *     }
 *
 * @method getTaxonomyAction
 * @static
 */
module.exports.getTaxonomyAction = function(request, response, next) {
  if (request.params.id) {
    taxonomyModel.getOne(request.params.id, null, function(error, taxonomy) {
      if (error)
        next(errors.GET_TAXONOMY_ERROR);
      else
        response.send({
          taxonomy: taxonomy
        });
    });
  } else {

    // Missing type and / or id of the taxonomy
    next(errors.GET_TAXONOMY_MISSING_PARAMETERS);

  }
};

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
 * @method getTaxonomiesAction
 * @static
 */
module.exports.getTaxonomiesAction = function(request, response, next) {
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

  taxonomyModel.getPaginatedFilteredEntities(
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
          taxonomies: taxonomies,
          pagination: pagination
        });
      }
    }
  );
};
