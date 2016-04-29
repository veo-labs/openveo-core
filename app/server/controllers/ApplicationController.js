'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var ClientModel = process.require('app/server/models/ClientModel.js');
var applicationStorage = openVeoAPI.applicationStorage;
var EntityController = openVeoAPI.controllers.EntityController;

/**
 * Provides route actions for all requests relative to the Web Service client applications and scopes.
 *
 * @class ApplicationController
 * @constructor
 * @extends EntityController
 */
function ApplicationController() {
  EntityController.call(this, ClientModel);
}

module.exports = ApplicationController;
util.inherits(ApplicationController, EntityController);

/**
 * Gets the list of scopes and return it as a JSON object.
 *
 * @example
 *     {
 *       "videos" : {
 *         "name" : "Name of the scope",
 *         "description" : "Scope description"
 *       }
 *     }
 *
 * @method getScopesAction
 */
ApplicationController.prototype.getScopesAction = function(request, response) {
  var scopes = applicationStorage.getWebServiceScopes();
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
