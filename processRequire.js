'use strict';

var path = require('path');

// Set module root directory and define a custom require function
process.root = __dirname;
process.require = function(filePath) {
  return require(path.join(process.root, filePath));
};
