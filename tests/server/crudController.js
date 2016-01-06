'use strict';

// Module dependencies
var assert = require('chai').assert;
var openVeoAPI = require('@openveo/api');
var applicationStorage = openVeoAPI.applicationStorage;
var ut = require('@openveo/test').unit.generator;

// crudController.js
describe('crudController', function() {
  var request,
    response,
    crudController,
    ClientModel;

  beforeEach(function() {
    ClientModel = process.require('app/server/models/ClientModel.js');

    ut.generateSuccessDatabase();
    applicationStorage.setEntities({
      application: new ClientModel()
    });

    crudController = process.require('app/server/controllers/crudController.js');

    response = {};
    request = {
      params: {
        type: 'application'
      }
    };
  });

  // getEntitiesAction method
  describe('getEntitiesAction', function() {

    it('Should be able to get a list of entities as a JSON object', function(done) {

      response.status = function() {
        return this;
      };
      response.send = function(data) {
        assert.isDefined(data);
        done();
      };

      crudController.getEntitiesAction(request, response, function() {
        assert.ok(false);
      });
    });

    it('Should return an HTTP code 400 if type is not found in url parameters', function(done) {
      request = {
        params: {}
      };

      crudController.getEntitiesAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 400);
        done();
      });
    });

    it('Should return an HTTP code 500 if type does not correspond to an existing entity', function(done) {
      request.params.type = 'wrongType';
      request.body = {};

      crudController.getEntitiesAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 500);
        done();
      });
    });

    it('Should return an HTTP code 500 if something wen\'t wrong', function(done) {
      ut.generateFailDatabase();
      applicationStorage.setEntities({
        application: new ClientModel()
      });

      crudController.getEntitiesAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 500);
        done();
      });
    });

  });

  // addEntityAction method
  describe('addEntityAction', function() {

    it('Should be able to add a new entity', function(done) {
      request.body = {
        name: 'app',
        scopes: {
          scope1: {
            description: 'description 1',
            name: 'name 1',
            activated: true
          }
        }
      };
      response.status = function() {
        assert.ok(false);
        return this;
      };

      response.send = function() {
        done();
      };

      crudController.addEntityAction(request, response, function() {
        assert.ok(false);
      });
    });

    it('Should return an HTTP code 400 if type is not found in url parameters', function(done) {
      request.params = {};
      request.body = {};

      crudController.addEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 400);
        done();
      });
    });

    it('Should return an HTTP code 400 if body is empty', function(done) {
      request.params = {
        type: 'application'
      };

      crudController.addEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 400);
        done();
      });
    });

    it('Should return an HTTP code 500 if something wen\'t wrong', function(done) {
      ut.generateFailDatabase();
      applicationStorage.setEntities({
        application: new ClientModel()
      });

      request.body = {};

      crudController.addEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 500);
        done();
      });
    });

  });

  // updateEntityAction method
  describe('updateEntityAction', function() {

    it('Should be able to update an entity', function(done) {
      request.params.id = '1';
      request.body = {
        name: 'Application name',
        scopes: {
          scope1: {
            description: 'description 1',
            name: 'name 1',
            activated: true
          }
        }
      };
      response.status = function() {
        assert.ok(false);
        return this;
      };
      response.send = function() {
        done();
      };

      crudController.updateEntityAction(request, response, function() {
        assert.ok(false);
      });

    });

    it('Should return an HTTP code 400 if type is not found in url parameters', function(done) {
      request.params = {
        id: '1'
      };
      request.body = {};

      crudController.updateEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 400);
        done();
      });
    });

    it('Should return an HTTP code 400 if id is not found in url parameters', function(done) {
      request.params = {
        type: 'application'
      };
      request.body = {};

      crudController.updateEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 400);
        done();
      });
    });

    it('Should return an HTTP code 400 if body is empty', function(done) {
      request.params = {
        id: '1',
        type: 'application'
      };

      crudController.updateEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 400);
        done();
      });
    });

    it('Should return an HTTP code 500 if something wen\'t wrong', function(done) {
      ut.generateFailDatabase();
      applicationStorage.setEntities({
        application: new ClientModel()
      });

      request.params = {
        id: '1',
        type: 'application'
      };
      request.body = {};

      crudController.updateEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 500);
        done();
      });
    });

  });

  // removeEntityAction method
  describe('removeEntityAction', function() {

    it('Should be able to remove an entity', function(done) {
      request.params.id = '2';
      response.status = function() {
        assert.ok(false);
        return this;
      };
      response.send = function() {
        done();
      };

      crudController.removeEntityAction(request, response, function() {
        assert.ok(false);
      });

    });

    it('Should return an HTTP code 400 if type is not found in url parameters', function(done) {
      request.params = {
        id: '1'
      };

      crudController.removeEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 400);
        done();
      });
    });

    it('Should return an HTTP code 400 if id is not found in url parameters', function(done) {
      request.params = {
        type: 'application'
      };

      crudController.removeEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 400);
        done();
      });
    });

    it('Should return an HTTP code 500 if something wen\'t wrong', function(done) {
      ut.generateFailDatabase();
      applicationStorage.setEntities({
        application: new ClientModel()
      });

      request.params = {
        id: '2',
        type: 'application'
      };

      crudController.removeEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 500);
        done();
      });
    });

  });

  // getEntityAction method
  describe('getEntityAction', function() {

    it('Should be able to retrieve an entity', function(done) {
      request.params.id = '3';
      response.status = function() {
        assert.ok(false);
        return this;
      };
      response.send = function() {
        done();
      };

      crudController.getEntityAction(request, response, function() {
        assert.ok(false);
      });

    });

    it('Should return an HTTP code 400 if type is not found in url parameters', function(done) {
      request.params = {
        id: '3'
      };

      crudController.getEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 400);
        done();
      });
    });

    it('Should return an HTTP code 400 if id is not found in url parameters', function(done) {
      request.params = {
        type: 'application'
      };

      crudController.getEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 400);
        done();
      });
    });

    it('Should return an HTTP code 500 if something wen\'t wrong', function(done) {
      ut.generateFailDatabase();
      applicationStorage.setEntities({
        application: new ClientModel()
      });

      request.params = {
        id: '3',
        type: 'application'
      };

      crudController.getEntityAction(request, response, function(error) {
        assert.isDefined(error);
        assert.equal(error.httpCode, 500);
        done();
      });
    });

  });

});
