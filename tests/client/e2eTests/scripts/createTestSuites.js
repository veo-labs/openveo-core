'use strict';

/**
 * Creates the list of test suites for end to end tests.
 *
 * @example
 *
 *     // Usage (from projet's root directory)
 *     node -r ./processRequire.js ./tests/client/e2eTests/scripts/createTestSuites.js
 */

var fs = require('fs');
var util = require('util');
var path = require('path');
var openVeoAPI = require('@openveo/api');
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
var suites = process.require('tests/client/protractorSuites.json');

// Path to the test suites files to load
var suiteFilePath = 'tests/client/protractorSuites.json';
var aggregatedSuiteFilePath = path.join(process.root, 'tests/client/e2eTests/suites/suites.json');

/**
 * Transforms all suites relatve path to absolute path.
 *
 * By default all suites are relative to protractorSuites.json.
 *
 * @param {Object} suites Suites description object
 * @param {String} basePath Base absolute path for these suites
 */
function setSuitesAbsolutePath(suites, basePath) {
  for (var suiteName in suites) {
    var suite = suites[suiteName];

    if (util.isArray(suite)) {
      for (var i = 0; i < suite.length; i++) {
        suite[i] = path.join(basePath, suite[i]);
      }
    } else
      suites[suiteName] = path.join(basePath, suite);
  }
}

setSuitesAbsolutePath(suites, path.join(process.root, 'tests/client'));

// Get plugins paths
pluginLoader.getPluginPaths(process.root, function(error, pluginPaths) {
  if (pluginPaths) {
    for (var i = 0; i < pluginPaths.length; i++) {
      var pluginPath = pluginPaths[i];

      try {
        var pluginSuites = require(path.join(pluginPath, suiteFilePath));
        setSuitesAbsolutePath(pluginSuites, path.join(pluginPath, 'tests/client'));
        openVeoAPI.util.merge(suites, pluginSuites);
      } catch (e) {
        process.stdout.write('Can\'t load file ' + path.join(pluginPath, suiteFilePath) + '\n');
      }
    }
    fs.writeFile(aggregatedSuiteFilePath, JSON.stringify(suites), {encoding: 'utf8'});
  }
});
