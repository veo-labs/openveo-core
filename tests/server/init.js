'use strict';

var path = require('path');
var openVeoApi = require('@openveo/api');

// Set module root directory
process.root = path.join(__dirname, '../../');
process.require = function(filePath) {
  return require(path.normalize(process.root + '/' + filePath));
};

process.logger = openVeoApi.logger.add('openveo');
