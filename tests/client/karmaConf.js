'use strict';

// Karma configuration
module.exports = function(config) {

  config.set({

    // Base path that will be used to resolve all patterns
    // (eg. files, exclude)
    basePath: '../../',

    // List of files / patterns to load in the browser
    files: [
      'public/lib/api-check/dist/api-check.js',
      'public/lib/angular/angular.js',
      'public/lib/angular-animate/angular-animate.js',
      'public/lib/angular-route/angular-route.js',
      'public/lib/angular-cookies/angular-cookies.js',
      'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
      'public/lib/angular-mocks/angular-mocks.js',
      'public/lib/angular-touch/angular-touch.js',
      'public/lib/angular-sanitize/angular-sanitize.js',
      'public/lib/angular-ui-tree/dist/angular-ui-tree.js',
      'public/lib/angular-formly/dist/formly.js',
      'public/lib/angular-formly-templates-bootstrap/dist/angular-formly-templates-bootstrap.js',
      'public/lib/angular-xeditable/dist/js/xeditable.js',
      'public/lib/checklist-model/checklist-model.js',
      'public/lib/multirange/multirange.js',
      'public/lib/ng-jsonpath/dist/ng-jsonpath.js',
      'public/lib/ng-tasty/ng-tasty-tpls.js',
      'app/client/admin/js/authentication/AuthenticationApp.js',
      'app/client/admin/js/route/RouteApp.js',
      'app/client/admin/js/ov/OvApp.js',
      'app/client/admin/js/**/*.js',
      'tests/client/unitTests/*.js'
    ]

  });

};
