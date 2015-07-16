"use strict"

// Module dependencies
var assert = require("chai").assert;
var openVeoAPI = require("openveo-api");
var ut = require("openveo-test").generator;

// oauthController.js
describe("oauthController", function(){
  var request, response, oauthController;
  
  before(function(){
    ut.generateWebServiceScopes();
    oauthController = process.require("app/server/controllers/oauthController.js");
    request = { oauth2 : {}, method : "GET"};
    response = { };
  });
  
  // validateScopesAction method
  describe("validateScopesAction", function(){

    it("Should be able to grant access to a path depending on client application authorizations", function(done){
      
      request.url = "/ws/videos";
      request.oauth2.accessToken = {
         scopes: {
          "scope1" : {
            "name" : "name 1",
            "activated" : true
          }
         }
      };

      response.status = function(){return this;};
      response.send = function(data){
        assert(false);
      };

      oauthController.validateScopesAction(request, response, function(){
        done();
      });
    });
    
    it("Should be able to revoke access to a path depending on client application authorizations", function(done){
      
      request.url = "/ws/videos";
      request.oauth2.accessToken = {
         scopes: {
          "scope1" : {
            "name" : "name 1",
            "activated" : false
          }
         }
      };

      oauthController.validateScopesAction(request, response, function(error){
        assert.isDefined(error);
        assert.equal(error.httpCode, 403);
        done();
      });
    });

  });
  
});