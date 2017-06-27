'use strict';

/**
 * Flightplan plans.
 *
 * Requirements to executes flightplan:
 * - node
 * - npm
 * - flightplan cli(npm install -g flightplan)
 *
 * e2e task:
 * Execute OpenVeo Core end to end tests on chrome
 *
 * e2e options:
 * - skipInstall: Skip installation, just execute end to end tests
 * - skipDriversUpdate: Skip protractor web drivers update
 *
 * e2e environment variables:
 * - TRAVIS_BRANCH: The name of the openveo-manage branch to test (default: develop)
 * - OPENVEO_API_BRANCH: The name of the openveo-api branch to test with (default: develop)
 * - OPENVEO_TEST_BRANCH: The name of the openveo-test branch to test with (default: develop)
 * - OPENVEO_REST_NODEJS_CLIENT_BRANCH: The name of the openveo-rest-nodejs-client branch to test
 *   with (default: develop)
 *
 * e2e usage:
 * - fly e2e:local
 * - fly e2e:local --skipInstall --skipDriversUpdate
 *
 * unit task:
 * Execute OpenVeo Core unit tests.
 *
 * unit environment variables:
 * - TRAVIS_BRANCH: The name of the openveo-manage branch to test (default: develop)
 * - OPENVEO_API_BRANCH: The name of the openveo-api branch to test with (default: develop)
 * - OPENVEO_TEST_BRANCH: The name of the openveo-test branch to test with (default: develop)
 * - OPENVEO_REST_NODEJS_CLIENT_BRANCH: The name of the openveo-rest-nodejs-client branch to test
 *   with (default: develop)
 *
 * unit usage:
 * - fly unit:local
 */

var path = require('path');
var plan = require('flightplan');
var openVeoApi = require('@openveo/api');

var workingDirectory = path.normalize('build/working');
var coreBranch = process.env.TRAVIS_BRANCH || 'develop';
var apiBranch = process.env.OPENVEO_API_BRANCH || 'develop';
var testBranch = process.env.OPENVEO_TEST_BRANCH || 'develop';
var restNodejsClientBranch = process.env.OPENVEO_REST_NODEJS_CLIENT_BRANCH || 'develop';
var homeDirectory = openVeoApi.fileSystem.getConfDir();

// Add a local target
plan.target('local');

// Create working directory where plans will be executed
plan.local(['unit'], function(local) {
  if (plan.runtime.options.skipInstall)
    return;

  // Remove working directory if it exists
  local.rm('-Rf ' + workingDirectory);

  // The -p option does not work on Node.js command prompt
  // If it fails use mkdir command without options
  if (local.exec('mkdir -p ' + workingDirectory, {failsafe: true}).code === 1)
    local.mkdir(workingDirectory);
});

// Install OpenVeo Core
plan.local(['e2e', 'unit'], function(local) {
  if (plan.runtime.options.skipInstall)
    return;

  local.log('Start installing openveo-core');

  try {

    // Checkout project specific branch or tag into working directory
    local.exec('git clone --branch=' +
               coreBranch +
               ' --single-branch https://github.com/veo-labs/openveo-core.git ' +
               workingDirectory);

    // Create openveo configuration directory
    var coreConfigurationDirectory = path.join(homeDirectory, 'core');

    if (local.exec('test -e ' + coreConfigurationDirectory, {failsafe: true}).code === 1) {
      if (local.exec('mkdir -p ' + coreConfigurationDirectory, {failsafe: true}).code === 1)
        local.mkdir(coreConfigurationDirectory);
    }

    // Copy configuration files if not always present
    var configurationFiles = ['conf.json', 'databaseTestConf.json', 'loggerTestConf.json', 'serverTestConf.json'];

    configurationFiles.forEach(function(configurationFile) {
      var destinationPath = path.join(coreConfigurationDirectory, configurationFile);
      if (local.exec('test -e ' + destinationPath, {failsafe: true}).code === 1)
        local.cp(path.normalize('tests/conf/' + configurationFile) + ' ' + destinationPath);
    });

    // Install openveo-core dependencies and compile sources
    local.with('cd ' + workingDirectory, function() {
      local.exec('npm install --ignore-scripts');
      local.exec('bower install');
      local.exec('grunt prod');
    });

    local.log('openveo-core successfully installed');
  } catch (e) {
    plan.abort(e.message);
  }
});

