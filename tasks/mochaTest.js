'use strict';

module.exports = {

  // Core unit tests
  core: {
    options: {
      reporter: 'spec'
    },
    src: [
      'tests/server/init.js',
      'tests/server/core/*.js',
      'tests/server/controllers/*.js',
      'tests/server/loaders/*.js'
    ]
  }

};
