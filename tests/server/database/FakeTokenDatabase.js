"use strict"

function FakeTokenDatabase(){}

module.exports = FakeTokenDatabase;

FakeTokenDatabase.prototype.get = function(collection, criteria, projection, limit, callback){
  
  switch(collection){
    case "tokens" : 
      if(criteria.token = "2")
        callback(null, [{}]);
    break; 
  }
  
};

FakeTokenDatabase.prototype.insert = function(collection, data, callback){  
  switch(collection){
    case "tokens":
      if(data.clientId === "1")
        callback();
      else
        callback(new Error("Error"));
    break;
  }
};

FakeTokenDatabase.prototype.update = function(collection, criteria, data, callback){

  switch(collection){
    case "clients":
      if(criteria.id === "1" && data.name && data.scopes)
        callback();
      else if(criteria.id === "2" && data.name && !data.scopes)
        callback();
      else if(criteria.id === "3" && !data.name && data.scopes)
        callback();
      else
        callback(new Error("Error")); 
    break;
  }
  
};

FakeTokenDatabase.prototype.remove = function(collection, criteria, callback){  
  switch(collection){
    case "tokens" : 
      if(criteria.clientId === "1")
        callback();
      else
        callback(new Error("Error"));       
    break;
  }
};