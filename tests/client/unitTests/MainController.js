"use strict"

window.assert = chai.assert;

// MainController.js
describe("MainController", function(){
  var $rootScope, $controller, $httpBackend, authenticationService, $route, $location, i18nService, menuService, scope, childScope, logoutRequestHandler;

  // Load openveo module
  beforeEach(module("ov"));

  // Dependencies injections
  beforeEach(inject(function(_$rootScope_, _$controller_, _$httpBackend_, _authenticationService_, _$route_, _$location_, _i18nService_, _menuService_){
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $controller = _$controller_;
    authenticationService = _authenticationService_;
    i18nService = _i18nService_;
    menuService = _menuService_;
    $route = _$route_;
    $location = _$location_;
  }));

  // Initializes tests
  beforeEach(function(){
    scope = $rootScope.$new();
    childScope = scope.$new();
    $controller("MainController", {
      $scope: scope,
      i18nService : i18nService,
      authenticationService: authenticationService,
      $route: $route,
      menuService : menuService,
      $window : {
        location : {
          reload : function(){}
        }
      }
    });

    logoutRequestHandler = $httpBackend.when("GET", "/logout");
    $httpBackend.when("GET", /.*/).respond(200, "");
  });

  // toggleResponsiveMenu method
  describe("toggleResponsiveMenu", function(){

    it("Should be able to toggle responsive menu", function(){
      assert.ok(scope.isResponsiveMenuClosed);
      scope.toggleResponsiveMenu();
      assert.notOk(scope.isResponsiveMenuClosed);
      scope.toggleResponsiveMenu();
      assert.ok(scope.isResponsiveMenuClosed);
    });

  });

  // changeLanguage method
  describe("changeLanguage", function(){

    it("Should be able to change language", function(){
      var languages = i18nService.getLanguages();
      i18nService.setLanguage(languages[0].value);
      scope.changeLanguage(languages[1].value);

      assert.equal(i18nService.getLanguage(), languages[1].value);
    });

  });

  // $routeChangeSuccess event handler
  describe("$routeChangeSuccess", function(){

    it("Should handle $routeChangeSuccess from child scope and set page title", function(){
      $route.current = {
        title : "Page title"
      };

      childScope.$emit("$routeChangeSuccess");
      assert.equal(scope.title, $route.current.title);
    });

    it("Should not display menu if user is not authenticated", function(){
      childScope.$emit("$routeChangeSuccess");
      menuService.getMenu = function(){
        return true;
      };
      assert.notOk(scope.menu);
      assert.notOk(scope.displayMainMenu);
      assert.notOk(scope.isResponsiveMenuOpened);
    });      

    it("Should display menu if user is authenticated and route has its access granted", function(){
      $route = {
        title : "Page title"
      };
      authenticationService.setUserInfo({"username" : "openveo"});
      menuService.getMenu = function(){
        return true;
      };
      childScope.$emit("$routeChangeSuccess", $route);
      assert.ok(scope.menu);
      assert.ok(scope.displayMainMenu);
    });
    it("Should display menu if user is authenticated and has permissions to access the route", function(){
      $route = {
        title : "Page title",
        access : "isAllowed"
      };
      authenticationService.setUserInfo({"username" : "openveo", permissions:["isAllowed"]});
      menuService.getMenu = function(){
        return true;
      };
      childScope.$emit("$routeChangeSuccess", $route);
      assert.ok(scope.menu);
      assert.ok(scope.displayMainMenu);
    });
    
    it("Should be redirect if user is authenticated and has not permissions to access the route", function(){
      $route = {
        title : "Page title",
        access : "isAllowed"
      };
      authenticationService.setUserInfo({"username" : "openveo", permissions:[""]});
      menuService.getMenu = function(){
        return true;
      };
      childScope.$emit("$routeChangeSuccess", $route);
      assert.notOk(scope.menu);
      assert.notOk(scope.displayMainMenu);
      assert.notOk(scope.isResponsiveMenuOpened);
      assert.equal($location.path(), "/admin");
    });
    
  }); 

  // $routeChangeError event handler
  describe("$routeChangeError", function(){

    it("Should redirect user to /login if authentication failed", function(){
      childScope.$emit("$routeChangeError", null, null, {authenticated : false});
      assert.equal($location.path(), "/login");
    });

    it("Should redirect user to /admin if authentication succeeded", function(){
      childScope.$emit("$routeChangeError");
      assert.equal($location.path(), "/admin");
    });

  });

  // Logout method
  describe("logout", function(){

    // Checks if no HTTP request stays without response
    afterEach(function(){
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it("Should redirect to /login if logout succeeded", function(){
      logoutRequestHandler.respond(200, "");
      
      scope.logout();
      $httpBackend.flush();

      assert.isNull(authenticationService.getUserInfo());
      assert.equal($location.path(), "/login");
      assert.notOk(scope.menu);
      assert.notOk(scope.displayMainMenu);
    });
    
    it("Should redirect to /login if logout failed", function(){
      logoutRequestHandler.respond(500, "");
      
      scope.logout();
      $httpBackend.flush();
      
      assert.isNull(authenticationService.getUserInfo());
      assert.equal($location.path(), "/login");
      assert.notOk(scope.menu);
    });

  });
    
});