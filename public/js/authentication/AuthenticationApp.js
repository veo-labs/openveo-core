(function(angular){

  "use strict"

  var app = angular.module("ov.authentication", []);

  app.factory("authenticationService", AuthenticationService);
  AuthenticationService.$inject = ["$http", "storage"];
  
  /**
   * Defines an authentication service to deal with user authentication.
   * Exposes methods to deal with user information and to sing in 
   * logout.
   */
  function AuthenticationService($http, storage){
    var userInfo;

    /**
     * At service initialization, retrieve user information
     * from local storage.
     */
    var init = function(){
      var info = storage.get("userInfo");
      if(info)
        userInfo = JSON.parse(info);
    };

    init();

    /**
     * Signs in using the given credentials.
     * @param String userName The login
     * @param String password The password
     * @return HttpPromise The authentication promise
     */
    var login = function(userName, password){
      if(userName && password){
        return $http.post("/authenticate", {
          "userName" : userName,
          "password" : password
        });
      }
    };

    /**
     * Logs out.
     * @return HttpPromise The logout promise
     */
    var logout = function(){
      return $http.get("/logout");
    };

    /**
     * Gets user information.
     * @return Object The user description object
     */
    var getUserInfo = function(){
      return userInfo;
    };

    /**
     * Sets user information.
     * @param Object The user description object or null to remove 
     * user information
     */
    var setUserInfo = function(info){
      if(info){
        storage.set("userInfo", JSON.stringify(info));
        userInfo = info;
      }
      else{
        userInfo = null;
        storage.remove("userInfo");
      }
    };

    return {
      login : login,
      logout: logout,
      getUserInfo : getUserInfo,
      setUserInfo : setUserInfo
    };

  }
  
})(angular);