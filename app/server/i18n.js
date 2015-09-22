'use strict';

/**
 * Provides functions to help translates the application. Translations
 * are grouped in dictionaries.
 *
 * @module core-i18n
 * @class core-i18n
 * @main core-i18n
 */

// Module dependencies
var path = require('path');
var fs = require('fs');
var async = require('async');
var winston = require('winston');
var openVeoAPI = require('@openveo/api');

// Get logger
var logger = winston.loggers.get('openveo');

// Module files
var applicationStorage = openVeoAPI.applicationStorage;

/**
 * Gets a dictionary of translations by its name and language.
 * Search is made on i18n directory and all plugin's i18n directories.
 * If the same dictionary name is found twice (same file name in
 * different i18n directories), dictionaries are merged.
 *
 * @example
 *     var i18n = process.require("app/server/i18n.js");
 *     i18n.getTranslations("login", "fr-FR", null, function(translations){
 *       console.log(translations);
 *     });
 *
 * @example
 *     var i18n = process.require("app/server/i18n.js");
 *     i18n.getTranslations("back-office", "en", "admin", function(translations){
 *       console.log(translations);
 *     });
 *
 * @method getTranslations
 * @async
 * @param {String} dictionary The name of the dictionary, this is
 * the name of the dictionary file without extension and without
 * the prefix if prefix is set
 * @param {String} code The language country code (e.g. en-US)
 * @param {String} prefix The prefix of the dictionary file to retrieve
 * @param {Function} callback Function to call when its done
 *  - *Object* A JavaScript object containing all translations
 */
module.exports.getTranslations = function(dictionary, code, prefix, callback) {
  var translations = null;

  if (!dictionary)
    return callback(translations);

  code = code || 'en';
  var plugins = applicationStorage.getPlugins() || [];
  var countryCode = code.split('-');
  var language = countryCode[0];
  var country = countryCode[1];
  dictionary = prefix ? prefix + dictionary : dictionary;

  var i18nDirectories = [path.normalize(process.root + '/i18n')];
  var pluginsWithi18n = [];

  // Get all plugins with a translation directory
  plugins.forEach(function(plugin) {
    if (plugin.i18nDirectory) {
      i18nDirectories.push(plugin.i18nDirectory);
      pluginsWithi18n.push(plugin.name);
    }
  });

  // Read all i18n directories
  async.map(i18nDirectories, fs.readdir, function(error, directoriesFiles) {
    var i = 0;

    // Iterate through i18n directories
    directoriesFiles.forEach(function(directoryFiles) {
      var translationFile,
        languageFile,
        defaultTranslationFile;

      // Iterate through directory files
      directoryFiles.forEach(function(fileName) {

        // File name matches the given name, language and country code
        if (fileName === dictionary + '-' + language + '_' + country + '.json') {
          translationFile = fileName;
          return;
        }

        // File name matches given name and language
        else if (fileName === dictionary + '-' + language + '.json')
          languageFile = fileName;

      });

      try {

        // Main application
        if (i === 0 && (translationFile || languageFile || defaultTranslationFile))
          translations = require(
            i18nDirectories[i] + '/' + (translationFile || languageFile || defaultTranslationFile));

        // Plugins
        else if (translationFile || languageFile || defaultTranslationFile) {
          translations = translations || {};
          openVeoAPI.util.merge(translations, require(
            i18nDirectories[i] + '/' + (translationFile || languageFile || defaultTranslationFile)));
        }

      } catch (e) {
        logger.error('An error occured while loading a translations dictionary with message : ' + e.message);
      }

      i++;
    });

    callback(translations);
  });
};
