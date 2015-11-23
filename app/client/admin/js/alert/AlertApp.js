'use strict';

/**
 * Controls alerts for the whole application.
 *
 * @module ov.alert
 * @main ov.alert
 */

(function(angular) {
  var app = angular.module('ov.alert', []);

  /**
   * Defines a generic alert management system to display one or several messages.
   *
   * @class alertService
   */
  function AlertService($rootScope, $timeout) {
    $rootScope.alerts = [];

    /**
     * Close an alert by its position in alerts array
     * @param {Integer} index Position in array
     * @returns {Array}
     */
    function closeAlertIdx(index) {
      return $rootScope.alerts.splice(index, 1);
    }

    /**
     * Close an alert
     * @param {Object} alert Alert to close
     * @returns {Array}
     */
    function closeAlert(alert) {
      return closeAlertIdx($rootScope.alerts.indexOf(alert));
    }

    var alertService = {

      /**
       * Displays an alert.
       *
       * @example
       *     // Info alert displayed for 4 seconds
       *     add('info', 'Message of the alert', 4000);
       *
       *     // Error alert displayed permanently
       *     add('danger', 'Message of the alert');
       *
       * @param {String} type The alert type (success, danger, warning or info)
       * @param {String} msg The alert message
       * @param {Number} [timeout] The timeout (in ms) before closing the alert, if not specified the alert
       * will be permanent
       * @method add
       */
      add: function(type, msg, timeout) {
        var alert = {
          type: type,
          msg: msg,
          close: function() {
            if (alert.timeout)
              $timeout.cancel(this.timeout);
            return closeAlert(this);
          }
        };
        if (timeout)
          alert.timeout = $timeout(function() {
            closeAlert(alert);
          }, timeout);

        $rootScope.alerts.push(alert);
      },
      closeAll: function() {
        $rootScope.alerts = [];
      }
    };
    return alertService;
  }

  app.factory('alertService', AlertService);
  AlertService.$inject = ['$rootScope', '$timeout'];

})(angular);
