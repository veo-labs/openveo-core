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
var path = require('path');
var openVeoApi = require('@openveo/api');
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
var suites = process.require('tests/client/protractorSuites.json');

// Path to the test suites files to load
var suiteFilePath = 'tests/client/protractorSuites.json';
var aggregatedSuiteFilePath = path.join(process.root, 'tests/client/e2eTests/build/suites.json');

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

    if (Array.isArray(suite)) {
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
        openVeoApi.util.merge(suites, pluginSuites);
      } catch (e) {
        process.stdout.write('Can\'t load file ' + path.join(pluginPath, suiteFilePath) + '\n');
      }
    }
    openVeoApi.fileSystem.mkdir(path.dirname(aggregatedSuiteFilePath), function(error) {
      if (!error)
        fs.writeFile(aggregatedSuiteFilePath, JSON.stringify(suites), {encoding: 'utf8'}, function(writeError) {
          if (writeError)
            process.stdout.write('Couln\'t create aggregated suite file with message: ' + writeError.message + '\n');
          else
            process.stdout.write('Aggregated suite file created at ' + aggregatedSuiteFilePath + '\n');
        });
    });
  }
});
