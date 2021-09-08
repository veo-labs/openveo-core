'use strict';

(function(app) {

  /**
   * Offers helpers to manipulate URLs as Internet Explorer does not implement URL.
   *
   * @class OvUrlFactory
   * @memberof module:ov/util
   * @inner
   */
  function OvUrlFactory() {

    /**
     * Sets a query parameter of an URL.
     *
     * @memberof module:ov/util~OvUrlFactory
     * @instance
     * @param {String} url The URL to modify
     * @param {String} parameter The name of the parameter to add
     * @param {String} value The value of the parameter to add
     * @return {String} The new computed URL
     */
    function setUrlParameter(url, parameter, value) {

      // JavaScript URL is not well implemented in Internet Explorer
      // This has to be replaced when Internet Explorer won't be supported anymore
      var parameters = {};
      var parametersStrings = [];
      var anchor;
      var finalUrl;
      var parametersQueryString;

      // Parse the URL
      var urlChunks = url.match(/([^?#]*)(?:\?([^#]*))?(?:#(.*))?/);
      if (!urlChunks) throw new TypeError(url + ' is not a valid URL');

      finalUrl = urlChunks[1];
      parametersQueryString = urlChunks[2];
      anchor = urlChunks[3];

      // Parse query parameters
      if (parametersQueryString) {
        parametersStrings = parametersQueryString.split('&');

        parametersStrings.forEach(function(parameterString) {
          var urlParameter = parameterString.split('=');
          parameters[urlParameter[0]] = urlParameter[1];
        });
      }

      // Add new parameter
      parameters[parameter] = value;

      // Build query parameters string
      parametersStrings = [];
      for (var name in parameters) {
        parametersStrings.push(name + '=' + parameters[name]);
      }

      // Build the URL
      if (parametersStrings.length) finalUrl += '?' + parametersStrings.join('&');
      if (anchor) finalUrl += '#' + anchor;

      return finalUrl;
    }

    return {
      setUrlParameter: setUrlParameter
    };

  }

  app.factory('OvUrlFactory', OvUrlFactory);
  OvUrlFactory.$inject = [];

})(angular.module('ov.util'));
