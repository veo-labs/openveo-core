(function(angular){

  "use strict"

  var app = angular.module("ov.i18n", ["ngCookies", "ngRoute"]);

  app.factory("i18nService", I18nService);
  app.filter("translate", TranslateFilter);
  I18nService.$inject = ["$http", "$route", "$cookies"];
  TranslateFilter.$inject = ["i18nService"];
  
  /**
   * Defines an internationalization service to manage
   * string translations.
   * TODO Make it a provider to configure the list of supported languages
   */
  function I18nService($http, $route, $cookies){
    var currentLanguage = $cookies.language || navigator.language || navigator.browserLanguage;
    var translations = {};
    var supportedLanguages = [];

    var init = function(){
      supportedLanguages = [
        {
          "value" : "en",
          "label" : "ENGLISH"
        },
        {
          "value" : "fr",
          "label" : "FRENCH"
        }
      ];

      // Verify if current language is supported, otherwise
      // set language to the first one in the list of supported languages
      if(!isLanguageSupported(currentLanguage)){
        var language = currentLanguage.split("-")[0];
        if(isLanguageSupported(language))
          setLanguage(language);
        else
          setLanguage(supportedLanguages[0].value);
      }
      else
        setActiveLanguage();
    };

    /**
     * Adds a new dictionary, to the translation table, for the current
     * language.
     * A dictionary is referenced by its name and contains a JSON 
     * representation of all its translations.
     * If dictionary does not exist yet, get it from the server. 
     *
     * @param String name The name of the dictionary to retrieve from 
     * server
     * @param Boolean admin true to retrieve a dictionary for the back 
     * office part (which requires authentication), false to get a
     * dictionary without access restriction
     */
    var addDictionary = function(name, admin){

      // Dictionary for the currentLanguage
      if(name && (!translations[name] || translations[name][currentLanguage] === undefined)){
        admin || (admin = false);
        
        var path = admin ? "/admin/" : "/";
        path += "getDictionary/" + name + "/" + currentLanguage;
        
        // Get dictionary
        return $http.get(path).success(function(translation){
          translations[name] || (translations[name] = {});
          translations[name][currentLanguage] = translation;
        }).error(function(){
           translations[name] || (translations[name] = {});
           translations[name][currentLanguage] = null;
        });
      }
    };
    
    /**
     * Removes a dictionary.
     * @param String name The dictionary name
     */
    var removeDictionary = function(name){
      translations[name] && (delete translations[name]);
    };
    
    /**
     * Gets a dictionary with all its languages or just for the specific 
     * language.
     * @param String name The dictionary name
     * @param String language An optional language to retrieve
     * @return Object The translations contained in the dictionary
     */
    var getDictionary = function(name, language){
      if(language && translations[name])
        return translations[name][language];
        
      return translations[name];
    };
    
    /**
     * Gets current language.
     * @return String The current language country code (e.g en-US)
     */
    var getLanguage = function(){
      return currentLanguage;
    };
    
    /**
     * Gets supported languages.
     * @return Array The list of supported languages
     */
    var getLanguages = function(){
      return supportedLanguages;
    };

    /**
     * Sets current language.
     * Changing the current language will reload the current route.
     *
     * @param String language The current language country 
     * code (e.g en-CA)
     */
    var setLanguage = function(language){
      if(isLanguageSupported(language)){
        currentLanguage = language;
        $cookies.language = currentLanguage;
        setActiveLanguage(currentLanguage);
        $route.reload();
      }
    };

    /**
     * Tests if a language is supported.
     * @param String language The language code to test
     * @return Boolean true if supported, false otherwise
     */
    var isLanguageSupported = function(language){
      for(var i = 0 ; i < supportedLanguages.length ; i++){
         if(language === supportedLanguages[i].value)
           return true;
      }

      return false;
    };

    /**
     * Gets full name of a language by its code.
     * @param String language The language code
     * @return String The language full name
     */
    var getLanguageName = function(language){
      for(var i = 0 ; i < supportedLanguages.length ; i++){
         if(language === supportedLanguages[i].value)
           return supportedLanguages[i].label;
      }

      return null;
    };

    /**
     * Sets current language to active and the other one to inactive.
     */
    var setActiveLanguage = function(){
      for(var i = 0 ; i < supportedLanguages.length ; i++)
        supportedLanguages[i].active = supportedLanguages[i].value === currentLanguage;
    };

    /**
     * Translates the given using current language.
     * @param String id The id of the translation
     * @param String dictionary The name of a particular dictionary
     * if several dictionaries are loaded
     */
    var translate = function(id, dictionary){

      // If the dictionary exists, get translation from
      // that dictionary
      if(dictionary && translations[dictionary]){
        
        // Language exists for the dictionary
        if(translations[dictionary][currentLanguage])
          return getTranslationFromDictionary(id, translations[dictionary][currentLanguage]);
        
        // Language does not exist
        // Use english language as default
        else if(translations[dictionary]["en"])
          return getTranslationFromDictionary(id, translations[dictionary]["en"]);
        
        return id;
      }
      
      // Iterate through the list of dictionaries to find a match
      // for the given id
      else{
        var translatedText = id;
        
        for(var i in translations){
          translatedText = getTranslationFromDictionary(id, translations[i][currentLanguage]);
          
          // Language does not exist
          // Use english language as default
          if(translatedText === id)
             translatedText = getTranslationFromDictionary(id, translations[i]["en"]);
          
          if(translatedText !== id)
            break;
          else
            translatedText = id;
        }
      }
      
      return translatedText;
    };
    
    /**
     * Looks for a translation inside a translations object.
     *
     * Usage example :
     * getTranslationFromDictionary("HOME.LOGIN", { "HOME" : { "LOGIN" : "The translation to look for" } });
     *
     * @param String id The id to retrieve (e.g. HOME.LOGIN)
     * @param Object translations Translations where to look for
     * @return String The translated text corresponding to the given id
     * in the translations or the unchanged id if no translation found
     */
    var getTranslationFromDictionary = function(id, translations){
      if(id && translations){
        try{
          return eval("translations." + id) || id;
        }
        catch(e){
          return id;
        }
      }
      
      return id;
    };
    
    init();

    return{
      addDictionary : addDictionary,
      removeDictionary : removeDictionary,
      getDictionary : getDictionary,
      getLanguage: getLanguage,
      getLanguages : getLanguages,
      setLanguage: setLanguage,
      translate: translate,
      isLanguageSupported : isLanguageSupported,
      getLanguageName : getLanguageName
    };
  }
  
  /**
   * Defines a filter to translate an id, contained inside a dictionary, 
   * into the appropriated text.
   */
  function TranslateFilter(i18nService){
    
    /**
     * Translates an id, contained inside a dictionary, into 
     * the appropriated text.
     * @param String id The id of the translation
     * @param String dictionaryName An optional dictionary to prevent
     * looking in all dictionaries
     */
    return function(id, dictionaryName){
      return i18nService.translate(id, dictionaryName);
    }
  }
  
})(angular);