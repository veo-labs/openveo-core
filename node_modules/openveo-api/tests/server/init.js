// Module dependencies
var path = require("path");

// Set module root directory
process.rootAPI = path.join(__dirname, "../../");
process.requireAPI = function(filePath){
  return require(path.normalize(process.rootAPI + "/" + filePath));
};