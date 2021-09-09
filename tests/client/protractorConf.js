'use strict';

require('../../processRequire.js');
var fs = require('fs');
var path = require('path');
var url = require('url');
var async = require('async');
var childProcess = require('child_process');
var openVeoApi = require('@openveo/api');
var e2e = require('@openveo/test').e2e;
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
var entityLoader = process.require('app/server/loaders/entityLoader.js');
var permissionLoader = process.require('app/server/loaders/permissionLoader.js');
var ClientProvider = process.require('app/server/providers/ClientProvider.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var CorePlugin = process.require('app/server/plugin/CorePlugin.js');
var storage = process.require('app/server/storage.js');
var screenshotPlugin = e2e.plugins.screenshotPlugin;
var configurationDirectoryPath = path.join(openVeoApi.fileSystem.getConfDir(), 'core');
var serverConfPath = path.join(configurationDirectoryPath, 'serverTestConf.json');
var loggerConfPath = path.join(configurationDirectoryPath, 'loggerTestConf.json');
var databaseConfPath = path.join(configurationDirectoryPath, 'databaseTestConf.json');
var confPath = path.join(configurationDirectoryPath, 'testConf.json');
var databaseConf = require(databaseConfPath);
var serverConf = require(serverConfPath);
var coreConf = require(confPath);
var ldapConf = (serverConf.app.auth && serverConf.app.auth[openVeoApi.passport.STRATEGIES.LDAP]) || null;
var casConf = (serverConf.app.auth && serverConf.app.auth[openVeoApi.passport.STRATEGIES.CAS]) || null;
var serverConfPathWithoutAuth = path.join(process.root, 'tests/client/e2eTests/build/serverConf.json');
var casDatabasePath = path.join(process.root, 'tests/client/e2eTests/build/casUsers.json');
var ldapDatabasePath = path.join(process.root, 'tests/client/e2eTests/build/ldapUsers.json');
var ldapConfPath = path.join(process.root, 'tests/client/e2eTests/build/ldapConf.json');
var db;
var servers = {};
var webServiceApplications;
var users;
var corePlugin;

// Load a console logger
process.logger = openVeoApi.logger.add('openveo');

// Load suites
var suites = process.require('tests/client/e2eTests/build/suites.json');

// Load external users
var casUsers = require(casDatabasePath);
var ldapUsers = require(ldapDatabasePath);

exports.config = {
  directConnect: true,
  framework: 'mocha',
  mochaOpts: {
    timeout: 200000,
    bail: false
  },
  suites: suites,
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
        'headless',
        'no-sandbox',
        '--window-size=1080,720',
        'disable-infobars'
      ]
    }
  },
  baseUrl: 'http://127.0.0.1:' + serverConf.app.httpPort + '/',
  webServiceUrl: 'http://127.0.0.1:' + serverConf.ws.port + '/',
  casConf: casConf,
  ldapConf: ldapConf,
  plugins: [
    {
      outdir: 'build/screenshots',
      inline: screenshotPlugin
    }
  ],

  /**
   * Gets Web Service application configuration by application id.
   *
   * @param {String} applicationId The application id as defined in data.json file
   * @return {Object} The description object of the application
   */
  getWebServiceApplication: function(applicationId) {
    for (var i = 0; i < webServiceApplications.length; i++) {
      if (webServiceApplications[i].name === applicationId)
        return webServiceApplications[i];
    }
    return null;
  },

  /**
   * Gets user configuration by user id.
   *
   * @param {String} userId The user id as defined in data.json file
   * @return {Object} The description object of the user
   */
  getUser: function(userId) {
    for (var i = 0; i < users.length; i++) {
      if (users[i].name === userId)
        return users[i];
    }
    return null;
  },

  /**
   * Gets LDAP user by id.
   *
   * @param {String} userId The user id as defined in data.json file. Attribute holding the
   * user id depends on the LDAP server configuration in serverTestConf.json
   * @return {Object|Null} The user
   */
  getLdapUser: function(userId) {
    if (ldapConf) {
      var userIdAttribute = process.protractorConf.ldapConf.userIdAttribute;

      for (var i = 0; i < ldapUsers.length; i++) {
        var id = openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, ldapUsers[i]);
        if (id === userId)
          return ldapUsers[i];
      }
    }

    return null;
  },

  /**
   * Gets CAS user by id.
   *
   * @param {String} userId The user id as defined in data.json file. Attribute holding the
   * user id depends on the CAS server configuration in serverTestConf.json
   * @return {Object|Null} The user
   */
  getCasUser: function(userId) {
    if (casConf) {
      var userIdAttribute = process.protractorConf.casConf.userIdAttribute;

      for (var i = 0; i < casUsers.length; i++) {
        var id = openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, casUsers[i]);
        if (id === userId)
          return casUsers[i];
      }
    }

    return null;
  },

  /**
   * Gets back end menu ordered by weight.
   *
   * @return {Array} The menu and sub menus
   */
  getMenu: function() {
    var plugins = process.api.getPlugins();
    var menu = [];

    function sortByWeight(item1, item2) {
      if (!item1.weight) return -1;
      if (!item2.weight) return 1;
      return (item1.weight < item2.weight) ? -1 : 1;
    }

    plugins.forEach(function(plugin) {
      if (plugin.menu) {
        menu = menu.concat(plugin.menu);
        menu = menu.sort(sortByWeight);

        if (menu.subMenu)
          menu.subMenu = menu.subMenu.sort(sortByWeight);
      }
    });

    return menu;
  },

  /**
   * Stops a sub process server.
   *
   * @param {String} server The id of the server to stop
   * @param {Boolean} doNotWaitForAngular true to not wait for angular application
   * @return {Promise} Promise resolved when server has stopped
   */
  stopServer: function(server, doNotWaitForAngular) {
    var flow = browser.controlFlow();

    function stop() {
      return flow.execute(function() {
        if (!servers[server] || !servers[server].connected)
          return protractor.promise.fulfilled();

        var deferred = protractor.promise.defer();
        servers[server].on('exit', function(code, signal) {
          deferred.fulfill();
        });

        servers[server].kill('SIGINT');
        return deferred.promise;
      });
    }

    if (doNotWaitForAngular) {
      return stop();
    } else {
      return browser.waitForAngular().then(function() {
        return stop();
      });
    }
  },

  /**
   * Starts OpenVeo as a sub process.
   *
   * @param {Boolean} ws true to start OpenVeo Web Service, false to start OpenVeo
   * @param {Boolean} doNotWaitForAngular true to not wait for angular application
   * @param {Boolean} withoutExternalAuth true to restart OpenVeo without the external authentication
   * providers (e.g. LDAP)
   * @return {Promise} Promise resolved when OpenVeo has started
   */
  startOpenVeo: function(ws, doNotWaitForAngular, withoutExternalAuth) {
    var flow = browser.controlFlow();

    function start() {
      return flow.execute(function() {
        var server = (ws) ? 'webServiceServer' : 'applicationServer';

        if (servers[server] && servers[server].connected)
          return protractor.promise.fulfilled();

        var deferred = protractor.promise.defer();
        var options = [
          '--conf', confPath,
          '--serverConf', withoutExternalAuth ? serverConfPathWithoutAuth : serverConfPath,
          '--loggerConf', loggerConfPath,
          '--databaseConf', databaseConfPath
        ];
        if (ws) options.push('--ws');

        // Executes server as a child process
        servers[server] = childProcess.fork(path.join(process.root, '/server.js'), options);

        // Listen to messages from sub process
        servers[server].on('message', function(data) {
          if (data)
            if (data.status === 'started') deferred.fulfill();
        });

        return deferred.promise;
      });
    }

    if (doNotWaitForAngular) {
      return start();
    } else {
      return browser.waitForAngular().then(function() {
        return start();
      });
    }
  },

  /**
   * Stops OpenVeo sub process.
   *
   * @param {Boolean} ws true to stop OpenVeo Web Service, false to stop OpenVeo
   * @param {Boolean} doNotWaitForAngular true to not wait for angular application
   * @return {Promise} Promise resolved when OpenVeo has stopped
   */
  stopOpenVeo: function(ws, doNotWaitForAngular) {
    return exports.config.stopServer((ws) ? 'webServiceServer' : 'applicationServer', doNotWaitForAngular);
  },

  /**
   * Restarts OpenVeo sub process.
   *
   * @param {Boolean} ws true to restart OpenVeo Web Service, false to restart OpenVeo
   * @param {Boolean} doNotWaitForAngular true to not wait for angular application
   * @param {Boolean} withoutExternalAuth true to restart OpenVeo without the external authentication
   * providers (e.g. LDAP)
   * @return {Promise} Promise resolved when OpenVeo has restarted
   */
  restartOpenVeo: function(ws, doNotWaitForAngular, withoutExternalAuth) {
    exports.config.stopOpenVeo(ws, doNotWaitForAngular);
    exports.config.startOpenVeo(ws, doNotWaitForAngular, withoutExternalAuth);
  },

  /**
   * Starts LDAP server as a sub process.
   *
   * @param {Boolean} doNotWaitForAngular true to not wait for angular application
   * @return {Promise} Promise resolved when LDAP server has started
   */
  startLdapServer: function(doNotWaitForAngular) {
    var flow = browser.controlFlow();

    function start() {
      return flow.execute(function() {
        var server = 'ldapServer';

        if (servers[server] && servers[server].connected)
          return protractor.promise.fulfilled();

        var deferred = protractor.promise.defer();
        var options = [
          '--conf', ldapConfPath,
          '--database', ldapDatabasePath
        ];

        // Executes server as a child process
        servers[server] = childProcess.fork(
          path.join(process.root, '/node_modules/ldap-server-mock/server.js'), options
        );

        // Listen to messages from sub process
        servers[server].on('message', function(data) {
          if (data)
            if (data.status === 'started') deferred.fulfill();
        });

        return deferred.promise;
      });
    }

    if (doNotWaitForAngular) {
      return start();
    } else {
      return browser.waitForAngular().then(function() {
        return start();
      });
    }
  },

  /**
   * Stops LDAP server sub process.
   *
   * @param {Boolean} doNotWaitForAngular true to not wait for angular application
   * @return {Promise} Promise resolved when LDAP server has stopped
   */
  stopLdapServer: function(doNotWaitForAngular) {
    return exports.config.stopServer('ldapServer', doNotWaitForAngular);
  },

  /**
   * Starts CAS server as a sub process.
   *
   * @param {Boolean} doNotWaitForAngular true to not wait for angular application
   * @return {Promise} Promise resolved when CAS server has started
   */
  startCasServer: function(doNotWaitForAngular) {
    var flow = browser.controlFlow();

    function start() {
      return flow.execute(function() {
        var server = 'casServer';

        if (servers[server] && servers[server].connected)
          return protractor.promise.fulfilled();

        var deferred = protractor.promise.defer();
        var casUrl = new url.URL(casConf.url);
        var options = [
          '--port', casUrl.port,
          '--database', casDatabasePath
        ];

        // Executes server as a child process
        servers[server] = childProcess.fork(
          path.join(process.root, '/node_modules/cas-server-mock/server.js'), options
        );

        // Listen to messages from sub process
        servers[server].on('message', function(data) {
          if (data)
            if (data.status === 'started') deferred.fulfill();
        });

        return deferred.promise;
      });
    }

    if (doNotWaitForAngular) {
      return start();
    } else {
      return browser.waitForAngular().then(function() {
        return start();
      });
    }
  },

  /**
   * Stops CAS server sub process.
   *
   * @param {Boolean} doNotWaitForAngular true to not wait for angular application
   * @return {Promise} Promise resolved when CAS server has stopped
   */
  stopCasServer: function(doNotWaitForAngular) {
    return exports.config.stopServer('casServer', doNotWaitForAngular);
  },

  /**
   * Prepares tests environment.
   *
   * Prepare browser before executing tests, spawn an OpenVeo server, spawn an OpenVeo Web Service
   * server, establish connection to the database, expose the list of plugins, expose the list of
   * users, expose the list of applications.
   *
   * @return {Promise} Promise resolved when environment is prepared
   */
  onPrepare: function() {
    var deferred = protractor.promise.defer();
    var flow = browser.controlFlow();

    // Init process configuration
    e2e.browser.deactivateAnimations();
    e2e.browser.init();

    // Set browser size
    e2e.browser.setSize(1920, 1080);

    // Get a Database instance to the test database
    db = openVeoApi.storages.factory.get(databaseConf.type, databaseConf);

    async.series([

      // Generate a server configuration file based on serverTestConf.json but without
      // the authentication mechanisms
      function(callback) {
        process.stdout.write('Prepare > Generate ' +
                             serverConfPathWithoutAuth +
                             ' without authentication mechanisms\n');

        var conf = JSON.parse(JSON.stringify(serverConf));
        delete conf.app.auth;

        fs.writeFile(serverConfPathWithoutAuth, JSON.stringify(conf), function(error) {
          if (error) throw error;

          process.stdout.write(serverConfPathWithoutAuth + ' generated\n');
          callback();
        });
      },

      // Generate configuration file for LDAP server mock
      function(callback) {
        process.stdout.write('Prepare > Generate ' + ldapConfPath + '\n');

        openVeoApi.fileSystem.mkdir(path.dirname(ldapDatabasePath), function(error) {
          if (error) return callback(error);
          var ldapUrl = new url.URL(ldapConf.url);

          fs.writeFile(ldapConfPath, JSON.stringify({
            port: ldapUrl.port,
            userLoginAttribute: ldapConf.userIdAttribute,
            searchBase: ldapConf.searchBase,
            searchFilter: ldapConf.searchFilter,
            bindDn: ldapConf.bindDn
          }), {encoding: 'utf8'}, function(error) {
            if (error) return callback(error);
            process.stdout.write(ldapConfPath + ' generated\n');
            callback();
          });
        });
      },

      // Launch CAS server as a sub process
      function(callback) {
        process.stdout.write('Prepare > Start CAS server\n');

        exports.config.startCasServer(true).then(function() {
          process.stdout.write('Prepare > CAS server started\n');
          callback();
        }, callback);
      },

      // Launch LDAP server as a sub process
      function(callback) {
        process.stdout.write('Prepare > Starts LDAP server\n');

        exports.config.startLdapServer(true).then(function() {
          process.stdout.write('Prepare > LDAP server started\n');
          callback();
        }, callback);
      },

      // Launch openveo server as a sub process
      function(callback) {
        process.stdout.write('Prepare > Starts OpenVeo server\n');

        exports.config.startOpenVeo(false, true).then(function() {
          process.stdout.write('Prepare > OpenVeo server started\n');
          callback();
        }, callback);
      },

      // Launch openveo web service server as a sub process
      function(callback) {
        process.stdout.write('Prepare > Starts OpenVeo Web Service server\n');

        exports.config.startOpenVeo(true, true).then(function() {
          process.stdout.write('Prepare > OpenVeo Web Service server started\n');
          callback();
        }, callback);
      },

      // Establish connection to the database
      function(callback) {
        process.stdout.write('Prepare > Establish connection to the database\n');

        db.connect(function(error) {
          if (error) return callback(error);
          process.stdout.write('Prepare > Connection to the database established\n');

          storage.setDatabase(db);

          // Set super administrator and anonymous user id from configuration
          storage.setConfiguration({
            superAdminId: '0',
            anonymousId: '1',
            cdn: coreConf.cdn,
            auth: serverConf.app.auth
          });

          callback();
        });
      },

      // Load Core plugin
      function(callback) {
        process.stdout.write('Prepare > Load core plugin\n');

        corePlugin = new CorePlugin();
        pluginLoader.loadPluginMetadata(corePlugin, function(error) {
          if (error) return callback(error);
          process.stdout.write('Prepare > Core plugin loaded\n');
          callback();
        });
      },

      // Load openveo plugins
      function(callback) {
        process.stdout.write('Prepare > Load plugins\n');

        pluginLoader.loadPlugins(path.join(process.root), function(error, plugins) {
          if (error) return callback(error);

          plugins.unshift(corePlugin);

          plugins.forEach(function(plugin) {
            process.api.addPlugin(plugin);
          });

          process.stdout.write('Prepare > Plugins loaded\n');
          callback();
        });
      },

      // Load entities
      function(callback) {
        process.stdout.write('Prepare > Load entities\n');

        var entities = entityLoader.buildEntities(process.api.getPlugins());
        storage.setEntities(entities);

        process.stdout.write('Prepare > Entities loaded\n');
        callback();
      },

      // Load permissions
      function(callback) {
        process.stdout.write('Prepare > Load permissions\n');

        var entities = storage.getEntities();
        var plugins = process.api.getPlugins();
        permissionLoader.buildPermissions(entities, plugins, function(error, permissions) {
          if (error) return callback(error);

          // Store application's permissions
          storage.setPermissions(permissions);

          process.stdout.write('Prepare > Permissions loaded\n');
          callback();
        });
      },

      // Get the list of available client applications and expose it to plugins
      function(callback) {
        process.stdout.write('Prepare > Load applications\n');

        var clientProvider = new ClientProvider(storage.getDatabase());
        clientProvider.getAll(null, null, {id: 'desc'}, function(error, entities) {
          if (error) return callback(error);
          process.stdout.write('Prepare > Applications loaded\n');

          webServiceApplications = entities;
          callback();
        });
      },

      // Get the list of available users and expose it to plugins
      function(callback) {
        process.stdout.write('Prepare > Load users\n');

        var userProvider = new UserProvider(storage.getDatabase());
        userProvider.getAll(null, null, {id: 'desc'}, function(error, entities) {
          if (error) return callback(error);
          process.stdout.write('Prepare > Users loaded\n');
          users = entities;
          callback();
        });
      }

    ], function(error) {
      if (error) throw error;
      deferred.fulfill();
    });

    return flow.execute(function() {
      return deferred.promise;
    });
  },
  onCleanUp: function() {
    process.stdout.write('Prepare > Tests finished, exit servers and close connection to the database\n');
    servers['applicationServer'].kill('SIGINT');
    servers['webServiceServer'].kill('SIGINT');
    servers['casServer'].kill('SIGINT');
    servers['ldapServer'].kill('SIGINT');
    db.close();
  }
};
