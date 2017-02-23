'use strict';

var chai = require('chai');
var spies = require('chai-spies');
var AuthenticationController = process.require('app/server/controllers/AuthenticationController.js');
var storage = process.require('app/server/storage.js');

var assert = chai.assert;
chai.should();
chai.use(spies);

// AuthenticationController.js
describe('AuthenticationController', function() {
  var request;
  var response;
  var authenticationController;
  var ADMIN_ID = '0';

  beforeEach(function() {
    request = {params: {}};
    response = {};
    authenticationController = new AuthenticationController();
    storage.setSuperAdminId(ADMIN_ID);
    storage.setPermissions([]);
  });

  afterEach(function() {
    storage.setPermissions(null);
    storage.setSuperAdminId(null);
  });

  // logoutAction method
  describe('logoutAction', function() {

    it('should logout the request and call the next middleware', function(done) {
      request.logout = chai.spy(function() {

      });
      authenticationController.logoutAction(request, response, function(error) {
        assert.isUndefined(error, 'Unexpected error');
        request.logout.should.have.been.called.exactly(1);
        done();
      });
    });

  });

  // getPermissionsAction method
  describe('getPermissionsAction', function() {

    it('should send response with a list of permissions as a JSON object', function(done) {
      var permissions = [];
      storage.setPermissions(permissions);
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

  // restrictAction method
  describe('restrictAction', function() {

    beforeEach(function() {
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
      storage.setPermissions(permissions);
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
