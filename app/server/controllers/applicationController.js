"use strict"

// Module dependencies
var crypto = require("crypto");
var winston = require("winston");
var openVeoAPI = require("openveo-api");
var applicationStorage = openVeoAPI.applicationStorage;

// Retrieve logger
var logger = winston.loggers.get("openveo");

var ClientProvider = process.require("app/server/providers/ClientProvider.js");
var clientProvider = new ClientProvider(applicationStorage.getDatabase());

/**
 * Gets the list of applications and return it as a JSON object.
 * Returns a JSON object as :
 * {
 *   applications : [
 *     {
 *       "name" : "Name of the application"
 *     }
 *     ...
 *   ]
 * }
 */
module.exports.getApplicationsAction = function(request, response, next){
  clientProvider.getClients(function(error, applications){
    if(error){
      logger.error(error && error.message);
      response.status(500);
    }
    else
      response.send({ applications : applications });
  });
};

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

/**
 * Adds a new application.
 * Expects the following body : 
 * {
 *   "name" : "Name of the application",
 *   "scopes" :
 *    {
 *      "scope1" : {
 *        "description" : "description 1",
 *        "name" : "name 1",
 *        "activated" : true
 *      },
 *      "scope2" : {
 *        "description" : "description 2",
 *        "name" : "name 2",
 *        "activated" : true
 *      }
 *    } 
 * }
 * Returns the application as a JSON object :
 * {
 *   application : {
 *    "name" : "Name of the application",
 *    "scopes" : {
 *      "scope1" : {
 *        "description" : "description 1",
 *        "name" : "name 1",
 *        "activated" : true
 *      },
 *      "scope2" : {
 *        "description" : "description 2",
 *        "name" : "name 2",
 *        "activated" : true
 *      }
 *    }
 *   }
 * }
 */
module.exports.addApplicationAction = function(request, response, next){
  if(request.body && request.body.name && request.body.scopes){
    
    var application = {
      id : crypto.randomBytes(20).toString("hex"),
      name : request.body.name,
      scopes : request.body.scopes,
      secret : crypto.randomBytes(20).toString("hex")
    };

    clientProvider.addClient(application, function(error){
      if(error){
        logger.error(error && error.message);
        response.status(500);
      }
      else
        response.send({application  : application});
    });
    
  }
  else
    response.status(400).send();
};

/**
 * Updates application.
 * Expects one GET parameter :
 *  - id The id of the application to update
 * Expects the following body : 
 * {
 *   "name" : "Name of the application",
 *   "scopes" : 
 *   {
 *    "scope1" : {
 *     "description" : "description 1",
 *     "name" : "name 1",
 *     "activated" : true
 *    },
 *    "scope2" : {
 *     "description" : "description 2",
 *     "name" : "name 2",
 *     "activated" : true
 *    }
 *  } 
 * }
 * with name, description and type optional.
 * Returns either an HTTP code 500 if a server error occured, 400
 * if id parameter is not set or 200 if success.
 */
module.exports.updateApplicationAction = function(request, response, next){
  if(request.params.id){
    var application = {};
    if(request.body.name) application["name"] = request.body.name;
    if(request.body.scopes) application["scopes"] = request.body.scopes;
    
    clientProvider.updateClient(request.params.id, application, function(error){
      if(error){
        logger.error(error && error.message);
        response.status(500).send();
      }
      else
        response.send();
    });
  }
  else
    response.status(400).send();
};

/**
 * Removes an application.
 * Expects one GET parameter :
 *  - id The id of the application to remove
 * Returns either an HTTP code 500 if a server error occured, 400
 * if id parameter is not set or 200 if success.
 */
module.exports.removeApplicationAction = function(request, response, next){
  if(request.params.id){
    clientProvider.removeClient(request.params.id, function(error){
      if(error){
        logger.error(error && error.message);
        response.status(500).send();
      }
      else
        response.send();
    });
  }
  else
    response.status(400).send();
};