'use strict';

/**
 * Creates the OpenVeo super administrator if it does not exist.
 *
 * Usage:
 *
 * # Create Openveo super administrator
 * - node createSuperAdmin.js --name="ADMIN_NAME" --email="ADMIN_EMAIL" --password="ADMIN_PASSWORD"
 */

require('./processRequire.js');
var crypto = require('crypto');
var path = require('path');
var async = require('async');
var nopt = require('nopt');
var openVeoApi = require('@openveo/api');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var confDir = path.join(openVeoApi.fileSystem.getConfDir(), 'core');
var conf = require(path.join(confDir, 'conf.json'));
var databaseConf = require(path.join(confDir, 'databaseConf.json'));
var exit = process.exit;
var database;

// Process arguments
var knownProcessOptions = {
  name: [String],
  email: [String],
  password: [String]
};

// Parse process arguments
var processOptions = nopt(knownProcessOptions, null, process.argv);

async.series([

  // Connect to database
  function(callback) {
    var db = openVeoApi.database.factory.get(databaseConf);
    db.connect(function(error) {
      if (error)
        error.message = 'Could not connect to the database with message : ' + error.message;

      database = db;

      callback(error);
    });
  },

  // Verify if the super admin does not already exist
  function(callback) {
    var userProvider = new UserProvider(database);
    userProvider.getOne('0', null, function(error, user) {
      if (user)
        callback(new Error('A super admin user already exists\n'));
      else if (error)
        callback(error);
      else
        callback();
    });
  },

  // Create super admin user
  function(callback) {
    if (!openVeoApi.util.isEmailValid(processOptions.email))
      return callback(new Error('Invalid email, aborting'));

    var user = {
      id: '0',
      locked: true,
      name: processOptions.name,
      email: processOptions.email,
      password: crypto.createHmac('sha256', conf.passwordHashKey).update(processOptions.password).digest('hex')
    };

    var userProvider = new UserProvider(database);
    userProvider.add(user, function(error) {
      if (!error)
        process.stdout.write('Super administrator successfully created');

      callback(error);
    });
  }
], function(error, results) {
  if (error) {
    process.stdout.write(error.message);
    throw error;
  }

  exit();
});
