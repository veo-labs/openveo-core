'use strict';

/**
 * @module core-loaders
 */

/**
 * Provides functions to load openveo plugins.
 *
 * @class pluginLoader
 */

var fs = require('fs');
var path = require('path');
var async = require('async');
var openVeoAPI = require('@openveo/api');

// Module files
var migrationLoader = process.require('/app/server/loaders/migrationLoader.js');

/**
 * Filters the list of plugins paths in case the same plugin appears
 * multiple time at different paths. Filters to keep only the most
 * top level one.
 *
 * @example
 *     var pluginsPaths = [
 *       "/openveo/node_modules/@openveo/plugin1",
 *       "/openveo/node_modules/@openveo/plugin2/node_modules/@openveo/plugin1"
 *     ];
 *     console.log(filterPluginsPaths(pluginsPaths));
 *     // [ "/openveo/node_modules/@openveo/plugin1" ]
 *
 * @method filterPluginsPaths
 * @private
 * @static
 * @param {Array} pluginsPaths The list of plugins paths to analyze
 * @return {Array} The filtered list of plugins paths
 */
function filterPluginsPaths(pluginsPaths) {
  var filteredPaths = [];

  // Got at least one path
  if (pluginsPaths.length) {
    var analyzedPaths = {};

    pluginsPaths.forEach(function(pluginPath) {

      // Extract plugin name
      // e.g "/openveo/node_modules/@openveo/plugin1"
      // becomes "plugin1"
      var pluginName = path.basename(pluginPath);

      // Plugin already analyzed
      // Replace it if the path length is shorter
      if (analyzedPaths[pluginName]) {
        if (analyzedPaths[pluginName].length > pluginPath.length)
          analyzedPaths[pluginName] = pluginPath;
      } else {

        // Plugin name not analyzed yet
        // Add it to the list of analyzed one
        analyzedPaths[pluginName] = pluginPath;

      }

    });

    for (var i in analyzedPaths)
      filteredPaths.push(analyzedPaths[i]);

  }

  return filteredPaths;
}

/**
 * Recursively and asynchronously analyze the given directory to get
 * npm plugins in @openveo scope directory.
 *
 * It assumes that the startingPath argument correspond to a valid
 * directory path.
 *
 * @example
 *     getPluginPaths("/node_modules/@openveo", function(error, pluginsPaths){
 *       console.log(pluginsPaths);
 *       // [
 *       //   '/home/veo-labs/openveo/node_modules/@openveo/publish
 *       // ]
 *     };
 *
 * @method getPluginPaths
 * @static
 * @param {String} startingPath Root path from where looking for
 * @openveo/* plugins.
 * @param {Function} callback A callback with two arguments :
 *    - **Error** An Error object or null
 *    - **Array** The list of plugins paths
 */
module.exports.getPluginPaths = function(startingPath, callback) {
  var self = this;

  if (startingPath) {
    startingPath = path.join(startingPath, 'node_modules', '@openveo');
    var pluginsPaths = [];

    // Open directory
    fs.readdir(startingPath, function(error, resources) {

      // Failed reading directory
      if (error)
        return callback(error);

      var pendingFilesNumber = resources.length;

      // No more pending resources, done for this directory
      if (!pendingFilesNumber)
        callback(null, pluginsPaths);

      // Iterate through the list of resources in the directory
      resources.forEach(function(resource) {

        // Get resource stats
        fs.stat(path.join(startingPath, resource), function(statError, stats) {
          if (statError)
            return callback(statError);

          // Resource correspond to an openveo plugin
          if (stats.isDirectory()) {
            pluginsPaths.push(path.join(startingPath, resource));

            // Test if node_modules/@openveo directory exists under the
            // plugin directory
            fs.exists(path.join(startingPath, resource, 'node_modules', '@openveo'), function(exists) {

              // node_modules/@openveo directory exists
              if (exists) {

                // Recursively load modules inside the new
                // node_modules/@openveo directory
                var pluginPath = path.join(startingPath, resource);
                resources = self.getPluginPaths(pluginPath, function(pathsError, subPluginsPaths) {

                  if (pathsError)
                    return callback(pathsError);

                  pluginsPaths = pluginsPaths.concat(subPluginsPaths);

                  pendingFilesNumber--;

                  if (!pendingFilesNumber)
                    callback(null, pluginsPaths);

                });
              } else {

                // node_modules directory does not exist
                pendingFilesNumber--;

                if (!pendingFilesNumber)
                  callback(null, pluginsPaths);

              }
            });

            if (!pendingFilesNumber)
              callback(null, pluginsPaths);
          }

        });

      });

    });
  }

};

