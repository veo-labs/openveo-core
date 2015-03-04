"use strict"

window.assert = chai.assert;

describe("OvApp", function(){
  
  beforeEach(module("ov"));
    
  var $rootScope, $controller, $httpBackend, authenticationService, $route, $location;

  beforeEach(inject(function(_$rootScope_, _$controller_, _$httpBackend_, _authenticationService_, _$route_, _$location_){
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $controller = _$controller_;
    authenticationService = _authenticationService_;
    $route = _$route_;
    $location = _$location_;
    
    $controller("MainController", {
      $scope: $rootScope.$new(),
      authenticationService: authenticationService,
      $route: $route
    });
    
    $httpBackend.when("GET", /.*/).respond(200, "");
  }));
  
  it("Should register /login and /admin routes", function(){
    assert.isDefined($route.routes["/admin"]);
    assert.isDefined($route.routes["/login"]);
  });
  
  it("Should route to /login if user is not authenticated", function(){
    $httpBackend.expectGET("views/home.html");
    
    $location.path("/admin");
    $httpBackend.flush();
    assert.equal($location.path(), "/login");
  });
  
  it("Should be able to route to /login", function(){
    $httpBackend.expectGET("views/login.html");
    
    $location.path("/login");
    $httpBackend.flush();
    assert.equal($location.path(), "/login");
  });
  
  it("Should be able to route to /admin", function(){
    $httpBackend.expectGET("views/home.html");
    
    authenticationService.setUserInfo({"username" : "openveo"});
    
    $location.path("/admin");
    $httpBackend.flush();
    assert.equal($location.path(), "/admin");
  });  
  
  it("Should redirect to /admin if no routes found", function(){
    authenticationService.setUserInfo({"username" : "openveo"});
    
    $location.path("/somethingThatDoesNotExist");
    $httpBackend.flush();
    assert.equal($location.path(), "/admin");
  });  

});