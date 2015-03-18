"use strict"

// Module dependencies
var openVeoAPI = require("openveo-api");

// Module files
var applicationStorage = openVeoAPI.applicationStorage;

/**
 * Gets the backend menu as a JSON object.
 * If menu is empty a 404 Not Found is sent.
 */
module.exports.getMenuAction = function(request, response, next){
  var menu = applicationStorage.getMenu();
  
  if(menu)
    response.send(menu);
  else
    response.status(404).send();
};