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

describe("client", function(){
  
  var client;
  
  before(function(){
    var FakeClientDatabase = require("./database/FakeClientDatabase.js");
    applicationStorage.setDatabase(new FakeClientDatabase());
    client = process.require("app/server/oauth/client.js");
  });
  
  describe("getId", function(){

    it("Should return the given client id", function(){
      assert.equal(client.getId({id : "id"}), "id");
    });

  });
  
  describe("fetchById", function(){

    it("Should be able to get client application information by id", function(done){
      client.fetchById("client-1", function(error, client){
        done();
      });
    });

  });
  
  describe("checkSecret", function(){

    it("Should be able to verify client's application secret", function(){
      assert.ok(client.checkSecret({secret : "secret"}, "secret"));
      assert.notOk(client.checkSecret({secret : "secret"}, "wrongSecret"));
    });

  }); 
  
  describe("checkGrantType", function(){

    it("Should validate only grant type client_credentials", function(){
      assert.ok(client.checkGrantType({}, "client_credentials"));
      assert.notOk(client.checkGrantType({}, "wrong grant type"));
    });

  });   
  
});