'use strict';

(function(angular, app) {

  /**
   * Truncates a text to 35 characters and add '...' at the end of the truncated string.
   *
   * @module ov
   * @class truncateFilter
   */
  function TruncateFilter() {

    // Average troncate size but 27 is the low limit with 'W'
    var limit = 35;
    return function(input) {
      if (input && input != '' && input.length > limit) {
        input = input.slice(0, limit) + '...';
      }
      return input;
    };
  }

  app.filter('truncate', TruncateFilter);

})(angular, angular.module('ov'));
