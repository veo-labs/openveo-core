"use scrict"

// Module dependencies
var fs = require("fs");
var path = require("path");
var async = require("async");
var winston = require("winston");
var openVeoAPI = require("openveo-api");

// Module files
var routeLoader = process.require("/app/server/loaders/routeLoader");

// Get logger
var logger = winston.loggers.get("openveo");

/**
 * Recursively and asynchronously load all npm plugins prefixed by "openveo-" under the given path.
 *
 * If the same plugin is encountered several times, the top level one 
 * will be kept.
 *
 * @param String startingPath Root path from where looking for 
 * openveo-* plugins.
 * @param Function callback A callback with two arguments :
 *    - Error An Error object or null
 *    - Array A list of Plugin objects
 */
module.exports.loadPlugins = function(startingPath, callback){
  var self = this;
  
  // Get the list of plugins absolute paths
  getPluginsPaths(startingPath, function(error, pluginsPaths){

    // An error occurred while scaning the directory looking for
    // openveo plugins
    if(error){
      callback(error);
      return;
    }
    
    // Filter duplicate plugins to keep only the top level ones
    pluginsPaths = filterPluginsPaths(pluginsPaths);
    var plugins = [];

    var pendingPlugins = pluginsPaths.length;
    if(pendingPlugins){
      
      // Iterate through each plugin path
      pluginsPaths.forEach(function(pluginPath){
        
        // Load the plugin
        self.loadPlugin(pluginPath, function(error, loadedPlugin){
          
          // An error occurred while loading the plugin
          // Skip the plugin and continue loading the other one
          if(error){
            logger.warn(error.message, {action : "loadPlugins", plugin : pluginPath});
            logger.info("Plugin " + pluginPath + " skipped");
          }
          
          // Plugin successfully loaded
          else
            plugins.push(loadedPlugin);
          
          pendingPlugins--;

          // All plugins loaded
          if(!pendingPlugins)
            callback(null, plugins);

        });
      });

    }
    
    // No plugins at all
    else
      callback(null, plugins);
    
  });

};

/**
 * Loads a single plugin by its path.
 * 
 * Each plugin may contains :
 *  - A public directory to store static files, if an incoming request
 *    does not match any of the files in the public directory of the main 
 *    plugin, it will look to the public directory of sub plugins
 *  - A conf.json file describing several things : 
 *    * public and admin routes
 *    * The back end menu items for the plugin
 *    * A list of JavaScript libraries files to load while accessing the
 *      back end page
 *    * A list of JavaScript files to load while accessing the back 
 *      end page
 *    * A list of CSS files to load while accessing the back end page
 *  - The plugin main file as an Object inherited from the 
 *    Plugin Object (see Plugin.js in openveo-api module)
 * 
 * @param String pluginPath Absolute path to the plugin directory
 * @param Function callback A callback with two arguments :
 *    - Error An Error object or null
 *    - Plugin The loaded plugin or null
 */
module.exports.loadPlugin = function(pluginPath, callback){
  
  var plugin = { path : pluginPath };

  // Extract the plugin(s) name(s) from the plugin path
  // e.g : /www/openveo/node_modules/openveo-plugin1/node_modules/openveo-plugin2
  // The plugin to load is openveo-plugin2
  // and is also a subplugin of openveo-plugin1
  var pathChunks = pluginPath.split("node_modules");
  
  // Keep only the plugin parts
  // e.g : ["/openveo-plugin1/", "/openveo-plugin2"]
  pathChunks.shift(0);
  
  // Clean plugins names removing slashes and 
  // "openveo-" prefix
  // e.g : ["plugin1", "plugin2"]
  var pluginPathComposition = pathChunks.map(function(pluginName){
    return pluginName.replace(/^[\/|\\]?openveo-([^/\\]*)[\/|\\]?$/, "$1");
  });
  
  try{

    // Try to load the main file of the plugin
    var Plugin = require(pluginPath);

    // Validate that we are sharing the same openveo API and that
    // the main file returned by the plugin is a valid instance
    // of the Plugin Object from openveo-api plugin
    if(Plugin.prototype instanceof openVeoAPI.Plugin && pluginPathComposition.length){
      
      // Instanciate the Plugin Object
      plugin = new Plugin();
      
      // Define plugin router mount path
      // Plugin router is mounted on a subpath to avoid collisions
      // with the main openveo application
      // e.g "/plugin1"
      plugin.mountPath = "/" + pluginPathComposition.join("/");
      
    }
  }
  catch(e){
    if(e.code === "MODULE_NOT_FOUND")
      logger.info("Plugin " + pluginPath + " doesn't have a main file", {action : "loadPlugin"});
    else
      logger.error("Error while loading plugin " + pluginPath, {action : "loadPlugin", "error" : e.message});
  }
  
  // Complete plugin information adding the name of the plugin
  plugin.name = pluginPathComposition[pluginPathComposition.length - 1];

  async.parallel(
    [
      function(callback){

        // Test if a public directory exists at plugin root level
        fs.exists(path.join(pluginPath, "public"), function(exists){

          if(exists)
            plugin.publicDirectory = path.join(pluginPath, "public");

          callback();

        });
      },
      function(callback){
        
        // Test if a file "conf.json" exists at plugin root level
        fs.exists(path.join(pluginPath, "conf.json"), function(exists){

          if(exists){
            try{
              
              // Try to load plugin configuration file
              var pluginConf = require(path.join(pluginPath, "conf.json"));
              
              plugin.custom = pluginConf["custom"] || null;
              
              // Got views folders for this plugin
              if(pluginConf["viewsFolders"] && pluginConf["viewsFolders"].length){
                plugin.viewsFolders = [];
                pluginConf["viewsFolders"].forEach(function(viewsFolder){
                  plugin.viewsFolders.push(path.join(pluginPath, viewsFolder));
                });
              }
              
              // Retrieve routes and back end conf from plugin conf
              var pluginRoutes = pluginConf["routes"];
              var backEndConf = pluginConf["backOffice"];
              
              // Got routes for this plugin
              // Retrieve public and admin routes
              if(pluginRoutes){
                plugin.routes = pluginRoutes["public"] && routeLoader.decodeRoutes(pluginPath, pluginRoutes["public"]);
                plugin.adminRoutes = pluginRoutes["admin"] && routeLoader.decodeRoutes(pluginPath, pluginRoutes["admin"])
              }
              
              if(backEndConf){
              
                // Retrieve back end menu pages from plugin conf
                plugin.menu = backEndConf["menu"] || null;

                // Retrieve back end scripts and css from plugin conf
                plugin.scriptLibFiles = backEndConf["scriptLibFiles"] || null;
                plugin.scriptFiles = backEndConf["scriptFiles"] || null;
                plugin.cssFiles = backEndConf["cssFiles"] || null;
                
              }
            }
            catch(e){
               logger.warn(e.message, {action : "loadPlugin", plugin : plugin.name});
              callback(new Error(e.message));
              return;
            }
          }

          callback();

        });
        
      }
      
    ],
    function(error, results){
      
      // Plugin is fully loaded
      if(callback)
        callback(error, plugin);
    }
  );
};

