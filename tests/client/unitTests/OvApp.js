'use strict';

window.assert = chai.assert;

// OvApp.js
describe('OvApp', function() {
  var $rootScope,
    $controller,
    $httpBackend,
    authenticationService,
    $route,
    $location;

  // Load openveo module
  beforeEach(module('ov'));

  // Dependencies injections
  beforeEach(inject(
    function(_$rootScope_, _$controller_, _$httpBackend_, _authenticationService_, _$route_, _$location_) {
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      $controller = _$controller_;
      authenticationService = _authenticationService_;
      $route = _$route_;
      $location = _$location_;
    }));

  // Initializes tests
  beforeEach(function() {
    $controller('MainController', {
      $scope: $rootScope.$new(),
      authenticationService: authenticationService,
      $route: $route
    });

    $httpBackend.when('GET', /.*/).respond(200, '');
  });

  it('Should register /login, /, /applications, /roles, /users, /profiles routes', function() {
    assert.isDefined($route.routes['/']);
    assert.isDefined($route.routes['/login']);
    assert.isDefined($route.routes['/applications']);
    assert.isDefined($route.routes['/roles']);
    assert.isDefined($route.routes['/users']);
    assert.isDefined($route.routes['/profiles']);
  });

  it('Should route to /login if user is not authenticated', function() {
    $httpBackend.expectGET('views/home.html');

    $location.path('/');
    $httpBackend.flush();
    assert.equal($location.path(), '/login');
  });

  it('Should be able to route to /login', function() {
    $httpBackend.expectGET('views/login.html');

    $location.path('/login');
    $httpBackend.flush();
    assert.equal($location.path(), '/login');
  });

  it('Should be able to route to /', function() {
    $httpBackend.expectGET('views/home.html');

    authenticationService.setUserInfo({
      username: 'openveo'
    });

    $location.path('/');
    $httpBackend.flush();
    assert.equal($location.path(), '/');
  });

  it('Should redirect to / if no routes found', function() {
    authenticationService.setUserInfo({
      username: 'openveo'
    });

    $location.path('/somethingThatDoesNotExist');
    $httpBackend.flush();
    assert.equal($location.path(), '/');
  });

});
