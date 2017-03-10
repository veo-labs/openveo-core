'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var storage = process.require('app/server/storage.js');
var Controller = openVeoApi.controllers.Controller;

var env = (process.env.NODE_ENV == 'production') ? 'prod' : 'dev';

/**
 * Defines a controller to handle request relative to AngularJS single page application.
 *
 * @class DefaultController
 * @extends Controller
 * @constructor
 */
function DefaultController() {
  DefaultController.super_.call(this);
}

module.exports = DefaultController;
util.inherits(DefaultController, Controller);

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
 * @param {Request} request ExpressJS HTTP Request
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
DefaultController.prototype.defaultAction = function(request, response) {

  // Retrieve openveo sub plugins
  var plugins = process.api.getPlugins();
  var angularJsModules = [];

  response.locals.librariesScripts = [];
  response.locals.scripts = [];
  response.locals.css = [];
  response.locals.version = [];

  // Got sub plugins
  if (plugins) {
    plugins.forEach(function(plugin) {

      // Plugin has a name and has a back office page configured.
      // It must have an angularjs module associated to it
      if (plugin.name && plugin.menu && plugin.name !== 'core') {

        // Convert plugin name to camel case

        var nameChunks = plugin.name.split('-');
        var pluginName = '';

        for (var i = 0; i < nameChunks.length; i++)
          pluginName += (i === 0) ? nameChunks[i] : nameChunks[i].charAt(0).toUpperCase() + nameChunks[i].slice(1);

        angularJsModules.push('"' + pluginName + '"');
      }

      // Plugin has JavaScript libraries files to load
      if (plugin['scriptLibFiles'] && util.isArray(plugin['scriptLibFiles']['base']))
        response.locals.librariesScripts = response.locals.librariesScripts.concat(plugin['scriptLibFiles']['base']);
      if (plugin['scriptLibFiles'] && util.isArray(plugin['scriptLibFiles'][env]))
        response.locals.librariesScripts = response.locals.librariesScripts.concat(plugin['scriptLibFiles'][env]);

      // Plugin has JavaScript files to load
      // Load files before main plugin JavaScript files
      if (plugin['scriptFiles'] && util.isArray(plugin['scriptFiles']['base']))
        response.locals.scripts = plugin['scriptFiles']['base'].concat(response.locals.scripts);
      if (plugin['scriptFiles'] && util.isArray(plugin['scriptFiles'][env]))
        response.locals.scripts = plugin['scriptFiles'][env].concat(response.locals.scripts);

      // Plugin has CSS files to load
      if (plugin['cssFiles'] && util.isArray(plugin['cssFiles']))
        response.locals.css = response.locals.css.concat(plugin['cssFiles']);

      // Plugin version
      if (plugin['version'] && util.isArray(plugin['version']))
        response.locals.version = response.locals.version.concat(plugin['version']);
    });
  }

  response.locals.version = JSON.stringify(response.locals.version);
  response.locals.socketServerPort = storage.getServerConfiguration().browserSocketPort;
  response.locals.angularJsModules = angularJsModules.join(',');
  response.render('root', response.locals);

};
