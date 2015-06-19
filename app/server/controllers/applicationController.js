"use strict"

// Module dependencies
var util = require("util");
var crypto = require("crypto");
var winston = require("winston");
var openVeoAPI = require("openveo-api");
var applicationStorage = openVeoAPI.applicationStorage;

// Retrieve logger
var logger = winston.loggers.get("openveo");

/**
 * Gets the list of scopes and return it as a JSON object.
 * Returns a JSON object as :
 * {
 *  "videos" : {
 *    "name" : "Name of the scope",
 *    "description" : "Scope description",
 *    "paths" : [
 *      "scope/path/1"
 *    ]
 *  }
 * }
 */
module.exports.getScopesAction = function(request, response, next){
  var scopes = applicationStorage.getWebServiceScopes();
  response.send({ scopes : scopes });
};