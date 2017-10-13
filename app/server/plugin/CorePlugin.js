'use strict';

/**
 * @module core-plugin
 */

var util = require('util');
var async = require('async');
var express = require('express');
var openVeoApi = require('@openveo/api');
var CorePluginApi = process.require('app/server/plugin/CorePluginApi.js');
var ClientProvider = process.require('app/server/providers/ClientProvider.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var TokenProvider = process.require('app/server/providers/TokenProvider.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var GroupProvider = process.require('app/server/providers/GroupProvider.js');
var TaxonomyProvider = process.require('app/server/providers/TaxonomyProvider.js');
var SettingProvider = process.require('app/server/providers/SettingProvider.js');
var storage = process.require('app/server/storage.js');
var listener = process.require('app/server/plugin/listener.js');

/**
 * Defines the Core Plugin.
 *
 * In some way, the core act just like any other plugins, it has a 3 routers (public, private and web service) and
 * a configuration file. Core plugin can be loaded just like any plugin.
 *
 * @class CorePlugin
 * @extends Plugin
 * @constructor
 */
function CorePlugin() {
  CorePlugin.super_.call(this);

  Object.defineProperties(this, {

    /**
     * Core plugin name.
     *
     * @property name
     * @type String
     */
    name: {value: 'core', writable: true, enumerable: true},

    /**
     * Core plugin path.
     *
     * @property path
     * @type String
     * @final
     */
    path: {value: process.root},

    /**
     * Core plugin mount path.
     *
     * @property mountPath
     * @type String
     * @final
     */
    mountPath: {value: '/'},

    /**
     * Core APIs.
     *
     * @property api
     * @type PluginApi
     * @final
     */
    api: {value: new CorePluginApi()},

    /**
     * Core public router.
     *
     * @property router
     * @type Router
     * @final
     */
    router: {value: express.Router()},

    /**
     * Core private router.
     *
     * @property router
     * @type Router
     * @final
     */
    privateRouter: {value: express.Router()},

    /**
     * Core web service router.
     *
     * @property router
     * @type Router
     * @final
     */
    webServiceRouter: {value: express.Router()}

  });
}

module.exports = CorePlugin;
util.inherits(CorePlugin, openVeoApi.plugin.Plugin);

/**
 * Sets listeners on core hooks.
 *
 * @method setCoreListeners
 * @private
 */
function setCoreListeners() {
  var coreApi = process.api.getCoreApi();
  var CORE_HOOKS = coreApi.getHooks();
  coreApi.registerAction(CORE_HOOKS.ROLES_DELETED, listener.onRolesDeleted);
}

/**
 * Prepares plugin by creating required database indexes.
 *
 * This is automatically called by core application after plugin is loaded.
 *
 * @method init
 * @async
 * @param {Function} callback Function to call when it's done with:
 *  - **Error** An error if something went wrong, null otherwise
 */
CorePlugin.prototype.init = function(callback) {
  var database = storage.getDatabase();
  var asyncFunctions = [];
  var providers = [
    new ClientProvider(database),
    new RoleProvider(database),
    new TaxonomyProvider(database),
    new TokenProvider(database),
    new UserProvider(database),
    new GroupProvider(database),
    new SettingProvider(database)
  ];

  setCoreListeners.call(this);

  providers.forEach(function(provider) {
    if (provider.createIndexes) {
      asyncFunctions.push(function(callback) {
        provider.createIndexes(callback);
      });
    }
  });

  async.parallel(asyncFunctions, function(error, results) {
    callback(error);
  });
};
