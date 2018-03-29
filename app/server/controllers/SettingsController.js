'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var SettingProvider = process.require('app/server/providers/SettingProvider.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoApi.controllers.EntityController;
var ResourceFilter = openVeoApi.storages.ResourceFilter;

/**
 * Defines an entity controller to handle requests relative to settings.
 *
 * @class SettingsController
 * @extends EntityController
 * @constructor
 */
function SettingsController() {
  SettingsController.super_.call(this);
}

module.exports = SettingsController;
util.inherits(SettingsController, EntityController);

/**
 * Gets settings.
 *
 * @example
 *
 *     // Response example
 *     {
 *       "entities" : [ ... ],
 *       "pagination" : {
 *         "limit": ..., // The limit number of settings by page
 *         "page": ..., // The actual page
 *         "pages": ..., // The total number of pages
 *         "size": ... // The total number of settings
 *     }
 *
 * @method getEntitiesAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request query
 * @param {Number} [request.query.limit] A limit number of settings to retrieve per page (default to 10)
 * @param {Number} [request.query.page] The page number started at 0 for the first page (default to 0)
 * @param {String} [request.query.sortOrder] Either "asc" for ascendant or "desc" for descendant
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
SettingsController.prototype.getEntitiesAction = function(request, response, next) {
  var provider = this.getProvider();
  var sort = {};
  var query;
  request.query = request.query || {};

  try {
    query = openVeoApi.util.shallowValidateObject(request.query, {
      limit: {type: 'number', gt: 0, default: 10},
      page: {type: 'number', gte: 0, default: 0},
      sortOrder: {type: 'string', in: ['asc', 'desc'], default: 'desc'}
    });
  } catch (error) {
    return next(errors.GET_SETTINGS_WRONG_PARAMETERS);
  }

  // Build sort description object
  sort['id'] = query.sortOrder || 'desc';

  provider.get(
    null,
    null,
    query.limit,
    query.page,
    sort,
    function(error, entities, pagination) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'getEntitiesAction'});
        next(errors.GET_SETTINGS_ERROR);
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
 * Gets a specific setting.
 *
 * If setting is not found it is sent with value null.
 *
 * @example
 *
 *     // Response example
 *     {
 *       "entity" : { ... }
 *     }
 *
 * @method getEntityAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.params Request's parameters
 * @param {String} request.params.id The setting id to retrieve
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
SettingsController.prototype.getEntityAction = function(request, response, next) {
  if (request.params.id) {
    var settingId = request.params.id;
    var provider = this.getProvider();

    provider.getOne(
      new ResourceFilter().equal('id', settingId),
      null,
      function(error, setting) {
        if (error) {
          process.logger.error(error.message, {error: error, method: 'getEntityAction', entity: settingId});
          return next(errors.GET_SETTING_ERROR);
        }

        response.send({
          entity: (!setting) ? null : setting
        });
      }
    );
  } else {

    // Missing id of the setting
    next(errors.GET_SETTING_MISSING_PARAMETERS);

  }
};

/**
 * Gets an instance of the provider associated to the controller.
 *
 * @method getProvider
 * @return {SettingsProvider} The provider
 */
SettingsController.prototype.getProvider = function() {
  return new SettingProvider(process.api.getCoreApi().getDatabase());
};
