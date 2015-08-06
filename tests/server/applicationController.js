"use strict"

// Module dependencies
var assert = require("chai").assert;
var openVeoAPI = require("openveo-api");
var ut = require("openveo-test").generator;
var applicationStorage = openVeoAPI.applicationStorage;

// applicationController.js
describe("applicationController", function(){
  var request, response, applicationController;
  
  before(function(){
    applicationController = process.require("app/server/controllers/applicationController.js");
  });

  beforeEach(function(){
    ut.generateWebServiceScopes();
    request = { params : {} };
    response = {};
  });
  
  // getScopesAction function
  describe("getScopesAction", function(){

    it("Should be able to get a list of scopes as a JSON object", function(done){
      response.status = function(status){return this;};
      response.send = function(data){
        assert.isDefined(data);
        assert.isObject(data);
        assert.isArray(data.scopes);
        done();
      };

      applicationController.getScopesAction(request, response, function(){
        assert.ok(false);
      });
    });

  });
  
});