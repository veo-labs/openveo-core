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
var FakeSuccessDatabase = require("./database/FakeSuccessDatabase.js");
var FakeFailDatabase = require("./database/FakeFailDatabase.js");

describe("crudController", function(){
  var request, response, crudController;
  
  beforeEach(function(){
    applicationStorage.setDatabase(new FakeSuccessDatabase());
    applicationStorage.setEntities({
      "application" : new ClientModel()
    });
    
    crudController = process.require("app/server/controllers/crudController.js");
    request = { params : { 
      type : "application"
    } };
    response = { };
  });
  
  describe("getEntitiesAction", function(){

    it("Should be able to send back a list of entities as a JSON object", function(done){

      response.status = function(){return this;};
      response.send = function(data){
        assert.isDefined(data);
        done();
      };

      crudController.getEntitiesAction(request, response, function(){
        assert.ok(false);
      });
    });
    
    it("Should return an HTTP code 400 if type is not found in url parameters", function(done){
      
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.getEntitiesAction(request, response, function(){
        assert.ok(false);
      });
    });
      
    it("Should return an HTTP code 500 if type does not correspond to an existing entity", function(done){
      request.params.type = "wrongType";
      request.body = {};
      response.status = function(status){
        assert.equal(status, 500);
        return this;
      };
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.getEntitiesAction(request, response, function(){
        assert.ok(false);
      });
    });
      
    it("Should return an HTTP code 500 if something wen't wrong", function(done){
      applicationStorage.setDatabase(new FakeFailDatabase());
      applicationStorage.setEntities({
        "application" : new ClientModel()
      });      
      response.status = function(status){
        assert.equal(status, 500);
        return this;
      };
      
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.getEntitiesAction(request, response, function(){
        assert.ok(false);
      });
    });

  }); 
  
  describe("addEntityAction", function(){

    it("Should be able to add a new entity", function(done){
      request.body = {
        name : "app",
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

      crudController.addEntityAction(request, response, function(){
        assert.ok(false);
      });
    });
    
    it("Should return an HTTP code 400 if type is not found in url parameters", function(done){
      request.params = {};
      request.body = {};
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.addEntityAction(request, response, function(){
        assert.ok(false);
      });
    });  
    
    it("Should return an HTTP code 400 if body is empty", function(done){
      request.params = { type: "application"};
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.addEntityAction(request, response, function(){
        assert.ok(false);
      });
    });  
    
    it("Should return an HTTP code 500 if something wen't wrong", function(done){
      request.body = {};
      applicationStorage.setDatabase(new FakeFailDatabase());
      applicationStorage.setEntities({
        "application" : new ClientModel()
      });      
      response.status = function(status){
        assert.equal(status, 500);
        return this;
      };
      
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.addEntityAction(request, response, function(){
        assert.ok(false);
      });
    });

  });  
  
  describe("updateEntityAction", function(){
    
    it("Should be able to update an entity", function(done){
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

      crudController.updateEntityAction(request, response, function(){
        assert.ok(false);
      });

    });
    
    it("Should return an HTTP code 400 if type is not found in url parameters", function(done){
      request.params = { id : "1" };
      request.body = {};
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.updateEntityAction(request, response, function(){
        assert.ok(false);
      });
    });    
    
    it("Should return an HTTP code 400 if id is not found in url parameters", function(done){
      request.params = { type : "application" };
      request.body = {};
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.updateEntityAction(request, response, function(){
        assert.ok(false);
      });
    });    
    
    it("Should return an HTTP code 400 if body is empty", function(done){
      request.params = { id: "1", type : "application" };
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.updateEntityAction(request, response, function(){
        assert.ok(false);
      });
    });     
    
    it("Should return an HTTP code 500 if something wen't wrong", function(done){
      request.params = { id: "1", type : "application"};
      request.body = {};
      applicationStorage.setDatabase(new FakeFailDatabase());
      applicationStorage.setEntities({
        "application" : new ClientModel()
      });
      response.status = function(status){
        assert.equal(status, 500);
        return this;
      };
      
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.updateEntityAction(request, response, function(){
        assert.ok(false);
      });
    });
    
  });
  
  describe("removeEntityAction", function(){

    it("Should be able to remove an entity", function(done){
      request.params.id = "2";
      response.status = function(status){
        assert.ok(false);
        return this;
      };
      response.send = function(data){
        done();
      };

      crudController.removeEntityAction(request, response, function(){
        assert.ok(false);
      });

    }); 
    
    it("Should return an HTTP code 400 if type is not found in url parameters", function(done){
      request.params = { id : "1" };
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.removeEntityAction(request, response, function(){
        assert.ok(false);
      });
    });    
    
    it("Should return an HTTP code 400 if id is not found in url parameters", function(done){
      request.params = { type : "application" };
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.removeEntityAction(request, response, function(){
        assert.ok(false);
      });
    }); 
    
    it("Should return an HTTP code 500 if something wen't wrong", function(done){
      request.params = { id: "2", type : "application" };
      applicationStorage.setDatabase(new FakeFailDatabase());
      applicationStorage.setEntities({
        "application" : new ClientModel()
      });
      response.status = function(status){
        assert.equal(status, 500);
        return this;
      };
      
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.removeEntityAction(request, response, function(){
        assert.ok(false);
      });
    });    
    
  });
  
  describe("getEntityAction", function(){

    it("Should be able to retrieve an entity", function(done){
      request.params.id = "3";
      response.status = function(status){
        assert.ok(false);
        return this;
      };
      response.send = function(data){
        done();
      };

      crudController.getEntityAction(request, response, function(){
        assert.ok(false);
      });

    }); 
    
    it("Should return an HTTP code 400 if type is not found in url parameters", function(done){
      request.params = { id : "3" };
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.getEntityAction(request, response, function(){
        assert.ok(false);
      });
    });    
    
    it("Should return an HTTP code 400 if id is not found in url parameters", function(done){
      request.params = { type : "application" };
      response.status = function(status){
        assert.equal(status, 400);
        return this;
      };
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.getEntityAction(request, response, function(){
        assert.ok(false);
      });
    }); 
    
    it("Should return an HTTP code 500 if something wen't wrong", function(done){
      request.params = { id: "3", type : "application" };
      applicationStorage.setDatabase(new FakeFailDatabase());
      applicationStorage.setEntities({
        "application" : new ClientModel()
      });
      response.status = function(status){
        assert.equal(status, 500);
        return this;
      };
      
      response.send = function(data){
        assert.ok(true);
        done();
      };

      crudController.getEntityAction(request, response, function(){
        assert.ok(false);
      });
    });    
    
  });  
  
});