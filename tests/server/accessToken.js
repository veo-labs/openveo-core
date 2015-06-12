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

describe("accessToken", function(){
  
  var accessToken;
  
  before(function(){
    var FakeTokenDatabase = require("./database/FakeTokenDatabase.js");
    applicationStorage.setDatabase(new FakeTokenDatabase());    
    accessToken = process.require("app/server/oauth/accessToken.js");
  });
  
  describe("create", function(){

    it("Should be able to create an access token for a client application", function(done){
      accessToken.create("userId", "1", [], 600, function(error, token){
        assert.isDefined(token);
        done();
      });
    });

  });
  
  describe("fetchByToken", function(){

    it("Should be able to get client application information by token", function(done){
      accessToken.fetchByToken("2", function(error, token){
        console.log(token);
        assert.isDefined(token);
        done();
      });
    });

  });  
  
  describe("checkTTL", function(){

    it("Should be able to verify if the token is still valid", function(){
      assert.notOk(accessToken.checkTTL({ ttl : 8000 }));
      assert.ok(accessToken.checkTTL({ ttl : 1e+20 }));
    });

  });
  
});