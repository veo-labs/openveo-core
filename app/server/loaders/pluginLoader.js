'use strict';

/**
 * @module core-loaders
 */

/**
 * Provides functions to load openveo plugins.
 *
 * @class pluginLoader
 * @static
 */

var fs = require('fs');
var path = require('path');
var async = require('async');
var openVeoApi = require('@openveo/api');
var migrationLoader = process.require('app/server/loaders/migrationLoader.js');
var storage = process.require('app/server/storage.js');
var ResourceFilter = openVeoApi.storages.ResourceFilter;

/**
 * Filters the list of plugins paths in case the same plugin appears
 * multiple time at different paths. Filters to keep only the most
 * top level one.
 *
 * @example
 *     var pluginsPaths = [
 *       '/openveo/node_modules/@openveo/plugin1',
 *       '/openveo/node_modules/@openveo/plugin2/node_modules/@openveo/plugin1'
 *     ];
 *     console.log(filterPluginsPaths(pluginsPaths));
 *     // [ '/openveo/node_modules/@openveo/plugin1' ]
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
 * npm plugins.
 *
 * There are two kinds of plugins : plugins maintained by the core team (under @openveo scope)
 * and contributers' plugins which must be prefixed by **openveo-**.
 *
 * @example
 *     getPluginPaths('/openveo', function(error, pluginsPaths){
 *       console.log(pluginsPaths);
 *       // [
 *       //   '/openveo/node_modules/@openveo/plugin',
 *       //   '/openveo/node_modules/openveo-contrib-plugin'
 *       // ]
 *     };
 *
 * @method getPluginPaths
 * @static
 * @param {String} startingPath Root path of an NPM module from where looking for plugins
 * @param {Function} callback A callback with two arguments :
 *    - **Error** An Error object or null
 *    - **Array** The list of plugins paths
 * @throws {TypeError} An error if starting path is not a valid string
 */
module.exports.getPluginPaths = function(startingPath, callback) {
  var self = this;
  var pluginsPaths = [];
  var asyncActions = [];
  startingPath = path.join(startingPath, 'node_modules');

  // Read node_modules directory
  fs.readdir(startingPath, function(error, resources) {
    if (error && error.code === 'ENOENT') {

      // Directory does not exist
      // No plugin for this path
      return callback(null, pluginsPaths);

    } else if (error)
      return callback(error);

    var getPluginPath = function(potentialPluginPath) {
      return function(callback) {
        fs.stat(potentialPluginPath, function(statError, stats) {
          if (statError)
            return callback(statError);

          if (stats.isDirectory()) {

            // Found a plugin path
            pluginsPaths.push(potentialPluginPath);

            self.getPluginPaths(potentialPluginPath, function(pathsError, subPluginsPaths) {
              if (pathsError)
                return callback(pathsError);

              // Found sub plugin paths
              pluginsPaths = pluginsPaths.concat(subPluginsPaths);

              // Done with this resource
              callback();
            });

          } else {

            // This is not a plugin path
            // Done with this resource
            callback();

          }
        });
      };
    };

    var getOfficialPluginsPaths = function(openveoDirPath) {
      return function(callback) {
        fs.stat(openveoDirPath, function(statError, stats) {
          if (statError)
            return callback(statError);

          if (stats.isDirectory()) {

            // Read directory
            fs.readdir(openveoDirPath, function(error, potentialPluginsResources) {
              var asyncActions = [];

              potentialPluginsResources.forEach(function(potentialPluginResource) {
                asyncActions.push(getPluginPath(path.join(openveoDirPath, potentialPluginResource)));
              });

              async.parallel(asyncActions, function(error, results) {
                callback(error);
              });
            });
          } else {

            // This is not a plugin path
            // Done with this resource
            callback();

          }
        });
      };
    };

    // Iterate through the list of resources in the directory
    // to find all resources starting by "openveo-" and if a resource
    // "@openveo" is present
    resources.forEach(function(resource) {
      var resourcePath = path.join(startingPath, resource);
      if (/^openveo-/.test(resource))
        asyncActions.push(getPluginPath(resourcePath));
      else if (resource === '@openveo')
        asyncActions.push(getOfficialPluginsPaths(resourcePath));
    });

    async.parallel(asyncActions, function(error, results) {
      if (error)
        callback(error);

      else
        callback(null, pluginsPaths);
    });
  });

};

