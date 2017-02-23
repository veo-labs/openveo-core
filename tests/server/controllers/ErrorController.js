'use strict';

var assert = require('chai').assert;
var ErrorController = process.require('app/server/controllers/ErrorController.js');

// ErrorController.js
describe('ErrorController', function() {
  var request = {params: {}};
  var response = {locals: {}};
  var errorController;

  beforeEach(function() {
    errorController = new ErrorController();
  });

  // notFoundAction method
  describe('notFoundAction', function() {

    it('should send an HTTP not found', function(done) {
      errorController.notFoundAction(request, response, function(error) {
        assert.equal(error.httpCode, 404);
        done();
      });
    });

  });

  // notFoundPageAction method
  describe('notFoundPageAction', function() {

    it('should send an HTML page with an HTTP not found if HTML is accepted', function(done) {
      request.accepts = function(format) {
        return (format === 'html');
      };
      request.url = '/notFound';

      response.status = function(status) {
        assert.equal(status, 404, 'Expected not found status');
      };

      response.render = function(page, data) {
        assert.isDefined(page, 'Expected a page to render');
        assert.equal(data.url, request.url, 'Expected the requested url to be transmitted to the page');
        done();
      };

      errorController.notFoundPageAction(request, response, function() {
        assert.ok(false, 'Unexpected next action, should be the end of the line');
      });
    });

    it('should send a JSON with HTTP not found if HTML is not accepted and JSON is', function(done) {
      request.accepts = function(format) {
        return (format === 'json');
      };
      request.url = '/notFound';

      response.status = function(status) {
        assert.equal(status, 404, 'Expected not found status');
      };

      response.send = function(data) {
        assert.isDefined(data, 'Expected a page to render');
        assert.equal(data.url, request.url, 'Expected the requested url to be transmitted to the page');
        done();
      };

      errorController.notFoundPageAction(request, response, function() {
        assert.ok(false, 'Unexpected next action, should be the end of the line');
      });
    });

    it('should send a simple text with HTTP not found if neither HTML nor JSON is accepted', function(done) {
      request.accepts = function() {
        return false;
      };
      request.url = '/notFound';

      response.status = function(status) {
        assert.equal(status, 404, 'Expected not found status');
      };

      response.type = function() {
        return this;
      };

      response.send = function(text) {
        assert.isDefined(text, 'Expected text to be send');
        done();
      };

      errorController.notFoundPageAction(request, response, function() {
        assert.ok(false, 'Unexpected next action, should be the end of the line');
      });
    });

  });

  // errorAction method
  describe('errorAction', function() {

    it('should send back a JSON object with the error code, http code and module', function(done) {
      var error = {
        httpCode: 500,
        code: 25,
        module: 'core'
      };

      response.status = function(status) {
        assert.equal(status, error.httpCode);
        return this;
      };

      request.accepts = function(type) {
        return type === 'json';
      };

      response.send = function(data) {
        assert.equal(data.error.code, error.code, 'Unexpected error code ' + data.error.code);
        assert.equal(data.error.module, error.module, 'Unexpected module name ' + data.error.module);
        done();
      };

      errorController.errorAction(error, request, response, function() {
        assert.ok(false, 'Unexpected next action, should be the end of the line');
      });
    });

    it('should send an HTTP server error if no error is specified', function(done) {
      response.status = function(status) {
        assert.equal(status, 500, 'Expected an HTTP server error code');
        return this;
      };

      request.accepts = function(type) {
        return type === 'json';
      };

      response.send = function(data) {
        done();
      };

      errorController.errorAction(null, request, response, function() {
        assert.ok(false, 'Unexpected next action, should be the end of the line');
      });
    });

  });

});
