'use strict';

// Module dependencies
var readline = require('readline');
var crypto = require('crypto');
var path = require('path');
var openVeoAPI = require('@openveo/api');

// Set module root directory and define a custom require function
process.root = __dirname;
process.require = function(filePath) {
  return require(path.normalize(process.root + '/' + filePath));
};

var UserProvider = process.require('app/server/providers/UserProvider.js');
var conf = process.require('config/conf.json');
var databaseConf = process.require('config/databaseConf.json');

var countLines = 1;
var superAdminName;
var superAdminPassword;
var superAdminEmail;
var exit = process.exit;

// Get a Database instance
var db = openVeoAPI.Database.getDatabase(databaseConf);

/**
 * Adds a user in the database.
 *
 * @param {Object} data User information
 * @param {Function} callback Function to call when its done
 */
function addUser(data, callback) {
  var userProvider = new UserProvider(openVeoAPI.applicationStorage.getDatabase());

  // Verify if the super admin does not exist
  userProvider.getOne(0, function(error, user) {
    if (user) {
      callback(new Error('A super admin user already exists'));
    } else if (error) {
      callback(error);
    } else {
      userProvider.add(data, function(error) {
        callback(error);
      });
    }
  });
}

// Establish connection to the database
db.connect(function(error) {
  if (error) {
    process.stdout.write('Could not connect to the database with message : ' + error.message);
    exit();
  }

  openVeoAPI.applicationStorage.setDatabase(db);

  // Create a readline interface to interact with the user
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  process.stdout.write('Enter the name of the OpenVeo super admin to create :\n');
  rl.prompt();

  // Listen to user answers
  rl.on('line', function(line) {
    line = line.trim();

    try {

      switch (countLines) {
        case 1:
          if (!line) throw new Error('Invalid name, aborting');
          superAdminName = line;
          process.stdout.write('Enter the password of the OpenVeo super admin to create :\n');
          rl.prompt();
          break;
        case 2:
          if (!line) throw new Error('Invalid password, aborting');
          superAdminPassword = crypto.createHmac('sha256', conf.passwordHashKey).update(line).digest('hex');
          process.stdout.write('Enter the email of the OpenVeo super admin to create :\n');
          rl.prompt();
          break;
        case 3:
          if (!line || !openVeoAPI.util.isEmailValid(line)) throw new Error('Invalid email, aborting');
          superAdminEmail = line;
          addUser({
            id: 0,
            name: superAdminName,
            email: superAdminEmail,
            password: superAdminPassword,
            locked: true
          }, function(error) {
            if (error) {
              process.stdout.write('Couldn\'t create the super admin user due to the following error : ' +
                                    error.message);
            } else {
              process.stdout.write('Super admin ' + superAdminName + ' (' + superAdminEmail + ') created');
            }

            rl.close();
            exit();
          });
          break;
        default:
          rl.close();
          exit();
      }

    } catch (e) {
      process.stdout.write(e.message);
      exit();
    }

    countLines++;
  });

});
