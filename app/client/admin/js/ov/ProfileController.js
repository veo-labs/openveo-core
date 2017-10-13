'use strict';

(function(app) {

  /**
   * Defines the profile controller for the profile page.
   */
  function ProfileController($scope, $filter, authenticationService, entityService, user) {
    var entityType = 'users';

    /**
     * Gets the list of role's names.
     *
     * @return {String} A comma separated list of role names
     */
    function getRoles() {
      var tmp = '';

      if (user.roles && user.roles.length) {
        var i = 0;
        for (i = 0; i < user.roles.length - 1; i++) {
          tmp += user.roles[i].name + ', ';
        }
        tmp += user.roles[i].name;
      }

      return tmp;
    }

    var self = this;
    this.password = '';
    this.confirmPassword = '';
    this.isInvalid = true;
    this.isSaving = false;
    this.user = user;
    this.roles = getRoles() || $filter('translate')('CORE.PROFILES.NO_ROLES');
    this.authenticationStrategies = openVeoSettings.authenticationStrategies;

    /**
     * Saves user information.
     *
     * @param {Object} userInfo The user information
     */
    function saveProfile(userInfo) {
      userInfo.saving = true;

      // update session cookie
      self.user.name = userInfo.name;

      return entityService.updateEntity(entityType, null, userInfo.id, {
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
    $scope.row = this.user;
    scopeEditForm.entityType = entityType;

    if (this.user.origin === openVeoSettings.authenticationStrategies.LOCAL) {
      scopeEditForm.fields = [
        {
          key: 'name',
          type: 'horizontalEditableInput',
          templateOptions: {
            label: $filter('translate')('CORE.PROFILES.ATTR_NAME'),
            required: true
          }
        },
        {
          key: 'email',
          type: 'emptyrow',
          templateOptions: {
            label: $filter('translate')('CORE.PROFILES.ATTR_EMAIL'),
            message: this.user.email
          }
        }
      ];

      if (this.user.roles && this.user.roles.length) {
        scopeEditForm.fields.push(
          {
            noFormControl: true,
            type: 'emptyrow',
            templateOptions: {
              label: $filter('translate')('CORE.PROFILES.ATTR_ROLES'),
              message: getRoles()
            }
          }
        );
      }
    }

    scopeEditForm.conditionEditDetail = function(userInfo) {
      return userInfo.id !== openVeoSettings.superAdminId && !userInfo.locked;
    };
    scopeEditForm.onSubmit = function(model) {
      return saveProfile(model);
    };

    /**
     * Updates user password.
     */
    this.updatePassword = function() {
      this.isSaving = true;

      entityService.updateEntity(entityType, null, this.user.id, {
        password: this.password,
        passwordValidate: this.confirmPassword,
        email: this.email
      }).then(function() {
        self.isSaving = false;
        self.resetForm();
        $scope.$emit('setAlert', 'success', $filter('translate')('CORE.UI.SAVE_SUCCESS'), 4000);
      }, function(data, status) {
        self.isSaving = false;
      });
    };

    /**
     * Resets password edition form.
     */
    this.resetForm = function() {
      this.password = '';
      this.confirmPassword = '';
      this.isInvalid = true;
    };

    /**
     * Validates password edition form.
     *
     * Password edition form is considered valid if password and password confirmation are the same.
     * It sets isInvalid property with the same value as the one returned.
     *
     * @return {Boolean} true if valid, false otherwise
     */
    this.checkValid = function() {
      this.isInvalid = !this.password || !this.confirmPassword || this.password !== this.confirmPassword;
      return this.isInvalid;
    };

    /**
     * Checks if password is editable.
     *
     * Some users can't edit their password, for example:
     * A lock user, the super administrator or a user coming from a third party provider such as LDAP.
     *
     * @return {Boolean} true if editable, false otherwise
     */
    this.passwordEditable = function() {
      return this.user.id != openVeoSettings.superAdminId &&
        !this.user.locked &&
        this.user.origin === openVeoSettings.authenticationStrategies.LOCAL;
    };

  }

  app.controller('ProfileController', ProfileController);
  ProfileController.$inject = ['$scope', '$filter', 'authenticationService', 'entityService', 'user'];

})(angular.module('ov'));
