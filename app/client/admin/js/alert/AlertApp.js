'use strict';

/**
 * Controls alerts for the whole application.
 *
 * @module ov/alert
 */

(function(angular) {
  var app = angular.module('ov.alert', []);

  /**
   * Defines a generic alert management system to display one or several messages.
   *
   * @example
   * MyAngularObject.$inject = ['alertService'];
   *
   * @class AlertService
   */
  function AlertService($rootScope, $timeout) {
    $rootScope.alerts = [];

    /**
     * Closes an alert by its position in alerts array.
     *
     * @param {Number} index Position in array
     * @return {Array} The list of remaining alerts
     */
    function closeAlertIdx(index) {
      return $rootScope.alerts.splice(index, 1);
    }

    /**
     * Closes an alert.
     *
     * @param {Object} alert Alert to close
     * @return {Array} The list of remaining alerts
     */
    function closeAlert(alert) {
      return closeAlertIdx($rootScope.alerts.indexOf(alert));
    }

    /** @lends module:ov/alert~AlertService */
    var alertService = {

      /**
       * Displays an alert.
       *
       * @example
       * // Info alert displayed for 4 seconds
       * AlertService.add('info', 'Message of the alert', 4000);
       *
       * // Error alert displayed permanently
       * AlertService.add('danger', 'Message of the alert');
       *
       * @instance
       * @param {String} type The alert type (success, danger, warning or info)
       * @param {String} msg The alert message
       * @param {Number} [timeout] The timeout (in ms) before closing the alert, if not specified the alert
       * will be permanent
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

      /**
       * Closes all opened alerts.
       *
       * @example
       * // Close all alerts
       * AlertService.closeAll();
       *
       * @instance
       */
      closeAll: function() {
        $rootScope.alerts = [];
      }
    };
    return alertService;
  }

  app.factory('alertService', AlertService);
  AlertService.$inject = ['$rootScope', '$timeout'];

})(angular);
