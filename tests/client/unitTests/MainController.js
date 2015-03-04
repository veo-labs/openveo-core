"use strict"

window.assert = chai.assert;

describe("MainController", function(){

  beforeEach(module("ov"));

  var $rootScope, $controller, $httpBackend, authenticationService, $route, $location;

  beforeEach(inject(function(_$rootScope_, _$controller_, _$httpBackend_, _authenticationService_, _$route_, _$location_){
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $controller = _$controller_;
    authenticationService = _authenticationService_;
    $route = _$route_;
    $location = _$location_;
  }));

  describe("$routeChangeSuccess", function(){
    var $scope, childScope;

    beforeEach(function(){
      $scope = $rootScope.$new();
      childScope = $scope.$new();

      $controller("MainController", {
        $scope: $scope,
        authenticationService: authenticationService,
        $route: $route
      });
    });

    it("Should handle $routeChangeSuccess from child scope and set page title", function(){
      $route.current = {
        title : "Page title"
      };

      childScope.$emit("$routeChangeSuccess");
      assert.equal($scope.title, $route.current.title);
    });

    it("Should not display menu if user is not authenticated", function(){
      childScope.$emit("$routeChangeSuccess");
      assert.notOk($scope.openedMenu);
    });      

    it("Should display menu if user is authenticated", function(){

      authenticationService.setUserInfo({"username" : "openveo"});
      childScope.$emit("$routeChangeSuccess");
      assert.ok($scope.openedMenu);
    });

  }); 

  describe("$routeChangeError", function(){
    var $scope, childScope;

    beforeEach(function(){
      $scope = $rootScope.$new();
      childScope = $scope.$new();

      $controller("MainController", {
        $scope: $scope,
        authenticationService: authenticationService,
        $route: $route
      });
    });

    it("Should redirect user to /login if authentication failed", function(){
      childScope.$emit("$routeChangeError", null, null, {authenticated : false});
      assert.equal($location.path(), "/login");
    });

    it("Should redirect user to /admin if authentication succeeded", function(){
      childScope.$emit("$routeChangeError");
      assert.equal($location.path(), "/admin");
    });

  });

  describe("logout", function(){
    var $scope, logoutRequestHandler;

    beforeEach(function(){
      $scope = $rootScope.$new();
      
      logoutRequestHandler = $httpBackend.when("GET", "/logout");
      $httpBackend.when("GET", /.*/).respond(200, "");
      
      $controller("MainController", {
        $scope: $scope,
        authenticationService: authenticationService,
        $route: $route
      });
    })

    it("Should redirect to /login if logout succeeded", function(){
      logoutRequestHandler.respond(200, "");
      
      $scope.logout();
      $httpBackend.flush();

      assert.isNull(authenticationService.getUserInfo());
      assert.equal($location.path(), "/login");
      assert.notOk($scope.openedMenu);
    });
    
    it("Should redirect to /login if logout failed", function(){
      logoutRequestHandler.respond(500, "");
      
      $scope.logout();
      $httpBackend.flush();
      
      assert.isNull(authenticationService.getUserInfo());
      assert.equal($location.path(), "/login");
      assert.notOk($scope.openedMenu);  
    });
    
    afterEach(function(){
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });    

  });
    
});