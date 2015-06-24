(function(app){

  "use strict"
  
  app.factory("userService", UserService);
  UserService.$inject = ["$http", "$q"];
  
  /**
   * Defines service to manage users, roles and permissions.
   */
  function UserService($http, $q){
    var basePath = "/admin/";
    var users, roles, permissions;
    
    /**
     * Loads the list of users from server.
     * @return Promise The promise used to retrieve users
     * from server
     */
    var loadUsers = function(){
      if(!users){
        
        // Get users from server
        return $http.get(basePath + "crud/user").success(function(usersObj){
          users = usersObj.entities;
        });

      }

      return $q.when({data : {entities : users}});
    };
    
    /**
     * Loads the list of roles from server.
     * @return Promise The promise used to retrieve roles
     * from server
     */
    var loadRoles = function(){
      if(!roles){
        
        // Get roles from server
        return $http.get(basePath + "crud/role").success(function(rolesObj){
          roles = rolesObj.entities;
        });

      }

      return $q.when({data : {entities : roles}});
    };    
    
    /**
     * Loads the list of permissions from server.
     * @return Promise The promise used to retrieve permissions
     * from server
     */
    var loadPermissions = function(){
      if(!permissions){
        
        // Get scopes from server
        return $http.get(basePath + "permissions").success(function(permissionsObj){
          permissions = permissionsObj;
        });

      }

      return $q.when({data : permissions});
    };
    
    /**
     * Gets users.
     * @param Array The users
     */
    var getUsers = function(){
      return users;
    }; 
    
    /**
     * Gets roles.
     * @param Array The roles
     */
    var getRoles = function(){
      return roles;
    };

    /**
     * Gets permissions.
     * @param Array The permissions
     */
    var getPermissions = function(){
      return permissions;
    };      
    
    /**
     * Gets the applications.
     * @param Array The applications
     */
    var getApplications = function(){
      return applications;
    };    
    
    /**
     * Destroys roles, users and permissions.
     */
    var destroy = function(){
      users = roles = permissions = null;
    };
    
    /**
     * Adds a new role.
     * @param String name The name of the role
     * @param Array permissions The list of role's permissions
     */
    var addRole = function(name, permissions){
      return $http.put(basePath + "crud/role", {
        name : name,
        permissions : permissions
      });
    };

    /**
     * Updates role.
     * @param String id The id of the role to update
     * @param String name The name of the role
     * @param Array permissions The list of role's permissions
     */
    var updateRole = function(id, name, permissions){
      return $http.post(basePath + "crud/role/" + id, {
        name : name,
        permissions : permissions
      });
    };

    /**
     * Removes a role.
     * @param String id The id of the role to remove
     * @return HttpPromise The HTTP promise
     */
    var removeRole = function(id){
      return $http.delete(basePath + "crud/role/" + id);
    };
    
    /**
     * Adds a new user.
     * @param String name The login of the user
     * @param String email The mail of the user
     * @param String password The password of the user
     * @param String passwordValidate The password validation
     * @param Array roles The list of roles
     */
    var addUser = function(name, email, password, passwordValidate, roles){
      return $http.put(basePath + "crud/user", {
        name : name,
        email : email,
        password : password,
        passwordValidate : passwordValidate,
        roles : roles
      });
    };
    
    /**
     * Updates user.
     * @param String name The login of the user
     * @param String email The mail of the user
     * @param String password The password of the user
     * @param Array roles The list of roles
     */
    var updateUser = function(id, name, email, roles){
      return $http.post(basePath + "crud/user/" + id, {
        name : name,
        email : email,
        roles : roles
      });
    };
    
    /**
     * Removes a user.
     * @param String id The id of the user to remove
     * @return HttpPromise The HTTP promise
     */
    var removeUser = function(id){
      return $http.delete(basePath + "crud/user/" + id);
    };    

    return{
      loadRoles : loadRoles,
      loadUsers : loadUsers,
      loadPermissions : loadPermissions,
      removeRole : removeRole,
      removeUser : removeUser,
      getRoles : getRoles,
      getUsers : getUsers,
      getPermissions : getPermissions,
      destroy : destroy,
      addRole : addRole,
      addUser : addUser,
      updateRole : updateRole,
      updateUser : updateUser
    };

  }

})(angular.module("ov"));