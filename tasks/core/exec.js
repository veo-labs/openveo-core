'use strict';

var path = require('path');
var openVeoAPI = require('@openveo/api');
var configDir = openVeoAPI.fileSystem.getConfDir();
var databaseConf = require(path.join(configDir, 'core/databaseTestConf.json'));

// For more information about Grunt exec, have a look at https://www.npmjs.com/package/grunt-exec
module.exports = {

  // Remove test database
  // Test database is described in databaseTestConf.json configuration file
  dropTestDatabase: {
    command: 'mongo -u ' + databaseConf['username'] +
      ' -p ' + databaseConf['password'] +
      ' --authenticationDatabase ' + databaseConf['database'] +
      ' --eval "db.dropDatabase()"' +
      ' ' + databaseConf['database'],
    stdout: true,
    stderr: true
  },

  // Create test entities from core and plugin's description files
  createTestEntities: {
    command: 'node -r ./processRequire.js ./tests/client/e2eTests/scripts/importEntities.js',
    stdout: true,
    stderr: true
  },

  // Aggregates all protractor test suites from core and plugins
  createTestSuites: {
    command: 'node -r ./processRequire.js ./tests/client/e2eTests/scripts/createTestSuites.js',
    stdout: true,
    stderr: true
  }

};
