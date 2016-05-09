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
                callback(error);
            });
            db.removeCollection('sessions', function(error) {
                callback(error);
            });
        }
    });

    process.logger.info('Core 2.0.0 migration done.');
    callback();
};
