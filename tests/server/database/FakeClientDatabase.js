"use strict"

var util = require("util");
var openVeoAPI = require("openveo-api");
var Database = openVeoAPI.Database;

function FakeClientDatabase(){}

module.exports = FakeClientDatabase;
util.inherits(FakeClientDatabase, Database);

FakeClientDatabase.prototype.get = function(collection, criteria, projection, limit, callback){

  switch(collection){
    case "properties" : 
      if(!criteria && !projection && limit === -1){
        callback(null, [
          {
            "id" : "client1",
            "secret" : "Client secret",
            "name" : "Name of the client",
            "scopes" : {
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
          },
          {
            "id" : "client2",
            "secret" : "Client secret",
            "name" : "Name of the client",
            "scopes" : {
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
          }
        ]);
      }
      else if(criteria.id === "client-1")
        callback(null, {});
    break; 
      
    case "clients" : 
      if(criteria.id === "client-1")
        callback(null, {});
    break;
  }
  
};

FakeClientDatabase.prototype.insert = function(collection, data, callback){
  switch(collection){
    case "clients":
      if(data.name === "Application name")
        callback();      
      if(data.id === "client-provider-2")
        callback();
      else if(data.name === "Failing application")
        callback(new Error("Error"));
    break;
  }
};

FakeClientDatabase.prototype.update = function(collection, criteria, data, callback){

  switch(collection){
    case "clients":
      if(criteria.id === "1" && data.name && data.scopes)
        callback();
      else if(criteria.id === "2" && data.name && !data.scopes)
        callback();
      else if(criteria.id === "3" && !data.name && data.scopes)
        callback();      
      else if(criteria.id === "client-provider-3")
        callback();
      else
        callback(new Error("Error")); 
    break;
  }
  
};

FakeClientDatabase.prototype.remove = function(collection, criteria, callback){  
  
  switch(collection){
    case "clients" : 
      if(criteria.id === "1")
        callback();
      else if(criteria.id === "client-provider-4")
        callback();
      else
        callback(new Error("Error"));       
    break;
  }
};