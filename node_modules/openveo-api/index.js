"use strict"

// Module dependencies
var path = require("path");

// Set module root directory
process.rootAPI = __dirname;
process.requireAPI = function(filePath){
  return require(path.normalize(process.rootAPI + "/" + filePath));
};

module.exports.Plugin = process.requireAPI("lib/Plugin.js");
module.exports.Database = process.requireAPI("lib/Database.js");
module.exports.applicationStorage = process.requireAPI("lib/applicationStorage.js");
module.exports.fileSystem = process.requireAPI("lib/fileSystem.js");
module.exports.util = process.requireAPI("lib/util.js");
module.exports.logger = process.requireAPI("lib/logger.js");
module.exports.EntityModel = process.requireAPI("lib/models/EntityModel.js");
module.exports.EntityProvider = process.requireAPI("lib/providers/EntityProvider.js");