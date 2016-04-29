'use strict';

// Module dependencies
var assert = require('chai').assert;
var ut = require('@openveo/test').unit.generator;

// ApplicationController.js
describe('ApplicationController', function() {
  var request,
    response,
    applicationController;

  before(function() {
    var ApplicationController = process.require('app/server/controllers/ApplicationController.js');
    applicationController = new ApplicationController();
  });

  beforeEach(function() {
    ut.generateWebServiceScopes();
    request = {
      params: {}
    };
    response = {};
  });

  // getScopesAction function
  describe('getScopesAction', function() {

    it('Should be able to get a list of scopes as a JSON object', function(done) {
      response.status = function() {
        return this;
      };
      response.send = function(data) {
        assert.isDefined(data);
        assert.isObject(data);
        assert.isArray(data.scopes);
        done();
      };

      applicationController.getScopesAction(request, response, function() {
        assert.ok(false);
      });
    });

  });

});
