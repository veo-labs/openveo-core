'use strict';

window.assert = chai.assert;

describe('OvUrlFactory', function() {
  var OvUrlFactory;

  // Load modules
  beforeEach(function() {
    module('ov.util');
  });

  // Dependencies injections
  beforeEach(inject(function(_OvUrlFactory_) {
    OvUrlFactory = _OvUrlFactory_;
  }));

  describe('setUrlParameter', function() {

    it('should be able to add a parameter to an URL', function() {
      var parameterName = 'param';
      var parameterValue = 'value';
      var urls = [
        'https://test.local/action',
        'https://test.local:3000/action',
        'http://test.local/action',
        'https://www.test.local/action',
        'https://www.test.local/action/',
        'https://www.test.local/action#anchor'
      ];

      urls.forEach(function(url) {
        var parsedUrl = new URL(OvUrlFactory.setUrlParameter(url, parameterName, parameterValue));
        assert.equal(parsedUrl.searchParams.get(parameterName), parameterValue, 'Wrong value for URL ' + url);
      });
    });

    it('should be able to add query parameter to an URL already containing parameters', function() {
      var existingParameterName = 'existingParam';
      var existingParameterValue = 'existingParamValue';
      var parameterName = 'param';
      var parameterValue = 'value';
      var url = 'https://www.test.local/action?' + existingParameterName + '=' + existingParameterValue;
      var parsedUrl = new URL(OvUrlFactory.setUrlParameter(url, parameterName, parameterValue));
      assert.equal(parsedUrl.searchParams.get(parameterName), parameterValue, 'Wrong value');
      assert.equal(parsedUrl.searchParams.get(existingParameterName), existingParameterValue, 'Wrong value');
    });

    it('should be able to update a query parameter from an URL', function() {
      var parameterName = 'param';
      var parameterValue = 'value';
      var url = 'https://www.test.local/action?' + parameterName + '=' + parameterValue;
      var parsedUrl = new URL(OvUrlFactory.setUrlParameter(url, parameterName, parameterValue));
      assert.equal(parsedUrl.searchParams.get(parameterName), parameterValue, 'Wrong value');
    });

  });

});
