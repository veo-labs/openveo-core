(function(app){
  
  "use strict"

  app.controller("RoleController", RoleController);
  RoleController.$inject = ["$scope", "userService", "roles", "permissions"];

  /**
   * Defines the roles controller for the roles page.
   */
  function RoleController($scope, userService, roles, permissions){
    $scope.roles = roles.data.entities;
    $scope.permissions = permissions.data.permissions;
    $scope.permissionsOptions = [];
    
    // Prepare the list of options for permissions checkboxes
    for(var permissionId in $scope.permissions){
      $scope.permissionsOptions.push({
        label : $scope.permissions[permissionId].name,
        value : permissionId
      });
    }
    
    prepareRolesPermissions();

    /**
     * Toggles the roles detail.
     * Can't open / close detail of the role if its saving.
     * @param Object role The role associated to the form
     */
    $scope.toggleRoleDetails = function(role){
      if(!role.saving){
        for(var i = 0 ; i < $scope.roles.length ; i++){
          $scope.roles[i].opened = ($scope.roles[i].id === role.id) ? !$scope.roles[i].opened : false;
        }
      }
    };
    
    /**
     * Removes the role.
     * Can't remove a role if its saving.
     * @param Object role The role to remove
     */
    $scope.removeRole = function(role){
      if(!role.saving){
        role.saving = true;
        userService.removeRole(role.id).success(function(data, status, headers, config){
          var index = 0;

          // Look for role index
          for(index = 0 ; index < $scope.roles.length ; index++){
            if($scope.roles[index].id === role.id)
              break;
          }

          // Remove role from the list of roles
          $scope.roles.splice(index, 1);

        }).error(function(data, status, headers, config){
          role.saving = false;
          if(status === 401)
            $scope.$parent.logout();
        });
      }
    };

    /**
     * Saves role.
     * @param Object form The angular edition form controller
     * @param Object role The role associated to the form
     */
    $scope.saveRole = function(form, role){
      role.saving = true;
      form.saving = true;
      
      var rolePermissions = {};
      
      for(var permissionId in $scope.permissions){
        rolePermissions[permissionId] = {
          activated : role.permissionsValues.indexOf(permissionId) > -1
        }
      }

      userService.updateRole(role.id, role.name, rolePermissions).success(function(data, status, headers, config){
        role.saving = form.saving = false;
        form.edition = false;
        form.closeEdition();
        $scope.toggleRoleDetails(role);
      }).error(function(data, status, headers, config){
        role.saving = form.saving = false;
        if(status === 401)
          $scope.$parent.logout();
      });
    };
    
    /**
     * Opens role edition.
     * @param Object form The angular edition form controller
     */
    $scope.openEdition = function(form){
      form.edition = true;
      form.openEdition();
    };
    
    /**
     * Cancels role edition.
     * @param Object form The angular edition form controller
     */
    $scope.cancelEdition = function(form){
      form.edition = false;
      form.cancelEdition();
    };
    
    /**
     * Adds a role.
     * @param Object form The angular form controller
     */
    $scope.addRole = function(form){
      form.saving = true;
      var permissions = {};
      
      // Get selected permissions
      for(var permissionId in $scope.permissions){
        permissions[permissionId] = {
          activated : $scope.permissions[permissionId].activated || false
        }
      }
      
      userService.addRole($scope.roleName, permissions).success(function(data, status, headers, config){
        form.saving = false;
        resetAddForm(form);
        $scope.roles.push(data.entity);
        prepareRolesPermissions();
      }).error(function(data, status, headers, config){
        form.saving = false;
        if(status === 401)
          $scope.$parent.logout();
      });
    };
    
    /**
     * Resets add's form values.
     * @param Object form The formular to reset
     */
    function resetAddForm(form){
      $scope.roleName = null;
      form.$submitted = false;
      for(var permissionId in $scope.permissions)
        $scope.permissions[permissionId].activated = false;
    }
    
    /**
     * Prepares activated permissions by roles.
     */
    function prepareRolesPermissions(){
      
      // Prepare the list of values for role's permissions
      for(var i = 0 ; i < $scope.roles.length ; i++){
        var role = $scope.roles[i];
        role["permissionsValues"] = [];

        for(var permissionId in role["permissions"])
          if(role["permissions"][permissionId].activated)
            role["permissionsValues"].push(permissionId);
      }
      
    }

  }

})(angular.module("ov"));