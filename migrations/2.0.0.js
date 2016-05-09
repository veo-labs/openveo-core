'use strict';

var openVeoAPI = require('@openveo/api');
var db = openVeoAPI.applicationStorage.getDatabase();


module.exports.update = function(callback) {
    process.logger.info('Core 2.0.0 migration launched.');

    // Prefix collection with the module name : core
    db.renameCollection('clients', 'core_clients', function(error) {
        if (error) {
            callback(error);
            return;
        }
    });
    db.renameCollection('roles', 'core_roles', function(error) {
        if (error) {
            callback(error);
            return;
        }
    });
    db.renameCollection('taxonomy', 'core_taxonomies', function(error) {
        if (error) {
            callback(error);
            return;
        }
    });
    db.renameCollection('tokens', 'core_tokens', function(error) {
        if (error) {
            callback(error);
            return;
        }
    });
    db.renameCollection('users', 'core_users', function(error) {
        if (error) {
            callback(error);
            return;
        }
    });

    // Get Sessions datas and remove collection
    db.get('sessions', {}, null, null, function(error, value) {
        if (error) {
            callback(error);
            return;
        }

        // No need to change anything
        if (!value || !value.length) callback();

        else {
            db.insert('core_sessions', value, function(error) {
                if (error) {
                    callback(error);
                    return;
                }
            });
            db.removeCollection('sessions', function(error) {
                if (error) {
                    callback(error);
                    return;
                }
            });
        }
    });

    // Rename permissions names
    db.get('core_roles', {}, null, null, function(error, value) {
        if (error) {
            callback(error);
            return;
        }

        // No need to change anything
        if (!value || !value.length) callback();

        var permissions = [];

        value.forEach(function(role) {
            if (role.permissions) {
                permissions = [];
                role['permissions'].forEach(function(permission) {
                    switch(permission) {
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

                db.update('core_roles', {id: role.id}, {permissions: permissions}, function(error) {
                    if (error) {
                        callback(error);
                        return;
                    }
                });
            }
        });
    });

    process.logger.info('Core 2.0.0 migration done.');
    callback();
};
