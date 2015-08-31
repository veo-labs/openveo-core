"use strict"

// Module dependencies
var path = require("path");
var assert = require("chai").assert;
var ut = require("@openveo/test").generator;

// routeLoader.js
describe("routeLoader", function(){
  var routeLoader, pluginConf;

  before(function(){
    pluginConf = require("./plugins/node_modules/@openveo/example/conf.json");
    routeLoader = process.require("app/server/loaders/routeLoader.js");
  });

  // decodeRoutes method
  describe("decodeRoutes", function(){
    var routes, adminRoutes; 

    before(function(){
      routes = routeLoader.decodeRoutes(path.join(__dirname, "plugins", "node_modules", "@openveo/example"), pluginConf["routes"]["public"]);
      adminRoutes = routeLoader.decodeRoutes(path.join(__dirname, "plugins", "node_modules", "@openveo/example"), pluginConf["routes"]["admin"]);
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

  // applyRoutes method
  describe("applyRoutes", function(){

    it("Should be able to apply a route to an express router", function(done){

      var routes = [
        {
          method : "get",
          path : "/get",
          action : function(){}
        },
        {
          method : "post",
          path : "/post",
          action : function(){}
        },
        {
          method : "put",
          path : "/put",
          action : function(){}
        },
        {
          method : "delete",
          path : "/delete",
          action : function(){}
        },
        {
          method : "all",
          path : "/all",
          action : function(){}
        }
      ];

      var router = {
        get: function(path, action){
          assert.equal(path, "/get");
          assert.isFunction(action);
        },
        post: function(path, action){
          assert.equal(path, "/post");
          assert.isFunction(action);
        },
        put: function(path, action){
          assert.equal(path, "/put");
          assert.isFunction(action);
        },
        delete: function(path, action){
          assert.equal(path, "/delete");
          assert.isFunction(action);
        },
        all: function(path, action){
          assert.equal(path, "/all");
          assert.isFunction(action);
          done();
        }
      };

      routeLoader.applyRoutes(routes, router);

    });

  });

});