/**
 * Recursively and asynchronously load all offical and contributed OpenVeo plugins under the given path.
 *
 * If the same plugin (same name) is encountered several times, the top level one
 * will be kept.
 *
 * @example
 *     var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
 *
 *     // Load all potential openveo plugins from directory /home/openveo/openveo
 *     pluginLoader.loadPlugins('/home/openveo/openveo', function(error, plugins){
 *       console.log(plugins);
 *     };
 *
 * @method loadPlugins
 * @static
 * @async
 * @param {String} startingPath Root path of an NPM module from where looking for plugins
 * @param {Function} callback A callback with two arguments :
 *    - **Error** An Error object or null
 *    - **Array** A list of Plugin objects
 * @throws {TypeError} An error if starting path is not a valid string
 */
module.exports.loadPlugins = function(startingPath, callback) {
  var self = this;

  // Get the list of potential plugins absolute paths
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
    var asyncActions = [];

    pluginsPaths.forEach(function(pluginPath) {
      asyncActions.push(function(callback) {

        // Load the plugin
        self.loadPlugin(pluginPath, function(loadError, loadedPlugin) {

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

          callback();
        });

      });
    });

    async.parallel(asyncActions, function(error, results) {
      callback(null, plugins);
    });

  });

};

/**
 * Loads a single plugin by its path.
 *
 * @example
 *     var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
 *
 *     // Load a plugin
 *     pluginLoader.loadPlugin('/node_modules/@openveo/publish', function(error, loadedPlugin){
 *       console.log(loadedPlugin);
 *     }
 *
 * @method loadPlugin
 * @static
 * @async
 * @param {String} pluginPath Absolute path to the plugin directory
 * @param {Function} callback A callback with two arguments :
 *    - **Error** An Error object or null
 *    - **Plugin** The loaded plugin or null
 * @throws {TypeError} An error if plugin path or starting path is not a valid string
 */
