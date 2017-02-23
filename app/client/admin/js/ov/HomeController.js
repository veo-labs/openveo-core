'use strict';

(function(app) {

  /**
   * Defines the back office controller for the home page.
   */
  function HomeController($scope, $uibModal) {

    // Global JS variable print by Mustache
    $scope.version = openVeoSettings.version;

    $scope.open = function(size) {
      $uibModal .open({
        templateUrl: 'versionModal.html',
        controller: 'ModalInstanceCtrl',
        size: size,
        resolve: {
          items: function() {
            return $scope.version;
          }
        }
      });
    };
  }

  /**
   * Defines a controller for modal instance.
   */
  function ModalInstanceCtrl($scope, $uibModalInstance, items) {
    $scope.items = items;
    $scope.close = function() {
      $uibModalInstance.close('close');
    };
  }

  app.controller('HomeController', HomeController);
  app.controller('ModalInstanceCtrl', ModalInstanceCtrl);
  HomeController.$inject = ['$scope', '$uibModal'];
  ModalInstanceCtrl.$inject = ['$scope', '$uibModalInstance', 'items'];

})(angular.module('ov'));
