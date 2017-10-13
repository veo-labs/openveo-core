'use strict';

/**
 * Service to authenticate / logout or manipulate authenticated user informations.
 *
 * @module ov.authentication
 * @main ov.authentication
 */

(function(angular) {
  var app = angular.module('ov.authentication', []);

  /**
   * Defines an authentication service to deal with user authentication.
   * Exposes methods to deal with user information and to sign in or logout.
   *
   * @class authenticationService
   */
  function AuthenticationService($http) {
    var basePath = '/be/';
    var userInfo;

    /**
     * Initializes user information from openVeoSettings global.
     */
    function init() {
      userInfo = openVeoSettings.user;
    }

    /**
     * Signs in using the given credentials.
     *
     * @param {String} login The login
     * @param {String} password The password
     * @return {Promise} The authentication promise
     * @method login
     */
    function login(login, password) {
      return $http.post(basePath + 'authenticate', {
        login: login,
        password: password
      });
    }

    /**
     * Logs out user.
     *
     * @return {Promise} The logout promise
     * @method logout
     */
    function logout() {
      return $http.post(basePath + 'logout');
    }

    /**
     * Gets user information.
     *
     * @return {Object} The user description object
     * @method getUserInfo
     */
    function getUserInfo() {
      return userInfo;
    }

    /**
     * Sets user information.
     *
     * @param {Object} [info] The user description object or null to remove all user information
     * user information
     * @method setUserInfo
     */
    function setUserInfo(info) {
      if (info) userInfo = info;
      else userInfo = null;
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
  AuthenticationService.$inject = ['$http'];

})(angular);
