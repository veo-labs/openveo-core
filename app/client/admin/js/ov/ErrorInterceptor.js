'use strict';

(function(angular, app) {

  /**
   * Builds the error message for the given error.
   *
   * @param {Object} error The promise error as returned by the interceptor
   * @param {Object} $filter Angular filter
   * @return {String} The translated error message
   */
  function getErrorMessage(error, $filter) {
    var errorCode;
    var errorModule;

    if (error.data && error.data.error) {
      errorCode = error.data.error.code;
      errorModule = error.data.error.module;
    }

    // Not authorized
    if (error.status === 403)
      return $filter('translate')('CORE.ERROR.FORBIDDEN');

    // Probably a client application error
    else if (error.status === 400)
      return $filter('translate')('CORE.ERROR.CLIENT') + ' (code=' + errorCode + ', module=' + errorModule + ')';

    // Internal server error
    else if (errorCode && errorModule)
      return $filter('translate')('CORE.ERROR.SERVER') + ' (code=' + errorCode + ', module=' + errorModule + ')';

    // Other error
    else
      return $filter('translate')('CORE.ERROR.SERVER');
  }

  /**
   * Defines an HTTP interceptor to handle all application errors.
   *
   * Not authorized errors (401) logs out the user while the other HTTP errors set an error message
   * using an alert.
   */
  function ErrorInterceptor($rootScope, $filter, $q) {
    return {
      responseError: function(rejection) {

        // Not authentified
        if (rejection.status === 401)
          $rootScope.$broadcast('forceLogout');

        else if (
          rejection.status === 400 &&
          rejection.data &&
          rejection.data.error &&
          rejection.data.error.code === 776
        ) {
          return $q.reject(rejection);
        } else if (rejection.status == -1) {
          // Canceled or network error

          // Set alert only on network error, not on cancel
          if (!rejection.config || !rejection.config.timeout || !rejection.config.timeout.status)
            $rootScope.$broadcast('setAlert', 'danger', getErrorMessage(rejection, $filter), 0);

        // Other status
        } else $rootScope.$broadcast('setAlert', 'danger', getErrorMessage(rejection, $filter), 0);

        return $q.reject(rejection);
      }
    };
  }

  app.factory('errorInterceptor', ErrorInterceptor);
  ErrorInterceptor.$inject = ['$rootScope', '$filter', '$q'];

})(angular, angular.module('ov'));
