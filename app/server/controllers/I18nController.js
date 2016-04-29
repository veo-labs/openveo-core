'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var errors = process.require('app/server/httpErrors.js');
var Controller = openVeoAPI.controllers.Controller;
var i18n = openVeoAPI.i18n;

/**
 * Provides route actions to access translation dictionaries.
 *
 * @class I18nController
 * @constructor
 * @extends Controller
 */
function I18nController() {
  Controller.call(this);
}

module.exports = I18nController;
util.inherits(I18nController, Controller);

/**
 * Gets a public dictionary of translations by its name.
 *
 * Expects two GET parameters :
 *  - **dictionary** The name of the dictionary
 *  - **code** The language code
 *
 * @example
 *     {
 *       ENGLISH: "Anglais",
 *       FRENCH: "Français",
 *       ...
 *     }
 *
 * If no dictionary is found, a JSON 404 Not Found response is send back.
 *
 * @method getDictionaryAction
 */
I18nController.prototype.getDictionaryAction = function(request, response, next) {
  i18n.getTranslations(request.params.dictionary.replace(/^admin-/, ''), request.params.code,
    function(translations) {
      if (translations)
        response.send(translations);
      else {
        next(errors.I18N_DICTIONARY_NOT_FOUND);
      }
    });
};

/**
 * Gets a dictionary, with restricted access, by its name.
 *
 * Expects two GET parameters :
 *  - **dictionary** The name of the dictionary
 *  - **code** The language code
 *
 * To restrict access to the dictionary, all dictionaries with
 * restricted access must be prefixed by "admin-".
 * If no dictionary is found, a JSON 404 Not Found response is send back
 * to the client.
 *
 * @method getAdminDictionaryAction
 */
I18nController.prototype.getAdminDictionaryAction = function(request, response, next) {
  i18n.getTranslations('admin-' + request.params.dictionary, request.params.code, function(translations) {
    if (translations)
      response.send(translations);
    else {
      next(errors.I18N_DICTIONARY_NOT_FOUND);
    }
  });
};
