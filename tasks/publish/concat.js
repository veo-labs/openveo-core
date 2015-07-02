var path = require("path");
process.root = __dirname;
process.require = function (filePath) {
  return require(path.normalize(process.root + "/" + filePath));
};
var applicationConf = process.require("../../node_modules/openveo-publish/conf.json");
var jsFile = applicationConf["backOffice"]["scriptFiles"]["dev"];


module.exports = {
  options: {
    separator: ';',
  },
  publishjs: {
    src: (function () {
      var files = [];
      jsFile.forEach(function (path) {
        files.push('<%= publish.uglify %>/' + path.replace('js', 'min.js'));
      });
      return files;
    }()),
    dest: '<%= publish.js %>/openveoPublish.js',
  }
}
