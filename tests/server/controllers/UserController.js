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
  var model;

  beforeEach(function() {
    model = {};
    request = {params: {}, query: {}};
    response = {};
    userController = new UserController();
    userController.getModel = function() {
      return model;
    };
  });

  // getEntitiesAction method
  describe('getEntitiesAction', function() {

    it('should send response with the paginated list of users', function(done) {
      var expectedEntities = [{id: '42'}];
      var expectedPagination = {page: 42, total: 60};

      model.getPaginatedFilteredEntities = function(filter, limit, page, sort, populate, callback) {
        assert.strictEqual(page, 1, 'Wrong default page');
        assert.strictEqual(sort['name'], -1, 'Wrong default sort');
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

      model.getPaginatedFilteredEntities = function(filter, limit, page, sort, populate, callback) {
        assert.equal(filter.$text.$search, '"' + expectedQuery + '"', 'Wrong query');
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

    it('should be able to ask for a specific page', function(done) {
      var expectedPage = 42;

      model.getPaginatedFilteredEntities = function(filter, limit, page, sort, populate, callback) {
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

    it('should be able to limit the number of results per page', function(done) {
      var expectedLimit = 42;

      model.getPaginatedFilteredEntities = function(filter, limit, page, sort, populate, callback) {
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

      model.getPaginatedFilteredEntities = function(filter, limit, page, sort, populate, callback) {
        assert.strictEqual(sort['name'], 1, 'Wrong sort order');
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

    it('should call next middleware with an error if limit parameter is under or equal to 0', function(done) {
      request.query = {limit: 0};
      userController.getEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_USERS_WRONG_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if page parameter is under or equal to 0', function(done) {
      request.query = {page: 0};
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

    it('should call next middleware with an error if getting the list of entities failed', function(done) {
      model.getPaginatedFilteredEntities = function(filter, limit, page, sort, populate, callback) {
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

      model.update = function(id, data, callback) {
        assert.deepEqual(data, expectedData, 'Wrong data');
        callback();
      };

      response.send = function(data) {
        assert.isNull(data.error, 'Wrong error');
        assert.strictEqual(data.status, 'ok', 'Wrong status');
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
      model.update = function(id, data, callback) {
        callback(new Error('Message'));
      };

      request.params.id = '42';
      request.body = {};
      userController.updateEntityAction(request, response, function(error) {
        assert.strictEqual(error, errors.UPDATE_USER_ERROR, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if user does not have permission to update', function(done) {
      model.update = function(id, data, callback) {
        callback(new openVeoApi.errors.AccessError('Message'));
      };

      request.params.id = '42';
      request.body = {};
      userController.updateEntityAction(request, response, function(error) {
        assert.strictEqual(error, errors.UPDATE_USER_FORBIDDEN, 'Wrong error');
        done();
      });
    });
  });

});
