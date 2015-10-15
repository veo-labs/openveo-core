'use strict';

(function(angular) {
  var app = angular.module('ov.alert', []);

  /**
   * Defines a generic alert management system to display one or several messages.
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
      }
    };
    return alertService;
  }

  app.factory('alertService', AlertService);
  AlertService.$inject = ['$rootScope', '$timeout'];

})(angular);
