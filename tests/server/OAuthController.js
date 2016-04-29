'use strict';

// Module dependencies
var assert = require('chai').assert;
var ut = require('@openveo/test').unit.generator;

// OAuthController.js
describe('OAuthController', function() {
  var request,
    response,
    oAuthController;

  before(function() {
    ut.generateWebServiceScopes();
    var OAuthController = process.require('app/server/controllers/OAuthController.js');
    oAuthController = new OAuthController();
    request = {
      oauth2: {},
      method: 'GET'
    };
    response = {};
  });

  // validateScopesAction method
  describe('validateScopesAction', function() {

    it('Should be able to grant access to a path depending on client application authorizations', function(done) {

      request.url = '/ws/videos';
      request.oauth2.accessToken = {
        scopes: {
          scope1: {
            name: 'name 1',
            activated: true
          }
        }
      };

      response.status = function() {
        return this;
      };
      response.send = function() {
        assert(false);
      };

      oAuthController.validateScopesAction(request, response, function() {
        done();
      });
    });

    it('Should be able to revoke access to a path depending on client application authorizations', function(done) {

      request.url = '/ws/videos';
      request.oauth2.accessToken = {
        scopes: {
          scope1: {
            name: 'name 1',
            activated: false
          }
        }
      };

      oAuthController.validateScopesAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 403);
        done();
      });
    });

  });

});
