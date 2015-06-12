"use strict"

var path = require("path");
var assert = require("chai").assert;

// Set module root directory
process.root = path.join(__dirname, "../../");
process.require = function(filePath){
  return require(path.normalize(process.root + "/" + filePath));
};

describe("ClientProvider", function(){
  
  var clientProvider;
  
  before(function(){
    var FakeClientDatabase = require("./database/FakeClientDatabase.js");
    var ClientProvider = process.require("app/server/providers/ClientProvider.js");
    clientProvider = new ClientProvider(new FakeClientDatabase());
  });
  
  describe("getClientById", function(){

    it("Should be able to retrieve a client application by its id", function(done){
      clientProvider.getClientById("client-provider-1", function(error, clientApplication){
        assert.isNull(error);
        assert.isDefined(clientApplication);
        done();
      });
    
    });

  });  
  
  describe("getClients", function(){

    it("Should be able to retrieve all client applications", function(done){
      clientProvider.getClients(function(error, clientApplications){
        assert.isNull(error);
        assert.equal(clientApplications.length, 2);
        done();
      });
    
    });

  });
  
  describe("addClient", function(){

    it("should be able to add a new client application", function(done){   
      var client = {
        id : "client-provider-2",
        secret : "Client secret",
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
      };     

      clientProvider.addClient(client, function(error){
        assert.isUndefined(error);
        done();
      });
    
    });

  });
  
  describe("updateClient", function(){

    it("Should be able to update a client application", function(done){
      var client = {
        name : "New client application name"
      };

      clientProvider.updateClient("client-provider-3", client, function(error){
        assert.isUndefined(error);
        done();
      });
    
    });

  });
  
  describe("removeClient", function(){

    it("Should be able to remove a client application", function(done){
      clientProvider.removeClient("client-provider-4", function(error){
        assert.isUndefined(error);
        done();
      });
    
    });

  });

});
