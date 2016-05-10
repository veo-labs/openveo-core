'use strict';

window.assert = chai.assert;

// ErrorInterceptor.js
describe('ErrorInterceptor', function() {
  var errorInterceptor, scope, $rootScope;

  // Load openveo application
  beforeEach(module('ov'));

  // Dependencies injections
  beforeEach(inject(function(_$rootScope_, _errorInterceptor_) {
    errorInterceptor = _errorInterceptor_;
    $rootScope = _$rootScope_;
  }));

  // Prepares scopes
  beforeEach(function() {
    scope = $rootScope.$new();
  });

  it('should force to logout if receiving an HTTP unauthorized code', function(done) {
    scope.$on('forceLogout', function() {
      done();
    });
    errorInterceptor.responseError({
      status: 401
    });
  });

  it('should set an error message if receiving an HTTP error other than an unauthorized code', function(done) {
    scope.$on('setAlert', function() {
      done();
    });
    errorInterceptor.responseError({
      status: 500
    });
  });

});
