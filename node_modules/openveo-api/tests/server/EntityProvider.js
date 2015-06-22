"use strict"

// Module dependencies
var util = require("util");
var assert = require("chai").assert;

// EntityProvider.js
describe("EntityProvider", function(){
  var EntityProvider, Database;

  // Initializes tests
  before(function(){
    Database = process.requireAPI("lib/Database.js");
    EntityProvider = process.requireAPI("lib/providers/EntityProvider.js");
  });
  
  it("Should expose crud methods to interact with database", function(){
    assert.isFunction(EntityProvider.prototype.get);
    assert.isFunction(EntityProvider.prototype.getOne);
    assert.isFunction(EntityProvider.prototype.add);
    assert.isFunction(EntityProvider.prototype.update);
    assert.isFunction(EntityProvider.prototype.remove);
  });
  
  it("Should initialize only if a database and a collection is given", function(){
    function ExampleDatabase(databaseConf){
      Database.call(this, databaseConf);
    }

    module.exports = ExampleDatabase;
    util.inherits(ExampleDatabase, Database);

    new EntityProvider(new ExampleDatabase({}), "A collection");
  });

});