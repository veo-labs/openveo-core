"use strict"

// Module dependencies
var assert = require("chai").assert;
var openVeoAPI = require("openveo-api");
var ut = require("openveo-test").generator;

// ClientModel.js
describe("CientModel", function(){
  var clientModel;
  
  // Initializes tests
  before(function(){
    var ClientModel = process.require("app/server/models/ClientModel.js");
    ut.generateSuccessDatabase();
    clientModel = new ClientModel();
  });
  
  it("Should be an instance of EntityModel", function(){
    assert.ok(clientModel instanceof openVeoAPI.EntityModel);
  });
  
  // add method
  describe("add", function(){

    it("Should be able to add a new client application", function(){
      
      clientModel.add({
        name : "Name of the client",
        scopes : {
          scope1 : {
            description : "description 1",
            name : "name 1",
            activated : true
          }
        }
      }, function(error, client){
        assert.isNull(error);
        assert.isDefined(client);
      });
      
    });
    
    it("Should generate an id and a secret", function(){
      
      clientModel.add({
        name : "Name of the client",
        scopes : {
          scope1 : {
            description : "description 1",
            name : "name 1",
            activated : true
          }
        }
      }, function(error, client){
        assert.isDefined(client.id);
        assert.isDefined(client.secret);
      });
      
    });
    
    it("Should return an error if no scopes are provided", function(){
      
      clientModel.add({
        name : "Name of the client"
      }, function(error, client){
        assert.isDefined(error);
        assert.isUndefined(client);
      });
      
    });

  });
  
  // update method
  describe("update", function(){
    
    it("Should be able to update a client application", function(){
      
      clientModel.update("1", {
        name : "Name of the client",
        scopes : {
          scope1 : {
            description : "description 1",
            name : "name 1",
            activated : true
          }
        }
      }, function(error){
        assert.isNull(error);
      });
      
    });
    
  });
  
});