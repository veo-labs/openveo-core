'use strict';

/**
 * Control back end internationalization.
 *
 * @module ov.i18n
 * @main ov.i18n
 */

(function(angular) {
  var app = angular.module('ov.i18n', ['ngCookies']);

  /**
   * Defines an internationalization service to manage string translations.
   *
   * @class i18nService
   */
  function I18nService($http, $cookies) {
    var currentLanguage = $cookies.get('language') || navigator.language || navigator.browserLanguage;
    var translations = {};
    var supportedLanguages = [];

    /**
     * Adds a new dictionary, to the translation table, for the current
     * language.
     * A dictionary is referenced by its name and contains a JSON
     * representation of all its translations.
     * If dictionary does not exist yet, get it from the server.
     *
     * @param {String} name The name of the dictionary to retrieve from
     * server
     * @param {Boolean} [admin] true to retrieve a dictionary for the back
     * office part (which requires authentication), false to get a
     * dictionary without access restriction
     * @return {Promise} The promise to retrieve the dictionary
     * @method addDictionary
     */
    function addDictionary(name, admin) {

      // Dictionary for the currentLanguage
      if (name && (!translations[name] || translations[name][currentLanguage] === undefined)) {
        admin || (admin = false);

        var path = admin ? '/be/' : '/';
        path += 'getDictionary/' + name + '/' + currentLanguage;

        // Get dictionary
        return $http.get(path).success(function(translation) {
          translations[name] || (translations[name] = {});
          translations[name][currentLanguage] = translation;
        }).error(function() {
          translations[name] || (translations[name] = {});
          translations[name][currentLanguage] = null;
        });
      }
    }

    /**
     * Removes a dictionary from cache.
     *
     * @param {String} name The dictionary name
     * @method removeDictionary
     */
    function removeDictionary(name) {
      translations[name] && (delete translations[name]);
    }

    /**
     * Gets a dictionary with all its languages or just for the specific language.
     *
     * @param {String} name The dictionary name
     * @param {String} language An optional language to retrieve
     * @return {Object} The translations contained in the dictionary
     * @method getDictionary
     */
    function getDictionary(name, language) {
      if (language && translations[name])
        return translations[name][language];

      return translations[name];
    }

    /**
     * Gets current language.
     *
     * @return {String} The current language country code (e.g en-US)
     * @method getLanguage
     */
    function getLanguage() {
      return currentLanguage;
    }

    /**
     * Gets supported languages.
     *
     * @return {Array} The list of supported languages
     * @method getLanguages
     */
    function getLanguages() {
      return supportedLanguages;
    }

    /**
     * Tests if a language is supported.
     *
     * @param {String} language The language code to test
     * @return {Boolean} true if supported, false otherwise
     * @method isLanguageSupported
     */
    function isLanguageSupported(language) {
      for (var i = 0; i < supportedLanguages.length; i++) {
        if (language === supportedLanguages[i].value)
          return true;
      }

      return false;
    }

    /**
     * Sets current language to active and the other one to inactive.
     */
    function setActiveLanguage() {
      for (var i = 0; i < supportedLanguages.length; i++)
        supportedLanguages[i].active = supportedLanguages[i].value === currentLanguage;
    }

    /**
     * Sets current language.
     *
     * @param {String} language The current language country code (e.g en-CA)
     * @method setLanguage
     */
    function setLanguage(language) {
      if (isLanguageSupported(language)) {
        currentLanguage = language;
        $cookies.put('language', currentLanguage);
        setActiveLanguage(currentLanguage);
      }
    }

    /**
     * Gets full name of a language by its code.
     *
     * @param {String} language The language code
     * @return {String} The language full name
     * @method getLanguageName
     */
    function getLanguageName(language) {
      for (var i = 0; i < supportedLanguages.length; i++) {
        if (language === supportedLanguages[i].value)
          return supportedLanguages[i].label;
      }

      return null;
    }

    /**
     * Looks for a translation inside a translations object.
     *
     * @example
     *     getTranslationFromDictionary('CORE.HOME.LOGIN', {
     *        'CORE': {
     *          'HOME': {
     *             'LOGIN': 'The translation to look for'
     *           }
     *         }
     *     });
     *
     * @param {String} id The id to retrieve (e.g. CORE.HOME.LOGIN)
     * @param {Object} dictionary Translations where to look for
     * @return {String} The translated text corresponding to the given id
     * in the translations or the unchanged id if no translation found
     */
    function getTranslationFromDictionary(id, dictionary) {
      if (id && dictionary) {
        var properties = id.split('.');
        var property = dictionary;

        for (var i = 0; i < properties.length; i++) {
          if (property[properties[i]])
            property = property[properties[i]];
        }
        return (typeof property === 'string') ? property : id;
      }

      return id;
    }

    /**
     * Translates the given id using current language.
     *
     * @param {String} id The id of the translation
     * @param {String} [dictionary] The name of a particular dictionary if several dictionaries are loaded
     * @method translate
     */
    function translate(id, dictionary) {

      // If the dictionary exists, get translation from
      // that dictionary
      if (dictionary && translations[dictionary]) {

        // Language exists for the dictionary
        if (translations[dictionary][currentLanguage])
          return getTranslationFromDictionary(id, translations[dictionary][currentLanguage]);

        // Language does not exist
        // Use english language as default
        else if (translations[dictionary]['en'])
          return getTranslationFromDictionary(id, translations[dictionary]['en']);

        return id;
      } else {

        // Iterate through the list of dictionaries to find a match
        // for the given id
        var translatedText = id;

        for (var i in translations) {
          translatedText = getTranslationFromDictionary(id, translations[i][currentLanguage]);

          // Language does not exist
          // Use english language as default
          if (translatedText === id)
            translatedText = getTranslationFromDictionary(id, translations[i]['en']);

          if (translatedText !== id)
            break;
          else
            translatedText = id;
        }

        return translatedText;
      }
    }

    /**
     * Destroys I18nService cached data.
     *
     * @method destroy
     */
    function destroy() {
      translations = {};
    }

    /**
     * Initializes supported languages.
     */
    function init() {
      supportedLanguages = [
        {
          value: 'en',
          label: 'CORE.LANGUAGE.ENGLISH'
        },
        {
          value: 'fr',
          label: 'CORE.LANGUAGE.FRENCH'
        }
      ];

      // Verify if current language is supported, otherwise
      // set language to the first one in the list of supported languages
      if (!isLanguageSupported(currentLanguage)) {
        var language = currentLanguage.split('-')[0];
        if (isLanguageSupported(language))
          setLanguage(language);
        else
          setLanguage(supportedLanguages[0].value);
      } else
        setActiveLanguage();
    }

    init();

    return {
      addDictionary: addDictionary,
      removeDictionary: removeDictionary,
      getDictionary: getDictionary,
      getLanguage: getLanguage,
      getLanguages: getLanguages,
      setLanguage: setLanguage,
      translate: translate,
      isLanguageSupported: isLanguageSupported,
      getLanguageName: getLanguageName,
      destroy: destroy
    };
  }

  /**
   * Defines a filter to translate an id, contained inside a dictionary,
   * into the appropriated text.
   *
   * @class translateFilter
   */
  function TranslateFilter(i18nService, $parse, $interpolate) {

    /**
     * Translates an id, contained inside a dictionary, into the appropriated text.
     *
     * **translate** filter helps translate a dictionary id.
     *
     * If id is not found in the specified dictionary for the actual language, it will search in the english version
     * of the dictionary.<br/>
     * If id is not found in the dictionary, the id is not translated and will be printed as is.<br/>
     *
     * If the dictionary is not specified, it will look for the id in all loaded dictionaries.<br/>
     * For each dictionary analyzed, if the id does not exist in the actual language it will try in the english
     * version of the dictionary.<br/>
     * After all, if id is not found in any versions of the list of dictionaries, the id is not translated and will
     * be printed as is.
     *
     * @example
     *     // Let's pretend that with have a dictionary named "login" with the following structure :
     *     // {
     *     //   "LOGIN" : {
     *     //     "PAGE_TITLE" : "Openveo - Sign In",
     *     //     "DESCRIPTION" : "Login page description for {{name}}",
     *     //     "LOGIN" : "User",
     *     //   }
     *     // }
     *
     *     // Search for id LOGIN.DESCRIPTION in dictionary "login" : "Login page description"
     *
     *     // In HTML
     *     // <label ng-bind="'LOGIN.DESCRIPTION' | translate:login:{Object}"></label>
     *
     *     // In JavaScript
     *     $filter('translate')('LOGIN.DESCRIPTION', 'login', {name: "John"});
     *
     * @param {String} id The id of the translation
     * @param {String} dictionaryName An optional dictionary to prevent looking in all dictionaries
     * @param {Object} interpolateParams Translation parameters
     * @method translate
     */
    return function(id, dictionaryName, interpolateParams) {
      var translateValue = i18nService.translate(id, dictionaryName),
        exp;

      if (interpolateParams) {
        if (!angular.isObject(interpolateParams)) {
          interpolateParams = $parse(interpolateParams)(this);
        }
        exp = $interpolate(translateValue);
        translateValue = exp(interpolateParams);
      }

      return translateValue;
    };

  }

  app.factory('i18nService', I18nService);
  app.filter('translate', TranslateFilter);
  I18nService.$inject = ['$http', '$cookies'];
  TranslateFilter.$inject = ['i18nService', '$parse', '$interpolate'];

})(angular);
