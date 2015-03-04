(function(app){
  
  "use strict"
  
  app.controller("HomeController", HomeController);
  HomeController.$inject = ["$scope"];

  /**
   * Defines the back office controller for the home page.
   */
  function HomeController($scope){}
  
})(angular.module("ov"));