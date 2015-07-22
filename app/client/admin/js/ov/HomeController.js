(function(app){
  
  "use strict"
  
  app.controller("HomeController", HomeController);
  app.controller("ModalInstanceCtrl", ModalInstanceCtrl);
  HomeController.$inject = ["$scope", "$modal"];
  ModalInstanceCtrl.$inject = ["$scope", "$modalInstance","items"];
  
  /**
   * Defines the back office controller for the home page.
   */
  function HomeController($scope, $modal){
    //Global JS variable print by Mustache
    $scope.version = version;
    
    $scope.open = function (size) {

      var modalInstance = $modal.open({
        templateUrl: 'versionModal.html',
        controller: 'ModalInstanceCtrl',
        size: size,
        resolve: {
          items: function () {
            return $scope.version;
          }
        }
      });
    };
  }
  
  function ModalInstanceCtrl($scope, $modalInstance, items) {
    $scope.items = items;
    $scope.close = function () {
      $modalInstance.close('close');
    };
  }
  
  
})(angular.module("ov"));