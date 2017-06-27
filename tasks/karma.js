'use strict';

module.exports = {

  // Common options for all karma targets
  options: {

    // Use mocha and chai for tests
    frameworks: ['mocha', 'chai'],

    // Web server port
    port: 9876,

    // Enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: OFF || ERROR || WARN || INFO || DEBUG
    logLevel: 'INFO',

    // Enable / disable watching file and executing tests whenever
    // any file changes
    autoWatch: false,

    // List of browsers to execute tests on
    browsers: [
      'Chrome'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // HTML templates mock
    ngHtml2JsPreprocessor: {
      moduleName: 'templates'
    }

  },

  // Core unit tests
  core: {
    configFile: 'tests/client/karmaConf.js'
  }
};
