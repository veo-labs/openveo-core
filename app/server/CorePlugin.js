'use strict';

/**
 * Defines the Core Plugin.
 *
 * In some way, the core act just like any other plugins, it has a 3 routers (public, private and web service) and
 * a configuration file. Core plugin can be loaded just like any plugin.
 *
 * @module core-plugin
 */

var util = require('util');
var express = require('express');
var openVeoAPI = require('@openveo/api');

/**
 * Creates a CorePlugin.
 *
 * @class CorePlugin
 * @constructor
 * @extends Plugin
 */
function CorePlugin() {

  /**
   * Core plugin name.
   *
   * @property name
   * @type String
   */
  this.name = 'core';

  /**
   * Core plugin path.
   *
   * @property path
   * @type String
   */
  this.path = process.root;

  /**
   * Core plugin mount path.
   *
   * @property mountPath
   * @type String
   */
  this.mountPath = '/';

  /**
   * Core public router.
   *
   * @property router
   * @type Router
   */
  this.router = express.Router();

  /**
   * Core private router.
   *
   * @property router
   * @type Router
   */
  this.privateRouter = express.Router();

  /**
   * Core web service router.
   *
   * @property router
   * @type Router
   */
  this.webServiceRouter = express.Router();

}

module.exports = CorePlugin;
util.inherits(CorePlugin, openVeoAPI.Plugin);
