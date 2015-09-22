'use strict';

/**
 * @module core-servers
 */

// Module dependencies
var express = require('express');

/**
 * Defines an HTTP Server. This Class must not be used directly,
 * instead use on of the sub classes.
 *
 * @example
 *     var Server = process.require("app/server/servers/Server.js");
 *     function MyServer(app){
 *       Server.prototype.init.call(this);
 *     }
 *
 *     module.exports = MyServer;
 *     util.inherits(MyServer, Server);
 *
 * @class Server
 * @constructor
 */
function Server() {
}

/**
 * Initializes the express application.
 *
 * @method init
 */
Server.prototype.init = function() {
  this.app = express();

  // Remove x-powered-by http header
  this.app.set('x-powered-by', false);

};

/**
 * Handles database available event.
 *
 * It assures that the database is loaded and can be accessed.
 *
 * @method onDatabaseAvailable
 * @param {Database} db The application database
 */
Server.prototype.onDatabaseAvailable = function() {
};

/**
 * Handles plugin available event.
 *
 * It assures that the given plugin's configuration is available.
 *
 * @example
 *     MyServer.prototype.onPluginAvailable(plugin){
 *       console.log(plugin);
 *       // {
 *       //   router: [Function],
 *       //   adminRouter: [Function],
 *       //   webServiceRouter: [Function],
 *       //   mountPath: "/publish",
 *       //   name: "publish",
 *       //   publicDirectory: "/home/veo-labs/openveo/node_modules/@openveo/publish/public",
 *       //   i18nDirectory: "/home/veo-labs/openveo/node_modules/@openveo/publish/i18n",
 *       //   custom: [Object],
 *       //   webServiceScopes: [Object],
 *       //   permissions: [Array],
 *       //   viewsFolders: [Array],
 *       //   routes: [Array],
 *       //   adminRoutes: [Array],
 *       //   webServiceRoutes: [Array],
 *       //   entities: [Object],
 *       //   menu: [Array],
 *       //   scriptLibFiles: [Array],
 *       //   scriptFiles: [Array],
 *       //   cssFiles: [Array]
 *       // }
 *     };
 *
 * @method onPluginAvailable
 * @param {Object} plugin The available openveo plugin
 */
Server.prototype.onPluginAvailable = function() {
};

/**
 * Handles plugin loaded event.
 *
 * It assures that the given plugin is fully loaded.
 *
 * @example
 *     MyServer.prototype.onPluginLoaded(plugin){
 *       console.log(plugin);
 *       // {
 *       //   router: [Function],
 *       //   adminRouter: [Function],
 *       //   webServiceRouter: [Function],
 *       //   mountPath: "/publish",
 *       //   name: "publish",
 *       //   publicDirectory: "/home/veo-labs/openveo/node_modules/@openveo/publish/public",
 *       //   i18nDirectory: "/home/veo-labs/openveo/node_modules/@openveo/publish/i18n",
 *       //   custom: [Object],
 *       //   webServiceScopes: [Object],
 *       //   permissions: [Array],
 *       //   viewsFolders: [Array],
 *       //   routes: [Array],
 *       //   adminRoutes: [Array],
 *       //   webServiceRoutes: [Array],
 *       //   entities: [Object],
 *       //   menu: [Array],
 *       //   scriptLibFiles: [Array],
 *       //   scriptFiles: [Array],
 *       //   cssFiles: [Array]
 *       // }
 *     };
 *
 * @method onPluginLoaded
 * @param {Object} plugin The available openveo plugin
 */
Server.prototype.onPluginLoaded = function() {
};

/**
 * Handles plugins loaded event.
 *
 * It assures that all plugins are fully loaded.
 *
 * @method onPluginsLoaded
 */
Server.prototype.onPluginsLoaded = function() {
};

/**
 * Starts the server.
 *
 * @method startServer
 */
Server.prototype.startServer = function() {
  throw new Error('startServer method not implemented for this server');
};

module.exports = Server;
