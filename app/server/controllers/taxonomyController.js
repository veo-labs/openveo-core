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
 * - **name** The name of the taxonomy
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
  if (request.params.name) {
    taxonomyModel.getByName(request.params.name, function(error, taxonomies) {
      if (error) {
        next(errors.GET_TAXONOMY_ERROR);
      } else {
        var taxonomy;
        if (!taxonomies.length) {
          taxonomy = {
            name: request.params.name,
            tree: []
          };
        } else
          taxonomy = taxonomies[0];

        response.send({
          taxonomy: taxonomy
        });
      }
    });
  } else {

    // Missing name of the taxonomy
    next(errors.GET_TAXONOMY_MISSING_PARAMETERS);

  }
};
