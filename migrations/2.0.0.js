'use strict';

var async = require('async');
var storage = process.require('app/server/storage.js');

var db = storage.getDatabase();

module.exports.update = function(callback) {
  process.logger.info('Core 2.0.0 migration launched.');
  async.series([

    // Prefix collection with the module name : core
    function(callback) {
      db.renameCollection('clients', 'core_clients', function(error) {
        callback(error);
      });
    },
    function(callback) {
      db.renameCollection('roles', 'core_roles', function(error) {
        callback(error);
      });
    },
    function(callback) {
      db.renameCollection('taxonomy', 'core_taxonomies', function(error) {
        callback(error);
      });
    },
    function(callback) {
      db.renameCollection('tokens', 'core_tokens', function(error) {
        callback(error);
      });
    },
    function(callback) {
      db.renameCollection('users', 'core_users', function(error) {
        callback(error);
      });
    },

    // Get Sessions datas and remove collection
    function(callback) {
      db.get('sessions', {}, null, null, function(error, value) {
        if (error) {
          callback(error);
          return;
        }

        // No need to change anything
        if (!value || !value.length) return callback();

        else {
          async.series([
            function(callback) {
              db.insert('core_sessions', value, function(error) {
                callback(error);
              });
            },
            function(callback) {
              db.removeCollection('sessions', function(error) {
                callback(error);
              });
            }
          ], callback);
        }
      });
    },

    // Rename permissions names
    function(callback) {
      db.get('core_roles', {}, null, null, function(error, value) {
        if (error) {
          callback(error);
          return;
        }

        // No need to change anything
        if (!value || !value.length) return callback();

        var asyncActions = [];

        value.forEach(function(role) {
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
              db.update('core_roles', {id: role.id}, {permissions: permissions}, function(error) {
                callback(error);
              });
            });
          }
        });

        async.series(asyncActions, callback);
      });
    }

  ], function(err) {
    if (err) {
      callback(err);
      return;
    }
    process.logger.info('Core 2.0.0 migration done.');
    callback();
  });
};
