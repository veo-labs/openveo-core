'use strict';

// Module dependencies
var assert = require('chai').assert;

// defaultController.js
describe('defaultController', function() {
  var request,
    response,
    defaultController;

  before(function() {
    defaultController = process.require('app/server/controllers/defaultController.js');
    request = {
      params: {}
    };
    response = {
      locals: {}
    };
  });

  // defaultAction method
  describe('defaultAction', function() {

    it('Should display the main template of the back office', function(done) {

      response.status = function() {
      };
      response.render = function(templateName, variables) {
        assert.equal(templateName, 'root');
        assert.isDefined(variables.librariesScripts);
        assert.isDefined(variables.scripts);
        assert.isDefined(variables.css);
        done();
      };

      defaultController.defaultAction(request, response, function() {
        assert.ok(false);
      });
    });

  });

});
