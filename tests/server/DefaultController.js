'use strict';

// Module dependencies
var assert = require('chai').assert;

// DefaultController.js
describe('DefaultController', function() {
  var request,
    response,
    defaultController;

  before(function() {
    var DefaultController = process.require('app/server/controllers/DefaultController.js');
    defaultController = new DefaultController();
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
