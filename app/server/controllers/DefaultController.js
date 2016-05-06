'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var applicationStorage = openVeoAPI.applicationStorage;
var Controller = openVeoAPI.controllers.Controller;

var env = (process.env.NODE_ENV == 'production') ? 'prod' : 'dev';

/**
 * Provides default route action to deal with angularJS single page application.
 *
 * @class DefaultController
 * @constructor
 * @extends Controller
 */
function DefaultController() {
  Controller.call(this);
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
 */
DefaultController.prototype.defaultAction = function(request, response) {

  // Retrieve openveo sub plugins
  var plugins = applicationStorage.getPlugins();
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
      if (plugin.name && plugin.menu && plugin.name !== 'core')
        angularJsModules.push('"' + plugin.name.toLowerCase() + '"');

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
  response.locals.angularJsModules = angularJsModules.join(',');
  response.render('root', response.locals);

};
