'use strict';

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
 * @return {Function} Function to call when all groups are imported with:
 *   - **Error** An error if importing groups failed
 *   - **Number** The total number of inserted groups
 *   - **Array** The list of added groups
 */
module.exports.importGroups = function(groups, callback) {
  var groupProvider = new GroupProvider(storage.getDatabase());
  var groupsToAdd = [];

  for (var id in groups) {
    groups[id].id = id;
    groupsToAdd.push(groups[id]);
  }

  groupProvider.add(groupsToAdd, function(error, total, addedGroups) {
    if (error) throw error;
    callback(error, total, addedGroups);
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
  var roleProvider = new RoleProvider(storage.getDatabase());
  var rolesToAdd = [];

  for (var id in roles) {
    roles[id].id = id;
    rolesToAdd.push(roles[id]);
  }
  roleProvider.add(rolesToAdd, function(error, total, addedRoles) {
    if (error) throw error;
    callback(error, total, roles);
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
 *         "roles": [ "coreAdmin", "guest" ], // User role reference as defined in roles property
 *         "locked": false // Indicates if user can be modified or not
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
  var userProvider = new UserProvider(storage.getDatabase());
  var usersToAdd = [];

  for (var id in users) {
    var user = users[id];
    user.passwordValidate = user.password;
    usersToAdd.push(user);
  }

  userProvider.add(usersToAdd, function(error, total, addedUsers) {
    if (error) throw error;
    callback(error, total, addedUsers);
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
  var clientProvider = new ClientProvider(storage.getDatabase());
  var applicationsToAdd = [];

  for (var id in applications) applicationsToAdd.push(applications[id]);

  clientProvider.add(applicationsToAdd, function(error, total, addedApplication) {
    if (error) throw error;
    callback(error, total, addedApplication);
  });
};
