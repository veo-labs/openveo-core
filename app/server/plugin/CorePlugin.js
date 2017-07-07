'use strict';

/**
 * @module core-plugin
 */

var util = require('util');
var express = require('express');
var openVeoApi = require('@openveo/api');
var CorePluginApi = process.require('app/server/plugin/CorePluginApi.js');

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
