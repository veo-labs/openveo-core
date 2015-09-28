'use strict';

(function(app) {

  /**
   * Defines the profile controller for the profile page.
   */
  function ProfileController($scope, $filter, entityService, user) {

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
      }).success(function() {
        userInfo.saving = false;
        $scope.$emit('setAlert', 'success', $filter('translate')('UI.SAVE_SUCCESS'), 4000);
        $scope.password = '';
        $scope.confirmPassword = '';
        $scope.isInValid = true;
      }).error(function(data, status) {
        userInfo.saving = false;
        $scope.$emit('setAlert', 'danger', $filter('translate')('UI.SAVE_ERROR'), 4000);
        if (status === 401)
          $scope.$parent.logout();
      });
    }

    /**
     * Saves user information.
     * @param {Object} userInfo The user information
     * @param {Function} successCb Function to call in case of success
     * @param {Function} errorCb Function to call in case of error
     */
    function saveProfile(userInfo, successCb, errorCb) {
      userInfo.saving = true;
      entityService.updateEntity('user', userInfo.id, {
        name: userInfo.name,
        email: userInfo.email
      }).success(function() {
        userInfo.saving = false;
        successCb();
        $scope.$emit('setAlert', 'warning', $filter('translate')('PROFILES.UPDATE_IN_NEXT_SESSION'), 0);
      }).error(function(data, status) {
        userInfo.saving = false;
        errorCb();
        if (status === 401)
          $scope.$parent.logout();
      });
    }

    /*
     * FORM
     */
    var scopeEditForm = $scope.editFormContainer = {};
    $scope.row = user;
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
    scopeEditForm.onSubmit = function(model, successCb, errorCb) {
      saveProfile(model, successCb, errorCb);
    };

    $scope.onSubmit = function(model, successCb, errorCb) {
      updatePassword(model, successCb, errorCb);
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
  ProfileController.$inject = ['$scope', '$filter', 'entityService', 'user'];

})(angular.module('ov'));
