'use strict';

var chai = require('chai');
var spies = require('chai-spies');
var OAuthController = process.require('app/server/controllers/OAuthController.js');
var storage = process.require('app/server/storage.js');
var errors = process.require('app/server/httpErrors.js');

var assert = chai.assert;
chai.should();
chai.use(spies);

// OAuthController.js
describe('OAuthController', function() {
  var request;
  var response;
  var oAuthController;

  beforeEach(function() {
    request = {oauth2: {}};
    response = {};
    oAuthController = new OAuthController();
  });

  afterEach(function() {
    storage.setWebServiceScopes(null);
  });

  // validateScopesAction method
  describe('validateScopesAction', function() {

    it('should call next middleware if route is in user\'s scopes (access granted)', function(done) {
      var expectedId = '42';
      var expectedMethod = 'get';
      var expectedPath = 'expected/path';
      var expectedScopes = [{id: expectedId, paths: [expectedMethod + ' ' + expectedPath]}];
      storage.setWebServiceScopes(expectedScopes);

      request.oauth2.accessToken = {
        scopes: [expectedId]
      };
      request.url = expectedPath;
      request.method = expectedMethod;
      oAuthController.validateScopesAction(request, response, function(error) {
        assert.isUndefined(error, 'Unexpected error');
        done();
      });
    });

    it('should call next middleware with an error if route is not in user\'s scopes (access refused)', function(done) {
      var expectedPath = 'some/path';
      storage.setWebServiceScopes([{id: '42', paths: ['get ' + expectedPath]}]);
      request.oauth2.accessToken = {
        scopes: ['43']
      };
      request.url = expectedPath;
      request.method = 'get';
      oAuthController.validateScopesAction(request, response, function(error) {
        assert.strictEqual(error, errors.WS_FORBIDDEN, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if no scope corresponds to the route', function(done) {
      storage.setWebServiceScopes([]);
      request.oauth2.accessToken = {
        scopes: ['42']
      };
      request.url = 'some/path';
      request.method = 'get';
      oAuthController.validateScopesAction(request, response, function(error) {
        assert.strictEqual(error, errors.WS_FORBIDDEN, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if request is not authenticated', function(done) {
      storage.setWebServiceScopes([]);
      request.url = 'some/path';
      request.method = 'get';
      oAuthController.validateScopesAction(request, response, function(error) {
        assert.strictEqual(error, errors.WS_UNAUTHORIZED, 'Wrong error');
        done();
      });
    });
  });

});
