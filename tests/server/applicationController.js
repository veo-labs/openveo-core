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

describe("applicationController", function(){
  var request, response, applicationController;
  
  before(function(){
    applicationStorage.setWebServiceScopes(
      {
        "scope1" : {
          "name" : "name 1",
          "description" : "description 1",
          "paths" : []
        },
        "scope2" : {
          "name" : "name 2",
          "description" : "description 2",
          "paths" : []
        },
        "scope3" : {
          "name" : "name 3",
          "description" : "description 3",
          "paths" : []
        },
        "scope4" : {
          "name" : "name 4",
          "description" : "description 4",
          "paths" : []
        }
      }
    );    
    applicationController = process.require("app/server/controllers/applicationController.js");
    request = { params : {} };
    response = { };
  });
  
  describe("getScopesAction", function(){

    it("Should be able to send back a list of scopes as a JSON object", function(done){

      response.status = function(){return this;};
      response.send = function(data){
        assert.isDefined(data);
        assert.isObject(data.scopes);
        assert.strictEqual(data.scopes, applicationStorage.getWebServiceScopes());
        done();
      };

      applicationController.getScopesAction(request, response, function(){
        assert.ok(false);
      });
    });

  });
  
});