"use strict"

// Module dependencies
var path = require("path");
var assert = require("chai").assert;

// Set module root directory
process.root = path.join(__dirname, "../../");
process.require = function(filePath){
  return require(path.normalize(process.root + "/" + filePath));
};

var entityLoader = process.require("app/server/loaders/entityLoader.js");
var pluginConf = require("./plugins/node_modules/openveo-example/conf.json");

describe("entityLoader", function(){

  describe("decodeEntities", function(){

    it("Should be able to load entities associated models", function(){
      var entities = entityLoader.decodeEntities(path.join(__dirname, "plugins", "node_modules", "openveo-example"), pluginConf["entities"]);
      assert.isDefined(entities["entity-example"]);
    });

  });

});