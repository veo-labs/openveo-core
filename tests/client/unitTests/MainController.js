'use strict';

window.assert = chai.assert;

// MainController.js
describe('MainController', function() {
  var $rootScope;
  var $controller;
  var $httpBackend;
  var authenticationService;
  var $route;
  var $location;
  var i18nService;
  var menuService;
  var entityService;
  var scope;
  var childScope;
  var logoutRequestHandler;

  // Load openveo module
  beforeEach(module('ov'));

  // Dependencies injections
  beforeEach(inject(
    function(_$rootScope_,
      _$controller_,
      _$httpBackend_,
      _authenticationService_,
      _$route_,
      _$location_,
      _i18nService_,
      _menuService_,
      _entityService_) {
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      $controller = _$controller_;
      authenticationService = _authenticationService_;
      i18nService = _i18nService_;
      menuService = _menuService_;
      entityService = _entityService_;
      $route = _$route_;
      $location = _$location_;
    }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
    childScope = scope.$new();
    $controller('MainController', {
      $scope: scope,
      i18nService: i18nService,
      authenticationService: authenticationService,
      $route: $route,
      menuService: menuService,
      entityService: entityService,
      $window: {
        location: {
          reload: function() {
          }
        }
      }
    });

    logoutRequestHandler = $httpBackend.when('POST', '/logout');
    $httpBackend.when('GET', /.*/).respond(200, '');
    $httpBackend.when('POST', /.*/).respond(200, '');
  });

  // $routeChangeSuccess event handler
  describe('$routeChangeStart', function() {

    it('should be redirected if user is authenticated and has no permissions to access the route', function() {
      $route = {
        title: 'Page title',
        access: 'isAllowed'
      };
      authenticationService.setUserInfo({
        username: 'openveo',
        permissions: ['']
      });
      menuService.getMenu = function() {
        return true;
      };
      childScope.$emit('$routeChangeStart', $route);
      assert.equal($location.path(), '/');
    });

  });

  // $routeChangeSuccess event handler
  describe('$routeChangeSuccess', function() {

    it('should handle $routeChangeSuccess from child scope and set page title', function() {
      $route.current = {
        title: 'Page title'
      };

      childScope.$emit('$routeChangeSuccess');
      assert.equal(scope.title, $route.current.title);
    });

    it('should not display menu if user is not authenticated', function() {
      childScope.$emit('$routeChangeSuccess');
      menuService.getMenu = function() {
        return true;
      };
      assert.notOk(scope.menu);
      assert.notOk(scope.displayMainMenu);
      assert.notOk(scope.isResponsiveMenuOpened);
    });

    it('should display menu if user is authenticated and route has its access granted', function() {
      $route = {
        title: 'Page title'
      };
      authenticationService.setUserInfo({
        username: 'openveo'
      });
      menuService.getMenu = function() {
        return true;
      };
      childScope.$emit('$routeChangeSuccess', $route);
      assert.ok(scope.menu);
      assert.ok(scope.displayMainMenu);
    });

    it('should display menu if user is authenticated and has permissions to access the route', function() {
      $route = {
        title: 'Page title',
        access: 'isAllowed'
      };
      authenticationService.setUserInfo({
        username: 'openveo',
        permissions: ['isAllowed']
      });
      menuService.getMenu = function() {
        return true;
      };
      childScope.$emit('$routeChangeSuccess', $route);
      assert.ok(scope.menu);
      assert.ok(scope.displayMainMenu);
    });

  });

  // $routeChangeError event handler
  describe('$routeChangeError', function() {

    it('should redirect user to /login if authentication failed', function() {
      childScope.$emit('$routeChangeError', null, null, {
        authenticated: false
      });
      assert.equal($location.path(), '/login');
    });

    it('should redirect user to / if authentication succeeded', function() {
      scope.userInfo = {};
      childScope.$emit('$routeChangeError');
      assert.equal($location.path(), '/');
    });

  });

  // Logout method
  describe('logout', function() {

    // Checks if no HTTP request stays without response
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should redirect to /login if logout succeeded', function() {
      logoutRequestHandler.respond(200, '');

      entityService.deleteCache = function() {
        assert.ok(true);
      };
      scope.logout();
      $httpBackend.flush();

      assert.isNull(authenticationService.getUserInfo());
      assert.equal($location.path(), '/login');
      assert.notOk(scope.menu);
      assert.notOk(scope.displayMainMenu);
    });

    it('should redirect to /login if logout failed', function() {
      logoutRequestHandler.respond(500, '');

      scope.logout();
      $httpBackend.flush();

      assert.isNull(authenticationService.getUserInfo());
      assert.equal($location.path(), '/login');
      assert.notOk(scope.menu);
    });

  });

});
