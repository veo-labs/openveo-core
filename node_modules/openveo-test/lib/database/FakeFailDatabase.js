"use strict"

var util = require("util");
var openVeoAPI = require("openveo-api");
var Database = openVeoAPI.Database;

function FakeFailDatabase(){}

module.exports = FakeFailDatabase;
util.inherits(FakeFailDatabase, Database);

FakeFailDatabase.prototype.get = function(collection, criteria, projection, limit, callback){
  callback(new Error("error"));
};

FakeFailDatabase.prototype.insert = function(collection, data, callback){  
  callback(new Error("error"));
};

FakeFailDatabase.prototype.update = function(collection, criteria, data, callback){
  callback(new Error("error"));
};

FakeFailDatabase.prototype.remove = function(collection, criteria, callback){
  callback(new Error("error"));
};