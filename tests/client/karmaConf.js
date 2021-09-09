'use strict';

var unit = require('@openveo/test').unit;

// Karma configuration
module.exports = function(config) {

  config.set({

    // Use mocha and chai for tests
    frameworks: ['mocha', 'chai'],

    // Web server port
    port: 9876,

    // Enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: DISABLE || ERROR || WARN || INFO || DEBUG
    logLevel: 'INFO',

    // Enable / disable watching file and executing tests whenever
    // any file changes
    autoWatch: false,

    // List of browsers to execute tests on
    browsers: ['ChromeHeadlessCI'],

    // Configure custom ChromHeadlessCI as an extension of ChromeHeadless without sandbox
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Base path that will be used to resolve all patterns
    // (eg. files, exclude)
    basePath: '../../',

    // Preprocessors configuration
    preprocessors: {
      'app/client/admin/views/*.html': 'ng-inline-templates'
    },

    // ng-inline-templates configuration
    ngInlineTemplatesPreprocessor: {
      moduleName: 'inline-templates'
    },

    // Plugins to load
    plugins: [
      'karma-chai',
      'karma-mocha',
      'karma-chrome-launcher',
      unit.plugins.inlineTemplatesPreprocessor
    ],

    // List of files / patterns to load in the browser
    files: [
      'node_modules/api-check/dist/api-check.js',
      'node_modules/angular/angular.js',
      'node_modules/angular-animate/angular-animate.js',
      'node_modules/angular-route/angular-route.js',
      'node_modules/angular-cookies/angular-cookies.js',
      'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/angular-sanitize/angular-sanitize.js',
      'node_modules/angular-ui-tree/dist/angular-ui-tree.js',
      'node_modules/angular-formly/dist/formly.js',
      'node_modules/angular-formly-templates-bootstrap/dist/angular-formly-templates-bootstrap.js',
      'node_modules/ng-tasty/ng-tasty-tpls.js',
      'node_modules/fastclick/lib/fastclick.js',
      'node_modules/tinymce/tinymce.js',
      'node_modules/angular-ui-tinymce/dist/tinymce.min.js',
      'node_modules/ng-file-upload/dist/ng-file-upload.js',
      'tests/client/unitTests/init.js',
      'app/client/admin/js/authentication/AuthenticationApp.js',
      'app/client/admin/js/ov/OvApp.js',
      'app/client/admin/js/util/UtilApp.js',
      'app/client/admin/views/*.html',
      'app/client/admin/js/**/*.js',
      'tests/client/unitTests/*.js'
    ]

  });

};
