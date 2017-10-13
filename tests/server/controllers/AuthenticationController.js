'use strict';

var util = require('util');
var chai = require('chai');
var spies = require('chai-spies');
var passport = require('passport');
var Strategy = require('passport-strategy');
var openVeoApi = require('@openveo/api');
var AuthenticationController = process.require('app/server/controllers/AuthenticationController.js');
var storage = process.require('app/server/storage.js');
var errors = process.require('app/server/httpErrors.js');

var assert = chai.assert;
chai.should();
chai.use(spies);

// AuthenticationController.js
describe('AuthenticationController', function() {
  var request;
  var response;
  var authenticationController;
  var ADMIN_ID = '0';
  var internalStrategy1;
  var internalStrategy2;
  var externalStrategy;
  var internalStrategyName1 = 'internal-strategy1';
  var internalStrategyName2 = 'internal-strategy2';
  var externalStrategyName = openVeoApi.passport.STRATEGIES.CAS;

  beforeEach(function() {
    request = {params: {}};
    response = {};
    authenticationController = new AuthenticationController();
    storage.setConfiguration({
      superAdminId: ADMIN_ID
    });
    storage.setPermissions([]);
  });

  // Mocks
  beforeEach(function() {
    function InternalStrategy1() {
      InternalStrategy1.super_.call(this);
      this.name = internalStrategyName1;
    }

    function InternalStrategy2() {
      InternalStrategy2.super_.call(this);
      this.name = internalStrategyName2;
    }

    function ExternalStrategy() {
      ExternalStrategy.super_.call(this);
      this.name = externalStrategyName;
    }

    util.inherits(InternalStrategy1, Strategy);
    util.inherits(InternalStrategy2, Strategy);
    util.inherits(ExternalStrategy, Strategy);

    internalStrategy1 = new InternalStrategy1();
    internalStrategy2 = new InternalStrategy2();
    externalStrategy = new ExternalStrategy();

    passport.use(internalStrategy1);
    passport.use(internalStrategy2);
    passport.use(externalStrategy);
  });

  afterEach(function() {
    storage.setPermissions(null);
    storage.setConfiguration(null);
    passport.unuse(internalStrategyName1);
    passport.unuse(internalStrategyName2);
    passport.unuse(externalStrategyName);
  });

  // authenticateInternalAction method
  describe('authenticateInternalAction', function() {

    beforeEach(function() {
      request = {
        body: {
          login: 'test@test.test',
          password: 'password'
        },
        login: chai.spy(function(user, callback) {
          callback(null, user);
        })
      };

      response = {
        status: chai.spy(function(status) {
          return this;
        }),
        send: chai.spy(function(user) {})
      };
    });

    it('should be able to authenticate using configured internal passport strategy', function() {
      var expectedUser = {id: '42'};
      var next = chai.spy(function() {});

      internalStrategy1.internal = true;
      internalStrategy1.authenticate = chai.spy(function() {
        this.success(expectedUser);
      });

      response = {
        status: chai.spy(function(status) {
          assert.equal(status, 200, 'Wrong status');
          return response;
        }),
        send: chai.spy(function(user) {
          assert.strictEqual(user, expectedUser, 'Wrong user');
        })
      };

      authenticationController.authenticateInternalAction(request, response, next);

      internalStrategy1.authenticate.should.have.been.called.exactly(1);
      response.status.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should be able to authenticate using several internal passport strategies', function() {
      var expectedUser = {id: '42'};
      var next = chai.spy(function() {});

      internalStrategy1.internal = true;
      internalStrategy2.internal = true;
      internalStrategy1.authenticate = chai.spy(function() {
        this.fail('message');
      });

      internalStrategy2.authenticate = chai.spy(function() {
        this.success(expectedUser);
      });

      response = {
        status: chai.spy(function(status) {
          assert.equal(status, 200, 'Wrong status');
          return response;
        }),
        send: chai.spy(function(user) {
          assert.strictEqual(user, expectedUser, 'Wrong user');
        })
      };

      authenticationController.authenticateInternalAction(request, response, next);

      internalStrategy1.authenticate.should.have.been.called.exactly(1);
      internalStrategy2.authenticate.should.have.been.called.exactly(1);
      response.status.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should send an HTTP Unauthorized if none of the internal strategies worked', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.BACK_END_AUTHENTICATION_FAILED);
      });

      internalStrategy1.internal = true;
      internalStrategy1.authenticate = chai.spy(function() {
        this.fail('message');
      });

      authenticationController.authenticateInternalAction(request, response, next);

      internalStrategy1.authenticate.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.status.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP error message if an error occurred during authentication', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.BACK_END_AUTHENTICATION_ERROR);
      });

      internalStrategy1.internal = true;
      internalStrategy1.authenticate = chai.spy(function() {
        this.error(new Error('Error'));
      });

      authenticationController.authenticateInternalAction(request, response, next);

      internalStrategy1.authenticate.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.status.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP error message if request login failed', function() {
      var expectedUser = {id: '42'};

      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.BACK_END_AUTHENTICATION_ERROR);
      });

      internalStrategy1.internal = true;
      internalStrategy1.authenticate = chai.spy(function() {
        this.success(expectedUser);
      });

      request.login = chai.spy(function(user, callback) {
        callback(new Error('Error'));
      });

      authenticationController.authenticateInternalAction(request, response, next);

      next.should.have.been.called.exactly(1);
      request.login.should.have.been.called.exactly(1);
      internalStrategy1.authenticate.should.have.been.called.exactly(1);
      response.status.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP bad request if login is not specified', function() {
      request.body = {password: 'password'};

      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.AUTHENTICATE_INTERNAL_WRONG_PARAMETERS);
      });

      authenticationController.authenticateInternalAction(request, response, next);
      next.should.have.been.called.exactly(1);
    });

    it('should send an HTTP bad request if password is not specified', function() {
      request.body = {login: 'test@test.test'};

      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.AUTHENTICATE_INTERNAL_WRONG_PARAMETERS);
      });

      authenticationController.authenticateInternalAction(request, response, next);
      next.should.have.been.called.exactly(1);
    });

  });

  // authenticateExternalAction method
  describe('authenticateExternalAction', function() {

    beforeEach(function() {
      request = {
        params: {
          type: openVeoApi.passport.STRATEGIES.CAS
        },
        login: chai.spy(function(user, callback) {
          callback(null, user);
        })
      };

      response = {
        redirect: chai.spy(function(location) {
          return response;
        })
      };
    });

    it('should be able to authenticate using configured external passport strategy', function() {
      var expectedUser = {id: '42'};

      var next = chai.spy(function() {});

      externalStrategy.authenticate = chai.spy(function() {
        this.success(expectedUser);
      });

      response = {
        redirect: chai.spy(function(location) {
          assert.equal(location, '/be', 'Wrong location');
          return response;
        })
      };

      authenticationController.authenticateExternalAction(request, response, next);

      externalStrategy.authenticate.should.have.been.called.exactly(1);
      response.redirect.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should send an HTTP bad request if type is not specified', function() {
      var expectedUser = {id: '42'};
      request = {params: {}};

      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.AUTHENTICATE_EXTERNAL_WRONG_PARAMETERS);
      });

      externalStrategy.authenticate = chai.spy(function() {
        this.success(expectedUser);
      });

      authenticationController.authenticateExternalAction(request, response, next);

      next.should.have.been.called.exactly(1);
      externalStrategy.authenticate.should.have.been.called.exactly(0);
      response.redirect.should.have.been.called.exactly(0);
    });

    it('should send an HTTP Unauthorized if authentication failed', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.BACK_END_EXTERNAL_AUTHENTICATION_FAILED);
      });

      externalStrategy.authenticate = chai.spy(function() {
        this.fail('message');
      });

      authenticationController.authenticateExternalAction(request, response, next);

      externalStrategy.authenticate.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.redirect.should.have.been.called.exactly(0);
    });

    it('should send an HTTP error message if an error occurred during authentication', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.BACK_END_EXTERNAL_AUTHENTICATION_ERROR);
      });

      externalStrategy.authenticate = chai.spy(function() {
        this.error(new Error('error'));
      });

      authenticationController.authenticateExternalAction(request, response, next);

      externalStrategy.authenticate.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.redirect.should.have.been.called.exactly(0);
    });

    it('should send an HTTP error message if request login failed', function() {
      var expectedUser = {id: '42'};

      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.BACK_END_EXTERNAL_AUTHENTICATION_ERROR);
      });

      externalStrategy.authenticate = chai.spy(function() {
        this.success(expectedUser);
      });

      request.login = chai.spy(function(user, callback) {
        callback(new Error('error'));
      });

      authenticationController.authenticateExternalAction(request, response, next);

      externalStrategy.authenticate.should.have.been.called.exactly(1);
      request.login.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.redirect.should.have.been.called.exactly(0);
    });

  });

  // logoutAction method
  describe('logoutAction', function() {

    beforeEach(function() {
      request = {
        isAuthenticated: function() {
          return true;
        },
        user: {
          origin: internalStrategyName1
        },
        session: {
          destroy: chai.spy(function(callback) {
            callback();
          })
        },
        logout: chai.spy(function() {})
      };

      response = {
        status: chai.spy(function(status) {
          return this;
        }),
        send: chai.spy(function() {})
      };
    });

    it('should be able to logout the request and the internal user', function() {
      var next = chai.spy(function() {});

      internalStrategy1.internal = true;
      request.user = {origin: internalStrategyName1};

      response.status = function(status) {
        assert.equal(status, 200, 'Wrong status');
        return this;
      };

      authenticationController.logoutAction(request, response, next);

      request.logout.should.have.been.called.exactly(1);
      request.session.destroy.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should not do anything if user is not authenticated', function() {
      var next = chai.spy(function(error) {});
      internalStrategy1.internal = true;

      request.isAuthenticated = chai.spy(function() {
        return false;
      });
      request.user = {origin: internalStrategyName1};

      authenticationController.logoutAction(request, response, next);

      request.isAuthenticated.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.status.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
      request.session.destroy.should.have.been.called.exactly(0);
      request.logout.should.have.been.called.exactly(0);
    });

    it('should keep going if destroying session failed', function() {
      var next = chai.spy(function(error) {});

      internalStrategy1.internal = true;
      request.user = {origin: internalStrategyName1};
      request.session.destroy = chai.spy(function(callback) {
        callback(new Error('error'));
      });

      authenticationController.logoutAction(request, response, next);

      request.logout.should.have.been.called.exactly(1);
      response.status.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      request.session.destroy.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should ask the strategy to logout if external', function() {
      var next = chai.spy(function(error) {});

      externalStrategy.internal = false;
      externalStrategy.logout = chai.spy(function() {});
      request.user = {origin: externalStrategyName};

      authenticationController.logoutAction(request, response, next);

      request.session.destroy.should.have.been.called.exactly(1);
      externalStrategy.logout.should.have.been.called.exactly(1);
      request.logout.should.have.been.called.exactly(1);
      response.status.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
      next.should.have.been.called.exactly(0);
    });
  });

  // getPermissionsAction method
  describe('getPermissionsAction', function() {

    it('should send response with a list of permissions as a JSON object', function() {
      var permissions = [];
      var next = chai.spy(function() {});

      storage.setPermissions(permissions);
      response.send = chai.spy(function(data) {
        assert.strictEqual(data.permissions, permissions, 'Wrong permissions');
      });

      authenticationController.getPermissionsAction(request, response, next);

      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
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

      response = {
        send: chai.spy(function() {})
      };
    });

    it('should grant access to the administrator', function() {
      var next = chai.spy(function(error) {
        assert.notOk(error, 'Unexpected error : ' + (error && error.message));
      });
      request = {
        method: 'GET',
        url: '/applications',
        params: {},
        user: {
          id: ADMIN_ID
        },
        isAuthenticated: chai.spy(function() {
          return true;
        })
      };

      authenticationController.restrictAction(request, response, next);

      request.isAuthenticated.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP Unauthorized if user is not authenticated', function() {
      var next = chai.spy(function(error) {
        assert.equal(error.httpCode, 401);
      });

      request = {
        method: 'GET',
        url: '/applications',
        params: {},
        isAuthenticated: chai.spy(function() {
          return false;
        })
      };

      authenticationController.restrictAction(request, response, next);

      request.isAuthenticated.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(0);
    });

    it('should grant access to user profile page', function() {
      var next = chai.spy(function(error) {
        assert.notOk(error, 'Unexpected error : ' + (error && error.message));
      });

      request = {
        method: 'POST',
        url: '/users/42',
        params: {},
        user: {
          id: '42'
        },
        isAuthenticated: chai.spy(function() {
          return true;
        })
      };

      authenticationController.restrictAction(request, response, next);

      request.isAuthenticated.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(0);
    });

    it('should grant access to user with the right permission', function() {
      var next = chai.spy(function(error) {
        assert.notOk(error, 'Unexpected error : ' + (error && error.message));
      });

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
        isAuthenticated: chai.spy(function() {
          return true;
        })
      };

      authenticationController.restrictAction(request, response, next);

      request.isAuthenticated.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP Forbidden if user does not have the right permission', function() {
      var next = chai.spy(function(error) {
        assert.equal(error.httpCode, 403);
      });

      request = {
        method: 'GET',
        url: '/applications',
        params: {},
        isAuthenticated: chai.spy(function() {
          return true;
        }),
        user: {
          id: '42',
          permissions: []
        }
      };

      authenticationController.restrictAction(request, response, next);

      request.isAuthenticated.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(0);
    });

  });

});
