'use strict';

(function(app) {

  /**
   * Defines the profile controller for the profile page.
   */
  function ProfileController($scope, $filter, authenticationService, entityService, user) {

    $scope.password = '';
    $scope.confirmPassword = '';
    $scope.isInValid = true;

    /**
     * Gets the list of role's names.
     * @return {String} A comma separated role names
     */
    function getRoles() {
      var tmp = '';
      var i = 0;
      for (i = 0; i < user.roles.length - 1; i++) {
        tmp += user.roles[i].name + ', ';
      }
      tmp += user.roles[i].name;
      return tmp;
    }

    /**
     * Updates user password.
     * @param {Object} userInfo User data information
     */
    function updatePassword(userInfo) {
      userInfo.saving = true;
      userInfo.password = $scope.password;
      entityService.updateEntity('user', userInfo.id, {
        password: userInfo.password,
        passwordValidate: userInfo.password,
        email: userInfo.email
      }).then(function() {
        userInfo.saving = false;
        $scope.$emit('setAlert', 'success', $filter('translate')('UI.SAVE_SUCCESS'), 4000);
        $scope.password = '';
        $scope.confirmPassword = '';
        $scope.isInValid = true;
      }, function(data, status) {
        userInfo.saving = false;
      });
    }

    /**
     * Saves user information.
     * @param {Object} userInfo The user information
     */
    function saveProfile(userInfo) {
      userInfo.saving = true;

      // update session cookie
      user.name = userInfo.name;

      return entityService.updateEntity('user', userInfo.id, {
        name: userInfo.name,
        email: userInfo.email
      }).then(function() {
        authenticationService.setUserInfo(user);
      }).finally(function() {
        userInfo.saving = false;
      });
    }

    /*
     * FORM
     */
    var scopeEditForm = $scope.editFormContainer = {};
    $scope.row = user;
    scopeEditForm.entityType = 'user';
    scopeEditForm.fields = [
      {

        // The key to be used in the model values
        // so this will be bound to vm.user.username
        key: 'name',
        type: 'horizontalExtendInput',
        templateOptions: {
          label: $filter('translate')('PROFILES.ATTR_NAME'),
          required: true
        }
      },
      {
        key: 'email',
        type: 'emptyrow',
        templateOptions: {
          label: $filter('translate')('PROFILES.ATTR_EMAIL'),
          message: user.email
        }
      }];

    if (user.roles) {
      if (user.roles.length)
        scopeEditForm.fields.push(
          {
            noFormControl: true,
            type: 'emptyrow',
            templateOptions: {
              label: $filter('translate')('PROFILES.ATTR_ROLES'),
              message: getRoles()
            }
          }
        );
    }

    scopeEditForm.conditionEditDetail = function(userInfo) {
      return (userInfo.id !== 0);
    };
    scopeEditForm.onSubmit = function(model) {
      return saveProfile(model);
    };

    $scope.onSubmit = function(model) {
      updatePassword(model);
    };

    $scope.cancelForm = function() {
      $scope.password = '';
      $scope.confirmPassword = '';
      $scope.isInValid = true;
    };

    $scope.checkValid = function() {
      if (($scope.password === '') || $scope.confirmPassword === '') {
        $scope.isInValid = true;
      } else {
        if ($scope.password === $scope.confirmPassword) {
          $scope.isInValid = false;
        } else {
          $scope.isInValid = true;
        }
        return $scope.isInValid;
      }
    };

    $scope.isNotSuperAdmin = function() {
      return (user.id != 0);
    };

  }

  app.controller('ProfileController', ProfileController);
  ProfileController.$inject = ['$scope', '$filter', 'authenticationService', 'entityService', 'user'];

})(angular.module('ov'));
