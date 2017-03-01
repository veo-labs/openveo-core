'use strict';

var path = require('path');
var openVeoApi = require('@openveo/api');
var configDir = openVeoApi.fileSystem.getConfDir();

/**
 * Generates exec command to drop the test database.
 *
 * @return {String} The drop command or null if databaseTestConf.json file is not readable or not valid
 */
function getDropDatabaseCommand() {
  var conf;

  // Test if databaseTestConf.json exists
  try {
    conf = openVeoApi.util.shallowValidateObject(require(path.join(configDir, 'core/databaseTestConf.json')), {
      host: {type: 'string', required: true},
      username: {type: 'string', required: true},
      password: {type: 'string', required: true},
      database: {type: 'string', required: true},
      port: {type: 'number'},
      replicaSet: {type: 'string'},
      seedlist: {type: 'string'}
    });
  } catch (e) {
    process.stdout.write('dropTestDatabase failed with message : ' + e.message + '\n');
    return null;
  }

  if (conf.replicaSet && conf.seedlist) {
    conf.host = conf.replicaSet + '/' + conf.seedlist;
    conf.port = null;
  }

  return 'mongo -u ' + conf.username +
      ' -p ' + conf.password +
      ' --host ' + conf.host +
      ' --authenticationDatabase ' + conf.database +
      ' --eval "db.dropDatabase()"' +
      ' ' + conf.database +
      ((conf.port) ? ' --port ' + conf.port : '');
}

// For more information about Grunt exec, have a look at https://www.npmjs.com/package/grunt-exec
module.exports = {

  // Remove test database
  // Test database is described in databaseTestConf.json configuration file
  dropTestDatabase: {
    command: getDropDatabaseCommand(),
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
  },

  // Aggregates all entities from core and plugins
  createEntities: {
    command: 'node -r ./processRequire.js ./tests/client/e2eTests/scripts/createEntities.js',
    stdout: true,
    stderr: true
  }

};
