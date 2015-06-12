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
    var FakeClientDatabase = require("./database/FakeClientDatabase.js");
    applicationStorage.setDatabase(new FakeClientDatabase());
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
  
  describe("getApplicationsAction", function(){

    it("Should be able to send back a list of applications as a JSON object", function(done){

      response.status = function(){return this;};
      response.send = function(data){
        assert.isDefined(data);
        assert.isArray(data.applications);
        assert.equal(data.applications.length, 2);
        done();
      };

      applicationController.getApplicationsAction(request, response, function(){
        assert.ok(false);
      });
    });   

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
  
  describe("addApplicationAction", function(){

    it("Should be able to add a new application", function(done){      
      
      request.body = {
        name : "Application name",
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
      };
      response.status = function(status){
        assert.ok(false);
        return this;
      };

      response.send = function(data){
        done();
      };

      applicationController.addApplicationAction(request, response, function(){
        assert.ok(false);
      });
    });
    
    it("Should return an HTTP code 500 if failed", function(done){
      request.body = {
        name : "Failing application",
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
      };      
      response.status = function(status){
        assert.equal(status, 500);
        done();
      };
      response.send = function(data){
        assert.ok(false);
      };

      applicationController.addApplicationAction(request, response, function(){
        assert.ok(false);
      });
    });

    it("Should return an HTTP code 400 if name is not found in body parameters", function(done){
      request.body = {
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
      };
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        assert.ok(true);
        done();
      };

      applicationController.addApplicationAction(request, response, function(){
        assert.ok(false);
      });
    });       

  });  
  
  describe("updateApplicationAction", function(){
    
    it("Should be able to update application name and scopes", function(done){
      request.params.id = "1";
      request.body = {
        name : "Application name",
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
      };
      response.status = function(status){
        assert.ok(false);
        return this;
      };
      response.send = function(data){
        done();
      };

      applicationController.updateApplicationAction(request, response, function(){
        assert.ok(false);
      });

    });
    
    it("Should be able to update only application name", function(done){
      request.params.id = "2";
      request.body = {
        name : "Application name"
      };
      response.status = function(status){
        assert.ok(false);
        return this;
      };
      response.send = function(data){
        done();
      };

      applicationController.updateApplicationAction(request, response, function(){
        assert.ok(false);
      });

    });   
    
    it("Should be able to update only application scopes", function(done){
      request.params.id = "3";
      request.body = {
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
      };
      response.status = function(status){
        assert.ok(false);
        return this;
      };
      response.send = function(data){
        done();
      };

      applicationController.updateApplicationAction(request, response, function(){
        assert.ok(false);
      });

    });
    
    it("Should return an HTTP 400 if application id is not given", function(done){
      request.body = {
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
      };
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        done();
      };

      applicationController.updateApplicationAction(request, response, function(){
        assert.ok(false);
      });

    });   
    
    it("Should return an HTTP 500 if update fails", function(done){
      request.params.id = "500";
      request.body = {
        name : "Application name"
      };
      response.status = function(status){
        assert.equal(status, 500);
        return this;
      };
      response.send = function(data){
        done();
      };

      applicationController.updateApplicationAction(request, response, function(){
        assert.ok(false);
      });

    });    
    
  });
  
  describe("removeApplicationAction", function(){

    it("Should be able to remove an application from database", function(done){
      request.params.id = "1";
      response.status = function(status){
        assert.ok(false);
        return this;
      };
      response.send = function(data){
        done();
      };

      applicationController.removeApplicationAction(request, response, function(){
        assert.ok(false);
      });

    });

    it("Should return an HTTP 400 if application id is not given", function(done){
      request.body = {
        name : "Application name"
      };
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        done();
      };

      applicationController.removeApplicationAction(request, response, function(){
        assert.ok(false);
      });

    }); 
    
    it("Should return an HTTP 500 if application if remove fails", function(done){
      request.params.id = "500";
      request.body = {
        name : "Application name"
      };
      response.status = function(status){
        assert.equal(status, 500);
        return this;
      };
      response.send = function(data){
        done();
      };

      applicationController.removeApplicationAction(request, response, function(){
        assert.ok(false);
      });

    });    
    
  });
  
});