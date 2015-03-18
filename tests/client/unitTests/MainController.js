"use strict"

window.assert = chai.assert;

describe("MainController", function(){

  beforeEach(module("ov"));

  var $rootScope, $controller, $httpBackend, authenticationService, $route, $location, i18nService, menuService;

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

  describe("toggleResponsiveMenu", function(){

    it("Should be able to toggle responsive menu", function(){
      var $scope = $rootScope.$new();
      $controller("MainController", {
        $scope: $scope
      });

      assert.notOk($scope.isResponsiveMenuOpened);
      $scope.toggleResponsiveMenu();
      assert.ok($scope.isResponsiveMenuOpened);
      $scope.toggleResponsiveMenu();
      assert.notOk($scope.isResponsiveMenuOpened);
    });

  });

  describe("changeLanguage", function(){

    it("Should be able to change language", function(){
      var $scope = $rootScope.$new();
      $controller("MainController", {
        $scope: $scope,
        i18nService : i18nService,
        $window : {
          location : {
            reload : function(){}
          }
        }
      });

      var languages = i18nService.getLanguages();
      i18nService.setLanguage(languages[0].value);
      $scope.changeLanguage(languages[1].value);

      assert.equal(i18nService.getLanguage(), languages[1].value);
    });

  });

  describe("toggleSubMenu", function(){

    it("Should be able to open / close a dropdown", function(){
      var $scope = $rootScope.$new();
      $controller("MainController", {
        $scope: $scope
      });

      var li = document.createElement("li");
      var a = document.createElement("a");
      var span1 = document.createElement("span1");
      var span2 = document.createElement("span2");

      li.setAttribute("class", "dropdown");

      a.appendChild(span1);
      a.appendChild(span2);
      li.appendChild(a);

      $scope.toggleSubMenu({target : li});
      assert.ok(angular.element(li).hasClass("open"));
      $scope.toggleSubMenu({target : li});
      assert.notOk(angular.element(li).hasClass("open"));
      $scope.toggleSubMenu({target : a});
      assert.ok(angular.element(li).hasClass("open"));
      $scope.toggleSubMenu({target : a});
      assert.notOk(angular.element(li).hasClass("open"));
      $scope.toggleSubMenu({target : span1});
      assert.ok(angular.element(li).hasClass("open"));
      $scope.toggleSubMenu({target : span1});
      assert.notOk(angular.element(li).hasClass("open"));
      $scope.toggleSubMenu({target : span2});
      assert.ok(angular.element(li).hasClass("open"));
      $scope.toggleSubMenu({target : span2});
      assert.notOk(angular.element(li).hasClass("open"));

    });

  });

  describe("$routeChangeSuccess", function(){
    var $scope, childScope;

    beforeEach(function(){
      $scope = $rootScope.$new();
      childScope = $scope.$new();

      $controller("MainController", {
        $scope: $scope,
        authenticationService: authenticationService,
        $route: $route,
        menuService : menuService
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
      menuService.getMenu = function(){
        return true;
      };
      assert.notOk($scope.menu);
      assert.notOk($scope.displayMainMenu);
      assert.notOk($scope.isResponsiveMenuOpened);
    });      

    it("Should display menu if user is authenticated", function(){
      authenticationService.setUserInfo({"username" : "openveo"});
      menuService.getMenu = function(){
        return true;
      };
      childScope.$emit("$routeChangeSuccess");
      assert.ok($scope.menu);
      assert.ok($scope.displayMainMenu);
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
      assert.notOk($scope.menu);
      assert.notOk($scope.displayMainMenu);
    });
    
    it("Should redirect to /login if logout failed", function(){
      logoutRequestHandler.respond(500, "");
      
      $scope.logout();
      $httpBackend.flush();
      
      assert.isNull(authenticationService.getUserInfo());
      assert.equal($location.path(), "/login");
      assert.notOk($scope.menu);
    });
    
    afterEach(function(){
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });    

  });
    
});