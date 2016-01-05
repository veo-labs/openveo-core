'use strict';

// For more information about Grunt protractor, have a look at https://www.npmjs.com/package/grunt-protractor-runner
module.exports = {

  // Launch end to end tests
  core: {
    options: {
      configFile: '<%= project.tests %>/client/protractorConf.js',
      debug: false
    }
  }

};