module.exports.loadPlugin = function(pluginPath, callback) {
  var plugin = null;
  var pluginComposition = [];
  var regResults;
  var reg = /(?:node_modules[/|\\](?:(?:@openveo[/|\\]([^/\\]*))|(?:openveo-([^/\\]*))))/g;

  // Extract the plugin(s) name(s) from the plugin path
  // e.g :
  // From plugin path : /www/openveo/node_modules/@openveo/plugin1/node_modules/openveo-plugin2
  // Retrieve : ['plugin1', 'plugin2']
  // The plugin to load is plugin2 which is also a sub plugin of plugin1
  while ((regResults = reg.exec(pluginPath)) !== null) {

    // Remove global match
    regResults.shift(0);

    // Get plugin name
    for (var i = 0; i < regResults.length; i++)
      if (regResults[i])
        pluginComposition.push(regResults[i]);
  }

  try {

    // Try to load the main file of the plugin
    var Plugin = require(pluginPath);

    // Validate that we are sharing the same openveo API and that
    // the main file returned by the plugin is a valid instance
    // of the Plugin Object from @openveo/api
    if (Plugin.prototype instanceof openVeoApi.plugin.Plugin && pluginComposition.length) {

      // Instanciate the Plugin Object
      plugin = new Plugin();
      plugin.path = pluginPath;

      // Define plugin router mount path
      // Plugin router is mounted on a subpath to avoid collisions
      // with the main openveo application
      // e.g "/plugin1"
      plugin.mountPath = '/' + pluginComposition.join('/');

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

  if (!plugin)
    return callback(new Error('Plugin ' + pluginPath + ' is not an instance of Plugin'));

  // Complete plugin information adding the name of the plugin
  plugin.name = pluginComposition[pluginComposition.length - 1];

  this.loadPluginMetadata(plugin, callback);
};

/**
 * Loads plugin's configuration.
 *
 * @method loadPluginMetadata
 * @static
 * @async
 * @param {Plugin} plugin The plugin
 * @param {Function} callback A callback with :
 *    - **Error** An Error if something went wrong
 */
module.exports.loadPluginMetadata = function(plugin, callback) {
  async.parallel(
    [
      function(callback) {

        // Test if an assets directory exists at plugin root level
        fs.stat(path.join(plugin.path, 'assets'), function(error, stats) {

          if (stats && stats.isDirectory())
            plugin.assets = path.join(plugin.path, 'assets');

          callback();

        });
      },
      function(callback) {

        // Test if an i18n directory exists at plugin's root level
        fs.stat(path.join(plugin.path, 'i18n'), function(error, stats) {

          if (stats && stats.isDirectory())
            plugin.i18nDirectory = path.join(plugin.path, 'i18n');

          callback();

        });
      },
      function(callback) {

        // Test if a file "conf.js" exists at plugin root level
        fs.stat(path.join(plugin.path, 'conf.js'), function(error, stats) {

          if (stats && stats.isFile()) {
            try {

              // Try to load plugin configuration file
              var pluginConf = require(path.join(plugin.path, 'conf.js'));

              plugin.custom = pluginConf['custom'] || null;
              plugin.webServiceScopes = pluginConf['webServiceScopes'] || null;
              plugin.permissions = pluginConf['permissions'] || null;

              // Got views folders for this plugin
              if (pluginConf['viewsFolders'] && pluginConf['viewsFolders'].length) {
                plugin.viewsFolders = [];
                pluginConf['viewsFolders'].forEach(function(viewsFolder) {
                  plugin.viewsFolders.push(path.join(plugin.path, viewsFolder));
                });
              }

              // Got images thumbnailable folders for this plugin
              var imageProcessing = pluginConf.imageProcessing;

              if (imageProcessing) {
                if (imageProcessing.folders && imageProcessing.folders.length) {
                  plugin.imageProcessingFolders = [];
                  imageProcessing.folders.forEach(function(folder) {
                    folder.imagesDirectory = path.join(plugin.path, folder.imagesDirectory);

                    if (folder.cacheDirectory)
                      folder.cacheDirectory = path.join(plugin.path, folder.cacheDirectory);

                    plugin.imageProcessingFolders.push(folder);
                  });

                  if (imageProcessing.styles && imageProcessing.styles.length)
                    plugin.imageProcessingStyles = imageProcessing.styles;
                }
              }

              // Retrieve routes and back end conf from plugin conf
              var pluginHttp = pluginConf['http'];
              var pluginSocket = pluginConf['socket'];
              var backEndConf = pluginConf['backOffice'];

              // Got routes for this plugin
              // Retrieve public, private and Web Service routes
              if (pluginHttp && pluginHttp['routes']) {
                plugin.routes = pluginHttp['routes']['public'];
                plugin.privateRoutes = pluginHttp['routes']['private'];
                plugin.webServiceRoutes = pluginHttp['routes']['ws'];
              }

              // Got socket namespaces for this plugin
              if (pluginSocket && pluginSocket['namespaces'])
                plugin.namespaces = pluginSocket['namespaces'];

              // Got entities
              if (pluginConf['entities'])
                plugin.entities = pluginConf['entities'];

              // Got libraries
              if (pluginConf['libraries'])
                plugin.libraries = pluginConf['libraries'];

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
                action: 'loadPluginMetadata',
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
        fs.stat(path.join(plugin.path, 'package.json'), function(error, stats) {

          if (stats && stats.isFile()) {
            var pluginPackage = require(path.join(plugin.path, 'package.json'));
            plugin.version = {
              name: pluginPackage['name'],
              version: pluginPackage['version']
            } || null;
          }

          callback();

        });
      },
      function(callback) {
        var db = storage.getDatabase();
        db.getOne(
          'core_system',
          new ResourceFilter().equal('name', plugin.name),
          null,
          function(error, pluginInformation) {
            if (error) return callback(error);

            var lastVersion = '0.0.0';
            if (pluginInformation) lastVersion = pluginInformation.version;

            var migrationPath = path.join(plugin.path, 'migrations');
            migrationLoader.getDiffMigrationScript(migrationPath, lastVersion, function(error, migrations) {
              if (error) return callback(error);
              if (migrations && Object.keys(migrations).length > 0)
                plugin.migrations = migrations;
              callback();
            });
          }
        );
      }
    ],
    function(error) {

      // Got all plugin's metadata
      if (callback)
        callback(error, plugin);

    }
  );
};
