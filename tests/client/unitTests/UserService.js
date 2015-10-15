'use strict';

window.assert = chai.assert;

// UserService.js
describe('UserService', function() {
  var $httpBackend,
    userService;

  // Load openveo application
  beforeEach(module('ov'));

  // Dependencies injections
  beforeEach(inject(function(_$httpBackend_, _userService_) {
    $httpBackend = _$httpBackend_;
    userService = _userService_;
  }));

  // Prepares HTTP responses
  beforeEach(function() {
    $httpBackend.when('POST', /.*/).respond(200, '');
    $httpBackend.when('DELETE', /.*/).respond(200, '');
    $httpBackend.when('PUT', /.*/).respond(200, '');
  });

  // Checks if no HTTP request stays without response
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('Should be able to ask server for the list of roles', function() {
    $httpBackend.when('GET', /.*/).respond(200, '');
    $httpBackend.expectGET('/be/crud/role');
    userService.loadRoles();
    $httpBackend.flush();
  });

  it('Should be able to ask server for the list of permissions', function() {
    $httpBackend.when('GET', /.*/).respond(200, '');
    $httpBackend.expectGET('/be/permissions');
    userService.loadPermissions();
    $httpBackend.flush();
  });

  it('Should be able to store roles', function() {
    $httpBackend.when('GET', '/be/crud/role').respond(200, {
      entities: [{
        name: 'Example',
        permissions: {
          perm1: {
            activated: true
          }
        }
      }]
    }
    );
    $httpBackend.expectGET('/be/crud/role');
    userService.loadRoles();
    $httpBackend.flush();

    var roles = userService.getRoles();
    assert.isDefined(roles);
    assert.equal(roles.length, 1);
  });

  it('Should be able to store permissions', function() {
    $httpBackend.when('GET', '/be/permissions').respond(200,
      [{
        perm1: {
          name: 'Name',
          description: 'Description',
          activated: true
        }
      }]
    );
    $httpBackend.expectGET('/be/permissions');
    userService.loadPermissions();
    $httpBackend.flush();

    var permissions = userService.getPermissions();
    assert.isDefined(permissions);
    assert.equal(permissions.length, 1);
  });

});
