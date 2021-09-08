'use strict';

/**
 * @module core/plugin/CorePlugin
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
 */
function CorePlugin() {
  CorePlugin.super_.call(this);

  Object.defineProperties(this,

    /** @lends module:core/plugin/CorePlugin~CorePlugin */
    {

      /**
       * Core plugin name.
       *
       * @type {String}
       * @default core
       * @instance
       */
      name: {value: 'core', writable: true, enumerable: true},

      /**
       * Core plugin path.
       *
       * @type {String}
       * @readonly
       * @instance
       */
      path: {value: process.root},

      /**
       * Core plugin mount path.
       *
       * @type {String}
       * @readonly
       * @default /
       * @instance
       */
      mountPath: {value: '/'},

      /**
       * Core APIs.
       *
       * @type {PluginApi}
       * @readonly
       * @instance
       */
      api: {value: new CorePluginApi()},

      /**
       * Core public router.
       *
       * @type {Router}
       * @readonly
       * @instance
       */
      router: {value: express.Router()},

      /**
       * Core private router.
       *
       * @type {Router}
       * @readonly
       * @instance
       */
      privateRouter: {value: express.Router()},

      /**
       * Core web service router.
       *
       * @type {Router}
       * @readonly
       * @instance
       */
      webServiceRouter: {value: express.Router()}

    }
  );
}

module.exports = CorePlugin;
util.inherits(CorePlugin, openVeoApi.plugin.Plugin);

/**
 * Sets listeners on core hooks.
 *
 * @private
 * @memberof module:core/plugin/CorePlugin~CorePlugin
 */
function setCoreListeners() {
  var coreApi = process.api.getCoreApi();
  var CORE_HOOKS = coreApi.getHooks();
  coreApi.registerAction(CORE_HOOKS.ROLES_DELETED, listener.onRolesDeleted);
  coreApi.registerAction(CORE_HOOKS.GROUPS_ADDED, listener.onGroupsAdded);
  coreApi.registerAction(CORE_HOOKS.GROUP_UPDATED, listener.onGroupUpdated);
  coreApi.registerAction(CORE_HOOKS.GROUPS_DELETED, listener.onGroupsDeleted);
}

/**
 * Prepares plugin by creating required database indexes.
 *
 * This is automatically called by core application after plugin is loaded.
 *
 * @param {callback} callback Function to call when it's done
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