/**
 * Recursively and asynchronously load all npm plugins prefixed by "@openveo/" under the given path.
 *
 * If the same plugin is encountered several times, the top level one
 * will be kept.
 *
 * @example
 *     var pluginLoader = process.require("app/server/lodaers/pluginLoader.js");
 *
 *     // Load all potential openveo plugins from directory /node_modules
 *     pluginLoader.loadPlugins("/node_modules", function(error, plugins){
 *       console.log(plugins);
 *     }
 *
 * @method loadPlugins
 * @static
 * @async
 * @param {String} startingPath Root path from where looking for plugins.
 * @param {Function} callback A callback with two arguments :
 *    - **Error** An Error object or null
 *    - **Array** A list of Plugin objects
 */
module.exports.loadPlugins = function(startingPath, callback) {
  var self = this;

  // Get the list of plugins absolute paths
  this.getPluginPaths(startingPath, function(error, pluginsPaths) {

    // An error occurred while scaning the directory looking for
    // openveo plugins
    if (error) {
      callback(error);
      return;
    }

    // Filter duplicate plugins to keep only the top level ones
    pluginsPaths = filterPluginsPaths(pluginsPaths);
    var plugins = [];

    var pendingPlugins = pluginsPaths.length;
    if (pendingPlugins) {

      // Iterate through each plugin path
      pluginsPaths.forEach(function(pluginPath) {

        // Load the plugin
        self.loadPlugin(pluginPath, startingPath, function(loadError, loadedPlugin) {

          // An error occurred while loading the plugin
          // Skip the plugin and continue loading the other one
          if (loadError) {
            process.logger.warn(loadError.message, {
              action: 'loadPlugins',
              plugin: pluginPath
            });
            process.logger.info('Plugin ' + pluginPath + ' skipped');
          } else {

            // Plugin successfully loaded
            plugins.push(loadedPlugin);

          }

          pendingPlugins--;

          // All plugins loaded
          if (!pendingPlugins)
            callback(null, plugins);

        });
      });

    } else {

      // No plugins at all
      callback(null, plugins);

    }

  });

};

/**
 * Loads a single plugin by its path.
 *
 * Each plugin may contains :
 *  - A public directory to store static files, if an incoming request
 *    does not match any of the files in the public directory of the main
 *    plugin, it will look to the public directory of sub plugins
 *  - A conf.js file describing several things :
 *    - public and admin routes
 *    - The back end menu items for the plugin
 *    - A list of JavaScript libraries files to load while accessing the
 *      back end page
 *    - A list of JavaScript files to load while accessing the back
 *      end page
 *    - A list of CSS files to load while accessing the back end page
 *  - The plugin main file as an Object inherited from the
 *    Plugin Object (see Plugin.js in @openveo/api module)
 *
 * @example
 *     var pluginLoader = process.require("app/server/loaders/pluginLoader.js");
 *
 *     // Load a plugin
 *     pluginLoader.loadPlugin("/node_modules/@openveo/publish", function(error, loadedPlugin){
 *       console.log(loadedPlugin);
 *     }
 *
 * @method loadPlugin
 * @static
 * @async
 * @param {String} pluginPath Absolute path to the plugin directory
 * @param {String} startingPath Root path from where looking for plugins.
 * @param {Function} callback A callback with two arguments :
 *    - **Error** An Error object or null
 *    - **Plugin** The loaded plugin or null
 */
