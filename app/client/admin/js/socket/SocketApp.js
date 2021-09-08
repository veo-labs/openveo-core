'use strict';

/**
 * Defines the ov.socket module to build a socket.io client.
 *
 * @module ov/socket
 */
/* global io */
(function(angular) {
  var app = angular.module('ov.socket', []);

  /**
   * Defines a SocketFactory holding a socket.io client singleton.
   *
   * @class SocketFactory
   */
  function SocketFactory($location) {
    var socket = null;

    /**
     * Initializes a socket.io connection with the server if not already initialized.
     *
     * @memberof module:ov/socket~SocketFactory
     * @instance
     * @param {String} namespace socket.io namespace name to connect to
     * @return {Client} The socket.io client
     */
    function initSocket(namespace) {
      if (!socket) {
        socket = io($location.protocol() + '://' + $location.host() + ':' + openVeoSettings.socketServerPort + namespace, {
          withCredentials: true
        });
      }

      return socket;
    }

    return {
      initSocket: initSocket
    };

  }

  app.factory('SocketFactory', SocketFactory);
  SocketFactory.$inject = ['$location'];

})(angular);
