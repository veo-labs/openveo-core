// Karma configuration
module.exports = function(config){
  
  config.set({

    // Base path that will be used to resolve all patterns 
    // (eg. files, exclude)
    basePath: "../../",

    // Use mocha and chai for tests
    frameworks: ["mocha", "chai"],

    // List of files / patterns to load in the browser
    files: [
        "public/lib/angular/angular.js",
        "public/lib/angular-animate/angular-animate.js",
        "public/lib/angular-route/angular-route.js",
        "public/lib/angular-mocks/angular-mocks.js",
        "public/js/authentication/AuthenticationApp.js",
        "public/js/route/RouteApp.js",
        "public/js/ov/OvApp.js",
        "public/js/**/*.js",
        "tests/client/unitTests/*.js"
    ],

    // Web server port
    port: 9876,

    // Enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR 
    // || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Enable / disable watching file and executing tests whenever
    // any file changes
    autoWatch: false,

    // List of browsers to execute tests on
    browsers: [
      "Firefox",
      "Chrome",
      "IE",
      "PhantomJS"
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true

  });
  
};