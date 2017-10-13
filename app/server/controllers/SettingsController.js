'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var SettingModel = process.require('app/server/models/SettingModel.js');
var SettingProvider = process.require('app/server/providers/SettingProvider.js');
var errors = process.require('app/server/httpErrors.js');
var EntityController = openVeoApi.controllers.EntityController;

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
    var entityId = request.params.id;
    var model = this.getModel(request);

    model.getOne(entityId, null, function(error, entity) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'getEntityAction', entity: entityId});
        next(errors.GET_SETTING_ERROR);
      } else if (!entity) {
        response.send({
          entity: null
        });
      } else {
        response.send({
          entity: entity
        });
      }
    });
  } else {

    // Missing id of the setting
    next(errors.GET_SETTING_MISSING_PARAMETERS);

  }
};

/**
 * Gets a list of settings.
 *
 * @method getEntitiesAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request's query parameters
 * @param {String|Array} [request.query.ids] The list of settings to fetch
 * @param {Number} [request.query.page=1] The expected page in pagination system
 * @param {Number} [request.query.limit] The maximum number of expected results
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
SettingsController.prototype.getEntitiesAction = function(request, response, next) {
  var model = this.getModel(request);
  var params;

  try {
    params = openVeoApi.util.shallowValidateObject(request.query, {
      ids: {type: 'array<string>'},
      limit: {type: 'number', gt: 0},
      page: {type: 'number', gte: 0, default: 0}
    });
  } catch (error) {
    return next(errors.GET_SETTINGS_WRONG_PARAMETERS);
  }

  // Build filter
  var filter = {};

  // Add ids
  if (params.ids && params.ids.length) {
    filter['id'] = {
      $in: params.ids
    };
  }

  model.getPaginatedFilteredEntities(
    filter,
    params.limit,
    params.page,
    null,
    null,
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
 * Updates a setting.
 *
 * @example
 *
 *     // Expected body example
 *     {
 *       value: SETTING_VALUE
 *     }
 *
 * @method updateEntityAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.params Request's parameters
 * @param {String} request.params.id The setting id to update
 * @param {Object} request.body Request's body
 * @param {Mixed} request.body.value Setting value
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
SettingsController.prototype.updateEntityAction = function(request, response, next) {
  if (request.params.id && request.body && request.body.value) {
    var model = this.getModel(request);
    var entityId = request.params.id;

    model.update(entityId, {
      value: request.body.value
    }, function(error, updateCount) {
      if (error) {
        process.logger.error((error && error.message) || 'Fail updating',
                             {method: 'updateEntityAction', entity: entityId});
        next(errors.UPDATE_SETTINGS_ERROR);
      } else {
        response.send({error: null, status: 'ok'});
      }
    });
  } else {

    // Missing id of the entity or the datas
    next(errors.UPDATE_SETTINGS_MISSING_PARAMETERS);

  }
};

/**
 * Adds a new setting.
 *
 * @example
 *
 *     // Expected body example
 *     {
 *       "id" : SETTING_ID
 *       "value" : SETTING_VALUE
 *     }
 *
 * @method addEntityAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.body Request's body
 * @param {Mixed} request.body.value Setting value
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
SettingsController.prototype.addEntityAction = function(request, response, next) {
  if (request.body && request.body.value && request.body.id) {
    var model = this.getModel(request);
    var params;

    try {
      params = openVeoApi.util.shallowValidateObject(request.body, {
        id: {type: 'string'}
      });
    } catch (error) {
      return next(errors.ADD_SETTINGS_WRONG_PARAMETERS);
    }

    model.add({
      id: params.id,
      value: request.body.value
    }, function(error, insertCount, entity) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'addEntityAction'});
        next(errors.ADD_SETTINGS_ERROR);
      } else {
        response.send({
          entity: entity
        });
      }
    });
  } else {

    // Missing body
    next(errors.ADD_SETTINGS_MISSING_PARAMETERS);

  }
};

/**
 * Gets an instance of the entity model associated to the controller.
 *
 * @method getModel
 * @return {EntityModel} The entity model
 */
SettingsController.prototype.getModel = function() {
  return new SettingModel(new SettingProvider(process.api.getCoreApi().getDatabase()));
};
