#!/usr/bin/env node

/**
 * Removes e2e test database.
 *
 * It needs to be run from project root directory.
 *
 * Usage:
 *
 * # Drop test database defined in .openveo/core/databaseTestConf.json
 * $ dropTestDatabase
 */

'use strict';

const {exec} = require('child_process');
const path = require('path');
const openVeoApi = require('@openveo/api');

const configDir = openVeoApi.fileSystem.getConfDir();

/**
 * Drops test database defined in .openveo/core/databaseTestConf.json.
 *
 * @return {Promise} Promise resolving when database has been dropped
 */
async function dropDatabase() {
  return new Promise((resolve, reject) => {
    const conf = openVeoApi.util.shallowValidateObject(require(path.join(configDir, 'core/databaseTestConf.json')), {
      host: {type: 'string', required: true},
      username: {type: 'string', required: true},
      password: {type: 'string', required: true},
      database: {type: 'string', required: true},
      port: {type: 'number'},
      replicaSet: {type: 'string'},
      seedlist: {type: 'string'}
    });

    if (conf.replicaSet && conf.seedlist) {
      conf.host = conf.replicaSet + '/' + conf.seedlist;
      conf.port = null;
    }

    const command = 'mongo -u ' + conf.username +
      ' -p ' + conf.password +
      ' --host ' + conf.host +
      ' --authenticationDatabase ' + conf.database +
      ' --eval "db.dropDatabase()"' +
      ' ' + conf.database +
      ((conf.port) ? ' --port ' + conf.port : '');
    console.log(`dropTestDatabase > ${process.cwd()} > Drop database`);
    exec(command, {cwd: process.cwd()}, (error, stdout, stderr) => {
      if (error) return reject(error);
      console.log(stdout);
      return resolve();
    });
  });
}

/**
 * Removes test database.
 */
async function main() {
  await dropDatabase();
}

main();
