'use strict';

/**
 * @module core-loaders
 */

/**
 * Provides functions to load namespaces from core and plugins configuration.
 *
 * @class namespaceLoader
 * @static
 */

var path = require('path');
var openVeoApi = require('@openveo/api');

/**
 * The list of socket controllers path with associated controller instance.
 *
 * It is used to instantiate each controller only once.
 *
 * @property controllers
 * @type Object
 * @private
 * @static
 */
var controllers = {};

/**
 * Attaches handlers to namespace.
 *
 * @example
 *     var namespaceLoader = process.require('app/server/loaders/namespaceLoader.js');
 *     var messagesDescriptors = {
 *       test1: 'app/server/controllers/TestSocketController.test1Action',
 *       test2: 'app/server/controllers/TestSocketController.test2Action'
 *     };
 *
 *     namespaceLoader.addHandlers(namespace, messagesDescriptors, '/home/openveo/node_modules/openveo-plugin');
 *
 * @method addHandlers
 * @static
 * @param {SocketNamespace} namespace The socket namespace
 * @param {Object} messagesDescriptors A list of socket namespace messages with associated controller / action
 * @param {String} pluginPath The root path of the plugin associated to the namespace used to find controllers
 * associated to messages
 */
module.exports.addHandlers = function(namespace, messagesDescriptors, pluginPath) {
  var messages = {};

  // Handle event when a client connects to the socket server
  namespace.on('connection', function(socket) {
    var socketInfo = {socketId: socket.id, ip: socket.handshake.address};
    process.logger.silly('Socket client connected', socketInfo);

    // Call action associated to "connection" message
    if (messages['connection']) messages['connection'](socket);

    // Handle event when a client has been disconnected from the socket server
    socket.on('disconnect', function(callback) {
      process.logger.silly('Socket client disconnected', socketInfo);

      // Call action associated to "disconnect" message
      if (messages['disconnect']) messages['disconnect'](socket, callback);

    });

    // Handle event when an error occurred between client and socket server
    socket.on('connect_error', function(error, callback) {
      process.logger.silly('Socket client error', socketInfo);

      // Call action associated to "error" message
      if (messages['error']) messages['error'](error, socket, callback);

    });

    // Handle custom socket messages
    for (var id in messages) {
      (function(id) {
        if (id === 'connection' || id === 'disconnect' || id === 'error')
          return;

        socket.on(id, function(data, callback) {
          process.logger.silly('Socket client message "' + id + '"', socketInfo);
          messages[id](data, socket, function(data) {
            callback && callback(data);
          });
        });
      }(id));
    }
  });

  for (var message in messagesDescriptors) {
    var action = messagesDescriptors[message];

    // e.g. app/server/controllers/TestController.test1Action
    // becomes ['app/server/controllers/TestController', 'test1Action']
    var actionChunks = action.split('.');

    // Got a message name and an action for this message
    if (message && actionChunks.length === 2) {
      try {

        // Try to register the controller
        var controllerFilePath = path.join(pluginPath, actionChunks[0] + '.js');
        var controllerInstance;

        if (controllers[controllerFilePath]) {

          // Controller instance already in cache
          controllerInstance = controllers[controllerFilePath];

        } else {

          // Controller has not been instantiated yet
          // Create an instance of the controller (only once per controller)
          // and make sure this is an instance of SocketController

          var Controller = require(controllerFilePath);
          if (!(Controller.prototype instanceof openVeoApi.controllers.SocketController))
            throw new TypeError(controllerFilePath + ' is not a SocketController');

          controllerInstance = new Controller(namespace);

          // Save controller instance into cache
          controllers[controllerFilePath] = controllerInstance;
        }

        // Got a method to call on the controller
        if (controllerInstance[actionChunks[1]]) {
          messages[message] = controllerInstance[actionChunks[1]].bind(controllerInstance);
          process.logger.debug('Socket message "' + message + '" handler attached');
        } else {
          process.logger.warn('Action for socket message "' + message + '" is not valid', {
            action: 'addHandlers'
          });
        }
      } catch (error) {
        process.logger.warn('Error while attaching handler for socket message "' + message + '"', {
          action: 'addHandlers',
          error: error.message,
          stack: error.stack
        });
      }

    }
  }
};
