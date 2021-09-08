'use strict';

/**
 * @module core/controllers/I18nController
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var errors = process.require('app/server/httpErrors.js');
var Controller = openVeoApi.controllers.Controller;

/**
 * Defines a controller to handle requests relative to internationalization.
 *
 * @class I18nController
 * @extends Controller
 */
function I18nController() {
  I18nController.super_.call(this);
}

module.exports = I18nController;
util.inherits(I18nController, Controller);

/**
 * Gets a public dictionary of translations by its name.
 *
 * @example
 * {
 *   ENGLISH: 'Anglais',
 *   FRENCH: 'Français',
 *   ...
 * }
 *
 * If no dictionary is found, a JSON 404 Not Found response is send back.
 *
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.params Request's parameters
 * @param {String} request.params.dictionary The name of the dictionary
 * @param {String} request.params.code Language code of the dictionary
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
I18nController.prototype.getDictionaryAction = function(request, response, next) {
  process.api.getCoreApi().getTranslations(request.params.dictionary.replace(/^admin-/, ''), request.params.code,
    function(error, translations) {
      if (error) {
        process.logger.error(error.message);
        next(errors.I18N_DICTIONARY_ERROR);
      } else if (translations)
        response.send(translations);
      else
        next(errors.I18N_DICTIONARY_NOT_FOUND);
    });
};

/**
 * Gets a dictionary, with restricted access, by its name.
 *
 * To restrict access to the dictionary, all dictionaries with
 * restricted access must be prefixed by "admin-".
 * If no dictionary is found, a JSON 404 Not Found response is send back
 * to the client.
 *
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.params Request's parameters
 * @param {String} request.params.dictionary The name of the dictionary
 * @param {String} request.params.code Language code of the dictionary
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
I18nController.prototype.getAdminDictionaryAction = function(request, response, next) {
  process.api.getCoreApi().getTranslations(
    'admin-' + request.params.dictionary,
    request.params.code,
    function(error, translations) {
      if (error) {
        process.logger.error(error.message);
        next(errors.I18N_DICTIONARY_ERROR);
      } else if (translations)
        response.send(translations);
      else
        next(errors.I18N_DICTIONARY_NOT_FOUND);
    }
  );
};
