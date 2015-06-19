"use strict"

var openVeoAPI = require("openveo-api");
var path = require("path");
var assert = require("chai").assert;

// Set module root directory
process.root = path.join(__dirname, "../../");
process.require = function(filePath){
  return require(path.normalize(process.root + "/" + filePath));
};

var i18n = process.require("app/server/i18n.js");
var applicationStorage = openVeoAPI.applicationStorage;

describe("i18n", function(){

  beforeEach(function(){
    applicationStorage.setPlugins(
      [
        {
          name : "example", 
          "i18nDirectory" : path.normalize(__dirname + "/i18n")
        }
      ]
    );
  });
  
  describe("getTranslations", function(){

    it("Should return a JSON object", function(done){
      i18n.getTranslations("languages", "fr", null, function(translations){
        assert.isDefined(translations);
        assert.isObject(translations);
        assert.equal(translations.ENGLISH, "anglais");
        done();
      });
    });
    
    it("Should return null if no translation found", function(done){
      i18n.getTranslations("no-translation", "fr", null, function(translations){
        assert.isNull(translations);
        done();
      });
    });
    
    it("Should return null if dictionary is not specified", function(done){
      i18n.getTranslations(null, "fr", null, function(translations){
        assert.isNull(translations);
        done();
      });
    });    
    
    it("Should be able to get translation of a particular language", function(done){
      i18n.getTranslations("login", "en", null, function(translations){
        assert.equal(translations.LOGIN, "User");
        done();
      });
    });    
    
    it("Should be able to get a translation by language and country code", function(done){
      i18n.getTranslations("canadian", "en-CA", null, function(translations){
        assert.equal(translations.DOLLAR, "Loonie");
        done();
      });
    });
    
    it("Should be able to get both plugin translations and openveo translations (merged)", function(done){
      i18n.getTranslations("back-office", "en", "admin-", function(translations){
        assert.equal(translations.MENU.DASHBOARD, "Dashboard");
        assert.equal(translations.MENU.EXAMPLE, "Example");
        done();
      });
    });
    
  });

});