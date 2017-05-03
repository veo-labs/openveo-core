'use strict';

/**
 * OpenVeo helper.
 *
 * @module ov.util
 * @main ov.util
 */

(function(angular) {
  var app = angular.module('ov.utilService', []);

  /**
   * Defines an Util service to expose helper function.
   *
   * @class utilService
   */
  function UtilService($filter) {

    /**
     * Builds groups select options.
     *
     * @return {Array} The list of options
     */
    function buildSelectOptions(entities) {
      var options = [{
        name: $filter('translate')('CORE.UI.NONE'),
        value: null
      }];

      entities.forEach(function(entity) {
        options.push({
          name: entity.name,
          value: entity.id
        });
      });

      return options;
    }

    return {
      buildSelectOptions: buildSelectOptions
    };

  }

  app.factory('utilService', UtilService);
  UtilService.$inject = ['$filter'];

})(angular);
