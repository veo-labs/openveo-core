"use strict"

// Module dependencies
var assert = require("chai").assert;
var ut = require("openveo-test").generator;

// defaultController.js
describe("defaultController", function(){
  var request, response, defaultController;
  
  before(function(){
    defaultController = process.require("app/server/controllers/defaultController.js");
    request = { params : {} };
    response = { locals : {} };
  });  
  
  // defaultAction method
  describe("defaultAction", function(){

    it("Should display the main template of the back office", function(done){

      response.status = function(){};
      response.render = function(templateName, variables){
        assert.equal(templateName, "root");
        assert.isDefined(variables.librariesScripts);
        assert.isDefined(variables.scripts);
        assert.isDefined(variables.css);
        done();
      };

      defaultController.defaultAction(request, response, function(){
        assert.ok(false);
      });
    });
    
  });
  
  // notFoundAction method
  describe("notFoundAction", function(){

    it("Should display the 404 page, with status 404, if client accepts html", function(done){
      
      request.url = "/test";
      request.accepts = function(acceptHeader){
        return (acceptHeader === "html");
      };
      
      response.status = function(status){
        assert.equal(status, 404);
      };
      
      response.render = function(templateName, variables){
        assert.equal(templateName, "404");
        assert.isDefined(variables.url);
        done();
      };

      defaultController.notFoundAction(request, response, function(){
        assert.ok(false);
      });
    });
    
    it("Should send back JSON, with status 404, if client accepts JSON", function(done){
      
      request.url = "/test";
      request.accepts = function(acceptHeader){
        return (acceptHeader === "json");
      };
      
      response.status = function(status){
        assert.equal(status, 404);
      };
      
      response.send = function(data){
        assert.isDefined(data.error);
        done();
      };

      defaultController.notFoundAction(request, response, function(){
        assert.ok(false);
      });
    });
    
    it("Should send back text, with status 404, if client does not accept HTML or JSON", function(done){
      
      request.url = "/test";
      request.accepts = function(acceptHeader){
        return false;
      };
      
      response.type = function(type){
        assert.equal(type, "txt");
        return this;
      };
      
      response.status = function(status){
        assert.equal(status, 404);
      };
      
      response.send = function(text){
        assert.isDefined(text);
        done();
      };

      defaultController.notFoundAction(request, response, function(){
        assert.ok(false);
      });
    });    
    
  });  

});