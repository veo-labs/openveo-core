'use strict';

/**
 * @module core-servers
 */

var express = require('express');

/**
 * Defines an HTTP Server. This Class must not be used directly,
 * instead use one of the sub classes.
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
 * @param {Object} configuration Service configuration
 */
function Server(configuration) {

  /**
   * Server configuration object.
   *
   * @property configuration
   * @type Object
   */
  this.configuration = configuration;

  /**
   * Express application.
   *
   * @property app
   * @type Application
   */
  this.app = express();

  // Remove x-powered-by http header
  this.app.set('x-powered-by', false);

}

/**
 * Handles database available event.
 *
 * It assures that the database is loaded and can be accessed.
 *
 * @async
 * @param {Database} db The application database
 * @param {Function} callback Function to call when its done with:
 *  - **Error** An error if something went wrong
 */
Server.prototype.onDatabaseAvailable = function(db, callback) {
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
 *       //   privateRouter: [Function],
 *       //   webServiceRouter: [Function],
 *       //   mountPath: "/publish",
 *       //   name: "publish",
 *       //   assetsDirectory: "/home/veo-labs/openveo/node_modules/@openveo/publish/public",
 *       //   i18nDirectory: "/home/veo-labs/openveo/node_modules/@openveo/publish/i18n",
 *       //   custom: [Object],
 *       //   webServiceScopes: [Object],
 *       //   permissions: [Array],
 *       //   viewsFolders: [Array],
 *       //   routes: [Array],
 *       //   privateRoutes: [Array],
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
 * @async
 * @param {Object} plugin The openveo plugin
 * @param {Function} callback Function to call when its done with:
 *  - **Error** An error if something went wrong
 */
Server.prototype.onPluginLoaded = function(plugin, callback) {
};

/**
 * Handles plugins loaded event.
 *
 * It assures that all plugins are fully loaded.
 *
 * @method onPluginsLoaded
 * @method async
 * @param {Function} callback Function to call when its done with:
 *  - **Error** An error if something went wrong
 */
Server.prototype.onPluginsLoaded = function(callback) {
};

/**
 * Starts the server.
 *
 * @method startServer
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
Server.prototype.startServer = function(callback) {
  throw new Error('startServer method not implemented for this server');
};

module.exports = Server;
