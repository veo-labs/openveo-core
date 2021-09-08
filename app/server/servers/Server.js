'use strict';

/**
 * @module core/servers/Server
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
  Object.defineProperties(this,

    /** @lends module:core/servers/Server~Server */
    {

      /**
       * Server configuration object.
       *
       * @type {Object}
       * @instance
       * @readonly
       */
      configuration: {value: configuration},

      /**
       * Express application.
       *
       * @type {Object}
       * @instance
       * @readonly
       */
      httpServer: {value: express()}

    }

  );

  // Remove x-powered-by http header
  this.httpServer.set('x-powered-by', false);

}

/**
 * Handles database available event.
 *
 * It assures that the database is loaded and can be accessed.
 *
 * @param {Database} db The application database
 * @param {callback} callback Function to call when its done
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
 * MyServer.prototype.onPluginLoaded(plugin){
 *   console.log(plugin);
 * };
 *
 * @param {Object} plugin The openveo plugin
 * @param {callback} callback Function to call when its done
 */
Server.prototype.onPluginLoaded = function(plugin, callback) {
};

/**
 * Handles plugins loaded event.
 *
 * It assures that all plugins are fully loaded.
 *
 * @param {callback} callback Function to call when its done
 */
Server.prototype.onPluginsLoaded = function(callback) {
};

/**
 * Starts the server.
 *
 * @param {callback} callback Function to call when it's done
 */
Server.prototype.startServer = function(callback) {
  throw new Error('startServer method not implemented for this server');
};

module.exports = Server;
