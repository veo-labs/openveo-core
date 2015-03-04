"use strict"

window.assert = chai.assert;

describe("LoginController", function(){
  
  beforeEach(module("ov"));

  describe("Sign in", function(){
    
    var $rootScope, $controller, $httpBackend, $location, authRequestHandler;
    
    beforeEach(inject(function(_$rootScope_, _$controller_, _$httpBackend_, _$location_){
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $controller = _$controller_;
      authRequestHandler = $httpBackend.when("POST", "/authenticate");
    }));
    
    it("Should set onError property when sign in fails", function(){
      var $scope = $rootScope.$new();
      $scope.userName = "openveo";
      $scope.password = "openveo";
      
      $controller("LoginController", {
        $scope: $scope,
        $location: $location
      });
      
      authRequestHandler.respond(401, "");
      
      $scope.signIn();
      $httpBackend.flush();

      // Expect onError to be true
      assert.ok($scope.onError);
      assert.equal($scope.userName, "");
      assert.equal($scope.password, "");
    });
    
    it("Should set location to /admin when user successfully signs in", function(){
      var $scope = $rootScope.$new();
      $scope.userName = "openveo";
      $scope.password = "openveo";
      
      authRequestHandler.respond(200, "");
      
      $controller("LoginController", {
        $scope: $scope,
        $location: $location
      });
      
      $scope.signIn();
      $httpBackend.flush();
      
      // Expect onError to be true
      assert.equal($location.path(), "/admin");
    });
    
    afterEach(function(){
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
    
  }); 
  
});