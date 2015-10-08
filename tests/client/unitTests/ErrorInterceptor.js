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

  it('Should force to logout if receiving a 401 request', function(done) {
    scope.$on('forceLogout', function() {
      done();
    });
    errorInterceptor.responseError({
      status: 401
    });
  });

  it('Should set an error message if receiving an error other than 401', function(done) {
    scope.$on('setAlert', function() {
      done();
    });
    errorInterceptor.responseError({
      status: 500
    });
  });

});
