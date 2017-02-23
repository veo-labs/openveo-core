'use strict';

/**
 * @module core-servers
 */

var express = require('express');

/**
 * Defines an HTTP Server. This Class must not be used directly,
 * instead use one of the sub classes.
 *
 * @class Server
 * @constructor
 * @param {Object} configuration Service configuration
 */
function Server(configuration) {
  Object.defineProperties(this, {

    /**
     * Server configuration object.
     *
     * @property configuration
     * @type Object
     * @final
     */
    configuration: {value: configuration},

    /**
     * Express application.
     *
     * @property httpServer
     * @type Application
     * @final
     */
    httpServer: {value: express()}

  });

  // Remove x-powered-by http header
  this.httpServer.set('x-powered-by', false);

}

/**
 * Handles database available event.
 *
 * It assures that the database is loaded and can be accessed.
 *
 * @method onDatabaseAvailable
 * @async
 * @param {Database} db The application database
 * @param {Function} callback Function to call when its done with:
 *  - **Error** An error if something went wrong
 */
Server.prototype.onDatabaseAvailable = function(db, callback) {
  callback();
};

/**
 * Handles plugin loaded event.
 *
 * It assures that the given plugin is fully loaded.
 *
 * @example
 *     MyServer.prototype.onPluginLoaded(plugin){
 *       console.log(plugin);
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
