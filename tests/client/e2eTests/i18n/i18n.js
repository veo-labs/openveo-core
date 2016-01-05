'use strict';

/**
 * Helper to retrieve core translations.
 */

var openVeoAPI = require('@openveo/api');

/**
 * Gets the list of back end translations for the core.
 *
 * @param {String} languageCode The language code (e.g. en)
 * @return {Object} The list of translations
 */
module.exports.getBackEndTranslations = function(languageCode) {
  var backEndTranslations = process.require('i18n/admin-back-office-' + languageCode + '.json');
  var commonTranslations = process.require('i18n/common-' + languageCode + '.json');
  return openVeoAPI.util.merge(backEndTranslations, commonTranslations);
};

/**
 * Gets the list of public translations.
 *
 * @param {String} languageCode The language code (e.g. en)
 * @return {Object} The list of translations
 */
module.exports.getPublicTranslations = function(languageCode) {
  var loginTranslations = process.require('i18n/login-' + languageCode + '.json');
  var commonTranslations = process.require('i18n/common-' + languageCode + '.json');
  return openVeoAPI.util.merge(loginTranslations, commonTranslations);
};
