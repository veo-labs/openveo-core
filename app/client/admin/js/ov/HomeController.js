'use strict';

(function(app) {

  /**
   * Defines the back office controller for the home page.
   */
  function HomeController($scope, $modal) {

    // Global JS variable print by Mustache
    $scope.version = version;

    $scope.open = function(size) {
      $modal.open({
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
  function ModalInstanceCtrl($scope, $modalInstance, items) {
    $scope.items = items;
    $scope.close = function() {
      $modalInstance.close('close');
    };
  }

  app.controller('HomeController', HomeController);
  app.controller('ModalInstanceCtrl', ModalInstanceCtrl);
  HomeController.$inject = ['$scope', '$modal'];
  ModalInstanceCtrl.$inject = ['$scope', '$modalInstance', 'items'];

})(angular.module('ov'));
