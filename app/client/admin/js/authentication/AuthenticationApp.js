'use strict';

/**
 * Service to authenticate / logout or manipulate authenticated user informations.
 *
 * @module ov/authentication
 */

(function(angular) {
  var app = angular.module('ov.authentication', []);

  /**
   * Defines an authentication service to deal with user authentication.
   * Exposes methods to deal with user information and to sign in or logout.
   *
   * @example
   * MyAngularObject.$inject = ['authenticationService'];
   *
   * @class AuthenticationService
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
     * @memberof module:ov/authentication~AuthenticationService
     * @instance
     * @async
     * @param {String} login The login
     * @param {String} password The password
     * @return {Promise} The authentication promise
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
     * @memberof module:ov/authentication~AuthenticationService
     * @instance
     * @async
     * @return {Promise} The logout promise
     */
    function logout() {
      return $http.post(basePath + 'logout');
    }

    /**
     * Gets user information.
     *
     * @memberof module:ov/authentication~AuthenticationService
     * @instance
     * @return {Object} The user description object
     */
    function getUserInfo() {
      return userInfo;
    }

    /**
     * Sets user information.
     *
     * @memberof module:ov/authentication~AuthenticationService
     * @instance
     * @param {Object} [info] The user description object or null to remove all user information
     * user information
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
