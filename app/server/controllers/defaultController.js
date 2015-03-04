"use strict"

// Module dependencies
var util = require("util");
var winston = require("winston");
var openVeoAPI = require("openveo-api");

// Module files
var applicationStorage = openVeoAPI.applicationStorage;
var applicationConf = process.require("conf.json");

// Get logger
var logger = winston.loggers.get("openveo");

/**
 * Handles back office default action, if no other action were performed
 * display the main back office template.
 * Configuration files of the openveo plugin and openveo sub plugins
 * are used to retrieve the list of files to load within the template. 
 * JavaScript libraries, JavaScript files and CSS files.
 */
module.exports.defaultAction = function(request, response, next){

  // Retrieve openveo sub plugins
  var plugins = applicationStorage.getPlugins();
  var angularJsModules = [];
  
  // Retrieve the list of scripts and css files from 
  // application configuration and sub plugins configuration
  response.locals.librariesScripts = applicationConf["backOffice"]["scriptLibFiles"] || [];
  response.locals.scripts = applicationConf["backOffice"]["scriptFiles"] || [];
  response.locals.css = applicationConf["backOffice"]["cssFiles"] || [];
  
  // Got sub plugins
  if(plugins){

    plugins.forEach(function(subPlugin){

      // Plugin has a name and has a back office page configured.
      // It must have an angularjs module associated to it
      if(subPlugin.name && subPlugin.menu)
        angularJsModules.push("\"" + subPlugin.name.toLowerCase() + "\"");

      // Plugin has JavaScript libraries files to load
      if(subPlugin["scriptLibFiles"] && util.isArray(subPlugin["scriptLibFiles"]))
        response.locals.librariesScripts = response.locals.librariesScripts.concat(subPlugin["scriptLibFiles"]);

      // Plugin has JavaScript files to load
      // Load files before main plugin JavaScript files
      if(subPlugin["scriptFiles"] && util.isArray(subPlugin["scriptFiles"]))
        response.locals.scripts = subPlugin["scriptFiles"].concat(response.locals.scripts);

      // Plugin has CSS files to load
      if(subPlugin["cssFiles"] && util.isArray(subPlugin["cssFiles"]))
        response.locals.css = response.locals.css.concat(subPlugin["cssFiles"]);

    });
  }

  response.locals.angularJsModules = angularJsModules.join(",");
  response.locals.menu = applicationStorage.getMenu();
  response.render("root", response.locals);
};

/**
 * Handles forgotten requests.
 * Depending on request Accept HTTP header, either an HTML content, 
 * a JSON content or a text content will be returned,  
 */
module.exports.notFoundAction = function(request, response, next){
  logger.warn("404 Not Found", {method : request.method, path : request.url, headers : request.headers});

  response.status(404);
  
  // HTML content
  if(request.accepts("html")){
    response.render("404", { url: request.url });  
    return; 
  }
  
  // JSON content
  if(request.accepts("json")){
    response.send({ error: "Not found" });
    return;
  }
  
  // Text content
  response.type("txt").send("Not found");
  
};