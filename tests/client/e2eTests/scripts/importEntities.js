'use strict';

/**
 * Standalone script to import groups, roles and users, into database, based on a description file.
 *
 * CAS users won't be added to the database but into a JSON database file (tests/client/e2eTests/build/casUsers.json).
 * LDAP users won't be added to the database but into a JSON database (tests/client/e2eTests/build/ldapUsers.json).
 *
 * End to end tests require plugins and core to create their own users, groups and roles to be able to test
 * permissions.
 *
 * Description file must be named "data.json" and must be contained in "tests/client/e2eTests/resources" directory.
 * Each plugin can have its own "data.json" file in the own "tests/client/e2eTests/resources" directory. When the
 * script is launched, all groups, roles and users from "data.json" will be created in test database.
 *
 * @example
 *
 *     // Usage (from projet's root directory)
 *     node -r ./processRequire.js ./tests/client/e2eTests/scripts/importEntities.js
 *
 * @example
 *
 *     // Description file example
 *     {
 *       "groups": { // Defines groups to import
 *         "group1": { // The id of the group which can be used in permission's key
 *           "name": "group-1", // Group name
 *           "description": "group-1" // Description name
 *         }
 *       },
 *       "roles": { // Defines roles to import
 *         "core": { // Role reference which can be used by "users" property
 *           "name": "Core administrator", // Role name
 *           "permissions": [ // List of permission ids (as defined in conf.js) for the role
 *             "core-add-application",
 *             "core-update-application"
 *           ]
 *         },
 *       },
 *       "users": { // Define users to import
 *         "coreAdmin": { // Not used internally
 *           "name": "Core administrator", // User name
 *           "email": "core-admin@veo-labs.com", // User email
 *           "password": "core-admin", // User password
 *           "roles": [ "coreAdmin", "guest" ], // User role reference as defined in roles property
 *           "locked": false // Indicates if user can be modified or not
 *         }
 *       },
 *       "casUsers": [ // Define CAS users to import
 *         {
 *           "name": "core-guest",
 *           "attributes": {
 *             "name": "test",
 *             "mail": "test@openveo.com",
 *             "groups": ["test-group1", "test-group2"]
 *           }
 *         }
 *       ],
 *       "ldapUsers": [ // Define LDAP users to import
 *         {
 *           "dn": "cn=core-guest,dc=test",
 *           "cn": "core-guest",
 *           "group": "core-guest-group",
 *           "mail": "core-guest@openveo.com"
 *         }
 *       ],
 *       "applications": { // Define applications to import
 *         "coreApplicationsGuest": { // not used internally
 *           "name": "core-applications-guest" Application name
 *           "scopes": [ // List of scope ids for the application
 *             "video" // Scope
 *           ]
 *         }
 *       }
 *     }
 */

var path = require('path');
var fs = require('fs');
var openVeoApi = require('@openveo/api');
var async = require('async');
var openVeoTest = require('@openveo/test');
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
var storage = process.require('app/server/storage.js');
var provider = process.require('tests/client/e2eTests/scripts/entitiesProvider.js');
var CorePlugin = process.require('app/server/plugin/CorePlugin.js');

// Test database configuration
var buildPath = path.join(process.root, 'tests/client/e2eTests/build');
var configDir = openVeoApi.fileSystem.getConfDir();
var databaseConf = require(path.join(configDir, 'core/databaseTestConf.json'));

// Path to the description files to import
var descriptionFilePath = '/tests/client/e2eTests/resources/data.json';

// Path of the file to generate which will contain the list of CAS users
var casDatabaseFilePath = path.join(buildPath, 'casUsers.json');

// Path of the file to generate which will contain the list of LDAP users
var ldapDatabaseFilePath = path.join(buildPath, 'ldapUsers.json');

// Path of the file to generate which will contain the aggregated datas of all plugins description files
var aggregatedDatasFilePath = path.join(buildPath, 'data.json');

// Plugin paths (core act as a plugin)
var pluginPaths = [process.root];

var data = {
  applications: {},
  groups: {},
  roles: {},
  users: openVeoTest.e2e.users
};
var ldapUsers = [];
var casUsers = [];
var roles;

// Get a Database instance to the test database
var db = openVeoApi.storages.factory.get(databaseConf.type, databaseConf);

async.series([

  // Establish a connection to the database
  function(callback) {
    db.connect(function(error) {
      if (error)
        throw new Error(error);

      storage.setDatabase(db);
      callback();
    });
  },

  // Get plugins paths
  function(callback) {
    pluginLoader.getPluginPaths(process.root, function(error, paths) {
      if (paths)
        pluginPaths = pluginPaths.concat(paths);

      callback(error);
    });
  },

  // Load core plugin
  function(callback) {
    pluginLoader.loadPluginMetadata(new CorePlugin(), function(error, plugin) {
      if (error) return callback(error);
      process.api.addPlugin(plugin);
      callback();
    });
  },

  // Get roles, users and applications from descriptions files
  function(callback) {
    pluginPaths.forEach(function(pluginPath) {
      try {
        var datas = require(path.join(pluginPath, descriptionFilePath));
        openVeoApi.util.merge(data.groups, datas.groups);
        openVeoApi.util.merge(data.roles, datas.roles);
        openVeoApi.util.merge(data.users, datas.users);
        openVeoApi.util.merge(data.applications, datas.applications);

        if (datas.ldapUsers) ldapUsers = ldapUsers.concat(datas.ldapUsers);
        if (datas.casUsers) casUsers = casUsers.concat(datas.casUsers);
      } catch (error) {
        process.stdout.write('Can\'t import file ' + path.join(pluginPath, descriptionFilePath) + '\n');
        return;
      }
    });
    callback();
  },

  // Import groups
  function(callback) {
    provider.importGroups(data.groups, callback);
  },

  // Import roles
  function(callback) {
    provider.importRoles(data.roles, function(error, total, importedRoles) {
      roles = importedRoles;
      callback();
    });
  },

  // Import users
  function(callback) {
    var users = [];
    var count = 1;

    for (var dataUserId in data.users) {
      var user = data.users[dataUserId];

      users.push({
        id: user.id || String(count++),
        name: user.name,
        email: user.email,
        locked: user.locked || false,
        password: user.password,
        roles: (user.roles || []).map(function(dataUserRoleName) {
          return roles[dataUserRoleName].id;
        })
      });
    }

    if (!users.length) return callback();

    provider.importUsers(users, callback);
  },

  // Import applications
  function(callback) {
    provider.importApplications(data.applications, callback);
  },

  // Create resource directory
  function(callback) {
    openVeoApi.fileSystem.mkdir(buildPath, callback);
  },

  // Create resource file containing aggregated datas
  function(callback) {
    fs.writeFile(aggregatedDatasFilePath, JSON.stringify(data), {encoding: 'utf8'}, callback);
  },

  // Create resource file containing CAS users
  function(callback) {
    fs.writeFile(casDatabaseFilePath, JSON.stringify(casUsers), {encoding: 'utf8'}, callback);
  },

  // Create resource file containing LDAP users
  function(callback) {
    fs.writeFile(ldapDatabaseFilePath, JSON.stringify(ldapUsers), {encoding: 'utf8'}, callback);
  }

], function(error) {
  db.close();
});
