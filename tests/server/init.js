"use strict"

// Module dependencies
var path = require("path");

// Set module root directory
process.root = path.join(__dirname, "../../");
process.require = function(filePath){
  return require(path.normalize(process.root + "/" + filePath));
};

// Define a custom require function to load modules of the core from plugins
process.requireModule = function(moduleName){
  return require(moduleName);
};