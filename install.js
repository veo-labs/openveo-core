'use strict';

require('./processRequire.js');
var readline = require('readline');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var os = require('os');
var async = require('async');
var openVeoApi = require('@openveo/api');
var confDir = path.join(openVeoApi.fileSystem.getConfDir(), 'core');
var exit = process.exit;
var storage = process.require('app/server/storage.js');
var supportedContentLanguages = process.require('supportedContentLanguages.json');
var ResourceFilter = openVeoApi.storages.ResourceFilter;

// Create a readline interface to interact with the user
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
var rlSecure = false;

/**
 * Secure question to not show stdout
 */
function secureQuestion(query, callback) {
  rlSecure = true;
  rl.question(query, function(value) {
    rl.history = rl.history.slice(1);
    rlSecure = false;
    callback(value);
  });
}

// rewrite stdout in cas of secure rl
process.stdin.on('data', function(char) {
  if (rlSecure)
    process.stdout.write('\x1B[2K\x1B[200D' + Array(rl.line.length + 1).join('*'));
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
  openVeoApi.fileSystem.mkdir(confDir, callback);
}

/**
 * Creates logger directory if it does not exist.
 */
function createLoggerDir(callback) {
  var conf = require(path.join(confDir, 'loggerConf.json'));
  async.series([
    function(callback) {
      openVeoApi.fileSystem.mkdir(path.dirname(conf.app.fileName), callback);
    },
    function(callback) {
      openVeoApi.fileSystem.mkdir(path.dirname(conf.ws.fileName), callback);
    }
  ], function(error, results) {
    if (error)
      process.stdout.write(error.message);

    callback();
  });
}

/**
 * Asks the user for CAS configuration.
 *
 * @param {Function} The function to call when its done with:
 *   - **Error** An error if something went wrong
 *   - **Object** The CAS configuration
 */
function askForCasAuthConf(callback) {
  var conf = {
    version: '3'
  };

  async.series([
    function(callback) {
      rl.question('Enter the application service registered in CAS server :\n', function(answer) {
        conf.service = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the URL of the CAS server :\n', function(answer) {
        conf.url = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the version of the CAS protocol to use to connect to the CAS server ? (default: ' +
                  conf.version + ') :\n', function(answer) {
        conf.version = answer || conf.version;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the complete path to the CAS certificate full chain:\n', function(answer) {
        if (answer) conf.certificate = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the name of the attribute holding the user group:\n', function(answer) {
        if (answer) conf.userGroupAttribute = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the name of the attribute holding the user unique id:\n', function(answer) {
        if (answer) conf.userIdAttribute = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the name of the attribute holding the user name:\n', function(answer) {
        if (answer) conf.userNameAttribute = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the name of the attribute holding the user email:\n', function(answer) {
        if (answer) conf.userEmailAttribute = answer;
        callback();
      });
    }
  ], function(error, results) {
    if (error) {
      process.stdout.write(error.message);
      callback();
    } else
      callback(conf);
  });
}

/**
 * Asks the user for LDAP configuration.
 *
 * @param {Function} The function to call when its done with:
 *   - **Error** An error if something went wrong
 *   - **Object** The LDAP configuration
 */
function askForLdapAuthConf(callback) {
  var conf = {
    searchFilter: '(&(objectclass=person)(cn={{username}}))'
  };

  async.series([
    function(callback) {
      rl.question('Enter the url of the LDAP server:\n', function(answer) {
        conf.url = answer;
        callback();
      });
    },
    function(callback) {
      rl.question(
        'Enter the entry attribute to bind to when connecting to LDAP server: (default: dn)\n',
        function(answer) {
          if (answer) conf.bindAttribute = answer;
          callback();
        }
      );
    },
    function(callback) {
      rl.question('Enter the entry id to use to connect to LDAP server:\n', function(answer) {
        conf.bindDn = answer;
        callback();
      });
    },
    function(callback) {
      secureQuestion('Enter the entry password:\n', function(answer) {
        conf.bindPassword = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the search base when looking for users:\n', function(answer) {
        conf.searchBase = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the search scope when looking for users: (default: sub)\n', function(answer) {
        if (answer) conf.searchScope = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the search filter to find a user: (default: ' + conf.searchFilter + ')\n', function(answer) {
        conf.searchFilter = answer || conf.searchFilter;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the name of the attribute holding the user group:\n', function(answer) {
        if (answer) conf.userGroupAttribute = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the name of the attribute holding the user unique id:\n', function(answer) {
        if (answer) conf.userIdAttribute = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the name of the attribute holding the user name:\n', function(answer) {
        if (answer) conf.userNameAttribute = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the name of the attribute holding the user email:\n', function(answer) {
        if (answer) conf.userEmailAttribute = answer;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the complete path to the LDAP certificate full chain:\n', function(answer) {
        if (answer) conf.certificate = answer;
        callback();
      });
    }
  ], function(error, results) {
    if (error) {
      process.stdout.write(error.message);
      callback();
    } else
      callback(conf);
  });
}

/**
 * Creates general configuration file if it does not exist.
 */
function createConf(callback) {
  var confFile = path.join(confDir, 'conf.json');
  var conf = {
    contentLanguage: 'en',
    passwordHashKey: getRandomHash(10),
    cdn: {
      url: ''
    }
  };

  async.series([
    function(callback) {
      fs.stat(confFile, function(error, stats) {
        if (stats && stats.isFile())
          callback(new Error(confFile + ' already exists\n'));
        else
          callback();
      });
    },
    function(callback) {
      var question = 'Choose the language for the content of your OpenVeo (default: ' + conf.contentLanguage + ') :\n';

      for (var i = 0; i < supportedContentLanguages.length; i++) {
        question += i + '. ' + supportedContentLanguages[i] + '\n';
      }
      rl.question(question, function(answer) {
        answer = Number(answer);

        if (answer && answer > 0 && answer < supportedContentLanguages.length)
          conf.contentLanguage = supportedContentLanguages[answer];

        callback();
      });
    },
    function(callback) {
      rl.question(
        'Enter a secret key used to encrypt users passwords (default: ' + conf.passwordHashKey + ') :\n',
        function(answer) {
          if (answer) conf.passwordHashKey = answer;
          callback();
        }
      );
    },
    function(callback) {
      rl.question('Enter OpenVeo CDN url (e.g. http://cdn.openveo.com) :\n', function(answer) {
        if (answer) conf.cdn.url = answer;
        callback();
      });
    }
  ], function(error, results) {
    if (error) {
      process.stdout.write(error.message);
      callback();
    } else
      fs.writeFile(confFile, JSON.stringify(conf, null, '\t'), {encoding: 'utf8'}, callback);
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
      fs.stat(confFile, function(error, stats) {
        if (stats && stats.isFile())
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
        conf.port = parseInt(answer || conf.port);
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
      secureQuestion('Enter database user password :\n', function(answer) {
        conf.password = answer || '';
        callback();
      });
    }
  ], function(error, results) {
    if (error) {
      process.stdout.write(error.message);
      callback();
    } else
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
      maxFileSize: 104857600,
      maxFiles: 2,
      console: false
    },
    ws: {
      level: 'info',
      maxFileSize: 104857600,
      maxFiles: 2,
      console: false
    }
  };

  async.series([
    function(callback) {
      fs.stat(confFile, function(error, stats) {
        if (stats && stats.isFile())
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
    } else
      fs.writeFile(confFile, JSON.stringify(conf, null, '\t'), {encoding: 'utf8'}, callback);
  });
}

/**
 * Creates server configuration file if it does not exist.
 */
function createServerConf(callback) {
  var confFile = path.join(confDir, 'serverConf.json');
  var authConf;
  var conf = {
    app: {
      httpPort: 3000,
      socketPort: 3001,
      browserSocketPort: 3001
    },
    ws: {
      port: 3002
    }
  };

  async.series([
    function(callback) {
      fs.stat(confFile, function(error, stats) {
        if (stats && stats.isFile())
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
      rl.question('Enter OpenVeo HTTP server port (default: ' + conf.app.httpPort + ') :\n', function(answer) {
        conf.app.httpPort = parseInt(answer || conf.app.httpPort);
        callback();
      });
    },
    function(callback) {
      rl.question('Enter OpenVeo socket server port (default: ' + conf.app.socketPort + ') :\n', function(answer) {
        conf.app.socketPort = parseInt(answer || conf.app.socketPort);

        callback();
      });
    },
    function(callback) {
      rl.question(
        'Enter OpenVeo browser\'s socket server port (default: ' +
        conf.app.browserSocketPort +
        ') :\n',
        function(answer) {
          conf.app.browserSocketPort = parseInt(answer || conf.app.browserSocketPort);
          callback();
        }
      );
    },
    function(callback) {
      rl.question('Enter OpenVeo Web Service HTTP server port (default: ' + conf.ws.port + ') :\n', function(answer) {
        conf.ws.port = parseInt(answer || conf.ws.port);
        callback();
      });
    },
    function(callback) {
      rl.question('Do you want to configure authentication using CAS ? (y/N) :\n', function(answer) {
        if (answer === 'y') {
          askForCasAuthConf(function(casConf) {
            authConf = {
              cas: casConf
            };
            callback();
          });
        } else {
          callback();
        }
      });
    },
    function(callback) {
      rl.question('Do you want to configure authentication using LDAP ? (y/N) :\n', function(answer) {
        if (answer === 'y') {
          askForLdapAuthConf(function(ldapConf) {
            if (!authConf) authConf = {};
            authConf.ldapauth = ldapConf;
            callback();
          });
        } else {
          callback();
        }
      });
    }
  ], function(error, results) {
    if (error) {
      process.stdout.write(error.message);
      callback();
    } else {
      if (authConf) conf.app.auth = authConf;
      fs.writeFile(confFile, JSON.stringify(conf, null, '\t'), {encoding: 'utf8'}, callback);
    }
  });
}

/**
 * Verifies connection to the database.
 */
function verifyDatabaseConf(callback) {
  var databaseConf = require(path.join(confDir, 'databaseConf.json'));
  var db = openVeoApi.storages.factory.get(databaseConf.type, databaseConf);

  db.connect(function(error) {
    if (error) {
      process.stdout.write('Could not connect to the database with message : ' + error.message);
      exit();
    }

    storage.setDatabase(db);
    callback();
  });
}

/**
 * Creates super administrator if it does not exist.
 */
function createSuperAdmin(callback) {
  var UserProvider = process.require('app/server/providers/UserProvider.js');
  var userProvider = new UserProvider(storage.getDatabase());
  var user = {
    id: '0',
    locked: true,
    origin: openVeoApi.passport.STRATEGIES.LOCAL
  };

  async.series([
    function(callback) {

      // Verify if the super admin does not exist
      userProvider.getOne(
        new ResourceFilter().equal('id', '0'),
        null,
        function(error, user) {
          if (user)
            callback(new Error('A super admin user already exists\n'));
          else if (error)
            callback(error);
          else
            callback();
        }
      );
    },
    function(callback) {
      rl.question('Enter the name of the OpenVeo super admin to create :\n', function(answer) {
        if (!answer) return callback(new Error('Invalid name, aborting\n'));
        user.name = answer;
        callback();
      });
    },
    function(callback) {
      secureQuestion('Enter the password of the OpenVeo super admin to create :\n', function(answer) {
        if (!answer) return callback(new Error('Invalid password, aborting\n'));
        user.password = answer;
        user.passwordValidate = user.password;
        callback();
      });
    },
    function(callback) {
      rl.question('Enter the email of the OpenVeo super admin to create :\n', function(answer) {
        if (!answer || !openVeoApi.util.isEmailValid(answer)) return callback(Error('Invalid email, aborting\n'));
        user.email = answer;
        callback();
      });
    }
  ], function(error, results) {
    if (error) {
      process.stdout.write(error.message);
      callback();
    } else
      userProvider.add([user], function(error, total, addedUsers) {
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
  verifyDatabaseConf,
  createSuperAdmin
], function(error, results) {
  if (error)
    throw error;
  else {
    process.stdout.write('Installation complete\n');
    exit();
  }
});
