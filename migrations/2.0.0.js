'use strict';

var async = require('async');
var openVeoApi = require('@openveo/api');
var storage = process.require('app/server/storage.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var ResourceFilter = openVeoApi.storages.ResourceFilter;
var databaseErrors = openVeoApi.storages.databaseErrors;

var db = storage.getDatabase();

module.exports.update = function(callback) {
  process.logger.info('Core 2.0.0 migration launched.');
  var roleProvider = new RoleProvider(db);

  async.series([

    // Prefix collection with the module name : core
    function(callback) {
      db.renameCollection('clients', 'core_clients', function(error) {
        if (error && error.code === databaseErrors.RENAME_COLLECTION_NOT_FOUND_ERROR) return callback();
        callback(error);
      });
    },
    function(callback) {
      db.renameCollection('roles', 'core_roles', function(error) {
        if (error && error.code === databaseErrors.RENAME_COLLECTION_NOT_FOUND_ERROR) return callback();
        callback(error);
      });
    },
    function(callback) {
      db.renameCollection('taxonomy', 'core_taxonomies', function(error) {
        if (error && error.code === databaseErrors.RENAME_COLLECTION_NOT_FOUND_ERROR) return callback();
        callback(error);
      });
    },
    function(callback) {
      db.renameCollection('tokens', 'core_tokens', function(error) {
        if (error && error.code === databaseErrors.RENAME_COLLECTION_NOT_FOUND_ERROR) return callback();
        callback(error);
      });
    },
    function(callback) {
      db.renameCollection('users', 'core_users', function(error) {
        if (error && error.code === databaseErrors.RENAME_COLLECTION_NOT_FOUND_ERROR) return callback();
        callback(error);
      });
    },
    function(callback) {
      db.renameCollection('sessions', 'core_sessions', function(error) {
        if (error && error.code === databaseErrors.RENAME_COLLECTION_NOT_FOUND_ERROR) return callback();
        callback(error);
      });
    },

    // Rename permissions names
    function(callback) {

      // filter, fields, callback
      roleProvider.getAll(
        null,
        {
          include: ['id', 'permissions']
        },
        {
          id: 'desc'
        },
        function(error, roles) {
          if (error) return callback(error);

          // No need to change anything
          if (!roles || !roles.length) return callback();

          var asyncActions = [];

          roles.forEach(function(role) {
            if (role.permissions) {
              var permissions = [];
              role['permissions'].forEach(function(permission) {
                switch (permission) {
                  case 'create-application':
                    permissions.push('core-add-applications');
                    break;
                  case 'update-application':
                    permissions.push('core-update-applications');
                    break;
                  case 'delete-application':
                    permissions.push('core-delete-applications');
                    break;
                  case 'create-taxonomy':
                    permissions.push('core-add-taxonomies');
                    break;
                  case 'update-taxonomy':
                    permissions.push('core-update-taxonomies');
                    break;
                  case 'delete-taxonomy':
                    permissions.push('core-delete-taxonomies');
                    break;
                  case 'create-user':
                    permissions.push('core-add-users');
                    break;
                  case 'update-user':
                    permissions.push('core-update-users');
                    break;
                  case 'delete-user':
                    permissions.push('core-delete-users');
                    break;
                  case 'create-role':
                    permissions.push('core-add-roles');
                    break;
                  case 'update-role':
                    permissions.push('core-update-roles');
                    break;
                  case 'delete-role':
                    permissions.push('core-delete-roles');
                    break;
                  case 'access-applications-page':
                    permissions.push('core-access-applications-page');
                    break;
                  case 'access-users-page':
                    permissions.push('core-access-users-page');
                    break;
                  case 'access-roles-page':
                    permissions.push('core-access-roles-page');
                    break;
                  default:
                    permissions.push(permission);
                    break;
                }
              });

              asyncActions.push(function(callback) {
                roleProvider.updateOne(
                  new ResourceFilter().equal('id', role.id),
                  {
                    permissions: permissions
                  },
                  callback
                );
              });
            }
          });

          async.series(asyncActions, callback);
        }
      );
    }

  ], function(error) {
    if (error) return callback(error);
    process.logger.info('Core 2.0.0 migration done.');
    callback();
  });
};
