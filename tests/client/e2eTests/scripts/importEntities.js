'use strict';

/**
 * Standalone script to import groups, roles and users, into database, based on a description file.
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
 *           "roles": [ "coreAdmin", "guest" ] // User role reference as defined in roles property
 *         }
 *       },
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
var openVeoApi = require('@openveo/api');
var async = require('async');
var users = require('@openveo/test').e2e.users;
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
var storage = process.require('app/server/storage.js');
var provider = process.require('tests/client/e2eTests/scripts/entitiesProvider.js');

// Test database configuration
var configDir = openVeoApi.fileSystem.getConfDir();
var databaseConf = require(path.join(configDir, 'core/databaseTestConf.json'));

// Path to the description files to import
var descriptionFilePath = '/tests/client/e2eTests/resources/data.json';

// Plugin paths (core act as a plugin)
var pluginPaths = [process.root];

// Imported groups, roles and applications
var groups = {};
var roles = {};
var applications = {};

// Get a Database instance to the test database
var db = openVeoApi.database.factory.get(databaseConf);

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

  // Get roles, users and applications from descriptions files
  function(callback) {
    pluginPaths.forEach(function(pluginPath) {
      try {
        var datas = require(path.join(pluginPath, descriptionFilePath));
        openVeoApi.util.merge(groups, datas.groups);
        openVeoApi.util.merge(roles, datas.roles);
        openVeoApi.util.merge(users, datas.users);
        openVeoApi.util.merge(applications, datas.applications);
      } catch (error) {
        process.stdout.write('Can\'t import file ' + path.join(pluginPath, descriptionFilePath) + '\n');
        return;
      }
    });
    callback();
  },

  // Import groups
  function(callback) {
    provider.importGroups(groups, function(error, importedGroups) {
      groups = importedGroups;
      callback();
    });
  },

  // Import roles
  function(callback) {
    provider.importRoles(roles, function(error, importedRoles) {
      roles = importedRoles;

      // User roles in description files are referenced by role keys as described in description files.
      // Replace role keys by the corresponding ids (roles are now created and have ids)
      var count = 1;
      for (var userKey in users) {
        var user = users[userKey];

        if (!user.id)
          user.id = String(count++);

        if (user.roles) {
          var userRoles = [];

          for (var i = 0; i < user.roles.length; i++)
            userRoles.push(roles[user.roles[i]].id);

          if (userRoles.length)
            user.roles = userRoles;
        }

      }

      callback();
    });
  },

  // Import users
  function(callback) {
    provider.importUsers(users, function(error, importedUsers) {
      users = importedUsers;
      callback();
    });
  },

  // Import applications
  function(callback) {
    provider.importApplications(applications, function(error, importedApplications) {
      applications = importedApplications;
      callback();
    });
  }
], function(error) {
  db.close();
});
