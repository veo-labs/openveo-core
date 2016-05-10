'use strict';

var assert = require('chai').assert;
var applicationStorage = require('@openveo/api').applicationStorage;
var AuthenticationController = process.require('app/server/controllers/AuthenticationController.js');

// AuthenticationController.js
describe('AuthenticationController', function() {
  var request = {params: {}};
  var response = {};
  var authenticationController;
  var ADMIN_ID = '0';

  before(function() {
    authenticationController = new AuthenticationController();
    applicationStorage.setSuperAdminId(ADMIN_ID);
  });

  // getPermissionsAction function
  describe('getPermissionsAction', function() {

    it('should be able to get a list of permissions as a JSON object', function(done) {
      var permissions = [];
      applicationStorage.setPermissions(permissions);
      response.status = function() {
        return this;
      };
      response.send = function(data) {
        assert.strictEqual(data.permissions, permissions);
        done();
      };

      authenticationController.getPermissionsAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + (error && error.message));
      });
    });

  });

  // restrictAction function
  describe('restrictAction', function() {

    before(function() {
      var permissions = [
        {
          id: 'perm1',
          name: 'name 1',
          description: 'description 1',
          paths: [
            'get /applications'
          ]
        },
        {
          id: 'perm2',
          name: 'name 2',
          description: 'description 2',
          paths: [
            'put /applications'
          ]
        }
      ];
      applicationStorage.setPermissions(permissions);
    });

    it('should grant access to the administrator', function(done) {
      request = {
        method: 'GET',
        url: '/applications',
        params: {},
        user: {
          id: ADMIN_ID
        },
        isAuthenticated: function() {
          return true;
        }
      };

      response.send = function() {
        assert.ok(false, 'Unexpected response send for restrictAction');
      };

      authenticationController.restrictAction(request, response, function(error) {
        assert.notOk(error, 'Unexpected error : ' + (error && error.message));
        done();
      });
    });

    it('should send an HTTP Unauthorized if user is not authenticated', function(done) {
      request = {
        method: 'GET',
        url: '/applications',
        params: {},
        isAuthenticated: function() {
          return false;
        }
      };

      response.send = function() {
        assert.ok(false, 'Unexpected response send for restrictAction');
      };

      authenticationController.restrictAction(request, response, function(error) {
        assert.equal(error.httpCode, 401);
        done();
      });
    });

    it('should grant access to user profile page', function(done) {
      request = {
        method: 'POST',
        url: '/users/42',
        params: {},
        user: {
          id: '42'
        },
        isAuthenticated: function() {
          return true;
        }
      };

      authenticationController.restrictAction(request, response, function(error) {
        assert.notOk(error, 'Unexpected error : ' + (error && error.message));
        done();
      });
    });

    it('should grant access to user with the right permission', function(done) {
      request = {
        method: 'GET',
        url: '/applications',
        params: {},
        user: {
          id: '42',
          permissions: [
            'perm1'
          ]
        },
        isAuthenticated: function() {
          return true;
        }
      };

      authenticationController.restrictAction(request, response, function(error) {
        assert.notOk(error, 'Unexpected error : ' + (error && error.message));
        done();
      });

    });

    it('should send an HTTP Forbidden if user does not have the right permission', function(done) {
      request = {
        method: 'GET',
        url: '/applications',
        params: {},
        isAuthenticated: function() {
          return true;
        },
        user: {
          id: '42',
          permissions: []
        }
      };

      response.send = function() {
        assert.ok(false, 'Unexpected response send for restrictAction');
      };

      authenticationController.restrictAction(request, response, function(error) {
        assert.equal(error.httpCode, 403);
        done();
      });
    });

  });

});
