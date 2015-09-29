'use strict';

var path = require('path');
process.root = __dirname;
process.require = function(filePath) {
  return require(path.normalize(process.root + '/' + filePath));
};
var applicationConf = process.require('../../conf.json');
var libFile = applicationConf['backOffice']['scriptLibFiles']['dev'];
var jsFile = applicationConf['backOffice']['scriptFiles']['dev'];


module.exports = {
  options: {
    separator: ';'
  },
  lib: {
    src: (function() {
      var files = [];
      libFile.forEach(function(filePath) {
        files.push('<%= project.uglify %>/lib/' + filePath.replace('js', 'min.js'));
      });
      return files;
    }()),
    dest: '<%= project.beJSAssets %>/libOpenveo.js'
  },
  js: {
    src: (function() {
      var files = [];
      jsFile.forEach(function(filePath) {
        files.push('<%= project.uglify %>/' + filePath.replace('js', 'min.js'));
      });
      return files;
    }()),
    dest: '<%= project.beJSAssets %>/openveo.js'
  }
};
