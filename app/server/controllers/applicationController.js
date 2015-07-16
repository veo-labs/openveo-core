"use strict"

// Module dependencies
var util = require("util");
var crypto = require("crypto");
var winston = require("winston");
var openVeoAPI = require("openveo-api");
var applicationStorage = openVeoAPI.applicationStorage;

/**
 * Gets the list of scopes and return it as a JSON object.
 * Returns a JSON object as :
 * {
 *  "videos" : {
 *    "name" : "Name of the scope",
 *    "description" : "Scope description"
 *  }
 * }
 */
module.exports.getScopesAction = function(request, response, next){
  var scopes = applicationStorage.getWebServiceScopes();
  var lightScopes = {};

  for(var scopeId in scopes){
    lightScopes[scopeId] = {
      name : scopes[scopeId].name,
      description : scopes[scopeId].description
    };
  }
  response.send({ scopes : lightScopes });
};