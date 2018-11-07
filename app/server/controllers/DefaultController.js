'use strict';

/**
 * @module core-controllers
 */

var path = require('path');
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
  var authConf = storage.getConfiguration().auth;
  var configuredAuth = (authConf && Object.keys(authConf)) || [];
  configuredAuth.push(openVeoApi.passport.STRATEGIES.LOCAL);

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

      // Plugin has libraries files to load
      if (plugin['libraries']) {
        plugin['libraries'].forEach(function(library) {
          if (library.files) {
            library.files.forEach(function(file) {
              var filePath = path.join(plugin.mountPath, library.mountPath, file);
              if (/.css$/.test(file)) response.locals.css.push(filePath);
              else if (/.js$/.test(file)) response.locals.librariesScripts.push(filePath);
            });
          }
        });
      }

      // Plugin has JavaScript files to load before the other files
      if (plugin['scriptLibFiles'] && util.isArray(plugin['scriptLibFiles'][env])) {
        response.locals.librariesScripts = response.locals.librariesScripts.concat(
          plugin['scriptLibFiles'][env].map(function(filePath) {
            return path.join(plugin.mountPath, filePath);
          })
        );
      }

      // Plugin has JavaScript files to load
      // Load files before main plugin JavaScript files
      if (plugin['scriptFiles'] && util.isArray(plugin['scriptFiles'][env])) {
        response.locals.scripts = plugin['scriptFiles'][env].map(function(filePath) {
          return path.join(plugin.mountPath, filePath);
        }).concat(response.locals.scripts);
      }

      // Plugin has CSS files to load
      if (plugin['cssFiles'] && util.isArray(plugin['cssFiles'])) {
        response.locals.css = response.locals.css.concat(plugin['cssFiles'].map(function(filePath) {
          return path.join(plugin.mountPath, filePath);
        }));
      }

      // Plugin version
      if (plugin['version'] && plugin['version'])
        response.locals.version.push(plugin['version']);
    });
  }

  response.locals.user = request.isAuthenticated() ? JSON.stringify(request.user) : JSON.stringify(null);
  response.locals.authenticationMechanisms = JSON.stringify(configuredAuth);
  response.locals.authenticationStrategies = JSON.stringify(openVeoApi.passport.STRATEGIES);
  response.locals.version = JSON.stringify(response.locals.version);
  response.locals.socketServerPort = storage.getServerConfiguration().browserSocketPort;
  response.locals.angularJsModules = angularJsModules.join(',');
  response.locals.anonymousId = storage.getConfiguration().anonymousId;
  response.locals.superAdminId = storage.getConfiguration().superAdminId;
  response.render('root', response.locals);

};
