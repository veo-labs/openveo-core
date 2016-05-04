'use strict';

var openVeoAPI = require('@openveo/api');
var db = openVeoAPI.applicationStorage.getDatabase();


module.exports.update = function(callback) {
    process.logger.info('Core 1.3.0 migration launched.');

    // Prefix collection with the module name : publish
    db.renameCollection('clients', 'core_clients', function(error, value) {
        if (error) {
            callback(error);
            return;
        }
    });
    db.renameCollection('roles', 'core_roles', function(error, value) {
        if (error) {
            callback(error);
            return;
        }
    });
    db.renameCollection('taxonomy', 'core_taxonomies', function(error, value) {
        if (error) {
            callback(error);
            return;
        }
    });
    db.renameCollection('tokens', 'core_tokens', function(error, value) {
        if (error) {
            callback(error);
            return;
        }
    });
    db.renameCollection('users', 'core_users', function(error, value) {
        if (error) {
            callback(error);
            return;
        }
    });

    process.logger.info('Core 1.3.0 migration done.');
    callback();
};
