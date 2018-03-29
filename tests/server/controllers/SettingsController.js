'use strict';

var chai = require('chai');
var spies = require('chai-spies');
var SettingsController = process.require('app/server/controllers/SettingsController.js');
var errors = process.require('app/server/httpErrors.js');

var assert = chai.assert;
chai.should();
chai.use(spies);

describe('SettingsController', function() {
  var request;
  var response;
  var provider;
  var expectedSettings;
  var expectedPagination;
  var settingsController;

  beforeEach(function() {
    expectedSettings = [];
    provider = {
      getOne: chai.spy(function(filter, fields, callback) {
        callback(null, expectedSettings[0]);
      }),
      get: chai.spy(function(filter, fields, limit, page, sort, callback) {
        callback(null, expectedSettings, expectedPagination);
      })
    };
    request = {
      query: {}
    };
    response = {
      send: chai.spy(function() {})
    };
    settingsController = new SettingsController();
    settingsController.getProvider = function() {
      return provider;
    };
  });

  describe('getEntitiesAction', function() {

    it('should send the list of settings with pagination', function(done) {
      expectedSettings = [{}];
      expectedPagination = {};

      response = {
        send: function(result) {
          assert.strictEqual(result.entities, expectedSettings, 'Expected a list of settings');
          assert.strictEqual(result.pagination, expectedPagination, 'Expected pagination');
          done();
        }
      };

      settingsController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should be able to set the limit number of settings by page', function(done) {
      var expectedLimit = 42;

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(limit, expectedLimit, 'Wrong limit');
        done();
      };

      request.query.limit = expectedLimit;

      settingsController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should be able to set the expected page of settings', function(done) {
      var expectedPage = 42;

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(page, expectedPage, 'Wrong page');
        done();
      };

      request.query.page = expectedPage;

      settingsController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should set default sort order to "desc"', function(done) {
      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(sort.id, 'desc', 'Wrong sort');
        done();
      };

      settingsController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should set default limit to 10 if not specified', function(done) {
      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(limit, 10, 'Wrong limit');
        done();
      };

      settingsController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should set default page to 0 if not specified', function(done) {
      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(page, 0, 'Wrong page');
        done();
      };

      settingsController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP wrong parameters if limit is lesser than equal 0', function(done) {
      var wrongValues = [-42, 0];

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      wrongValues.forEach(function(wrongValue) {
        request.query.limit = wrongValue;
        settingsController.getEntitiesAction(request, response, function(error) {
          assert.strictEqual(error, errors.GET_SETTINGS_WRONG_PARAMETERS);
        });
      });

      done();
    });

    it('should send an HTTP wrong parameters if page is lesser than 0', function(done) {
      var wrongValues = [-42];

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      wrongValues.forEach(function(wrongValue) {
        request.query.page = wrongValue;
        settingsController.getEntitiesAction(request, response, function(error) {
          assert.strictEqual(error, errors.GET_SETTINGS_WRONG_PARAMETERS);
        });
      });

      done();
    });

    it('should send an HTTP wrong parameters if sortOrder is different from "asc" or "desc"', function(done) {
      var wrongValues = ['Something else'];

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      wrongValues.forEach(function(wrongValue) {
        request.query.sortOrder = wrongValue;
        settingsController.getEntitiesAction(request, response, function(error) {
          assert.strictEqual(error, errors.GET_SETTINGS_WRONG_PARAMETERS);
        });
      });

      done();
    });

    it('should send an HTTP server error if an error occured while fetching settings', function(done) {
      provider.get = function(filter, fields, limit, page, sort, callback) {
        callback(new Error('Something went wrong'));
      };

      response.send = function(entities) {
        assert.ok(false, 'Unexpected response');
      };

      settingsController.getEntitiesAction(request, response, function(error) {
        assert.equal(error, errors.GET_SETTINGS_ERROR, 'Wrong error');
        done();
      });
    });

  });

  describe('getEntityAction', function() {

    it('should send the entity returned by the provider', function() {
      var expectedEntity = {};
      var next = chai.spy(function() {});
      var response = {
        send: chai.spy(function(entity) {
          assert.strictEqual(entity.entity, expectedEntity, 'Expected entity');
        })
      };

      provider.getOne = chai.spy(function(filter, fields, callback) {
        callback(null, expectedEntity);
      });

      settingsController.getEntityAction({params: {id: 42}}, response, next);

      provider.getOne.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

    it('should send an HTTP server error if provider returns an error', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.GET_SETTING_ERROR);
      });

      provider.getOne = chai.spy(function(filter, fields, callback) {
        callback(new Error('Error'));
      });

      settingsController.getEntityAction({params: {id: 1}}, response, next);

      provider.getOne.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(1);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send an HTTP bad request error if id is not specified', function() {
      var next = chai.spy(function(error) {
        assert.strictEqual(error, errors.GET_SETTING_MISSING_PARAMETERS);
      });

      provider.getOne = chai.spy(function(filter, fields, callback) {
        callback();
      });

      settingsController.getEntityAction({params: {}}, response, next);

      next.should.have.been.called.exactly(1);
      provider.getOne.should.have.been.called.exactly(0);
      response.send.should.have.been.called.exactly(0);
    });

    it('should send null if entity is not found', function() {
      var next = chai.spy(function() {});

      provider.getOne = chai.spy(function(filter, fields, callback) {
        callback();
      });

      response.send = chai.spy(function(entity) {
        assert.isNull(entity.entity, 'Expected entity to be null');
      });

      settingsController.getEntityAction({params: {id: 1}}, response, next);

      response.send.should.have.been.called.exactly(1);
      provider.getOne.should.have.been.called.exactly(1);
      next.should.have.been.called.exactly(0);
    });

  });

});
