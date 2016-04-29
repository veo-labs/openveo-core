'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var path = require('path');
var openVeoAPI = require('@openveo/api');
var Controller = openVeoAPI.controllers.Controller;

/**
 * Gets entity model.
 *
 *     var entities = {
 *       {
 *         core: {
 *           path: "/home/openveo/",
 *           entities: {
 *             applications: "app/server/controllers/ApplicationController"
 *           }
 *         }
 *       }
 *     };
 *
 * @param {String} type The type of entity
 * @return {EntityModel} An instance of an EntityModel
 */
function getEntityModel(type, user) {
  var pluginsEntities = openVeoAPI.applicationStorage.getEntities();
  try {
    for (var pluginName in pluginsEntities) {
      var pluginEntities = pluginsEntities[pluginName].entities;
      var pluginPath = pluginsEntities[pluginName].path;

      if (pluginEntities[type]) {
        var Controller = require(path.join(pluginPath, pluginEntities[type]));
        var controller = new Controller();
        return new controller.Entity(user);
      }

    }
  } catch (error) {
    process.logger.error(error.message);
  }
}

/**
 * Provides route actions for all requests relative to entity search.
 *
 * @class SearchController
 * @constructor
 * @extends Controller
 */
function SearchController() {
  Controller.call(this);
}

module.exports = SearchController;
util.inherits(SearchController, Controller);

/**
 * Updates an entity.
 *
 * Expects the following url parameters :
 *  - **type** The type of the entity to retrieve
 *  - **id** The id of the entity to update
 * Also expects data in body.
 */
SearchController.prototype.searchEntitiesAction = function(request, response) {
  if (request.params.type) {
    var model = getEntityModel(request.params.type, request.user);

    var options = request.body;
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
  } else {

    // Missing type and / or id of the entity
    response.status(400).send();

  }
};