module.exports.loadPlugin = function(pluginPath, startingPath, callback) {
  var plugin = {};

  // Extract the plugin(s) name(s) from the plugin path
  // e.g : [/www/openveo/]node_modules/@openveo/plugin1/node_modules/@openveo/plugin2
  // The plugin to load is plugin2 and is also a subplugin of plugin1
  var pathChunks = pluginPath.replace(startingPath, '').split(path.join('node_modules', '@openveo'));

  // Keep only the plugin parts
  // e.g : ["/plugin1/", "/plugin2"]
  pathChunks.shift(0);

  // Clean plugins names removing scope and slashes
  // e.g : ["plugin1", "plugin2"]
  var pluginPathComposition = pathChunks.map(function(pluginName) {
    return pluginName.replace(/^[\/|\\]?([^/\\]*)[\/|\\]?$/, '$1');
  });

  try {

    // Try to load the main file of the plugin
    var Plugin = require(pluginPath);

    // Validate that we are sharing the same openveo API and that
    // the main file returned by the plugin is a valid instance
    // of the Plugin Object from @openveo/api plugin
    if (Plugin.prototype instanceof openVeoAPI.Plugin && pluginPathComposition.length) {

      // Instanciate the Plugin Object
      plugin = new Plugin();
      plugin.path = pluginPath;

      // Define plugin router mount path
      // Plugin router is mounted on a subpath to avoid collisions
      // with the main openveo application
      // e.g "/plugin1"
      plugin.mountPath = '/' + pluginPathComposition.join('/');

    }
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND')
      process.logger.info('Plugin ' + pluginPath + ' doesn\'t have a main file', {
        action: 'loadPlugin',
        message: e.message
      });
    else
      process.logger.error('Error while loading plugin ' + pluginPath, {
        action: 'loadPlugin',
        error: e.message,
        stack: e.stack
      });

    return callback(new Error(e.message));
  }

  // Complete plugin information adding the name of the plugin
  plugin.name = pluginPathComposition[pluginPathComposition.length - 1];

  async.parallel(
    [
      function(callback) {

        // Test if an assets directory exists at plugin root level
        fs.exists(path.join(pluginPath, 'assets'), function(exists) {

          if (exists)
            plugin.assets = path.join(pluginPath, 'assets');

          callback();

        });
      },
      function(callback) {

        // Test if an i18n directory exists at plugin's root level
        fs.exists(path.join(pluginPath, 'i18n'), function(exists) {

          if (exists)
            plugin.i18nDirectory = path.join(pluginPath, 'i18n');

          callback();

        });
      },
      function(callback) {

        // Test if a file "conf.js" exists at plugin root level
        fs.exists(path.join(pluginPath, 'conf.js'), function(exists) {

          if (exists) {
            try {

              // Try to load plugin configuration file
              var pluginConf = require(path.join(pluginPath, 'conf.js'));

              plugin.custom = pluginConf['custom'] || null;
              plugin.webServiceScopes = pluginConf['webServiceScopes'] || null;
              plugin.permissions = pluginConf['permissions'] || null;

              // Got views folders for this plugin
              if (pluginConf['viewsFolders'] && pluginConf['viewsFolders'].length) {
                plugin.viewsFolders = [];
                pluginConf['viewsFolders'].forEach(function(viewsFolder) {
                  plugin.viewsFolders.push(path.join(pluginPath, viewsFolder));
                });
              }

              // Got images thumbnailable folders for this plugin
              var pluginImageProc = pluginConf['imageProcessing'];

              if (pluginImageProc) {
                if (pluginImageProc['imagesFolders'] && pluginImageProc['imagesFolders'].length) {
                  plugin.imagesFolders = [];
                  pluginImageProc['imagesFolders'].forEach(function(imagesFolders) {
                    plugin.imagesFolders.push(path.join(pluginPath, imagesFolders));
                  });
                  if (pluginImageProc['imagesStyle']) {
                    plugin.imagesStyle = pluginImageProc['imagesStyle'];
                  }
                }

              }

              // Retrieve routes and back end conf from plugin conf
              var pluginRoutes = pluginConf['routes'];
              var backEndConf = pluginConf['backOffice'];

              // Got routes for this plugin
              // Retrieve public, private and Web Service routes
              if (pluginRoutes) {
                plugin.routes = pluginRoutes['public'];
                plugin.privateRoutes = pluginRoutes['private'];
                plugin.webServiceRoutes = pluginRoutes['ws'];
              }

              // Got entities
              if (pluginConf['entities'])
                plugin.entities = pluginConf['entities'];

              // Got back end conf
              if (backEndConf) {

                // Retrieve back end menu pages from plugin conf
                plugin.menu = backEndConf['menu'] || null;

                // Retrieve back end scripts and css from plugin conf
                plugin.scriptLibFiles = backEndConf['scriptLibFiles'] || null;
                plugin.scriptFiles = backEndConf['scriptFiles'] || null;
                plugin.cssFiles = backEndConf['cssFiles'] || null;

              }
            } catch (e) {
              process.logger.warn(e.message, {
                action: 'loadPlugin',
                plugin: plugin.name
              });
              callback(new Error(e.message));
              return;
            }
          }

          callback();

        });

      },
      function(callback) {

        // Test if a package.json file exists at plugin's root level
        fs.exists(path.join(pluginPath, 'package.json'), function(exists) {

          if (exists) {
            var pluginPackage = require(path.join(pluginPath, 'package.json'));
            plugin.version = [{
              name: pluginPackage['name'],
              version: pluginPackage['version']
            }] || null;
          }

          callback();

        });
      },
      function(callback) {

        var db = openVeoAPI.applicationStorage.getDatabase();
        db.get('core-system', {name: plugin.name}, null, null, function(error, value) {
          if (error) {
            callback(error);
            return;
          }
          var lastVersion = '0.0.0';
          if (value && value.length) lastVersion = value[0].version;

          var migrationPath = path.join(pluginPath, 'migrations');
          migrationLoader.getDiffMigrationScript(migrationPath, lastVersion, function(error, migrations) {
            if (error) {
              callback(error);
              return;
            }
            if (migrations && Object.keys(migrations).length > 0)
              plugin.migrations = migrations;
            callback();
          });
        });
      }
    ],
    function(error) {

      // Plugin is fully loaded
      if (callback)
        callback(error, plugin);
    }
  );
};
