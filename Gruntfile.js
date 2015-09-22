'use strict';

/**
 * Loads a bunch of grunt configuration files from the given directory.
 *
 * Loaded configurations can be referenced using the configuration file name.
 * For example, if myConf.js describes a property "test", it will be accessible
 * using myConf.test.
 *
 * @param String path Path of the directory containing configuration files
 * @return Object The list of configurations indexed by filename without
 * the extension
 */
function loadConfig(path) {
  var glob = require('glob');
  var object = {};
  var key;

  glob.sync('*', {cwd: path}).forEach(function(option) {
    key = option.replace(/\.js$/, '');
    object[key] = require(path + '/' + option);
  });

  return object;
}

module.exports = function(grunt) {
  var config = {
    pkg: grunt.file.readJSON('package.json'),
    env: process.env
  };

  grunt.initConfig(config);
  grunt.config.merge(loadConfig('./tasks/core'));

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-eslint');

  // only watch core scss
  grunt.registerTask('default', ['compass:dev', 'watch']);

  // uglify and concat core
  grunt.registerTask('concatcore', ['uglify:prod', 'concat:lib', 'concat:js']);

  // core Prod process (CSS+JS)
  grunt.registerTask('prod', ['compass:dist', 'concatcore']);

};
