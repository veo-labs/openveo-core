'use strict';

/**
 * @module core
 */

var openVeoApi = require('@openveo/api');

/**
 * API manipulates the list of loaded plugins and exposes their APIs.
 *
 * @class api
 * @static
 */

/**
 * The list of loaded plugins.
 *
 * @property plugins
 * @type Array
 * @private
 */
var plugins = [];

/**
 * Gets a plugin by its name.
 *
 * @method getPlugin
 * @static
 * @param {String} name The plugin's name
 * @return {Plugin} The plugin
 */
module.exports.getPlugin = function(name) {
  if (name) {
    for (var i = 0; i < plugins.length; i++) {
      if (plugins[i].name === name)
        return plugins[i];
    }
  }

  return null;
};

/**
 * Gets the list of loaded plugins.
 *
 * @method getPlugins
 * @static
 * @return {Array} The list of loaded plugins
 */
module.exports.getPlugins = function() {
  return plugins;
};

/**
 * Adds a plugin to the list of plugins.
 *
 * @method addPlugin
 * @param {Plugin} plugin The plugin to add
 * @throws {TypeError} If plugin is not a valid plugin
 */
module.exports.addPlugin = function(plugin) {
  if (plugin instanceof openVeoApi.plugin.Plugin && plugin.name) {
    if (!this.getPlugin(plugin.name)) {
      Object.freeze(plugin);
      plugins.push(plugin);
    }
  } else
    throw new TypeError('Could not add the plugin : invalid plugin');
};

/**
 * Gets API of a plugin.
 *
 * @method getApi
 * @static
 * @param {String} name The plugin's name
 * @return {PluginApi} The plugin's API
 */
module.exports.getApi = function(name) {
  var plugin = this.getPlugin(name);
  return plugin ? plugin.api : null;
};

/**
 * Gets core plugin's API.
 *
 * @method getCoreApi
 * @static
 * @return {PluginApi} The core plugin's API
 */
module.exports.getCoreApi = function() {
  var plugin = this.getPlugin('core');
  return plugin ? plugin.api : null;
};
