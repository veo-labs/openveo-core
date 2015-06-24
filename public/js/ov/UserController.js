(function(app){
  
  "use strict"

  app.controller("UserController", UserController);
  UserController.$inject = ["$scope", "userService", "users", "roles"];

  /**
   * Defines the users controller for the users page.
   */
  function UserController($scope, userService, users, roles){
    $scope.users = users.data.entities;
    $scope.roles = roles.data.entities;
    $scope.rolesOptions = [];
    
    // Prepare the list of options for roles checkboxes
    for(var roleId in $scope.roles){
      $scope.rolesOptions.push({
        label : $scope.roles[roleId].name,
        value : $scope.roles[roleId].id
      });
    }
    
    prepareUsersRoles();

    /**
     * Toggles the users detail.
     * Can't open / close detail of the user if its saving.
     * @param Object user The user associated to the form
     */
    $scope.toggleUserDetails = function(user){
      if(!user.saving){
        for(var i = 0 ; i < $scope.users.length ; i++){
          $scope.users[i].opened = ($scope.users[i].id === user.id) ? !$scope.users[i].opened : false;
        }
      }
    };
    
    /**
     * Removes the user.
     * Can't remove a user if its saving.
     * @param Object user The user to remove
     */
    $scope.removeUser = function(user){
      if(!user.saving){
        user.saving = true;
        userService.removeUser(user.id).success(function(data, status, headers, config){
          var index = 0;

          // Look for user index
          for(index = 0 ; index < $scope.users.length ; index++){
            if($scope.users[index].id === user.id)
              break;
          }

          // Remove user from the list of users
          $scope.users.splice(index, 1);

        }).error(function(data, status, headers, config){
          user.saving = false;
          if(status === 401)
            $scope.$parent.logout();
        });
      }
    };

    /**
     * Saves user.
     * @param Object form The angular edition form controller
     * @param Object user The user associated to the form
     */
    $scope.saveUser = function(form, user){
      user.saving = true;
      form.saving = true;
      
      var roles = {};
      
      /*for(var roleId in $scope.roles)
        roles.push(roleId);*/
      for(var roleId in $scope.roles){
        roles[roleId] = {
          activated : user.rolesValues.indexOf(roleId) > -1
        }
      }      

      userService.updateUser(user.id, user.name, user.email, roles).success(function(data, status, headers, config){
        user.saving = form.saving = false;
        form.edition = false;
        form.closeEdition();
        $scope.toggleUserDetails(user);
      }).error(function(data, status, headers, config){
        user.saving = form.saving = false;
        if(status === 401)
          $scope.$parent.logout();
      });
    };
    
    /**
     * Opens user edition.
     * @param Object form The angular edition form controller
     */
    $scope.openEdition = function(form){
      form.edition = true;
      form.openEdition();
    };
    
    /**
     * Cancels user edition.
     * @param Object form The angular edition form controller
     */
    $scope.cancelEdition = function(form){
      form.edition = false;
      form.cancelEdition();
    };
    
    /**
     * Adds a user.
     * @param Object form The angular form controller
     */
    $scope.addUser = function(form){
      form.saving = true;
      var roles = {};
      
      // Get selected roles
      for(var roleId in $scope.roles){
        if($scope.roles[roleId].activated){
          roles[$scope.roles[roleId].id] = {
            activated : $scope.roles[roleId].activated
          }
        }
      }
      
      userService.addUser($scope.userName, $scope.userEmail, $scope.userPassword, $scope.userPasswordValidate, roles).success(function(data, status, headers, config){
        form.saving = false;
        resetAddForm(form);
        $scope.users.push(data.entity);
        prepareUsersRoles();
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
      $scope.userName = $scope.userEmail = $scope.userPassword = $scope.userPasswordValidate = null;
      form.$submitted = false;
      for(var roleId in $scope.roles)
        $scope.roles[roleId].activated = false;
    }
    
    /**
     * Prepares activated roles by users.
     */
    function prepareUsersRoles(){
      
      // Prepare the list of values for user's roles
      for(var i = 0 ; i < $scope.users.length ; i++){
        var user = $scope.users[i];
        user["rolesValues"] = [];

        for(var roleId in user["roles"])
          if(user["roles"][roleId].activated)
            user["rolesValues"].push(roleId);
      }
      
    }

  }

})(angular.module("ov"));