"use strict"

var path = require("path");
var assert = require("chai").assert;
var openVeoAPI = require("openveo-api");

// Set module root directory
process.root = path.join(__dirname, "../../");
process.require = function(filePath){
  return require(path.normalize(process.root + "/" + filePath));
};

var applicationStorage = openVeoAPI.applicationStorage;

describe("oauthController", function(){
  var request, response, oauthController;
  
  before(function(){
    applicationStorage.setWebServiceScopes(
      {
        "scope1" : {
          "name" : "name 1",
          "description" : "description 1",
          "paths" : ["/ws/videos"]
        },
        "scope2" : {
          "name" : "name 2",
          "description" : "description 2",
          "paths" : []
        }
      }
    ); 
    oauthController = process.require("app/server/controllers/oauthController.js");
    request = { oauth2 : {}};
    response = { };
  });
  
  describe("validateScopesAction", function(){

    it("Should be able to grant access to a path depending on client application authorizations", function(done){
      
      request.url = "/ws/videos";
      request.oauth2.accessToken = {
         scopes: {
          "scope1" : {
            "name" : "name 1",
            "activated" : true
          },
          "scope2" : {
            "name" : "name 2",
            "activated" : false
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
          },
          "scope2" : {
            "name" : "name 2",
            "activated" : false
          }
         }
      };

      response.status = function(status){
        assert.equal(status, 403);
        return this;
      };
      response.send = function(data){
        done();
      };

      oauthController.validateScopesAction(request, response, function(){
        assert(false);
      });
    });

  });
  
});