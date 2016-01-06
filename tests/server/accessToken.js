'use strict';

// Module dependencies
var assert = require('chai').assert;
var ut = require('@openveo/test').unit.generator;

// accessToken.js file
describe('accessToken', function() {
  var accessToken;

  before(function() {
    ut.generateSuccessDatabase();
    accessToken = process.require('app/server/oauth/accessToken.js');
  });

  // create method
  describe('create', function() {

    it('Should be able to create an access token for a client application', function(done) {
      accessToken.create('userId', '1', [], 600, function(error, token) {
        assert.isDefined(token);
        done();
      });
    });

  });

  // fetchByToken method
  describe('fetchByToken', function() {

    it('Should be able to get client application information by token', function(done) {
      accessToken.fetchByToken('2', function(error, token) {
        assert.isDefined(token);
        done();
      });
    });

  });

  // checkTTL method
  describe('checkTTL', function() {

    it('Should be able to verify if the token is still valid', function() {
      assert.notOk(accessToken.checkTTL({
        ttl: 8000
      }));
      assert.ok(accessToken.checkTTL({
        ttl: 1e+20
      }));
    });

  });

});
