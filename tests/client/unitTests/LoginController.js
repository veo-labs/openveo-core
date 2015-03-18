"use strict"

window.assert = chai.assert;

describe("LoginController", function(){
  var $rootScope, $controller, i18nService;
  
  beforeEach(module("ov"));

  beforeEach(inject(function(_$rootScope_, _$controller_, _i18nService_){
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    i18nService = _i18nService_;
  }));

  describe("Sign in", function(){
    
    var $httpBackend, $location, authRequestHandler;
    
    beforeEach(inject(function(_$httpBackend_, _$location_){
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $httpBackend.when("GET", /.*/).respond(200, "");
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
  
  describe("Languages", function(){

    it("Should have a predefined language", function(){
      var $scope = $rootScope.$new();

      $controller("LoginController", {
        $scope: $scope
      });

      assert.isDefined($scope.language);
      assert.isNotNull($scope.language);
    });

    it("Should have a list of languages", function(){
      var $scope = $rootScope.$new();

      $controller("LoginController", {
        $scope: $scope
      });

      assert.isDefined($scope.languages);
      assert.isNotNull($scope.languages);
      assert.isArray($scope.languages);
    });

    it("Should be able to change language", function(done){
      var $scope = $rootScope.$new();

      $controller("LoginController", {
        $scope: $scope
      });

      i18nService.setLanguage = function(language){
        assert.equal(language, "en");
        done();
      };

      $scope.changeLanguage("en");
    });

  });

});