// Install OpenVeo API
plan.local(['e2e', 'unit'], function(local) {
  if (plan.runtime.options.skipInstall)
    return;

  local.log('Start installing openveo-api');

  try {

    var apiDirectory = path.join(workingDirectory, 'node_modules/@openveo/api');

    // Remove api directory if it exists
    local.rm('-Rf ' + apiDirectory);

    // Checkout project
    local.exec('git clone --branch=' +
               apiBranch +
               ' --single-branch https://github.com/veo-labs/openveo-api.git ' +
               apiDirectory);

    // Install openveo-api dependencies
    local.with('cd ' + apiDirectory, function() {
      local.exec('npm install');
    });

    // Remove @openveo dependencies if any
    local.rm('-Rf ' + path.join(apiDirectory, 'node_modules/@openveo'));

    local.log('openveo-api successfully installed');
  } catch (e) {
    plan.abort(e.message);
  }
});

// Install OpenVeo test
plan.local(['e2e', 'unit'], function(local) {
  if (plan.runtime.options.skipInstall)
    return;

  local.log('Start installing openveo-test');

  try {

    var testDirectory = path.join(workingDirectory, 'node_modules/@openveo/test');

    // Remove test directory if it exists
    local.rm('-Rf ' + testDirectory);

    // Checkout project
    local.exec('git clone --branch=' +
               testBranch +
               ' --single-branch https://github.com/veo-labs/openveo-test.git ' +
               testDirectory);

    // Install openveo-test dependencies
    local.with('cd ' + testDirectory, function() {
      local.exec('npm install');
    });

    // Remove @openveo dependencies if any
    local.rm('-Rf ' + path.join(testDirectory, 'node_modules/@openveo'));

    local.log('openveo-test successfully installed');
  } catch (e) {
    plan.abort(e.message);
  }
});

// Install OpenVeo REST Nodejs client
plan.local(['e2e', 'unit'], function(local) {
  if (plan.runtime.options.skipInstall)
    return;

  local.log('Start installing openveo-rest-nodejs-client');

  try {

    var restNodejsClientDirectory = path.join(workingDirectory, 'node_modules/@openveo/rest-nodejs-client');

    // Remove REST nodejs client directory if it exists
    local.rm('-Rf ' + restNodejsClientDirectory);

    // Checkout project
    local.exec('git clone --branch=' +
               restNodejsClientBranch +
               ' --single-branch https://github.com/veo-labs/openveo-rest-nodejs-client.git ' +
               restNodejsClientDirectory);

    // Install openveo-rest-nodejs-client dependencies
    local.with('cd ' + restNodejsClientDirectory, function() {
      local.exec('npm install');
    });

    // Remove @openveo dependencies if any
    local.rm('-Rf ' + path.join(restNodejsClientDirectory, 'node_modules/@openveo'));

    local.log('openveo-rest-nodejs-client successfully installed');
  } catch (e) {
    plan.abort(e.message);
  }
});

// Update protractor web drivers
plan.local(['e2e'], function(local) {
  if (plan.runtime.options.skipDriversUpdate)
    return;

  try {
    local.exec(path.join(workingDirectory, 'node_modules/protractor/bin/webdriver-manager update'));
  } catch (e) {
    plan.abort(e.message);
  }
});

// Execute OpenVeo end to end tests using chrome
plan.local(['e2e'], function(local) {
  try {
    local.with('cd ' + workingDirectory, function() {
      local.exec(
        'grunt test-e2e --capabilities="{\\"browserName\\": \\"chrome\\"}" --directConnect=true --suite="core"'
      );
    });
  } catch (e) {
    plan.abort(e.message);
  }
});

// Execute OpenVeo unit tests
plan.local(['unit'], function(local) {
  try {
    local.with('cd ' + workingDirectory, function() {
      local.exec('grunt karma');
      local.exec('grunt mochaTest');
    });
  } catch (e) {
    plan.abort(e.message);
  }
});
