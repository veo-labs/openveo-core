(function (angular) {

  'use strict';
  
  var app = angular.module("ov.alert", []);

  app.factory("alertService", AlertService);
  AlertService.$inject = ["$rootScope", "$timeout"];

  function AlertService($rootScope, $timeout) {
    $rootScope.alerts = [];

    var alertService = {
      add: function (type, msg, timeout) {
        var alert = {
          type: type,
          msg: msg,
          close: function () {
            if (alert.timeout) $timeout.cancel(this.timeout);
            return alertService.closeAlert(this);
          },
          
        }
        if (timeout)
          alert.timeout = $timeout(function () {
            alertService.closeAlert(alert);
          }, timeout);
        
        $rootScope.alerts.push(alert);
      },
      closeAlert: function (alert) {;
        return this.closeAlertIdx($rootScope.alerts.indexOf(alert));
      },
      closeAlertIdx: function (index) {
        return $rootScope.alerts.splice(index, 1);
      }
    };
    return alertService;
  };
})(angular);