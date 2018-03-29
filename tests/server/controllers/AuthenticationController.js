'use strict';

var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var mock = require('mock-require');
var openVeoApi = require('@openveo/api');
var errors = process.require('app/server/httpErrors.js');

var assert = chai.assert;
chai.should();
chai.use(spies);

describe('AuthenticationController', function() {
  var storage;
  var passport;
  var expectedUser;
  var request;
  var response;
  var authenticationController;
  var superAdminId = '0';

  // Mocks
  beforeEach(function() {
    storage = {
      getPermissions: function() {},
      getConfiguration: function() {
        return {
          superAdminId: superAdminId
        };
      }
    };

    passport = {
      authenticate: chai.spy(function(strategies, callback) {
        return function() {
          callback(null, expectedUser);
        };
      }),
      _strategies: {

      },
      _strategy: function(strategy) {

      }
    };

    mock(path.join(process.root, 'app/server/storage.js'), storage);
    mock('passport', passport);
  });

  // Initializes tests
  beforeEach(function() {
    var AuthenticationController = mock.reRequire(
      path.join(process.root, 'app/server/controllers/AuthenticationController.js')
    );
    request = {params: {}};
    response = {};
    authenticationController = new AuthenticationController();
  });

  afterEach(function() {
    mock.stopAll();
  });

  describe('authenticateInternalAction', function() {
    var expectedInternalStrategies;

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

      expectedInternalStrategies = ['strategy1', 'strategy2'];

      expectedInternalStrategies.forEach(function(expectedInternalStrategy) {
        passport._strategies[expectedInternalStrategy] = {
          internal: true
        };
      });
    });

    it('should authenticate using configured internal passport strategy', function() {
      expectedUser = {id: '42'};
      var next = chai.spy(function() {});

      response = {
        status: chai.spy(function(status) {
          assert.equal(status, 200, 'Wrong status');
          return response;
        }),
        send: chai.spy(function(user) {
          assert.strictEqual(user, expectedUser, 'Wrong user');
        })
      };

      passport.authenticate = chai.spy(function(strategies, callback) {
        assert.deepEqual(strategies, expectedInternalStrategies, 'Wrong strategies');
        return function() {
          callback(null, expectedUser);
        };
      });

      authenticationController.authenticateInternalAction(request, response, next);

      passport.authenticate.should.have.been.called.exactly(1);
      response.status.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should send an HTTP Unauthorized if internal strategies did not authenticate the user', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.BACK_END_AUTHENTICATION_FAILED);
      });

      passport.authenticate = chai.spy(function(strategies, callback) {
        return function() {
          callback();
        };
      });

      authenticationController.authenticateInternalAction(request, response, next);

      passport.authenticate.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.status.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP error message if an error occurred during authentication', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.BACK_END_AUTHENTICATION_ERROR);
      });

      passport.authenticate = chai.spy(function(strategies, callback) {
        return function() {
          callback(new Error('Something went wrong'));
        };
      });

      authenticationController.authenticateInternalAction(request, response, next);

      passport.authenticate.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.status.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP error message if request login failed', function() {
      expectedUser = {id: '42'};

      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.BACK_END_AUTHENTICATION_ERROR);
      });

      request.login = chai.spy(function(user, callback) {
        callback(new Error('Error'));
      });

      authenticationController.authenticateInternalAction(request, response, next);

      passport.authenticate.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      request.login.should.have.been.called.exactly(1);
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

  describe('authenticateExternalAction', function() {
    var expectedExternalStrategies;

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

      expectedExternalStrategies = ['strategy1', 'strategy2'];

      expectedExternalStrategies.forEach(function(expectedExternalStrategy) {
        passport._strategies[expectedExternalStrategy] = {
          internal: false
        };
      });
    });

    it('should be able to authenticate using configured external passport strategy', function() {
      expectedUser = {id: '42'};
      var next = chai.spy(function() {});

      passport.authenticate = chai.spy(function(strategy, callback) {
        assert.equal(strategy, request.params.type, 'Wrong strategy');
        return function() {
          callback(null, expectedUser);
        };
      });

      response = {
        redirect: chai.spy(function(location) {
          assert.equal(location, '/be', 'Wrong location');
          return response;
        })
      };

      authenticationController.authenticateExternalAction(request, response, next);

      passport.authenticate.should.have.been.called.exactly(1);
      response.redirect.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should send an HTTP bad request if type is not specified', function() {
      expectedUser = {id: '42'};
      request = {params: {}};

      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.AUTHENTICATE_EXTERNAL_WRONG_PARAMETERS);
      });

      authenticationController.authenticateExternalAction(request, response, next);

      next.should.have.been.called.exactly(1);
      response.redirect.should.have.been.called.exactly(0);
    });

    it('should send an HTTP Unauthorized if authentication failed', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.BACK_END_EXTERNAL_AUTHENTICATION_FAILED);
      });

      passport.authenticate = chai.spy(function(strategy, callback) {
        return function() {
          callback();
        };
      });

      authenticationController.authenticateExternalAction(request, response, next);

      passport.authenticate.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.redirect.should.have.been.called.exactly(0);
    });

    it('should send an HTTP error message if an error occurred during authentication', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.BACK_END_EXTERNAL_AUTHENTICATION_ERROR);
      });

      passport.authenticate = chai.spy(function(strategy, callback) {
        return function() {
          callback(new Error('Something went wrong'));
        };
      });

      authenticationController.authenticateExternalAction(request, response, next);

      passport.authenticate.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.redirect.should.have.been.called.exactly(0);
    });

    it('should send an HTTP error message if request login failed', function() {
      expectedUser = {id: '42'};

      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.BACK_END_EXTERNAL_AUTHENTICATION_ERROR);
      });

      request.login = chai.spy(function(user, callback) {
        callback(new Error('error'));
      });

      authenticationController.authenticateExternalAction(request, response, next);

      passport.authenticate.should.have.been.called.exactly(1);
      request.login.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.redirect.should.have.been.called.exactly(0);
    });

  });

  describe('logoutAction', function() {
    var Strategy;

    beforeEach(function() {
      request = {
        isAuthenticated: function() {
          return true;
        },
        user: {
          origin: 'origin'
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

      Strategy = function() {};
      Strategy.internal = true;

      passport._strategy = function(strategy) {
        return Strategy.prototype;
      };
    });

    it('should be able to logout the request and the internal user', function() {
      var next = chai.spy(function() {});

      response.status = function(status) {
        assert.equal(status, 200, 'Wrong status');
        return this;
      };

      passport._strategy = function(strategy) {
        assert.equal(strategy, request.user.origin, 'Wrong strategy');
        return Strategy.prototype;
      };

      authenticationController.logoutAction(request, response, next);

      request.logout.should.have.been.called.exactly(1);
      request.session.destroy.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should not do anything if user is not authenticated', function() {
      var next = chai.spy(function(error) {});

      request.isAuthenticated = chai.spy(function() {
        return false;
      });

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

      request.session.destroy = chai.spy(function(callback) {
        callback(new Error('Something went wrong'));
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

      Strategy.internal = false;
      Strategy.prototype.logout = chai.spy(function() {});

      authenticationController.logoutAction(request, response, next);

      request.session.destroy.should.have.been.called.exactly(1);
      Strategy.prototype.logout.should.have.been.called.exactly(1);
      request.logout.should.have.been.called.exactly(1);
      response.status.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
      next.should.have.been.called.exactly(0);
    });
  });

  describe('getPermissionsAction', function() {

    it('should send response with a list of permissions as a JSON object', function() {
      var expectedPermissions = [];
      var next = chai.spy(function() {});

      storage.getPermissions = function() {
        return expectedPermissions;
      };

      response.send = chai.spy(function(data) {
        assert.strictEqual(data.permissions, expectedPermissions, 'Wrong permissions');
      });

      authenticationController.getPermissionsAction(request, response, next);

      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

  });

  describe('restrictAction', function() {
    var expectedPermissions;

    beforeEach(function() {
      expectedPermissions = [
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

      storage.getPermissions = function() {
        return expectedPermissions;
      };

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
          id: superAdminId
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
