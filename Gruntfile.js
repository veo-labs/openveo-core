'use strict';

/* eslint no-sync: 0 */
require('./processRequire.js');
var fs = require('fs');
var openVeoApi = require('@openveo/api');

/**
 * Loads a bunch of grunt configuration files from the given directory.
 *
 * Loaded configurations can be referenced using the configuration file name.
 * For example, if myConf.js returns an object with a property "test", it will be accessible using myConf.test.
 *
 * @param {String} path Path of the directory containing configuration files
 * @return {Object} The list of configurations indexed by filename without the extension
 */
function loadConfig(path) {
  var configuration = {};
  var configurationFiles = fs.readdirSync(path);

  configurationFiles.forEach(function(configurationFile) {
    configuration[configurationFile.replace(/\.js$/, '')] = require(path + '/' + configurationFile);
  });

  return configuration;
}

module.exports = function(grunt) {
  var config = {
    pkg: grunt.file.readJSON('package.json'),
    env: process.env
  };

  grunt.initConfig(config);
  grunt.config.merge(loadConfig('./tasks'));

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mkdocs');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerMultiTask('rename', openVeoApi.grunt.renameTask(grunt));
  grunt.registerMultiTask('remove', openVeoApi.grunt.removeTask(grunt));

  // Listen to changes on SCSS files and generate CSS files
  grunt.registerTask('default', ['compass:dev', 'watch']);

  // Launch end to end tests
  // e.g. grunt test-e2e --capabilities="{\"browserName\": \"chrome\"}" --directConnect=true
  // e.g. grunt test-e2e --capabilities="{\"browserName\": \"firefox\"}" --directConnect=true
  // e.g. grunt test-e2e --capabilities="{\"browserName\": \"internet explorer\"}"
  grunt.registerTask('test-e2e', [
    'exec:dropTestDatabase',
    'exec:createTestEntities',
    'exec:createTestSuites',
    'exec:createEntities',
    'protractor'
  ]);

  // Minify and concat back end AngularJS Javascript files
  grunt.registerTask('concatcore', ['uglify:prod', 'concat:lib', 'concat:js']);

  // Generate documentation
  grunt.registerTask('doc', ['remove:doc', 'mkdocs', 'yuidoc', 'rename:doc']);

  // Prepare project for production
  grunt.registerTask('prod', ['compass:dist', 'concatcore']);

  // Deploy documentation to github pages
  grunt.registerTask('deploy-doc', ['doc', 'gh-pages:doc']);

};
