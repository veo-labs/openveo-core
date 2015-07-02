(function(app){
  
  "use strict"

  app.controller("RoleController", RoleController);
  RoleController.$inject = ["$scope", "entityService", "roles", "permissions"];

  /**
   * Defines the roles controller for the roles page.
   */
  function RoleController($scope, entityService, roles, permissions){
    $scope.roles = roles.data.entities;
    $scope.permissions = permissions.data.permissions;
    $scope.addRolePermissions = prepareRolePermission($scope.permissions);
    
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
        entityService.removeEntity("role", role.id).success(function(data, status, headers, config){
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
      
      var rolePermissions = getRolePermissionsValues(role.permissionsValues, true);

      entityService.updateEntity("role", role.id, {
        name : role.name, 
        permissions : rolePermissions
      }).success(function(data, status, headers, config){
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
      
      var permissions = getRolePermissionsValues($scope.addRolePermissions);
      
      entityService.addEntity("role", {
        name : $scope.roleName, 
        permissions : permissions
      }).success(function(data, status, headers, config){
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

      resetPermissions($scope.addRolePermissions);
    }
    
    /**
     * Prepares activated permissions by roles.
     */
    function prepareRolesPermissions(){
      
      // Prepare the list of values for role's permissions
      for(var i = 0 ; i < $scope.roles.length ; i++){
        var role = $scope.roles[i];
        role["permissionsValues"] = prepareRolePermission($scope.permissions, role["permissions"]);
      }

    }

    /**
     * Resets permissions to activated : false.
     * @param Array permissions The tree of permissions
     * e.g.
     * [
     *   {
     *      "label" : "",
     *      "options" : [
     *        {
     *          "label" : "Perm 2 name",
     *          "value" : "perm-2",
     *          "activated" : true
     *        }
     *      ],
     *     "values" : [],
     *     "permissions" : {
     *        {
     *          "label" : "group 1 label",
     *          "options" : [
     *            {
     *              "label" : "Perm 1 name",
     *              "value" : "perm-1"
     *              "activated" : false
     *            }
     *          ],
     *          "values" : []
     *        }
     *     }
     *   }
     * ]
     */
    function resetPermissions(permissions){

      // Iterate through permissions
      for(var i = 0 ; i < permissions.length ; i++){

        // Group permissions
        if(permissions[i].options){

          // Reset permissions of the group
          for(var j = 0 ; j < permissions[i].options.length ; j++)
            permissions[i].options[j].activated = false;

        }

        // Sub group permissions
        if(permissions[i].permissions)
          resetPermissions(permissions[i].permissions);

      }

    }

    /**
     * Prepares role permissions.
     * Transform the tree of permissions to make it more flexible to
     * display as form elements.
     * @param Array permissions The tree of available
     * groups / permissions ordered by groups
     * e.g.
     * [
     *   {
     *     "label" : "group 1 label",
     *     "permissions" : [
     *       {
     *         "id" : "perm-1",
     *         "name" : "Perm 1 name",
     *         "description" : "Perm 1 description",
     *         "paths" : []
     *       }
     *     ]
     *   },
     *   {
     *     "id" : "perm-2",
     *     "name" : "Perm 2 name",
     *     "description" : "Perm 2 description",
     *     "paths" : []
     *   }
     * ]
     * @param Object rolePermissions The list of role's
     * groups / permissions
     * e.g.
     * [
     *  {
     *    "id" : "perm-1",
     *    "activated" : true,
     *  },
     *  {
     *    "id" : "perm-2",
     *    "activated" : true,
     *  }
     * ]
     * @return Object The prepared permissions
     * e.g.
     * [
     *   {
     *      "label" : "",
     *      "options" : [
     *        {
     *          "label" : "Perm 2 name",
     *          "value" : "perm-2"
     *        }
     *      ],
     *     "values" : [],
     *     "permissions" : {
     *        {
     *          "label" : "group 1 label",
     *          "options" : [
     *            {
     *              "label" : "Perm 1 name",
     *              "value" : "perm-1"
     *            }
     *          ],
     *          "values" : [ "perm-1" ]
     *        }
     *     }
     *   }
     * ]
     */
    function prepareRolePermission(permissions, rolePermissions){
      var preparedPermissions = [];

      // Iterate through permissions
      for(var i = 0 ; i < permissions.length ; i++){

        // Got a permission
        if(permissions[i].id){

          // Format permission with label as the name of the permission
          // and value as the id of the permission
          var permissionOption = {
            label : permissions[i].name,
            value : permissions[i].id
          };

          // Permission exists in role
          // Activate permission in the tree of permissions
          if(rolePermissions){
            for(var j = 0 ; j < rolePermissions.length ; j++){
              if(rolePermissions[j].id === permissions[i].id){
                permissionOption.activated = rolePermissions[j].activated || false;
                break;
              }
            }
          }

          preparedPermissions.push(permissionOption);
        }

        // Got a group of permissions
        else if(permissions[i].permissions){

          // Recursively prepare sub permissions
          var groupPermissions = prepareRolePermission(permissions[i].permissions, rolePermissions);

          if(groupPermissions.length){
            var group = extractPermissionsValues(groupPermissions);
            group.label = permissions[i].label;
            preparedPermissions.push(group);
          }

        }
      }
      
      return preparedPermissions;
    }

    /**
     * Extract options and values from a list of permissions.
     * @param Array groupPermissions A list of permissions
     * [
     *   {
     *     label : "Name of the permission",
     *     value : "perm-id",
     *     activated : true
     *   }
     * ]
     * @return Object The formatted permissions
     * {
     *   options : [
     *     {
     *       label : "Name of the permission",
     *       value : "perm-id"
     *     }
     *   ],
     *   values : [ "perm-id" ]
     * }
     */
    function extractPermissionsValues(groupPermissions){
      var group = {};
      var groupValues = [];
      var groupOptions = [];
      var filteredGroupPermissions = [];

      for(var j = 0 ; j < groupPermissions.length ; j++){

        // Activated permission
        if(groupPermissions[j].activated)
          groupValues.push(groupPermissions[j].value);

        // Permission
        if(groupPermissions[j].value)
          groupOptions.push(groupPermissions[j]);

        // Group of permissions
        else
          filteredGroupPermissions.push(groupPermissions[j]);
      }

      if(groupOptions.length){
        group.values = groupValues;
        group.options = groupOptions;
      }

      if(filteredGroupPermissions.length)
        group.permissions = filteredGroupPermissions;

      return group;
    }

    /**
     * Gets the list of permissions from the tree of permissions.
     * @param Array permissions The tree of permissions
     * e.g.
     * [
     *   {
     *      "label" : "",
     *      "options" : [
     *        {
     *          "label" : "Perm 2 name",
     *          "value" : "perm-2"
     *        }
     *      ],
     *     "values" : [],
     *     "permissions" : {
     *        {
     *          "label" : "group 1 label",
     *          "options" : [
     *            {
     *              "label" : "Perm 1 name",
     *              "value" : "perm-1"
     *            }
     *          ],
     *          "values" : [ "perm-1" ]
     *        }
     *     }
     *   }
     * ]
     * @param Boolean fromValues true to retrieve the activated state of
     * the permission from the list of values, false to get it directly
     * in permission description using "activated" property.
     * @return Array The list of permissions
     * [
     *  {
     *    "id" : "perm-1",
     *    "activated" : true,
     *  },
     *  {
     *    "id" : "perm-2",
     *    "activated" : false,
     *  }
     * ]
     */
    function getRolePermissionsValues(permissions, fromValues){
      var activatedPermissions = [];

      for(var i = 0 ; i < permissions.length ; i++){

        // Transform options into permissions
        if(permissions[i].options){
          var options = permissions[i].options;

          // Iterate through options
          for(var j = 0 ; j < options.length ; j++){
            var option = options[j];
            var groupPermission = {
              id : option.value
            };

            if(fromValues)
              groupPermission.activated = permissions[i].values.indexOf(option.value) > -1;
            else
              groupPermission.activated = option.activated || false;

            activatedPermissions.push(groupPermission);
          }
        }

        // Group of permissions
        if(permissions[i].permissions){
          activatedPermissions = activatedPermissions.concat(getRolePermissionsValues(permissions[i].permissions, fromValues));
        }
      }

      return activatedPermissions;
    }

  }

})(angular.module("ov"));