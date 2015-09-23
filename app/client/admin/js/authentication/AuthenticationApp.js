'use strict';

(function(angular) {
  var app = angular.module('ov.authentication', []);

  /**
   * Defines an authentication service to deal with user authentication.
   * Exposes methods to deal with user information and to sign in or logout.
   */
  function AuthenticationService($http, storage) {
    var userInfo;

    /**
     * Initializes user information from local storage.
     */
    function init() {
      var info = storage.get('userInfo');
      if (info)
        userInfo = JSON.parse(info);
    }

    /**
     * Signs in using the given credentials.
     * @param {String} email The email
     * @param {String} password The password
     * @return {Promise} The authentication promise
     */
    function login(email, password) {
      if (email && password) {
        return $http.post('/authenticate', {
          email: email,
          password: password
        });
      }
    }

    /**
     * Logs out user.
     * @return {Promise} The logout promise
     */
    function logout() {
      return $http.get('/logout');
    }

    /**
     * Gets user information.
     * @return {Object} The user description object
     */
    function getUserInfo() {
      return userInfo;
    }

    /**
     * Sets user information.
     * @param {Object} The user description object or null to remove
     * user information
     */
    function setUserInfo(info) {
      if (info) {
        storage.set('userInfo', JSON.stringify(info));
        userInfo = info;
      } else {
        userInfo = null;
        storage.remove('userInfo');
      }
    }

    init();

    return {
      login: login,
      logout: logout,
      getUserInfo: getUserInfo,
      setUserInfo: setUserInfo
    };

  }

  app.factory('authenticationService', AuthenticationService);
  AuthenticationService.$inject = ['$http', 'storage'];

})(angular);
