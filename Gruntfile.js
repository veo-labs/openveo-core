'use strict';

/* eslint node/no-sync: 0 */
require('./processRequire.js');
var fs = require('fs');

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

  // Set "withSourceMaps" property which will be used by grunt tasks to set appropriate configuration
  process.withSourceMaps = (process.argv.length > 3 && process.argv[3] === '--with-source-maps') ? true : false;

  grunt.initConfig(config);
  grunt.config.merge(loadConfig('./tasks'));

  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-exec');

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

};
