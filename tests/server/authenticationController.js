"use strict"

// Module dependencies
var assert = require("chai").assert;
var openVeoAPI = require("openveo-api");
var ut = require("openveo-test").generator;
var applicationStorage = openVeoAPI.applicationStorage;

// authenticationController.js
describe("authenticationController", function(){
  var request, response, authenticationController;
  
  before(function(){
    authenticationController = process.require("app/server/controllers/authenticationController.js");
  });

  beforeEach(function(){
    ut.generatePermissions();
    request = { params : {} };
    response = {};
  });
  
  // getPermissionsAction function
  describe("getPermissionsAction", function(){

    it("Should be able to get a list of permissions as a JSON object", function(done){
      response.status = function(status){return this;};
      response.send = function(data){
        assert.isDefined(data);
        assert.isObject(data.permissions);
        done();
      };

      authenticationController.getPermissionsAction(request, response, function(){
        assert.ok(false);
      });
    });

  });
  
  // restrictAction function
  describe("restrictAction", function(){

    it("Should grant access to user if its id is 0", function(done){
      request = { 
        method : "GET",
        url : "/crud/application",
        params : {},
        user : {
          id : 0 
        },
        isAuthenticated : function(){
          return true; 
        }
      };
      
      response.status = function(status){return this;};
      response.send = function(data){
        assert.ok(false);
      };

      authenticationController.restrictAction(request, response, function(){
        done();
      });
      
    });
    
    it("Should grant access to user with the right permission", function(done){
      request = { 
        method : "GET",
        url : "/crud/application",
        params : {},
        user : {
          id : 1,
          roles: [
            {
              permissions : {
                perm1 : {
                  activated : true 
                }
              }
            }
          ]
        },
        isAuthenticated : function(){
          return true; 
        }
      };
      
      response.status = function(status){return this;};
      response.send = function(data){
        assert.ok(false);
      };

      authenticationController.restrictAction(request, response, function(){
        done();
      });
      
    });
    
    it("Should forbid access to user without permission", function(done){
      request = {
        method : "GET",
        url : "/crud/application",
        params : {},
        user : {
          id : 1,
          roles: []
        },
        isAuthenticated : function(){
          return true; 
        },
        accepts : function(format){
          return (format === "json");
        }
      };
      
      response.status = function(status){
        return this;
      };
      response.send = function(data){
        done();
      };

      authenticationController.restrictAction(request, response, function(){
        assert.ok(false);
      });
      
    });     

  });  
  
});