'use strict';

window.assert = chai.assert;

// AuthenticationApp.js
describe('AuthenticationApp', function() {
  var authenticationService,
    $httpBackend;

  // Load openveo, authentication and storage modules
  beforeEach(function() {
    module('ov');
    module('ov.authentication');
    module('ov.storage');
  });

  // Dependencies injections
  beforeEach(inject(function(_$controller_, _$httpBackend_, _authenticationService_) {
    $httpBackend = _$httpBackend_;
    authenticationService = _authenticationService_;
  }));

  // Prepares HTTP responses
  beforeEach(function() {
    $httpBackend.when('POST', /.*/).respond(200, {
      email: 'openveo'
    });
    $httpBackend.when('GET', /.*/).respond(200, '');
  });

  // Checks if no HTTP request stays without response
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('Should be able to authenticate a user', function() {
    $httpBackend.expectPOST('/be/authenticate', {
      email: 'openveo',
      password: 'openveo'
    });

    authenticationService.login('openveo', 'openveo').then(function() {
      assert.ok(true);
    }, function() {
      assert.ok(false);
    });

    $httpBackend.flush();
  });

  it('Should be able to logout the authenticated user', function() {
    $httpBackend.expectPOST('/be/logout');

    authenticationService.logout().then(function() {
      authenticationService.setUserInfo();
      assert.notOk(authenticationService.getUserInfo());
      assert.ok(true);
    }, function() {
      assert.ok(false);
    });

    $httpBackend.flush();
  });

  it('Should be able to get / set authenticated user information', function() {
    authenticationService.setUserInfo({
      email: 'openveo'
    });

    assert.isDefined(authenticationService.getUserInfo());
  });

});
