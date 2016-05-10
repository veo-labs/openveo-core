'use strict';

window.assert = chai.assert;

// i18nApp.js
describe('i18nApp', function() {
  var i18nService;
  var $httpBackend;
  var $filter;
  var $cookies;

  // Load i18n module
  beforeEach(module('ov.i18n'));

  // Dependencies injections
  beforeEach(inject(function(_i18nService_, _$cookies_, _$httpBackend_, _$filter_) {
    $cookies = _$cookies_;
    $filter = _$filter_;
    i18nService = _i18nService_;
    $httpBackend = _$httpBackend_;
  }));

  // Initialize tests
  afterEach(function() {
    $cookies.remove('language');
  });

  // Checks if no HTTP request stays without response
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be able to set the language', function() {
    i18nService.setLanguage('en');
    assert.equal(i18nService.getLanguage(), 'en');
  });

  it('should not set language if not supported', function() {
    i18nService.setLanguage('en');
    i18nService.setLanguage('notSupportedLanguage');
    assert.equal(i18nService.getLanguage(), 'en');
  });

  it('should use browser language by default', function() {
    assert.equal(i18nService.getLanguage(), (navigator.language || navigator.browserLanguage).split('-')[0]);
  });

  it('should be able to request for a dictionary of translations', function() {
    $httpBackend.when('GET', /.*getDictionary.*/).respond(200, {
      TRANSLATION_ID: 'Translated text'
    });
    i18nService.addDictionary('publicDictionary');
    $httpBackend.flush();

    var dictionary = i18nService.getDictionary('publicDictionary');
    assert.equal(dictionary[i18nService.getLanguage()].TRANSLATION_ID, 'Translated text');
  });

  it('should set translation to null if no dictionary found', function() {
    $httpBackend.when('GET', /.*getDictionary.*/).respond(404, '');
    i18nService.addDictionary('publicDictionary');
    $httpBackend.flush();

    var dictionary = i18nService.getDictionary('publicDictionary');
    assert.isNull(dictionary[i18nService.getLanguage()], 'Unexpected dictionary');
  });

  it('should be able to remove a dictionary by its name', function() {
    $httpBackend.when('GET', /.*getDictionary.*/).respond(200, {
      TRANSLATION_ID: 'Translated text'
    });
    i18nService.addDictionary('publicDictionary');
    $httpBackend.flush();
    i18nService.removeDictionary('publicDictionary');

    var dictionary = i18nService.getDictionary('publicDictionary');
    assert.isUndefined(dictionary, 'Unexpected dictionary');
  });

  it('should be able to add a dictionary with restricted access', function() {
    $httpBackend.when('GET', /be\/.*getDictionary.*/).respond(200, {
      TRANSLATION_ID: 'Translated text'
    });
    i18nService.addDictionary('adminDictionary', true);
    $httpBackend.flush();

    var dictionary = i18nService.getDictionary('adminDictionary');
    assert.equal(dictionary[i18nService.getLanguage()].TRANSLATION_ID, 'Translated text');
  });

  it('should be able to translate an id to its translated text', function() {
    $httpBackend.when('GET', /.*getDictionary.*/).respond(200, {
      TRANSLATION_ID: 'Translated text'
    });
    i18nService.addDictionary('publicDictionary');
    $httpBackend.flush();

    assert.equal(i18nService.translate('TRANSLATION_ID'), 'Translated text');
  });

  it('should be able to translate an id using a precise directory', function() {
    $httpBackend.when('GET', /be.*getDictionary.*/).respond(200, {
      TRANSLATION_ID: 'Translated text from admin dictionary'
    });
    $httpBackend.when('GET', /.*getDictionary.*/).respond(200, {
      TRANSLATION_ID: 'Translated text from public dictionary'
    });

    i18nService.addDictionary('publicDictionary');
    i18nService.addDictionary('adminDictionary', true);
    $httpBackend.flush();

    assert.equal(i18nService.translate('TRANSLATION_ID', 'adminDictionary'), 'Translated text from admin dictionary');
    assert.equal(i18nService.translate('TRANSLATION_ID', 'publicDictionary'),
      'Translated text from public dictionary');
  });

  it('should return the id if no translation found', function() {
    assert.equal(i18nService.translate('TRANSLATION_ID'), 'TRANSLATION_ID');
    assert.equal(i18nService.translate('TRANSLATION_ID', 'dictionary'), 'TRANSLATION_ID');
  });

  it('should return the english translation if no others', function() {
    $httpBackend.when('GET', /.*getDictionary.*fr.*/).respond(200, {
      TRANSLATION_ID: 'Traduction française'
    });
    $httpBackend.when('GET', /.*getDictionary.*en.*/).respond(200, {
      TRANSLATION_ID: 'English translation',
      ONLY_IN_ENGLISH_DICTIONARY: 'In english'
    });

    i18nService.setLanguage('fr');
    i18nService.addDictionary('publicDictionary');
    $httpBackend.flush();

    i18nService.setLanguage('en');
    i18nService.addDictionary('publicDictionary');
    $httpBackend.flush();

    assert.equal(i18nService.translate('ONLY_IN_ENGLISH_DICTIONARY'), 'In english');
  });

  it('should be able to translate an id with a filter', function() {
    $httpBackend.when('GET', /.*getDictionary.*/).respond(200, {
      TRANSLATION_ID: 'Some translation'
    });

    i18nService.addDictionary('publicDictionary');
    $httpBackend.flush();

    var translateFilter = $filter('translate');
    assert.equal(translateFilter('TRANSLATION_ID'), 'Some translation');
    assert.equal(translateFilter('TRANSLATION_ID', 'publicDictionary'), 'Some translation');
  });

  it('should define a list of supported languages', function() {
    var languages = i18nService.getLanguages();
    assert.isArray(languages, 'Expected a default list of languages');
    assert.ok(languages.length > 0, 'Expected a a non empty list of languages');
  });

  it('should be able to tell if a language is supported or not', function() {
    assert.ok(i18nService.isLanguageSupported('en'), 'Expected english language to be supported');
    assert.ok(i18nService.isLanguageSupported('fr'), 'Expected french language to be supported');
    assert.notOk(i18nService.isLanguageSupported('notSupported'), 'Unexpected language "notSupported"');
  });

});
