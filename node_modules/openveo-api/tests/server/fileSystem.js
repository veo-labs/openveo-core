"use strict"

// Module dependencies
var path = require("path");
var fs = require("fs");
var assert = require("chai").assert;

// fileSystem.js
describe("fileSystem", function(){
  var fileSystem;

  // Initializes tests
  before(function(){
    fileSystem = process.requireAPI("lib/fileSystem.js");
  });

  // extract method
  describe("extract", function(){

    it("Should be able to extract a tar file", function(done){
      fileSystem.extract(path.normalize(__dirname + "/fileSystem/package.tar"), path.normalize(__dirname + "/fileSystem/package"), function(error){
        if(!error)
          done();
        else
          assert.ok(false);
      });
    });
    
  });
  
  // rmdir method
  describe("rmdir", function(){
  
    it("Should be able to recursively remove a directory with all its content", function(done){
      fileSystem.rmdir(path.normalize(__dirname + "/fileSystem/package"), function(error){
        if(!error)
          done();
        else
          assert.ok(false);
      });
    });
    
  });
  
  // getJSONFileContent method
  describe("getJSONFileContent", function(){
  
    it("Should be able to get a file content as JSON", function(done){
      fileSystem.getJSONFileContent(path.normalize(__dirname + "/fileSystem/.session"), function(error, data){
        if(!error){
          assert.isObject(data);
          done();
        }
        else
          assert.ok(false);
      });
    });
    
  });  
  
  // copy method
  describe("copy", function(){
  
    it("Should be able to copy a file", function(done){
      fileSystem.copy(path.normalize(__dirname + "/fileSystem/.session"), path.normalize(__dirname + "/fileSystem/.sessionCopy"), function(error){
        if(!error){
          fs.unlink(path.normalize(__dirname + "/fileSystem/.sessionCopy"), function(error){
            if(!error)
              done();
          });          
        }
        else
          assert.ok(false);
      });
    });
    
  });   

});