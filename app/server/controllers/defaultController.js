"use strict"

/** 
 * @module core-controllers
 */

/**
 * Provides default route action to deal with angularJS single page
 * application.
 *
 * @class defaultController
 */

// Module dependencies
var util = require("util");
var winston = require("winston");
var openVeoAPI = require("openveo-api");
var path = require("path");

// Module files
var applicationStorage = openVeoAPI.applicationStorage;
var applicationConf = process.require("conf.json");
var applicationVersion = process.require("package.json");

// Get logger
var logger = winston.loggers.get("openveo");

var env = ( process.env.NODE_ENV == 'production')?'prod':'dev';

/**
 * Handles back office default action to display main HTML.
 *
 * If no other action were performed display the main back
 * office template.  
 * Configuration files of the openveo plugin and openveo sub plugins
 * are used to retrieve the list of files to load within the template.  
 * JavaScript libraries, JavaScript files and CSS files.
 *
 * @method defaultAction
 * @static  
 */
module.exports.defaultAction = function(request, response, next){

  // Retrieve openveo sub plugins
  var plugins = applicationStorage.getPlugins();
  var angularJsModules = [];

  // Retrieve the list of scripts and css files from 
  // application configuration and sub plugins configuration
  response.locals.librariesScriptsBase = applicationConf["backOffice"]["scriptLibFiles"]['base'] || [];
  response.locals.librariesScripts = applicationConf["backOffice"]["scriptLibFiles"][env] || [];
  response.locals.librariesScripts = response.locals.librariesScriptsBase.concat(response.locals.librariesScripts);
  response.locals.scripts = applicationConf["backOffice"]["scriptFiles"][env] || [];
  response.locals.css = applicationConf["backOffice"]["cssFiles"] || [];
  response.locals.version = [{name:applicationVersion["name"], version:applicationVersion["version"]}] || [];
  
  // Got sub plugins
  if(plugins){

    plugins.forEach(function(plugin){

      // Plugin has a name and has a back office page configured.
      // It must have an angularjs module associated to it
      if(plugin.name && plugin.menu)
        angularJsModules.push("\"" + plugin.name.toLowerCase() + "\"");

      // Plugin has JavaScript libraries files to load
      if(plugin["scriptLibFiles"] && util.isArray(plugin["scriptLibFiles"]))
        response.locals.librariesScripts = response.locals.librariesScripts.concat(plugin["scriptLibFiles"]);

      // Plugin has JavaScript files to load
      // Load files before main plugin JavaScript files
      if(plugin["scriptFiles"] && util.isArray(plugin["scriptFiles"]))
        response.locals.scripts = plugin["scriptFiles"].concat(response.locals.scripts);

      // Plugin has CSS files to load
      if(plugin["cssFiles"] && util.isArray(plugin["cssFiles"]))
        response.locals.css = response.locals.css.concat(plugin["cssFiles"]);

      //Plugin version
      if(plugin["version"] && util.isArray(plugin["version"]))
        response.locals.version = response.locals.version.concat(plugin["version"]);
    });
  }
  
  response.locals.version = JSON.stringify(response.locals.version);
  response.locals.angularJsModules = angularJsModules.join(",");
  response.render("root", response.locals);
  
};