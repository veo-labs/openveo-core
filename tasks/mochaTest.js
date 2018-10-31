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
      'tests/server/loaders/*.js',
      'tests/server/plugin/*.js',
      'tests/server/providers/*.js',
      'tests/server/migrations/*.js',
      'tests/server/servers/*.js'
    ]
  }

};
