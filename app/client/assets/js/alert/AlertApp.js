(function (angular) {

  'use strict';
  
  var app = angular.module("ov.alert", []);

  app.factory("alertService", AlertService);
  AlertService.$inject = ["$rootScope", "$timeout"];

  function AlertService($rootScope, $timeout) {
    $rootScope.alerts = [];

    var alertService = {
      add: function (type, msg, timeout) {
        $rootScope.alerts.push({
          type: type,
          msg: msg,
          close: function () {
            return alertService.closeAlert(this);
          }
        });

        if (timeout) {
          $timeout(function () {
            alertService.closeAlert(this);
          }, timeout);
        }
      },
      closeAlert: function (alert) {
        return this.closeAlertIdx($rootScope.alerts.indexOf(alert));
      },
      closeAlertIdx: function (index) {
        return $rootScope.alerts.splice(index, 1);
      }
    };
    return alertService;
  };
})(angular);