'use strict';

var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var mock = require('mock-require');
var api = require('@openveo/api');

var assert = chai.assert;
chai.should();
chai.use(spies);

describe('UserProvider', function() {
  var EntityProvider;
  var UserProvider;
  var openVeoApi;
  var storage;
  var provider;
  var expectedUsers;
  var coreConf;
  var coreApi;
  var originalCoreApi;
  var expectedLocation = 'location';
  var NotFoundError = api.errors.NotFoundError;

  // Initiates mocks
  beforeEach(function() {
    storage = {};
    expectedUsers = [];

    EntityProvider = function() {
      this.storage = storage;
      this.location = expectedLocation;
    };
    EntityProvider.prototype.executeCallback = function() {
      var args = Array.prototype.slice.call(arguments);
      var callback = args.shift();
      if (callback) return callback.apply(null, args);
    };
    EntityProvider.prototype.getAll = function(filter, fields, sort, callback) {
      callback(null, []);
    };
    EntityProvider.prototype.add = function(resources, callback) {
      callback(null, expectedUsers.length, expectedUsers);
    };
    EntityProvider.prototype.getOne = function(filter, fields, callback) {
      callback(null, expectedUsers[0]);
    };
    EntityProvider.prototype.remove = chai.spy(function(filter, callback) {
      callback(null, expectedUsers.length);
    });
    EntityProvider.prototype.updateOne = chai.spy(function(filter, data, callback) {
      callback(null, 1);
    });

    openVeoApi = {
      providers: {
        EntityProvider: EntityProvider
      },
      storages: {
        ResourceFilter: api.storages.ResourceFilter
      },
      fileSystem: {
        getConfDir: function() {
          return '';
        }
      },
      passport: api.passport,
      util: api.util,
      errors: api.errors
    };

    coreApi = {
      getCoreApi: function() {
        return coreApi;
      },
      getHooks: function() {
        return {
          USERS_DELETED: 'users.deleted'
        };
      },
      executeHook: chai.spy(function(hook, data, callback) {
        callback(null);
      })
    };

    coreConf = {
      passwordHashKey: 'hashkey'
    };

    originalCoreApi = process.api;
    process.api = coreApi;
    mock('core/conf.json', coreConf);
    mock('@openveo/api', openVeoApi);
  });

  // Initiates tests
  beforeEach(function() {
    UserProvider = mock.reRequire(path.join(process.root, 'app/server/providers/UserProvider.js'));
    provider = new UserProvider(storage, expectedLocation);
  });

  // Stop mocks
  afterEach(function() {
    process.api = originalCoreApi;
    mock.stopAll();
  });

  describe('add', function() {

    it('should add a list of users with generated passwords', function(done) {
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com',
          password: 'password42',
          passwordValidate: 'password42',
          locked: true,
          roles: ['role42']
        },
        {
          id: '43',
          name: 'Name 43',
          email: 'email.43@domain.com',
          password: 'password43',
          passwordValidate: 'password43',
          locked: false,
          roles: ['role43']
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++) {
          assert.equal(resources[i].id, expectedUsers[i].id, 'Wrong id for user "' + i + '"');
          assert.equal(resources[i].name, expectedUsers[i].name, 'Wrong name for user "' + i + '"');
          assert.equal(resources[i].email, expectedUsers[i].email, 'Wrong email for user "' + i + '"');
          assert.equal(resources[i].locked, expectedUsers[i].locked, 'Wrong locked for user "' + i + '"');
          assert.equal(resources[i].origin, api.passport.STRATEGIES.LOCAL, 'Wrong origin for user "' + i + '"');
          assert.notEqual(resources[i].password, expectedUsers[i].password, 'Wrong password for user "' + i + '"');
          assert.isNotEmpty(resources[i].password, 'Expected a password for user "' + i + '"');
          assert.deepEqual(resources[i].roles, expectedUsers[i].roles, 'Wrong roles for user "' + i + '"');
        }

        callback(null, expectedUsers.length, expectedUsers);
      };

      provider.add(
        expectedUsers,
        function(error, total, users) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(total, expectedUsers.length, 'Wrong number of inserted users');
          assert.strictEqual(users, expectedUsers, 'Wrong users');
          done();
        }
      );
    });

    it('should initialize roles to an empty array if no role specified', function(done) {
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com',
          password: 'password42',
          passwordValidate: 'password42',
          locked: true
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++)
          assert.isArray(resources[i].roles, 'Expected empty roles for user "' + i + '"');

        callback(null, expectedUsers.length, expectedUsers);
      };

      provider.add(
        expectedUsers,
        function(error, total, tokens) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

    it('should initialize locked to false if not specified', function(done) {
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com',
          password: 'password42',
          passwordValidate: 'password42',
          roles: ['role42']
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++)
          assert.notOk(resources[i].locked, 'Unexpected lock on user "' + i + '"');

        callback(null, expectedUsers.length, expectedUsers);
      };

      provider.add(
        expectedUsers,
        function(error, total, tokens) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

    it('should generate an id if not specified', function(done) {
      expectedUsers = [
        {
          name: 'Name 42',
          email: 'email.42@domain.com',
          password: 'password42',
          passwordValidate: 'password42',
          roles: ['role42']
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++)
          assert.isNotEmpty(resources[i].id, 'Expected an id for user "' + i + '"');

        callback(null, expectedUsers.length, expectedUsers);
      };

      provider.add(
        expectedUsers,
        function(error, total, tokens) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

    it('should exclude user passwords from response', function(done) {
      expectedUsers = [
        {
          name: 'Name 42',
          email: 'email.42@domain.com',
          password: 'password42',
          passwordValidate: 'password42',
          roles: ['role42']
        }
      ];

      provider.add(
        expectedUsers,
        function(error, total, users) {
          assert.notProperty(users[0], 'password', 'Unexpected property "password"');
          done();
        }
      );
    });

    it('should execute callback with an error if name is not specified', function(done) {
      expectedUsers = [
        {
          email: 'email.42@domain.com',
          password: 'password42',
          passwordValidate: 'password42',
          roles: ['role42']
        }
      ];

      provider.add(
        expectedUsers,
        function(error, total, users) {
          assert.instanceOf(error, TypeError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if email is not specified', function(done) {
      expectedUsers = [
        {
          name: 'Name 42',
          password: 'password42',
          passwordValidate: 'password42',
          roles: ['role42']
        }
      ];

      provider.add(
        expectedUsers,
        function(error, total, users) {
          assert.instanceOf(error, TypeError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if password is not specified', function(done) {
      expectedUsers = [
        {
          name: 'Name 42',
          email: 'email.42@domain.com',
          passwordValidate: 'password42',
          roles: ['role42']
        }
      ];

      provider.add(
        expectedUsers,
        function(error, total, users) {
          assert.instanceOf(error, TypeError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if passwords do not match', function(done) {
      expectedUsers = [
        {
          name: 'Name 42',
          email: 'email.42@domain.com',
          password: 'password42',
          passwordValidate: 'doesNotMatch',
          roles: ['role42']
        }
      ];

      provider.add(
        expectedUsers,
        function(error, total, users) {
          assert.instanceOf(error, Error, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if email is not valid', function(done) {
      expectedUsers = [
        {
          name: 'Name 42',
          email: 'email.42',
          password: 'password42',
          passwordValidate: 'password42',
          roles: ['role42']
        }
      ];

      provider.add(
        expectedUsers,
        function(error, total, users) {
          assert.instanceOf(error, TypeError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if getting users failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedUsers = [
        {
          name: 'Name 42',
          email: 'email.42@domain.com',
          password: 'password42',
          passwordValidate: 'password42',
          roles: ['role42']
        }
      ];

      EntityProvider.prototype.getAll = function(filter, fields, sort, callback) {
        callback(expectedError);
      };

      provider.add(
        expectedUsers,
        function(error, total, users) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if email is already used', function(done) {
      expectedUsers = [
        {
          name: 'Name 42',
          email: 'email.42@domain.com',
          password: 'password42',
          passwordValidate: 'password42',
          roles: ['role42']
        }
      ];

      EntityProvider.prototype.getAll = function(filter, fields, sort, callback) {
        assert.deepEqual(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.IN, 'email').value,
          [expectedUsers[0].email],
          'Wrong email'
        );
        assert.deepEqual(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.EQUAL, 'origin').value,
          api.passport.STRATEGIES.LOCAL,
          'Wrong origin'
        );
        callback(null, expectedUsers);
      };

      provider.add(
        expectedUsers,
        function(error, total, users) {
          assert.instanceOf(error, Error, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if adding users failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedUsers = [
        {
          name: 'Name 42',
          email: 'email.42@domain.com',
          password: 'password42',
          passwordValidate: 'password42',
          roles: ['role42']
        }
      ];

      EntityProvider.prototype.add = function(users, callback) {
        callback(expectedError);
      };

      provider.add(
        expectedUsers,
        function(error, total, users) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

  });

  describe('getUserByCredentials', function() {

    it('should get a user by its credentials', function(done) {
      var expectedEmail = 'email.42@domain.com';
      var expectedPassword = 'password42';
      var expectedUser = {};

      EntityProvider.prototype.getOne = function(filter, fields, callback) {
        assert.equal(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.EQUAL, 'origin').value,
          api.passport.STRATEGIES.LOCAL,
          'Wrong origin'
        );
        assert.equal(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.EQUAL, 'email').value,
          expectedEmail,
          'Wrong email'
        );
        assert.isNotEmpty(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.EQUAL, 'password').value,
          'Expected a password'
        );
        assert.notEqual(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.EQUAL, 'password').value,
          expectedPassword,
          'Wrong password'
        );
        callback(null, expectedUser);
      };

      provider.getUserByCredentials(
        expectedEmail,
        expectedPassword,
        function(error, user) {
          assert.isNull(error, 'Unexpected error');
          assert.strictEqual(user, expectedUser, 'Wrong user');
          done();
        }
      );
    });

    it('should exclude "password" field from response', function(done) {
      var expectedUser = {
        password: 'password42'
      };

      EntityProvider.prototype.getOne = function(filter, fields, callback) {
        assert.include(fields.exclude, 'password', 'Expected "password" to be excluded');
        callback(null, expectedUser);
      };

      provider.getUserByCredentials(
        'email.42@domain.com',
        'password42',
        function(error, user) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

  });

  describe('getUserByEmail', function() {

    it('Get a user by its email', function(done) {
      var expectedUser = {};
      var expectedEmail = 'email.42@domain.com';

      EntityProvider.prototype.getOne = function(filter, fields, callback) {
        assert.equal(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.EQUAL, 'origin').value,
          api.passport.STRATEGIES.LOCAL,
          'Wrong origin'
        );
        assert.equal(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.EQUAL, 'email').value,
          expectedEmail,
          'Wrong email'
        );
        callback(null, expectedUser);
      };

      provider.getUserByEmail(
        expectedEmail,
        function(error, user) {
          assert.isNull(error, 'Unexpected error');
          assert.strictEqual(user, expectedUser, 'Wrong user');
          done();
        }
      );
    });

    it('should exclude "password" field from response', function(done) {
      var expectedUser = {
        password: 'password42'
      };

      EntityProvider.prototype.getOne = function(filter, fields, callback) {
        assert.include(fields.exclude, 'password', 'Expected "password" to be excluded');
        callback(null, expectedUser);
      };

      provider.getUserByEmail(
        'email.42@domain.com',
        function(error, user) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

  });

  describe('updateOne', function() {

    beforeEach(function() {
      provider.getUserByEmail = function(email, callback) {
        callback(null, expectedUsers[0]);
      };
    });

    it('should update a user', function(done) {
      var expectedFilter = new api.storages.ResourceFilter();
      var expectedTotal = 1;
      var expectedModifications = {
        password: 'password43',
        passwordValidate: 'password43',
        email: 'email.43@domain.com',
        roles: ['role43']
      };
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.getOne = function(filter, fields, callback) {
        assert.equal(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.EQUAL, 'origin').value,
          api.passport.STRATEGIES.LOCAL,
          'Wrong origin'
        );
        callback(null, expectedUsers[0]);
      };

      provider.getUserByEmail = function(email, callback) {
        assert.equal(email, expectedModifications.email, 'Wrong email');
        callback(null, expectedUsers[0]);
      };

      EntityProvider.prototype.updateOne = function(filter, data, callback) {
        assert.equal(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.EQUAL, 'origin').value,
          api.passport.STRATEGIES.LOCAL,
          'Wrong origin'
        );
        assert.equal(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.EQUAL, 'id').value,
          expectedUsers[0].id,
          'Wrong id'
        );
        assert.isNotEmpty(data.password, 'Expected a password');
        assert.notEqual(data.password, expectedModifications.password, 'Wrong password');
        assert.equal(data.email, expectedModifications.email, 'Wrong email');
        assert.deepEqual(data.roles, expectedModifications.roles, 'Wrong roles');
        callback(null, expectedTotal);
      };

      provider.updateOne(
        expectedFilter,
        expectedModifications,
        function(error, total) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(total, expectedTotal, 'Wrong total');
          done();
        }
      );
    });

    it('should update only email, password, roles and locked', function(done) {
      var expectedTotal = 1;
      var expectedModifications = {
        id: '43',
        unexpectedProperty: 'Unexpected property value'
      };
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.updateOne = function(filter, data, callback) {
        assert.notProperty(data, 'id', 'Unexpected property "id"');
        assert.notProperty(data, 'unexpectedProperty', 'Unexpected property "unexpectedProperty"');
        callback(null, expectedTotal);
      };

      provider.updateOne(
        null,
        expectedModifications,
        function(error, total) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

    it('should execute callback with an error if passwords do not match', function(done) {
      var expectedModifications = {
        password: 'password43',
        passwordValidate: 'does not match'
      };
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.updateOne = function(filter, data, callback) {
        assert.ok(false, 'Unexpected update');
      };

      provider.updateOne(
        null,
        expectedModifications,
        function(error, total) {
          assert.instanceOf(error, Error, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if email is not valid', function(done) {
      var expectedModifications = {
        email: 'wrong.email'
      };
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.updateOne = function(filter, data, callback) {
        assert.ok(false, 'Unexpected update');
      };

      provider.updateOne(
        null,
        expectedModifications,
        function(error, total) {
          assert.instanceOf(error, TypeError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if user does not exist', function(done) {
      var expectedError = new Error('Something went wrong');
      var expectedModifications = {
        name: 'New name'
      };
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.getOne = function(filter, fields, callback) {
        callback(expectedError);
      };

      EntityProvider.prototype.updateOne = function(filter, data, callback) {
        assert.ok(false, 'Unexpected update');
      };

      provider.updateOne(
        null,
        expectedModifications,
        function(error, total) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if trying to use an email already attributed', function(done) {
      var expectedModifications = {
        email: 'email.43@domain.com'
      };
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        },
        {
          id: '43',
          name: 'Name 43',
          email: expectedModifications.email
        }
      ];

      provider.getUserByEmail = function(email, callback) {
        callback(null, expectedUsers[1]);
      };

      EntityProvider.prototype.updateOne = function(filter, data, callback) {
        assert.ok(false, 'Unexpected update');
      };

      provider.updateOne(
        null,
        expectedModifications,
        function(error, total) {
          assert.instanceOf(error, Error, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if finding user by email failed', function(done) {
      var expectedError = new Error('Something went wrong');
      var expectedModifications = {
        email: 'email.43@domain.com'
      };
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      provider.getUserByEmail = function(email, callback) {
        callback(expectedError);
      };

      EntityProvider.prototype.updateOne = function(filter, data, callback) {
        assert.ok(false, 'Unexpected update');
      };

      provider.updateOne(
        null,
        expectedModifications,
        function(error, total) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if updating user failed', function(done) {
      var expectedError = new Error('Something went wrong');
      var expectedModifications = {
        name: 'New name'
      };
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.updateOne = function(filter, data, callback) {
        callback(expectedError);
      };

      provider.updateOne(
        null,
        expectedModifications,
        function(error, total) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if user if not found', function(done) {
      var expectedModifications = {
        name: 'New name'
      };

      provider.updateOne(null, expectedModifications, function(error, total) {
        assert.instanceOf(error, NotFoundError, 'Wrong error');
        EntityProvider.prototype.updateOne.should.have.been.called.exactly(0);
        done();
      });
    });

  });

  describe('remove', function() {

    it('should remove users', function() {
      var expectedFilter = new api.storages.ResourceFilter();
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        },
        {
          id: '43',
          name: 'Name 43',
          email: 'email.43@domain.com'
        }
      ];

      EntityProvider.prototype.getAll = function(filter, fields, sort, callback) {
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        callback(null, expectedUsers);
      };

      EntityProvider.prototype.remove = function(filter, callback) {
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        callback(null, expectedUsers.length);
      };

      provider.remove(
        expectedFilter,
        function(error, total) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(total, expectedUsers.length, 'Wrong total');
        }
      );
    });

    it('should execute hook USERS_DELETED', function() {
      var expectedFilter = new api.storages.ResourceFilter();
      var expectedIds = ['42', '43'];
      expectedUsers = [];

      expectedIds.forEach(function(expectedId) {
        expectedUsers.push(
          {
            id: expectedId,
            name: 'Name ' + expectedId,
            email: 'email.' + expectedId + '@domain.com'
          }
        );
      });

      EntityProvider.prototype.getAll = function(filter, fields, sort, callback) {
        callback(null, expectedUsers);
      };

      coreApi.executeHook = function(hook, data, callback) {
        assert.equal(hook, coreApi.getHooks().USERS_DELETED, 'Wrong hook');
        assert.deepEqual(data, expectedIds, 'Wrong user ids');
        callback(null);
      };

      provider.remove(
        expectedFilter,
        function(error, total) {
          assert.isNull(error, 'Unexpected error');
        }
      );
    });

    it('should execute callback with an error if getting users failed', function() {
      var expectedError = new Error('Something went wrong');
      var expectedFilter = new api.storages.ResourceFilter();
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.getAll = function(filter, fields, sort, callback) {
        callback(expectedError);
      };

      EntityProvider.prototype.remove = function(filter, callback) {
        assert.ok(false, 'Unexpected remove');
      };

      provider.remove(
        expectedFilter,
        function(error, total) {
          assert.strictEqual(error, expectedError, 'Unexpected error');
        }
      );
    });

    it('should execute callback with an error if removing users failed', function() {
      var expectedError = new Error('Something went wrong');
      var expectedFilter = new api.storages.ResourceFilter();
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.getAll = function(filter, fields, sort, callback) {
        callback(null, expectedUsers);
      };

      EntityProvider.prototype.remove = function(filter, callback) {
        callback(expectedError);
      };

      provider.remove(
        expectedFilter,
        function(error, total) {
          assert.strictEqual(error, expectedError, 'Unexpected error');
        }
      );
    });

    it('should execute callback if executing hook failed', function() {
      var expectedError = new Error('Something went wrong');
      var expectedFilter = new api.storages.ResourceFilter();
      expectedUsers = [
        {
          id: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.getAll = function(filter, fields, sort, callback) {
        callback(null, expectedUsers);
      };

      coreApi.executeHook = function(hook, data, callback) {
        callback(expectedError);
      };

      provider.remove(
        expectedFilter,
        function(error, total) {
          assert.strictEqual(error, expectedError, 'Unexpected error');
        }
      );
    });

    it('should execute callback without doing anything if no user found', function(done) {
      provider.remove(
        new api.storages.ResourceFilter(),
        function(error, total) {
          assert.isUndefined(error, 'Unexpected error');
          coreApi.executeHook.should.have.been.called.exactly(0);
          EntityProvider.prototype.remove.should.have.been.called.exactly(0);
          done();
        }
      );
    });

  });

  describe('addThirdPartyUsers', function() {

    it('should add external users', function() {
      expectedUsers = [
        {
          id: '42',
          origin: api.passport.STRATEGIES.LDAP,
          originId: '42',
          name: 'Name 42',
          email: 'email.42@domain.com',
          originGroups: ['group42'],
          roles: ['role42']
        },
        {
          id: '43',
          origin: api.passport.STRATEGIES.CAS,
          originId: '43',
          name: 'Name 43',
          email: 'email.43@domain.com',
          originGroups: ['group43'],
          roles: ['role43']
        }
      ];

      EntityProvider.prototype.add = function(users, callback) {
        for (var i = 0; i < users.length; i++) {
          assert.equal(users[i].id, expectedUsers[i].id, 'Wrong id for user "' + i + '"');
          assert.equal(users[i].name, expectedUsers[i].name, 'Wrong name for user "' + i + '"');
          assert.equal(users[i].origin, expectedUsers[i].origin, 'Wrong origin for user "' + i + '"');
          assert.equal(users[i].originId, expectedUsers[i].originId, 'Wrong originId for user "' + i + '"');
          assert.equal(users[i].email, expectedUsers[i].email, 'Wrong email for user "' + i + '"');
          assert.deepEqual(users[i].originGroups, expectedUsers[i].originGroups, 'Wrong groups for user "' + i + '"');
          assert.deepEqual(users[i].roles, expectedUsers[i].roles, 'Wrong roles for user "' + i + '"');
          assert.ok(users[i].locked, 'Expected user "' + i + '" to be locked');
        }
        callback(null, expectedUsers.length, expectedUsers);
      };

      provider.addThirdPartyUsers(
        expectedUsers,
        function(error, total, users) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(total, expectedUsers.length, 'Wrong total');
          assert.equal(users, expectedUsers, 'Wrong users');
        }
      );
    });

    it('should generate an id if user id is not specified', function() {
      expectedUsers = [
        {
          origin: api.passport.STRATEGIES.LDAP,
          originId: '42',
          name: 'Name 42',
          email: 'email.42@domain.com',
          originGroups: ['group42'],
          roles: ['role42']
        }
      ];

      EntityProvider.prototype.add = function(users, callback) {
        assert.isNotEmpty(users[0].id, 'Expected user id to be generated');
        callback(null, expectedUsers.length, expectedUsers);
      };

      provider.addThirdPartyUsers(
        expectedUsers,
        function(error, total, users) {
          assert.isNull(error, 'Unexpected error');
        }
      );
    });

    it('should initialize originGroups to an empty array if not specified', function() {
      expectedUsers = [
        {
          origin: api.passport.STRATEGIES.LDAP,
          originId: '42',
          name: 'Name 42',
          email: 'email.42@domain.com',
          roles: ['role42']
        }
      ];

      EntityProvider.prototype.add = function(users, callback) {
        assert.isArray(users[0].originGroups, 'Expected originGroups to be an array');
        assert.isEmpty(users[0].originGroups, 'Wrong originGroups');
        callback(null, expectedUsers.length, expectedUsers);
      };

      provider.addThirdPartyUsers(
        expectedUsers,
        function(error, total, users) {
          assert.isNull(error, 'Unexpected error');
        }
      );
    });

    it('should initialize roles to an empty array if not specified', function() {
      expectedUsers = [
        {
          origin: api.passport.STRATEGIES.LDAP,
          originId: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.add = function(users, callback) {
        assert.isArray(users[0].roles, 'Expected roles to be an array');
        assert.isEmpty(users[0].roles, 'Wrong roles');
        callback(null, expectedUsers.length, expectedUsers);
      };

      provider.addThirdPartyUsers(
        expectedUsers,
        function(error, total, users) {
          assert.isNull(error, 'Unexpected error');
        }
      );
    });

    it('should execute callback with an error if origin is not specified', function() {
      expectedUsers = [
        {
          originId: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.add = function(users, callback) {
        assert.ok(false, 'Unexpected add');
      };

      provider.addThirdPartyUsers(
        expectedUsers,
        function(error, total, users) {
          assert.instanceOf(error, TypeError, 'Wrong error');
        }
      );
    });

    it('should execute callback with an error if originId is not specified', function() {
      expectedUsers = [
        {
          origin: api.passport.STRATEGIES.LDAP,
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.add = function(users, callback) {
        assert.ok(false, 'Unexpected add');
      };

      provider.addThirdPartyUsers(
        expectedUsers,
        function(error, total, users) {
          assert.instanceOf(error, TypeError, 'Wrong error');
        }
      );
    });

    it('should execute callback with an error if name is not specified', function() {
      expectedUsers = [
        {
          origin: api.passport.STRATEGIES.LDAP,
          originId: '42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.add = function(users, callback) {
        assert.ok(false, 'Unexpected add');
      };

      provider.addThirdPartyUsers(
        expectedUsers,
        function(error, total, users) {
          assert.instanceOf(error, TypeError, 'Wrong error');
        }
      );
    });

    it('should execute callback with an error if email is not specified', function() {
      expectedUsers = [
        {
          origin: api.passport.STRATEGIES.LDAP,
          originId: '42',
          name: 'Name 42'
        }
      ];

      EntityProvider.prototype.add = function(users, callback) {
        assert.ok(false, 'Unexpected add');
      };

      provider.addThirdPartyUsers(
        expectedUsers,
        function(error, total, users) {
          assert.instanceOf(error, TypeError, 'Wrong error');
        }
      );
    });

    it('should execute callback with an error if origin is local', function() {
      expectedUsers = [
        {
          origin: api.passport.STRATEGIES.LOCAL,
          originId: '42',
          name: 'Name 42',
          email: 'email.42@domain.com'
        }
      ];

      EntityProvider.prototype.add = function(users, callback) {
        assert.ok(false, 'Unexpected add');
      };

      provider.addThirdPartyUsers(
        expectedUsers,
        function(error, total, users) {
          assert.instanceOf(error, Error, 'Wrong error');
        }
      );
    });

  });

  describe('updateThirdPartyUser', function() {

    it('should update an external user', function(done) {
      var expectedFilter = api.storages.ResourceFilter();
      var expectedOrigin = api.passport.STRATEGIES.CAS;
      var expectedTotal = 1;
      var expectedModifications = {
        name: 'Name 42',
        email: 'email.42@domain.com',
        originGroups: ['group42'],
        roles: ['role42']
      };

      storage.updateOne = function(location, filter, modifications, callback) {
        assert.equal(location, expectedLocation, 'Wrong location');
        assert.equal(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.EQUAL, 'origin').value,
          expectedOrigin,
          'Wrong origin'
        );
        assert.equal(modifications.name, expectedModifications.name, 'Wrong name');
        assert.equal(modifications.email, expectedModifications.email, 'Wrong email');
        assert.equal(modifications.originGroups, expectedModifications.originGroups, 'Wrong originGroups');
        assert.equal(modifications.roles, expectedModifications.roles, 'Wrong roles');
        callback(null, expectedTotal);
      };

      provider.updateThirdPartyUser(
        expectedFilter,
        expectedModifications,
        expectedOrigin,
        function(error, total) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(total, expectedTotal, 'Wrong total');
          done();
        }
      );
    });

    it('should update only name, email, originGroups and roles', function(done) {
      var expectedFilter = new api.storages.ResourceFilter();
      var expectedModifications = {
        id: '42',
        origin: api.passport.STRATEGIES.LDAP,
        unexpectedProperty: 'Unexpected property value'
      };

      storage.updateOne = function(location, filter, modifications, callback) {
        assert.notProperty(modifications, 'id', 'Unexpected property "id"');
        assert.notProperty(modifications, 'origin', 'Unexpected property "origin"');
        assert.notProperty(modifications, 'unexpectedProperty', 'Unexpected property "unexpectedProperty"');
        callback(null, 1);
      };

      provider.updateThirdPartyUser(
        expectedFilter,
        expectedModifications,
        api.passport.STRATEGIES.CAS,
        function(error, total) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

    it('should execute callback with an error if origin is local', function(done) {
      var expectedFilter = new api.storages.ResourceFilter();
      var expectedModifications = {
        name: 'New name'
      };

      storage.updateOne = function(location, filter, modifications, callback) {
        callback(null, 1);
      };

      provider.updateThirdPartyUser(
        expectedFilter,
        expectedModifications,
        api.passport.STRATEGIES.LOCAL,
        function(error, total) {
          assert.instanceOf(error, Error, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if update failed', function(done) {
      var expectedFilter = new api.storages.ResourceFilter();
      var expectedError = new Error('Something went wrong');
      var expectedModifications = {
        name: 'New name'
      };

      storage.updateOne = function(location, filter, modifications, callback) {
        callback(expectedError);
      };

      provider.updateThirdPartyUser(
        expectedFilter,
        expectedModifications,
        api.passport.STRATEGIES.CAS,
        function(error, total) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

  });

});
