var path = require("path");
process.root = __dirname;
process.require = function (filePath) {
  return require(path.normalize(process.root + "/" + filePath));
};
var applicationConf = process.require("../../conf.json");
var libFile = applicationConf["backOffice"]["scriptLibFiles"]["dev"];
var jsFile = applicationConf["backOffice"]["scriptFiles"]["dev"];


module.exports = {
  options: {
    separator: ';',
  },
  lib: {
    src: (function () {
      var files = [];
      libFile.forEach(function (path) {
        files.push('<%= project.uglify %>/lib/' + path.replace('js', 'min.js'));
      });
      return files;
    }()),
    dest: '<%= project.js %>/libOpenveo.js',
  },
  js: {
    src: (function () {
      var files = [];
      jsFile.forEach(function (path) {
        files.push('<%= project.uglify %>/' + path.replace('js', 'min.js'));
      });
      return files;
    }()),
    dest: '<%= project.js %>/openveo.js',
  }
}
