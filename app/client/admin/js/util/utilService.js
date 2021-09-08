'use strict';

(function(app) {

  /**
   * Defines an Util service to expose helper function.
   *
   * @class UtilService
   * @memberof module:ov/util
   * @inner
   */
  function UtilService($filter) {

    /**
     * Builds groups select options.
     *
     * @memberof module:ov/util~UtilService
     * @instance
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

})(angular.module('ov.util'));
