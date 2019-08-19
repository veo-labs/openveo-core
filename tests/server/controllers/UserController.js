'use strict';

var chai = require('chai');
var spies = require('chai-spies');
var openVeoApi = require('@openveo/api');
var UserController = process.require('app/server/controllers/UserController.js');
var errors = process.require('app/server/httpErrors.js');

var assert = chai.assert;
chai.should();
chai.use(spies);

// UserController.js
describe('UserController', function() {
  var request;
  var response;
  var userController;
  var provider;

  beforeEach(function() {
    provider = {};
    request = {params: {}, query: {}};
    response = {
      send: chai.spy(function() {})
    };
    userController = new UserController();
    userController.getProvider = function() {
      return provider;
    };
  });

  // getEntitiesAction method
  describe('getEntitiesAction', function() {

    it('should send response with the paginated list of users', function(done) {
      var expectedEntities = [{id: '42'}];
      var expectedPagination = {page: 42, total: 60};

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.strictEqual(page, 0, 'Wrong default page');
        assert.strictEqual(sort['name'], 'desc', 'Wrong default sort');
        callback(null, expectedEntities, expectedPagination);
      };

      response.send = function(data) {
        assert.deepEqual(data.entities, expectedEntities, 'Wrong entities');
        assert.strictEqual(data.pagination, expectedPagination, 'Wrong pagination');
        done();
      };

      userController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should be able to search by query', function(done) {
      var expectedQuery = '42';

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(
          filter.getComparisonOperation(openVeoApi.storages.ResourceFilter.OPERATORS.SEARCH).value,
          '"' + expectedQuery + '"',
          'Wrong query'
        );
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {query: expectedQuery};
      userController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should be able to deactivate the smart search', function(done) {
      var expectedQuery = '42';

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(
          filter.getComparisonOperation(openVeoApi.storages.ResourceFilter.OPERATORS.REGEX, 'name').value,
          '/' + expectedQuery + '/i',
          'Wrong operation on "name"'
        );
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {query: expectedQuery, useSmartSearch: 0};
      userController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should be able to ask for a specific page', function(done) {
      var expectedPage = 42;

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.strictEqual(page, expectedPage, 'Wrong page');
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {page: expectedPage};
      userController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should be able to include / exclude certain fields from results', function(done) {
      var expectedInclude = ['field1', 'field2'];
      var expectedExclude = ['field3', 'field4'];

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.includeMembers(fields.include, expectedInclude, 'Wrong include');
        assert.includeMembers(fields.exclude, expectedExclude, 'Wrong exclude');
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {
        include: expectedInclude,
        exclude: expectedExclude
      };
      userController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should remove "password" field if included', function(done) {
      var expectedInclude = ['field1', 'field2', 'password'];

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.notInclude(fields.include, 'password', 'Unexpected "password" field');
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {
        include: expectedInclude
      };
      userController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should add "password" field to excluded fields', function(done) {
      var expectedExclude = ['field1', 'field2'];

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.include(fields.exclude, 'password', 'Expected "password" field to be excluded');
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {
        exclude: expectedExclude
      };
      userController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should exclude "password" field', function(done) {
      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.include(fields.exclude, 'password', 'Expected "password" field to be excluded');
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {};
      userController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should be able to limit the number of results per page', function(done) {
      var expectedLimit = 42;

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.strictEqual(limit, expectedLimit, 'Wrong limit');
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {limit: expectedLimit};
      userController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should be able to sort results by name in ascending order', function(done) {
      var expectedSort = 'asc';

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.strictEqual(sort['name'], 'asc', 'Wrong sort order');
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {sortOrder: expectedSort};
      userController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should be able to filter by origin', function() {
      var expectedOrigin = openVeoApi.passport.STRATEGIES.CAS;
      var next = chai.spy(function() {});

      provider.get = chai.spy(function(filter, fields, limit, page, sort, callback) {
        assert.equal(
          filter.getComparisonOperation(openVeoApi.storages.ResourceFilter.OPERATORS.EQUAL, 'origin').value,
          expectedOrigin,
          'Wrong origin'
        );
        callback();
      });

      request.query = {origin: expectedOrigin};
      userController.getEntitiesAction(request, response, next);

      provider.get.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should be able to filter by email', function() {
      var expectedEmails = ['email@veo-labs.com'];
      var next = chai.spy(function() {});

      provider.get = chai.spy(function(filter, fields, limit, page, sort, callback) {
        assert.deepEqual(
          filter.getComparisonOperation(openVeoApi.storages.ResourceFilter.OPERATORS.IN, 'email').value,
          expectedEmails,
          'Wrong emails'
        );
        callback();
      });

      request.query = {email: expectedEmails};
      userController.getEntitiesAction(request, response, next);

      provider.get.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should call next middleware with an error if limit parameter is under or equal to 0', function(done) {
      request.query = {limit: 0};
      userController.getEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_USERS_WRONG_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if page parameter is under 0', function(done) {
      request.query = {page: -1};
      userController.getEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_USERS_WRONG_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if sortBy parameter is not "name"', function(done) {
      request.query = {sortBy: 'wrong sort property'};
      userController.getEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_USERS_WRONG_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if sortOrder parameter is not "asc" or "desc"', function(done) {
      request.query = {sortOrder: 'wrong sort order'};
      userController.getEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_USERS_WRONG_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if origin parameter is not in available strategies', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.GET_USERS_WRONG_PARAMETERS, 'Wrong error');
      });

      request.query = {origin: 'unknown strategy'};
      userController.getEntitiesAction(request, response, next);

      next.should.have.been.called.exactly(1);
    });

    it('should call next middleware with an error if getting the list of entities failed', function(done) {
      provider.get = function(filter, fields, limit, page, sort, callback) {
        callback(new Error('message'));
      };

      userController.getEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_USERS_ERROR, 'Wrong error');
        done();
      });
    });
  });

  // updateEntityAction method
  describe('updateEntityAction', function() {

    it('should update information about a user and send response with status', function(done) {
      var expectedId = '42';
      var expectedData = {
        name: 'name',
        email: '42@email.com',
        password: 'password',
        passwordValidate: 'password',
        roles: ['role1']
      };

      provider.updateOne = function(filter, data, callback) {
        assert.deepEqual(data, expectedData, 'Wrong data');
        callback(null, 1);
      };

      response.send = function(data) {
        assert.equal(data.total, 1, 'Wrong total');
        done();
      };

      request.params.id = expectedId;
      request.body = expectedData;
      userController.updateEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should call next middleware with an error if id is not specified', function(done) {
      request.body = {};
      userController.updateEntityAction(request, response, function(error) {
        assert.strictEqual(error, errors.UPDATE_USER_MISSING_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if data is not specified', function(done) {
      request.params.id = '42';
      userController.updateEntityAction(request, response, function(error) {
        assert.strictEqual(error, errors.UPDATE_USER_MISSING_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if something went wrong while updating', function(done) {
      provider.updateOne = function(filter, data, callback) {
        callback(new Error('Message'));
      };

      request.params.id = '42';
      request.body = {};
      userController.updateEntityAction(request, response, function(error) {
        assert.strictEqual(error, errors.UPDATE_USER_ERROR, 'Wrong error');
        done();
      });
    });

  });

});
