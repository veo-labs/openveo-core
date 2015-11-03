'use strict';

// Module dependencies
var readline = require('readline');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var os = require('os');
var async = require('async');
var openVeoAPI = require('@openveo/api');
var confDir = path.join(openVeoAPI.fileSystem.getConfDir(), 'core');
var exit = process.exit;
var conf;
var databaseConf;

// Set module root directory and define a custom require function
process.root = __dirname;
process.require = function(filePath) {
  return require(path.normalize(process.root + '/' + filePath));
};

var UserProvider = process.require('app/server/providers/UserProvider.js');

// Create a readline interface to interact with the user
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Creates a random hash.
 *
 * @param {Number} size The length of the expected hash
 * @return {String} A hash
 */
function getRandomHash(size) {
  return crypto.randomBytes(256).toString('base64').slice(0, size);
}

/**
 * Creates conf directory if it does not exist.
 */
function createConfDir(callback) {
  openVeoAPI.fileSystem.mkdir(confDir, callback);
}

/**
 * Creates logger directory if it does not exist.
 */
function createLoggerDir(callback) {
  var conf = require(path.join(confDir, 'loggerConf.json'));
  async.series([
    function(callback) {
      openVeoAPI.fileSystem.mkdir(path.dirname(conf.app.fileName), callback);
    },
    function(callback) {
      openVeoAPI.fileSystem.mkdir(path.dirname(conf.ws.fileName), callback);
    }
  ], function(error, results) {
    if (error)
      process.stdout.write(error.message);

    callback();
  });
}

/**
 * Creates general configuration file if it does not exist.
 */
function createConf(callback) {
  var confFile = path.join(confDir, 'conf.json');

  fs.exists(confFile, function(exists) {
    if (exists) {
      process.stdout.write(confFile + ' already exists\n');
      callback();
    } else {
      var hash = getRandomHash(10);
      rl.question('Enter a secret key used to encrypt users passwords (default: ' + hash + ') :\n', function(answer) {
        var conf = {
          passwordHashKey: answer || hash
        };

        fs.writeFile(confFile, JSON.stringify(conf, null, '\t'), {encoding: 'utf8'}, callback);
      });
    }
  });
}

/**
 * Creates database configuration file if it does not exist.
 */
function createDatabaseConf(callback) {
  var confFile = path.join(confDir, 'databaseConf.json');
  var conf = {
    type: 'mongodb',
    host: 'localhost',
    port: 27017
  };

  async.series([
    function(callback) {
      fs.exists(confFile, function(exists) {
        if (exists)
          callback(new Error(confFile + ' already exists\n'));
        else
          callback();
      });
    },
    function(callback) {
      rl.question('Enter database host (default: ' + conf.host + ') :\n', function(answer) {
        conf.host = answer || conf.host;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter database port (default: ' + conf.port + ') :\n', function(answer) {
        conf.port = answer || conf.port;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter database name :\n', function(answer) {
        conf.database = answer || '';
        callback();
      });
    },
    function(callback) {
      rl.question('Enter database user name :\n', function(answer) {
        conf.username = answer || '';
        callback();
      });
    },
    function(callback) {
      rl.question('Enter database user password :\n', function(answer) {
        conf.password = answer || '';
        callback();
      });
    }
  ], function(error, results) {
    if (error) {
      process.stdout.write(error.message);
      callback();
    }
    else
      fs.writeFile(confFile, JSON.stringify(conf, null, '\t'), {encoding: 'utf8'}, callback);
  });
}

/**
 * Creates loggers configuration file if it does not exist.
 */