/**
 * Filters the list of plugins paths in case the same plugin appears
 * multiple time at different paths. Filters to keep only the most 
 * top level one.
 *
 * e.g
 * 
 * Before filter : 
 * [ 
 *  "/openveo/node_modules/openveo-plugin1",
 *  "/openveo/node_modules/openveo-plugin2/node_modules/openveo-plugin1"
 * ] 
 *
 * After filter :
 * [ "/openveo/node_modules/openveo-plugin1" ]
 *
 * @param Array pluginsPaths The list of plugins paths to analyze
 * @return Array The filtered list of plugins paths
 */
var filterPluginsPaths = function(pluginsPaths){
  var filteredPaths = [];
  
  // Got at least one path
  if(pluginsPaths.length){
    var analyzedPaths = {};
    
    pluginsPaths.forEach(function(pluginPath){
      
      // Extract plugin name
      // e.g "/openveo/node_modules/openveo-plugin1"
      // becomes "openveo-plugin1"
      var pluginName = path.basename(pluginPath);
      
      // Plugin already analyzed
      // Replace it if the path length is shorter
      if(analyzedPaths[pluginName]){
         if(analyzedPaths[pluginName].length > pluginPath.length)
           analyzedPaths[pluginName] = pluginPath;
      }
      
      // Plugin name not analyzed yet
      // Add it to the list of analyzed one
      else
        analyzedPaths[pluginName] = pluginPath;
      
    });
    
    for(var i in analyzedPaths)
      filteredPaths.push(analyzedPaths[i]);
    
  }
  
  return filteredPaths;
};

/**
 * Recursively and asynchronously analyze the given directory to get
 * npm plugins prefixed by "openveo-".
 *
 * It assumes that the startingPath argument correspond to a valid
 * directory path.
 *
 * @param String startingPath Root path from where looking for 
 * openveo-* plugins.
 * @param Function callback A callback with two arguments :
 *    - Error An Error object or null
 *    - Array The list of plugins paths
 */
var getPluginsPaths = function(startingPath, callback){

  if(startingPath){
    var pluginsPaths = [];

    // Open directory
    fs.readdir(startingPath, function(error, resources){
      var pendingFilesNumber = resources.length;

      // Failed reading directory
      if(error)
        return callback(error);

      // No more pending resources, done for this directory 
      if(!pendingFilesNumber)
        callback(null, pluginsPaths);

      // Iterate through the list of resources in the directory
      resources.forEach(function(resource){

        // Get resource stats
        fs.stat(path.join(startingPath, resource), function(error, stats){
          if(error)
            return callback(error);

          // Resource correspond to an openveo plugin
          if(stats.isDirectory() && resource.indexOf("openveo-") === 0){
            pluginsPaths.push(path.join(startingPath, resource));

            // Test if node_modules directory exists under the 
            // plugin directory
            fs.exists(path.join(startingPath, resource, "node_modules"), function(exists){

              // node_modules directory exists
              if(exists){
                
                // Recursively load openveo- modules inside the new
                // node_modules directory
                resources = getPluginsPaths(path.join(startingPath, resource, "node_modules"), function(error, subPluginsPaths){

                  if(error)
                    return callback(error);

                  pluginsPaths = pluginsPaths.concat(subPluginsPaths);
                  
                  pendingFilesNumber--;
                  
                  if(!pendingFilesNumber)
                    callback(null, pluginsPaths); 
                  
                });
              }
              
              // node_modules directory does not exist
              else{
                pendingFilesNumber--;
                
                if(!pendingFilesNumber)
                  callback(null, pluginsPaths);                

              }
            });
            
            if(!pendingFilesNumber)
              callback(null, pluginsPaths);
          }
          
          // Resource does not correspond to an openveo plugin
          // Mark resource as treated
          else{
            pendingFilesNumber--;
            
            if(!pendingFilesNumber)
              callback(null, pluginsPaths);
          }

        });
        
      });

    });
  }
  
};