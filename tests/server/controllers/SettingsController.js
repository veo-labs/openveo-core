'use strict';

var chai = require('chai');
var spies = require('chai-spies');
var SettingsController = process.require('app/server/controllers/SettingsController.js');
var errors = process.require('app/server/httpErrors.js');

var assert = chai.assert;
chai.should();
chai.use(spies);

// SettingsController.js
describe('SettingsController', function() {
  var request;
  var response;
  var model;
  var settingsController;

  beforeEach(function() {
    model = {};
    request = {params: {}, query: {}};
    response = {
      send: chai.spy(function() {})
    };
    settingsController = new SettingsController();
    settingsController.getModel = function() {
      return model;
    };
  });

  // getEntityAction method
  describe('getEntityAction', function() {

    it('should send the entity returned by the model', function() {
      var expectedEntity = {};
      var next = chai.spy(function() {});
      var response = {
        send: chai.spy(function(entity) {
          assert.strictEqual(entity.entity, expectedEntity, 'Expected entity');
        })
      };

      model.getOne = chai.spy(function(id, filter, callback) {
        callback(null, expectedEntity);
      });

      settingsController.getEntityAction({params: {id: 42}}, response, next);

      model.getOne.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should send an HTTP server error if model return an error', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.GET_SETTING_ERROR);
      });

      model.getOne = chai.spy(function(id, filter, callback) {
        callback(new Error('Error'));
      });

      settingsController.getEntityAction({params: {id: 1}}, response, next);

      model.getOne.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP bad request error if id is not specified', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.GET_SETTING_MISSING_PARAMETERS);
      });

      model.getOne = chai.spy(function(id, filter, callback) {
        callback();
      });

      settingsController.getEntityAction({params: {}}, response, next);

      next.should.have.been.called.exactly(1);
      model.getOne.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send null if entity is not found', function() {
      var next = chai.spy(function() {});

      model.getOne = chai.spy(function(id, filter, callback) {
        callback();
      });

      response.send = chai.spy(function(entity) {
        assert.isNull(entity.entity, 'Expected entity to be null');
      });

      settingsController.getEntityAction({params: {id: 1}}, response, next);

      response.send.should.have.been.called.exactly(1);
      model.getOne.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

  });

  // getEntitiesAction method
  describe('getEntitiesAction', function() {

    it('should send response with the paginated list of entities', function() {
      var expectedEntities = [{id: '42'}];
      var expectedPagination = {page: 42, total: 60};
      var next = chai.spy(function() {});

      model.getPaginatedFilteredEntities = chai.spy(function(filter, limit, page, sort, populate, callback) {
        assert.isUndefined(filter['id'], 0, 'Wrong default page');
        assert.strictEqual(page, 0, 'Wrong page');
        assert.isUndefined(limit, 0, 'Wrong limit');
        callback(null, expectedEntities, expectedPagination);
      });

      response.send = chai.spy(function(data) {
        assert.deepEqual(data.entities, expectedEntities, 'Wrong entities');
        assert.strictEqual(data.pagination, expectedPagination, 'Wrong pagination');
      });

      settingsController.getEntitiesAction(request, response, next);

      model.getPaginatedFilteredEntities.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should be able to ask for a specific page', function() {
      var expectedPage = 42;
      var next = chai.spy(function() {});

      model.getPaginatedFilteredEntities = chai.spy(function(filter, limit, page, sort, populate, callback) {
        assert.strictEqual(page, expectedPage, 'Wrong page');
        callback();
      });

      request.query = {page: expectedPage};
      settingsController.getEntitiesAction(request, response, next);

      model.getPaginatedFilteredEntities.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should be able to limit the number of results per page', function() {
      var expectedLimit = 42;
      var next = chai.spy(function() {});

      model.getPaginatedFilteredEntities = chai.spy(function(filter, limit, page, sort, populate, callback) {
        assert.strictEqual(limit, expectedLimit, 'Wrong limit');
        callback();
      });

      request.query = {limit: expectedLimit};
      settingsController.getEntitiesAction(request, response, next);

      model.getPaginatedFilteredEntities.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should be able to filter entities by ids', function() {
      var expectedIds = ['42', '43'];
      var next = chai.spy(function() {});

      model.getPaginatedFilteredEntities = chai.spy(function(filter, limit, page, sort, populate, callback) {
        assert.sameMembers(filter['id'].$in, expectedIds, 'Wrong ids');
        callback();
      });

      request.query = {ids: expectedIds};
      settingsController.getEntitiesAction(request, response, next);

      model.getPaginatedFilteredEntities.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should call next middleware with an error if limit parameter is under or equal to 0', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.GET_SETTINGS_WRONG_PARAMETERS, 'Wrong error');
      });

      model.getPaginatedFilteredEntities = chai.spy(function(filter, limit, page, sort, populate, callback) {
        callback();
      });

      request.query = {limit: 0};
      settingsController.getEntitiesAction(request, response, next);

      next.should.have.been.called.exactly(1);
      model.getPaginatedFilteredEntities.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });

    it('should call next middleware with an error if page parameter is under 0', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.GET_SETTINGS_WRONG_PARAMETERS, 'Wrong error');
      });

      model.getPaginatedFilteredEntities = chai.spy(function(filter, limit, page, sort, populate, callback) {
        callback();
      });

      request.query = {page: -1};
      settingsController.getEntitiesAction(request, response, next);

      next.should.have.been.called.exactly(1);
      model.getPaginatedFilteredEntities.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });

    it('should call next middleware with an error if getting the list of entities failed', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.GET_SETTINGS_ERROR, 'Wrong error');
      });

      model.getPaginatedFilteredEntities = chai.spy(function(filter, limit, page, sort, populate, callback) {
        callback(new Error('message'));
      });

      settingsController.getEntitiesAction(request, response, next);

      model.getPaginatedFilteredEntities.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(0);
    });
  });


  // updateEntityAction method
  describe('updateEntityAction', function() {

    it('should send a status "ok" if entity has been updated', function() {
      var next = chai.spy(function() {});
      var expectedId = '42';
      var expectedValue = 'value';

      model.update = chai.spy(function(id, data, callback) {
        assert.equal(id, expectedId, 'Wrong id');
        assert.equal(data.value, expectedValue, 'Wrong value');
        callback(null, 1);
      });

      response.send = chai.spy(function(res) {
        assert.equal(res.status, 'ok');
      });

      settingsController.updateEntityAction({
        params: {
          id: expectedId
        },
        body: {
          value: expectedValue
        }
      }, response, next);

      model.update.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should send an HTTP server error if model return an error', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.UPDATE_SETTINGS_ERROR);
      });

      model.update = chai.spy(function(id, data, callback) {
        callback(new Error('Error'));
      });

      settingsController.updateEntityAction({
        params: {
          id: 1
        },
        body: {
          value: 'value'
        }
      }, response, next);

      model.update.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP missing parameter error if id is not specified', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.UPDATE_SETTINGS_MISSING_PARAMETERS);
      });

      model.update = chai.spy(function(id, data, callback) {
        callback();
      });

      settingsController.updateEntityAction({params: {}, body: {value: '42'}}, response, next);

      next.should.have.been.called.exactly(1);
      model.update.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP missing parameter error if value is not specified', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.UPDATE_SETTINGS_MISSING_PARAMETERS);
      });

      model.update = chai.spy(function(id, data, callback) {
        callback();
      });

      settingsController.updateEntityAction({params: {id: '42'}, body: {}}, response, next);

      next.should.have.been.called.exactly(1);
      model.update.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });

  });

  // addEntityAction method
  describe('addEntityAction', function() {

    it('should send back the entity when added', function() {
      var expectedId = '42';
      var expectedValue = 'value';
      var expectedEntity = {
        id: expectedId,
        value: expectedValue
      };
      var next = chai.spy(function() {});

      model.add = chai.spy(function(data, callback) {
        assert.equal(data.id, expectedId, 'Wrong id');
        assert.equal(data.value, expectedValue, 'Wrong value');
        callback(null, 1, expectedEntity);
      });

      response.send = chai.spy(function(entity) {
        assert.strictEqual(entity.entity, expectedEntity, 'Wrong entity');
      });

      settingsController.addEntityAction({body: expectedEntity}, response, next);

      model.add.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should send an HTTP server error if model return an error', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.ADD_SETTINGS_ERROR);
      });

      model.add = chai.spy(function(data, callback) {
        callback(new Error('Error'));
      });

      settingsController.addEntityAction({body: {id: '42', value: 'value'}}, response, next);

      model.add.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP missing parameter error if id is not specified', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.ADD_SETTINGS_MISSING_PARAMETERS);
      });

      model.add = chai.spy(function(data, callback) {
        callback();
      });

      settingsController.addEntityAction({body: {value: 'value'}}, response, next);

      next.should.have.been.called.exactly(1);
      model.add.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP missing parameter error if value is not a string', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.ADD_SETTINGS_MISSING_PARAMETERS);
      });

      model.add = chai.spy(function(data, callback) {
        callback();
      });

      settingsController.addEntityAction({body: {id: '42'}}, response, next);

      next.should.have.been.called.exactly(1);
      model.add.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });
  });

});
