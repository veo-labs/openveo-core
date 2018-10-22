'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var ClientProvider = process.require('app/server/providers/ClientProvider.js');
var errors = process.require('app/server/httpErrors.js');
var storage = process.require('app/server/storage.js');
var EntityController = openVeoApi.controllers.EntityController;
var ResourceFilter = openVeoApi.storages.ResourceFilter;

/**
 * Defines an entity controller to handle requests relative to the Web Service client applications and scopes.
 *
 * @class ApplicationController
 * @extends EntityController
 * @constructor
 */
function ApplicationController() {
  ApplicationController.super_.call(this);
}

module.exports = ApplicationController;
util.inherits(ApplicationController, EntityController);

/**
 * Gets the list of scopes and return it as a JSON object.
 *
 * @method getScopesAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Response} response ExpressJS HTTP Response
 */
ApplicationController.prototype.getScopesAction = function(request, response) {
  var scopes = storage.getWebServiceScopes();
  var lightScopes = [];
  for (var i = 0; i < scopes.length; i++) {
    var scope = scopes[i];
    lightScopes.push({
      id: scope.id,
      name: scope.name,
      description: scope.description
    });
  }
  response.send({
    scopes: lightScopes
  });
};

/**
 * Gets applications.
 *
 * @example
 *
 *     // Response example
 *     {
 *       "entities" : [ ... ],
 *       "pagination" : {
 *         "limit": ..., // The limit number of applications by page
 *         "page": ..., // The actual page
 *         "pages": ..., // The total number of pages
 *         "size": ... // The total number of applications
 *     }
 *
 * @method getEntitiesAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request's query parameters
 * @param {String|Array} [request.query.include] The list of fields to include from returned applications
 * @param {String|Array} [request.query.exclude] The list of fields to exclude from returned applications. Ignored if
 * include is also specified.
 * @param {String} [request.query.query] Search query to search on application name
 * @param {Number} [request.query.useSmartSearch=1] 1 to use a more advanced search mechanism, 0 to use a simple search
 * based on a regular expression
 * @param {Number} [request.query.page=0] The expected page in pagination system
 * @param {Number} [request.query.limit=10] The maximum number of expected results
 * @param {String} [request.query.sortBy="name"] The application field To sort by (only "name" is available right now)
 * @param {String} [request.query.sortOrder="desc"] The sort order (either "asc" or "desc")
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
ApplicationController.prototype.getEntitiesAction = function(request, response, next) {
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
    return next(errors.GET_APPLICATIONS_WRONG_PARAMETERS);
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
    function(error, clients, pagination) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'getEntitiesAction'});
        next(errors.GET_APPLICATIONS_ERROR);
      } else {
        response.send({
          entities: clients,
          pagination: pagination
        });
      }
    }
  );
};

/**
 * Gets an instance of the provider associated to the controller.
 *
 * @method getProvider
 * @return {ClientProvider} The provider
 */
ApplicationController.prototype.getProvider = function() {
  return new ClientProvider(process.api.getCoreApi().getDatabase());
};
