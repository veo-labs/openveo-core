"use strict"

// Module dependencies
var assert = require("chai").assert;

// EntityModel.js
describe("EntityModel", function(){
  var EntityModel;

  // Initializes tests
  before(function(){
    EntityModel = process.requireAPI("lib/models/EntityModel.js");
  });
  
  it("Should expose crud methods", function(){
    assert.isFunction(EntityModel.prototype.get);
    assert.isFunction(EntityModel.prototype.getOne);
    assert.isFunction(EntityModel.prototype.add);
    assert.isFunction(EntityModel.prototype.update);
    assert.isFunction(EntityModel.prototype.remove);
  }); 

});