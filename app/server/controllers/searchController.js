'use strict';

/**
 * @module core-controllers
 */

/**
 * Provides route actions for all requests relative to entity search.
 *
 * @class searchController
 */

var openVeoAPI = require('@openveo/api');

/**
 * Gets entity model.
 *
 * @param {String} type The type of entity
 * @return {EntityModel} An instance of an EntityModel
 */
function getEntityModel(type) {
  var entities = openVeoAPI.applicationStorage.getEntities();
  return entities[type];
}

/**
 * Updates an entity.
 *
 * Expects the following url parameters :
 *  - **type** The type of the entity to retrieve
 *  - **id** The id of the entity to update
 * Also expects data in body.
 */
module.exports.searchEntitiesAction = function(request, response) {
  if (request.params.type) {
    var model = getEntityModel(request.params.type);
    var options = request.body;
    if (model) {
      model.getPaginatedFilteredEntities(options.filter, options.limit, options.page, options.sort, false,
        function(error, rows, paginate) {
          if (error) {
            process.logger.error((
              error && error.message) || 'An error in request filter occured. Please verify your parameters.');
            response.status(500).send();
          } else {

            response.send({
              rows: rows,
              pagination: paginate
            });

          }
        });
    }

    // No model implemented for this type of entity
    else
      response.status(500).send();
  }

  // Missing type and / or id of the entity
  else
    response.status(400).send();
};
