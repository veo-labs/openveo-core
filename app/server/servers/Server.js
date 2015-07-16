"use scrict"

// Module dependencies
var express = require("express");

/**
 * Defines an HTTP server application based on Express Framework.
 * HTTP servers can extends Server to add routers.
 */
function Server(){}

/**
 * Initializes the express application.
 */
Server.prototype.init = function(){
  this.app = express();
  
  // Remove x-powered-by http header
  this.app.set("x-powered-by", false);
  
};

/**
 * Handles database available event. 
 * It assures that the database is loaded and can be accessed.
 *
 * @param Database db The application database
 */
Server.prototype.onDatabaseAvailable = function(db){};

/**
 * Handles plugin available event. 
 * It assures that the given plugin's configuration is available.
 *
 * @param Object plugin The available openveo plugin
 * e.g.
 * {
 *   router: [Function],
 *   adminRouter: [Function],
 *   webServiceRouter: [Function],
 *   mountPath: "/publish",
 *   name: "publish",
 *   publicDirectory: "/home/veo-labs/openveo/node_modules/openveo-publish/public",
 *   i18nDirectory: "/home/veo-labs/openveo/node_modules/openveo-publish/i18n",
 *   custom: [Object],
 *   webServiceScopes: [Object],
 *   permissions: [Array],
 *   viewsFolders: [Array],
 *   routes: [Array],
 *   adminRoutes: [Array],
 *   webServiceRoutes: [Array],
 *   entities: [Object],
 *   menu: [Array],
 *   scriptLibFiles: [Array],
 *   scriptFiles: [Array],
 *   cssFiles: [Array]
 * }
 */
Server.prototype.onPluginAvailable = function(plugin){};

/**
 * Handles plugin loaded event.
 * It assures that the given plugin is fully loaded.
 *
 * @param Object plugin The available openveo plugin
 * e.g.
 * {
 *   router: [Function],
 *   adminRouter: [Function],
 *   webServiceRouter: [Function],
 *   mountPath: "/publish",
 *   name: "publish",
 *   publicDirectory: "/home/veo-labs/openveo/node_modules/openveo-publish/public",
 *   i18nDirectory: "/home/veo-labs/openveo/node_modules/openveo-publish/i18n",
 *   custom: [Object],
 *   webServiceScopes: [Object],
 *   permissions: [Array],
 *   viewsFolders: [Array],
 *   routes: [Array],
 *   adminRoutes: [Array],
 *   webServiceRoutes: [Array],
 *   entities: [Object],
 *   menu: [Array],
 *   scriptLibFiles: [Array],
 *   scriptFiles: [Array],
 *   cssFiles: [Array]
 * }
 */
Server.prototype.onPluginLoaded = function(plugin){};

/**
 * Handles plugins loaded event.
 * It assures that all plugins are fully loaded.
 */
Server.prototype.onPluginsLoaded = function(){};

/**
 * Starts the server.
 */
Server.prototype.startServer = function(){
  throw new Exception("startServer method not implemented for this server");
};

module.exports = Server;