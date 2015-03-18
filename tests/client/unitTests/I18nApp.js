"use strict"

window.assert = chai.assert;

describe("TranslateApp", function(){
  var i18nService, $httpBackend, $filter;
  
  beforeEach(module("ov.i18n"));
  
  beforeEach(inject(function(_i18nService_, _$cookies_, _$httpBackend_, _$filter_){
    var $cookies = _$cookies_;
    $filter = _$filter_;
    i18nService = _i18nService_;
    $httpBackend = _$httpBackend_;
    $cookies.language = null;
  }));
  
  afterEach(function(){
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  }); 
  
  it("Should be able to set the language", function(){
    i18nService.setLanguage("en-US");
    assert.equal(i18nService.getLanguage(), "en-US");
  });
  
  it("Should use browser language by default", function(){
    assert.equal(i18nService.getLanguage(), navigator.language || navigator.browserLanguage);
  });
  
  it("Should be able to add a dictionary of translations", function(){
    $httpBackend.when("GET", /.*getDictionary.*/).respond(200, {
      "TRANSLATION_ID" : "Translated text"
    });
    i18nService.addDictionary("publicDictionary");
    $httpBackend.flush();
    
    var dictionary = i18nService.getDictionary("publicDictionary");
    assert.equal(dictionary[i18nService.getLanguage()].TRANSLATION_ID, "Translated text");
  });
  
  it("Should set translation to null if no dictionary found", function(){
    $httpBackend.when("GET", /.*getDictionary.*/).respond(404, "");
    i18nService.addDictionary("publicDictionary");
    $httpBackend.flush();
    
    var dictionary = i18nService.getDictionary("publicDictionary");
    assert.isNull(dictionary[i18nService.getLanguage()]);
  });
  
  it("Should be able to remove a dictionary by its name", function(){
    $httpBackend.when("GET", /.*getDictionary.*/).respond(200, {
      "TRANSLATION_ID" : "Translated text"
    });
    i18nService.addDictionary("publicDictionary");
    $httpBackend.flush();
    i18nService.removeDictionary("publicDictionary");
    
    var dictionary = i18nService.getDictionary("publicDictionary");
    assert.isUndefined(dictionary);
  });  
  
  it("Should be able to add a dictionary with restricted access", function(){
    $httpBackend.when("GET", /admin\/.*getDictionary.*/).respond(200, {
      "TRANSLATION_ID" : "Translated text"
    });
    i18nService.addDictionary("adminDictionary", true);
    $httpBackend.flush();
    
    var dictionary = i18nService.getDictionary("adminDictionary");
    assert.equal(dictionary[i18nService.getLanguage()].TRANSLATION_ID, "Translated text");
  });  

  it("Should be able to translate an id to its translated text", function(){
    $httpBackend.when("GET", /.*getDictionary.*/).respond(200, {
      "TRANSLATION_ID" : "Translated text"
    });
    i18nService.addDictionary("publicDictionary");
    $httpBackend.flush();
    
    assert.equal(i18nService.translate("TRANSLATION_ID"), "Translated text");
  });  

  it("Should be able to translate an id using a precise directory", function(){
    $httpBackend.when("GET", /admin.*getDictionary.*/).respond(200, {
      "TRANSLATION_ID" : "Translated text from admin dictionary"
    });
    $httpBackend.when("GET", /.*getDictionary.*/).respond(200, {
      "TRANSLATION_ID" : "Translated text from public dictionary"
    });
    
    i18nService.addDictionary("publicDictionary");
    i18nService.addDictionary("adminDictionary", true);
    $httpBackend.flush();
    
    assert.equal(i18nService.translate("TRANSLATION_ID", "adminDictionary"), "Translated text from admin dictionary");
    assert.equal(i18nService.translate("TRANSLATION_ID", "publicDictionary"), "Translated text from public dictionary");
  });

  it("Should return the id if no translation found", function(){
    assert.equal(i18nService.translate("TRANSLATION_ID"), "TRANSLATION_ID");
    assert.equal(i18nService.translate("TRANSLATION_ID", "dictionary"), "TRANSLATION_ID");
  });  

  it("Should return the english translation if no others", function(){
    $httpBackend.when("GET", /.*getDictionary.*/).respond(200, {
      "TRANSLATION_ID" : "English translation"
    });
    
    i18nService.setLanguage("en");
    i18nService.addDictionary("publicDictionary");
    $httpBackend.flush();
    i18nService.setLanguage("es");
    
    assert.equal(i18nService.getLanguage(), "es");
    assert.equal(i18nService.translate("TRANSLATION_ID"), "English translation");
  });

  it("Should be able to translate an id with a filter", function(){
    $httpBackend.when("GET", /.*getDictionary.*/).respond(200, {
      "TRANSLATION_ID" : "Some translation"
    });
    
    i18nService.addDictionary("publicDictionary");
    $httpBackend.flush();  
    
    var translateFilter = $filter("translate");
    assert.equal(translateFilter("TRANSLATION_ID"), "Some translation");
    assert.equal(translateFilter("TRANSLATION_ID", "publicDictionary"), "Some translation");
  });  
  
});