function createLoggerConf(callback) {
  var confFile = path.join(confDir, 'loggerConf.json');
  var conf = {
    app: {
      level: 'info',
      maxFileSize: 1048576,
      maxFiles: 2
    },
    ws: {
      level: 'info',
      maxFileSize: 1048576,
      maxFiles: 2
    }
  };

  async.series([
    function(callback) {
      fs.exists(confFile, function(exists) {
        if (exists)
          callback(new Error(confFile + ' already exists\n'));
        else
          callback();
      });
    },
    function(callback) {
      var defaultPath = path.join(os.tmpdir(), 'openveo', 'logs');
      rl.question('Enter OpenVeo logs directory (default: ' + defaultPath + ') :\n', function(answer) {
        conf.app.fileName = path.join((answer || defaultPath), 'openveo.log').replace(/\\/g, '/');
        conf.ws.fileName = path.join((answer || defaultPath), 'openveo-ws.log').replace(/\\/g, '/');
        callback();
      });
    }
  ], function(error, results) {
    if (error) {
      process.stdout.write(error.message);
      callback();
    }
    else
      fs.writeFile(confFile, JSON.stringify(conf, null, '\t'), {encoding: 'utf8'}, callback);
  });
}

/**
 * Creates server configuration file if it does not exist.
 */
function createServerConf(callback) {
  var confFile = path.join(confDir, 'serverConf.json');
  var conf = {
    app: {
      port: 3000
    },
    ws: {
      port: 3001
    }
  };

  async.series([
    function(callback) {
      fs.exists(confFile, function(exists) {
        if (exists)
          callback(new Error(confFile + ' already exists\n'));
        else
          callback();
      });
    },
    function(callback) {
      var hash = getRandomHash(40);
      rl.question('Enter a hash to secure HTTP sessions (default: ' + hash + ') :\n', function(answer) {
        conf.app.sessionSecret = answer || hash;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter OpenVeo server port (default: ' + conf.app.port + ') :\n', function(answer) {
        conf.app.port = answer || conf.app.port;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter OpenVeo Web Service server port (default: ' + conf.ws.port + ') :\n', function(answer) {
        conf.ws.port = answer || conf.ws.port;
        callback();
      });
    }
  ], function(error, results) {
    if (error) {
      process.stdout.write(error.message);
      callback();
    }
    else
      fs.writeFile(confFile, JSON.stringify(conf, null, '\t'), {encoding: 'utf8'}, callback);
  });
}

/**
 * Verifies connection to the database.
 */
function verifyDatbaseConf(callback) {
  databaseConf = require(path.join(confDir, 'databaseConf.json'));
  conf = require(path.join(confDir, 'conf.json'));

  var db = openVeoAPI.Database.getDatabase(databaseConf);

  db.connect(function(error) {
    if (error) {
      process.stdout.write('Could not connect to the database with message : ' + error.message);
      exit();
    }

    openVeoAPI.applicationStorage.setDatabase(db);
    callback();
  });
}

/**
 * Creates super administrator if it does not exist.
 */
function createSuperAdmin(callback) {
  var userProvider = new UserProvider(openVeoAPI.applicationStorage.getDatabase());
  var user = {
    id: '0',
    locked: true
  };

  async.series([
    function(callback) {

      // Verify if the super admin does not exist
      userProvider.getOne('0', function(error, user) {
        if (user)
          callback(new Error('A super admin user already exists\n'));
        else if (error)
          callback(error);
        else
          callback();
      });
    },
    function(callback) {
      rl.question('Enter the name of the OpenVeo super admin to create :\n', function(answer) {
        if (!answer) callback(new Error('Invalid name, aborting'));
        user.name = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the password of the OpenVeo super admin to create :\n', function(answer) {
        if (!answer) callback(new Error('Invalid password, aborting'));
        user.password = crypto.createHmac('sha256', conf.passwordHashKey).update(answer).digest('hex');
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the email of the OpenVeo super admin to create :\n', function(answer) {
        if (!answer || !openVeoAPI.util.isEmailValid(answer)) callback(Error('Invalid email, aborting'));
        user.email = answer;
        callback();
      });
    }
  ], function(error, results) {
    if (error) {
      process.stdout.write(error.message);
      callback();
    }
    else
      userProvider.add(user, function(error) {
        callback(error);
      });
  });
}

// Launch installation
async.series([
  createConfDir,
  createConf,
  createDatabaseConf,
  createLoggerConf,
  createLoggerDir,
  createServerConf,
  verifyDatbaseConf,
  createSuperAdmin
], function(error, results) {
  if (error)
    throw error;
  else {
    process.stdout.write('Installation complete\n');
    exit();
  }
});
