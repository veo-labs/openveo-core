"use strict"

// Module dependencies
var path = require("path");
var assert = require("chai").assert;

// Set module root directory
process.root = path.join(__dirname, "../../");
process.require = function(filePath){
  return require(path.normalize(process.root + "/" + filePath));
};

var routeLoader = require("../../app/server/loaders/routeLoader.js");
var pluginConf = require("./plugins/node_modules/openveo-example/conf.json");

describe("routeLoader", function(){

  describe("decodeRoutes", function(){
    var routes, adminRoutes; 

    before(function(){
      routes = routeLoader.decodeRoutes(path.join(__dirname, "plugins", "node_modules", "openveo-example"), pluginConf["routes"]["public"]);
      adminRoutes = routeLoader.decodeRoutes(path.join(__dirname, "plugins", "node_modules", "openveo-example"), pluginConf["routes"]["admin"]);
    });

    it("Should load 4 public routes and ignores 3", function(){
      assert.equal(routes.length, 4);
    });
    
    it("Should load 6 admin routes", function(){
      assert.equal(adminRoutes.length, 6);
    });

    it("Should load routes as an array of objects", function(){
      assert.isArray(routes);
      assert.isObject(routes[0]);
    });
    
    it("Should be able to load routes with several actions", function(){
      var countRoutes = 0;
      adminRoutes.forEach(function(adminRoute){
        if(adminRoute.path === "*" && adminRoute.method === "all")
          countRoutes++;
      });
      
      assert.equal(countRoutes, 2);
    });

    it("Should load objects with properties \"method\", \"path\" and \"action\"", function(){
      assert.isDefined(routes[0].method);
      assert.isDefined(routes[0].path);
      assert.isDefined(routes[0].action);
      assert.isString(routes[0].method);
      assert.isString(routes[0].path);
      assert.isFunction(routes[0].action);
    });

  });

});