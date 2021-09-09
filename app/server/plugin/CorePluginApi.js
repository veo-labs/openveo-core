'use strict';

/**
 * @module core/plugin/CorePluginApi
 */

var util = require('util');
var path = require('path');
var fs = require('fs');
var url = require('url');
var async = require('async');
var openVeoApi = require('@openveo/api');
var storage = process.require('app/server/storage.js');
var ClientProvider = process.require('app/server/providers/ClientProvider.js');
var GroupProvider = process.require('app/server/providers/GroupProvider.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var TaxonomyProvider = process.require('app/server/providers/TaxonomyProvider.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var SettingProvider = process.require('app/server/providers/SettingProvider.js');
var CORE_HOOKS = process.require('app/server/plugin/hooks.js');

/**
 * Defines the Core Plugin API exposed to other plugins.
 *
 * @class CorePluginApi
 * @extends PluginApi
 */
function CorePluginApi() {
  CorePluginApi.super_.call(this);
  var database = storage.getDatabase();

  Object.defineProperties(this,

    /** @lends module:core/plugin/CorePluginApi~CorePluginApi */
    {

      /**
       * An instance of ClientProvider.
       *
       * @type {module:core/providers/ClientProvider~ClientProvider}
       * @readonly
       * @instance
       */
      clientProvider: {value: new ClientProvider(database)},

      /**
       * An instance of GroupProvider.
       *
       * @type {module:core/providers/GroupProvider~GroupProvider}
       * @readonly
       * @instance
       */
      groupProvider: {value: new GroupProvider(database)},

      /**
       * An instance of RoleProvider.
       *
       * @type {module:core/providers/RoleProvider~RoleProvider}
       * @readonly
       * @instance
       */
      roleProvider: {value: new RoleProvider(database)},

      /**
       * An instance of TaxonomyProvider.
       *
       * @type {module:core/providers/TaxonomyProvider~TaxonomyProvider}
       * @readonly
       * @instance
       */
      taxonomyProvider: {value: new TaxonomyProvider(database)},

      /**
       * An instance of UserProvider.
       *
       * @type {module:core/providers/UserProvider~UserProvider}
       * @readonly
       * @instance
       */
      userProvider: {value: new UserProvider(database)},

      /**
       * An instance of SettingProvider.
       *
       * @type {module:core/providers/SettingProvider~SettingProvider}
       * @readonly
       * @instance
       */
      settingProvider: {value: new SettingProvider(database)}

    }
  );
}

module.exports = CorePluginApi;
util.inherits(CorePluginApi, openVeoApi.plugin.PluginApi);

/**
 * Gets the current database instance.
 *
 * @return {Database} The application's database
 */
CorePluginApi.prototype.getDatabase = function() {
  return storage.getDatabase();
};

/**
 * Gets the id of the super administrator.
 *
 * @return {String} The super administrator id
 */
CorePluginApi.prototype.getSuperAdminId = function() {
  return storage.getConfiguration().superAdminId;
};

/**
 * Gets the id of the anonymous user.
 *
 * @return {String} The anonymous user id
 */
CorePluginApi.prototype.getAnonymousUserId = function() {
  return storage.getConfiguration().anonymousId;
};

/**
 * Gets the list of entities defined by plugins.
 *
 * @return {Object} The list of entities by entity name
 */
CorePluginApi.prototype.getEntities = function() {
  return storage.getEntities();
};

/**
 * Gets the list of permissions defined by plugins.
 *
 * @return {Object} The list of permissions
 */
CorePluginApi.prototype.getPermissions = function() {
  return storage.getPermissions();
};

/**
 * Gets the list of Web Service scopes defined by plugins.
 *
 * @return {Object} The list of Web Service scopes
 */
CorePluginApi.prototype.getWebServiceScopes = function() {
  return storage.getWebServiceScopes();
};

/**
 * Gets information about the application server.
 *
 * @return {Object} The server configuration
 */
CorePluginApi.prototype.getServerConfiguration = function() {
  var serverConfiguration = storage.getServerConfiguration();
  return {
    httpPort: serverConfiguration.httpPort,
    socketPort: serverConfiguration.socketPort
  };
};

/**
 * Gets a dictionary of translations by its name and language.
 *
 * Search is made on i18n directory and all plugin's i18n directories.
 * If the same dictionary name is found twice (same file name in different i18n directories),
 * dictionaries are merged.
 *
 * @example
 * process.api.getCoreApi().getTranslations('login', 'fr-FR', function(error, translations) {
 *   console.log(translations);
 * });
 *
 * @example
 * process.api.getCoreApi().getTranslations('back-office', 'en', function(error, translations) {
 *   console.log(translations);
 * });
 *
 * @param {String} dictionary The name of the dictionary, this is the name of the dictionary file without
 * extension
 * @param {String} code The language country code (e.g. en-US)
 * @param {module:core/plugin/CorePluginApi~CorePluginApi~getTranslationsCallback} callback Function to call when its
 * done
 */
CorePluginApi.prototype.getTranslations = function(dictionary, code, callback) {
  var translations = null;

  if (!dictionary)
    return callback(null, translations);

  code = code || 'en';
  var plugins = process.api.getPlugins() || [];
  var countryCode = code.split('-');
  var language = countryCode[0];
  var country = countryCode[1];
  var asyncFunctions = [];

  plugins.forEach(function(plugin) {
    if (plugin.i18nDirectory) {

      // Plugin has an i18n directory
      // Read files in the directory to find the expected dictionary
      asyncFunctions.push(function(callback) {
        fs.readdir(plugin.i18nDirectory, function(error, directoryFiles) {
          if (error) {
            process.logger.error(error.message, {
              plugin: plugin.name,
              dir: plugin.i18nDirectory
            });
            callback(new Error('An error occured while reading the i18n directory'));
            return;
          }
          var translationFile;
          var pluginNameUpperCase = plugin.name.toUpperCase().replace('-', '_');

          // Iterate through directory files to find the dictionary
          for (var i = 0; i < directoryFiles.length; i++) {
            var fileName = directoryFiles[i];
            if (fileName === dictionary + '-' + language + '_' + country + '.json') {
              translationFile = fileName;
              break;
            } else if (fileName === dictionary + '-' + language + '.json')
              translationFile = fileName;
          }

          try {

            if (translationFile) {
              var pluginTranslations = require(path.join(plugin.i18nDirectory, translationFile));
              var encapsulatedPluginTranslations;
              translations = translations || {};

              // Make sure translations are contained in an object with the plugin name as the key
              if (Object.keys(pluginTranslations).length > 1 || !pluginTranslations[pluginNameUpperCase]) {
                encapsulatedPluginTranslations = {};
                encapsulatedPluginTranslations[pluginNameUpperCase] = pluginTranslations;
              } else
                encapsulatedPluginTranslations = pluginTranslations;

              openVeoApi.util.merge(translations, encapsulatedPluginTranslations);
            }

          } catch (e) {
            process.logger.error(e.message, {
              plugin: plugin.name,
              dir: plugin.i18nDirectory,
              file: translationFile
            });
            callback(new Error('An error occured while loading a translations dictionary'));
            return;
          }

          callback();
        });

      });
    }
  });

  async.parallel(asyncFunctions, function(error, results) {
    callback(error, translations);
  });
};

/**
 * Gets OpenVeo CDN url ending with a slash.
 *
 * @param {Boolean} [trimSlash=false] true to trim the ending slash
 * @return {String} The CDN url
 */
CorePluginApi.prototype.getCdnUrl = function(trimSlash) {
  var cdnUrl = new url.URL(storage.getConfiguration().cdn.url).href;
  return trimSlash ? cdnUrl.substring(0, cdnUrl.length - 1) : cdnUrl;
};

/**
 * Gets the language of the OpenVeo content.
 *
 * @return {String} The content language code, see supportedContentLanguages.json file for the full list of languages
 */
CorePluginApi.prototype.getContentLanguage = function() {
  return storage.getConfiguration().contentLanguage || 'en';
};

/**
 * Gets core hooks.
 *
 * @return {Object} The core hooks
 */
CorePluginApi.prototype.getHooks = function() {
  return CORE_HOOKS;
};

/**
 * Clear image cache
 *
 * @param string imagePath    Relative image path
 * @param string pluginName   Plugin name
 * @param {callback} callback Function to call when its done
 */
CorePluginApi.prototype.clearImageCache = function(imagePath, pluginName, callback) {
  var plugin = process.api.getPlugin(pluginName);

  if (null === plugin)
    return callback(new Error('Failed to clear "' + imagePath + '" image cache: unknown plugin "' + pluginName + '".'));

  plugin.imageProcessingFolders.forEach(function(folder) {
    var cacheDirectory = folder.cacheDirectory || path.join(folder.imagesDirectory, '.cache');

    plugin.imageProcessingStyles.forEach(function(style) {
      var imageAbsPath = path.join(cacheDirectory, style.id, imagePath);

      fs.stat(imageAbsPath, function(err, stats) {
        if (err) return;

        fs.unlink(imageAbsPath, function(err) {
          if (err)
            process.logger.error(err.message);
        });
      });
    });
  });

  callback();
};

/**
 * @callback module:core/plugin/CorePluginApi~CorePluginApi~getTranslationsCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Object|Undefined)} translations All translations
 */
