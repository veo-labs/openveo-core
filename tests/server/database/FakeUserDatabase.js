"use strict"

var util = require("util");
var openVeoAPI = require("openveo-api");
var Database = openVeoAPI.Database;

function FakeUserDatabase(){}

module.exports = FakeUserDatabase;
util.inherits(FakeUserDatabase, Database);

FakeUserDatabase.prototype.get = function(collection, criteria, projection, limit, callback){

  switch(collection){
    case "users" : 
      if(!criteria){
        callback(null, [
         {
           "id" : "1",
           "username" : "user name", 
           "password" : "password"
         }
        ]);
      }
      else if(criteria.username === "name1"){
         callback(null, [{
           "id" : "2",
           "username" : "user name", 
           "password" : "password"
         }]);
      }
      else if(criteria.id === "54c7a7ded0909a3b3e8d64c4"){
         callback(null, [{
           "id" : "3",
           "username" : "user name", 
           "password" : "password"
         }]);      
      }
      else
        callback(new Error("Error"));
    break;
  }
  
};

FakeUserDatabase.prototype.insert = function(collection, data, callback){  
  switch(collection){
    case "users":
      if(data.name === "name1")
        callback();
      else
        callback(new Error("Error"));
    break;
  }
};

FakeUserDatabase.prototype.update = function(collection, criteria, data, callback){

  switch(collection){
    case "users":
      if(criteria.id === "1")
        callback();
      else
        callback(new Error("Error")); 
    break;
  }
  
};

FakeUserDatabase.prototype.remove = function(collection, criteria, callback){  
  switch(collection){
    case "users" : 
      if(criteria.id === "1")
        callback();
      else
        callback(new Error("Error"));       
    break;
  }
};