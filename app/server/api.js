'use strict';

/**
 * API manipulates the list of loaded plugins and exposes their APIs.
 *
 * @module core/api
 */

var openVeoApi = require('@openveo/api');

/**
 * The list of loaded plugins.
 *
 * @type {Array}
 * @private
 * @ignore
 */
var plugins = [];

/**
 * Gets a plugin by its name.
 *
 * @param {String} name The plugin's name
 * @return {Object} The plugin
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
 * @return {Array} The list of loaded plugins
 */
module.exports.getPlugins = function() {
  return plugins;
};

/**
 * Adds a plugin to the list of plugins.
 *
 * @param {Object} plugin The plugin to add
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
 * @param {String} name The plugin's name
 * @return {Object} The plugin's API
 */
module.exports.getApi = function(name) {
  var plugin = this.getPlugin(name);
  return plugin ? plugin.api : null;
};

/**
 * Gets core plugin's API.
 *
 * @return {Object} The core plugin's API
 */
module.exports.getCoreApi = function() {
  var plugin = this.getPlugin('core');
  return plugin ? plugin.api : null;
};
