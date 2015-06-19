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
var ClientModel = process.require("app/server/models/ClientModel.js");

describe("CientModel", function(){
  var clientModel;
  
  before(function(){
    var FakeClientDatabase = require("./database/FakeClientDatabase.js");
    applicationStorage.setDatabase(new FakeClientDatabase());

    clientModel = new ClientModel();
  });
  
  it("Should be an instance of EntityModel", function(){
    assert.ok(clientModel instanceof openVeoAPI.EntityModel);
  });
  
  describe("add", function(){

    it("Should be able to add a client application", function(){
      
      clientModel.add({
        name : "Name of the client",
        scopes : {
          scope1 : {
            description : "description 1",
            name : "name 1",
            activated : true
          },
          scope2 : {
            description : "description 2",
            name : "name 2",
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
          },
          scope2 : {
            description : "description 2",
            name : "name 2",
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
  
  describe("update", function(){
    
    it("Should be able to update a client application", function(){
      
      clientModel.update("1", {
        name : "Name of the client",
        scopes : {
          scope1 : {
            description : "description 1",
            name : "name 1",
            activated : true
          },
          scope2 : {
            description : "description 2",
            name : "name 2",
            activated : true
          }
        }
      }, function(error){
        assert.isUndefined(error);
      });
      
    });
    
  });
  
});