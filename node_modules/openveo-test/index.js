"use strict"

// Module dependencies
var path = require("path");

// Set module root directory
process.rootTest = __dirname;
process.requireTest = function(filePath){
  return require(path.normalize(process.rootTest + "/" + filePath));
};

module.exports.generator = process.requireTest("lib/generator.js");