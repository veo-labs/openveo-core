"use strict"

// Module dependencies
var assert = require("chai").assert;

// util.js
describe("util", function(){
  var util;

  // Intiializes tests
  before(function(){
    util = process.requireAPI("lib/util.js");
  });

  // merge function
  describe("merge", function(){

    it("Should be able to merge two objects with depth = 1", function(){
      var mergedObject = util.merge(
        {
          property1 : "value1",
          property2 : "value2"
        },
        {
          property1 : "newValue1",
          property3 : "value3"
        }
      );
      
      assert.equal(mergedObject.property1, "newValue1");
      assert.equal(mergedObject.property2, "value2");
      assert.equal(mergedObject.property3, "value3");
    });
    
    it("Should be able to recursively merge two objects with depth > 1", function(){
      var mergedObject = util.merge(
        {
          property1 : {
            subProperty1 : {
              subSubProperty1 : "subSubValue1" 
            }
          }
        },
        {
          property1 : {
            subProperty1 : {
              subSubProperty2 : "subSubValue2"
            },
            subProperty2 : "subProperty2",
            subProperty3 : function(){return "function";}
          }
        }
      );
      
      assert.equal(mergedObject.property1.subProperty1.subSubProperty1, "subSubValue1");
      assert.equal(mergedObject.property1.subProperty1.subSubProperty2, "subSubValue2");
      assert.equal(mergedObject.property1.subProperty2, "subProperty2");
      assert.equal(mergedObject.property1.subProperty3(), "function");
    });   
    
  }); 

});