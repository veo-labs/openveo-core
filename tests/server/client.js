"use strict"

// Module dependencies
var assert = require("chai").assert;
var ut = require("@openveo/test").generator;

// client.js
describe("client", function(){
  var client;
  
  before(function(){
    ut.generateSuccessDatabase();
    client = process.require("app/server/oauth/client.js");
  });
  
  // getId method
  describe("getId", function(){

    it("Should return the value of the id property of the given client", function(){
      assert.equal(client.getId({id : "id"}), "id");
    });

  });
  
  // fetchById method
  describe("fetchById", function(){

    it("Should be able to get client application information by id", function(done){
      client.fetchById("1", function(error, client){
        done();
      });
    });

  });
  
  // checkSecret method
  describe("checkSecret", function(){

    it("Should be able to verify client's application secret", function(){
      assert.ok(client.checkSecret({secret : "secret"}, "secret"));
      assert.notOk(client.checkSecret({secret : "secret"}, "wrongSecret"));
    });

  }); 
  
  // checkGranType method
  describe("checkGrantType", function(){

    it("Should validate only grant type client_credentials", function(){
      assert.ok(client.checkGrantType({}, "client_credentials"));
      assert.notOk(client.checkGrantType({}, "wrong grant type"));
    });

  });   
  
});