'use strict';

var async = require('async');
var GroupModel = process.require('app/server/models/GroupModel.js');
var UserModel = process.require('app/server/models/UserModel.js');
var RoleModel = process.require('app/server/models/RoleModel.js');
var ClientModel = process.require('app/server/models/ClientModel.js');
var GroupProvider = process.require('app/server/providers/GroupProvider.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var ClientProvider = process.require('app/server/providers/ClientProvider.js');
var storage = process.require('app/server/storage.js');

/**
 * Imports groups from JSON file in database.
 *
 * @example
 *
 *     var groups = { // Define groups to import
 *       "coreGroup1": { // Not used internally
 *         "name": "Core group 1", // Group name
 *         "description": "Core group 1 description" // Group description
 *       }
 *     };
 *
 *     loader.importGroups(groups, function(error, importedGroups){
 *       console.log('Groups imported into database');
 *     });
 *
 * @param {Object} groups Groups description object
 * @return {Function} Function to call when all groups are imported
 */
module.exports.importGroups = function(groups, callback) {
  var parallel = [];
  var groupModel = new GroupModel(new GroupProvider(storage.getDatabase()));

  // Create function for async to add a group to the database
  function createAddFunction(groupKey) {
    var group = groups[groupKey];
    group.id = groupKey;

    // Add function to the list of functions to execute in parallel
    parallel.push(function(callback) {

      // Add group
      groupModel.add(group, function(error, addedGroup) {
        callback(error);
      });

    });
  }

  // Create functions to add groups with async
  for (var groupKey in groups)
    createAddFunction(groupKey);

  // Asynchonously create groups
  async.parallel(parallel, function(error) {
    if (error) {
      throw error;
    } else {
      callback(null, groups);
    }
  });

};

/**
 * Imports roles from JSON file into database.
 *
 * @example
 *
 *     var roles = { // Defines roles to import
 *      "core": { // Role reference which can be used by "users" property
 *        "name": "Core administrator", // Role name
 *        "permissions": [ // List of permission ids (as defined in conf.js) for the role
 *          "core-add-application",
 *          "core-update-application"
 *        ]
 *       },
 *     };
 *
 *     loader.importRoles(roles, function(error, roles){
 *       console.log('Roles imported into database');
 *     });
 *
 * @param {Object} roles Roles description object
 * @return {Function} Function to call when all roles are imported
 */
module.exports.importRoles = function(roles, callback) {
  var parallel = [];
  var roleModel = new RoleModel(new RoleProvider(storage.getDatabase()));

  // Create function for async to add a role to the database
  function createAddFunction(roleKey) {
    var role = roles[roleKey];
    role.id = roleKey;

    // Add function to the list of functions to execute in parallel
    parallel.push(function(callback) {

      // Add role
      roleModel.add(role, function(error, addedRole) {
        callback(error);
      });

    });
  }

  // Create functions to add roles with async
  for (var roleKey in roles)
    createAddFunction(roleKey);

  // Asynchonously create roles
  async.parallel(parallel, function(error) {
    if (error) {
      throw error;
    } else {
      callback(null, roles);
    }
  });
};

/**
 * Imports users from JSON file in database.
 *
 * @example
 *
 *     var users = { // Define users to import
 *       "coreAdmin": { // Not used internally
 *         "name": "Core administrator", // User name
 *         "email": "core-admin@veo-labs.com", // User email
 *         "password": "core-admin", // User password
 *         "roles": [ "coreAdmin", "guest" ] // User role reference as defined in roles property
 *       }
 *     };
 *
 *     loader.importUsers(users, function(error, users){
 *       console.log('Users imported into database');
 *     });
 *
 * @param {Object} users Users description object
 * @return {Function} Function to call when all users are imported
 */
module.exports.importUsers = function(users, callback) {
  var parallel = [];
  var userModel = new UserModel(new UserProvider(storage.getDatabase()));

  // Create function for async to add a user to the database
  function createAddFunction(userKey) {
    var user = users[userKey];
    user.passwordValidate = user.password;

    parallel.push(function(callback) {
      userModel.add(user, callback);
    });
  }

  // Create functions to add users with async
  for (var userKey in users)
    createAddFunction(userKey);

  // Asynchonously create users
  async.parallel(parallel, function(error) {
    if (error) {
      throw error;
    } else {
      callback(null, users);
    }
  });

};

/**
 * Imports applications from JSON file in database.
 *
 * @example
 *
 *     var  applications = { // Define applications to import
 *       "coreApplicationsGuest": { // not used internally
 *         "name": "core-applications-guest" // Application name
 *         "scopes": [ // List of scope ids for the application
 *           "video" // Scope
 *         ]
 *       }
 *     };
 *
 *     loader.importApplications(applications, function(error, applications){
 *       console.log('Applications imported into database');
 *     });
 *
 * @param {Object} applications Applications description object
 * @return {Function} Function to call when all applications are imported
 */
module.exports.importApplications = function(applications, callback) {
  var parallel = [];
  var clientModel = new ClientModel(new ClientProvider(storage.getDatabase()));

  // Create function for async to add an application to the database
  function createAddFunction(applicationKey) {
    var application = applications[applicationKey];

    parallel.push(function(callback) {
      clientModel.add(application, callback);
    });
  }

  // Create functions to add applications with async
  for (var applicationKey in applications)
    createAddFunction(applicationKey);

  // Asynchonously create applications
  async.parallel(parallel, function(error) {
    if (error) {
      throw error;
    } else {
      callback(null, applications);
    }
  });

};
