'use strict';

// Karma configuration
module.exports = function(config) {

  config.set({

    // Base path that will be used to resolve all patterns
    // (eg. files, exclude)
    basePath: '../../',

    // List of files / patterns to load in the browser
    files: [
      'assets/lib/api-check/dist/api-check.js',
      'assets/lib/angular/angular.js',
      'assets/lib/angular-animate/angular-animate.js',
      'assets/lib/angular-route/angular-route.js',
      'assets/lib/angular-cookies/angular-cookies.js',
      'assets/lib/angular-bootstrap/ui-bootstrap-tpls.js',
      'assets/lib/angular-mocks/angular-mocks.js',
      'assets/lib/angular-touch/angular-touch.js',
      'assets/lib/angular-sanitize/angular-sanitize.js',
      'assets/lib/angular-ui-tree/dist/angular-ui-tree.js',
      'assets/lib/angular-formly/dist/formly.js',
      'assets/lib/angular-formly-templates-bootstrap/dist/angular-formly-templates-bootstrap.js',
      'assets/lib/angular-xeditable/dist/js/xeditable.js',
      'assets/lib/checklist-model/checklist-model.js',
      'assets/lib/ng-jsonpath/dist/ng-jsonpath.js',
      'assets/lib/ng-tasty/ng-tasty-tpls.js',
      'app/client/admin/js/authentication/AuthenticationApp.js',
      'app/client/admin/js/ov/OvApp.js',
      'app/client/admin/js/**/*.js',
      'tests/client/unitTests/*.js'
    ]

  });

};
