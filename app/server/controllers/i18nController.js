"use strict"

// Module files
var i18n = process.require("app/server/i18n.js");

/**
 * Gets a public dictionary of translations by its name.
 * Expects two GET parameters :
 *  - dictionary The name of the dictionary
 *  - code The language code
 * If no dictionary is found, a JSON 404 Not Found response is send back.
 */
module.exports.getDictionaryAction = function(request, response, next){
  i18n.getTranslations(request.params.dictionary.replace(/^admin-/, ""), request.params.code, null, function(translations){
    if(translations)
      response.send(translations);
    else      
      response.status(404).send({ error: "Not found" });
  });
};

/**
 * Gets a dictionary, with restricted access, by its name.
 * Expects two GET parameters :
 *  - dictionary The name of the dictionary
 *  - code The language code
 * To restrict access to the dictionary, all dictionaries with 
 * restricted access must be prefixed by "admin-".
 * If no dictionary is found, a JSON 404 Not Found response is send back 
 * to the client.
 */
module.exports.getAdminDictionaryAction = function(request, response, next){
  i18n.getTranslations(request.params.dictionary, request.params.code, "admin-", function(translations){
    if(translations)
      response.send(translations);
    else      
      response.status(404).send({ error: "Not found" });
  });
};