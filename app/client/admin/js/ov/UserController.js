'use strict';

(function(app) {

  /**
   * Defines the user controller for the user page.
   */
  function UserController($scope, $filter, userService, entityService, roles) {

    /**
     * Adds a user.
     * @param {Object} user The user data
     */
    function addUser(user) {
      var entity = {
        name: user.name,
        email: user.email,
        password: user.password,
        passwordValidate: user.passwordValidate,
        roles: user.roles || []
      };
      return entityService.addEntity('user', entity);
    }

    /**
     * Removes a list of users.
     * @param {Array} selected The list of user ids to remove
     * @param {Function} reload The reload Function to force reloading the table
     */
    function removeRows(selected, reload) {
      entityService.removeEntity('user', selected.join(','))
        .then(function() {
          $scope.$emit('setAlert', 'success', $filter('translate')('USERS.REMOVE_SUCCESS'), 4000);
          reload();
        });
    }

    /**
     * Saves user.
     * @param {Object} user The user data
     */
    function saveUser(user) {
      return entityService.updateEntity('user', user.id, {
        name: user.name,
        email: user.email,
        roles: user.roles
      });
    }

    $scope.roles = roles.data.entities;


    /**
     *
     * RIGHTS
     *
     */
    $scope.rights = {};
    $scope.rights.add = $scope.checkAccess('create-user');
    $scope.rights.edit = $scope.checkAccess('update-user');
    $scope.rights.delete = $scope.checkAccess('delete-user');


    /**
     *
     * DATATABLE
     */
    var scopeDataTable = $scope.tableContainer = {};
    scopeDataTable.entityType = 'user';
    scopeDataTable.filterBy = [
      {
        key: 'name',
        value: '',
        label: $filter('translate')('ROLES.TITLE_FILTER')
      }
    ];
    scopeDataTable.header = [{
      key: 'name',
      name: $filter('translate')('USERS.NAME_COLUMN'),
      class: ['col-xs-12 col-sm-11']
    },
    {
      key: 'action',
      name: $filter('translate')('UI.ACTIONS_COLUMN'),
      class: [' hidden-xs col-sm-1']
    }];

    scopeDataTable.actions = [{
      label: $filter('translate')('UI.REMOVE'),
      warningPopup: true,
      condition: function(row) {
        return $scope.rights.delete && !row.locked && !row.saving;
      },
      callback: function(row, reload) {
        removeRows([row.id], reload);
      },
      global: function(selected, reload) {
        removeRows(selected, reload);
      }
    }];


    /**
     * FORM
     */
    var scopeEditForm = $scope.editFormContainer = {};
    scopeEditForm.model = {};
    scopeEditForm.entityType = 'user';
    scopeEditForm.fields = [
      {

        // the key to be used in the model values
        // so this will be bound to vm.user.username
        key: 'name',
        type: 'horizontalExtendInput',
        templateOptions: {
          label: $filter('translate')('USERS.ATTR_NAME'),
          required: true
        }
      },
      {
        key: 'email',
        type: 'horizontalExtendInput',
        templateOptions: {
          label: $filter('translate')('USERS.ATTR_EMAIL'),
          required: true
        }
      }];
    if ($scope.roles.length != 0)
      scopeEditForm.fields.push(
        {
          key: 'roles',
          type: 'horizontalExtendCheckList',
          templateOptions: {
            label: $filter('translate')('USERS.ATTR_ROLE'),
            required: false,
            options: $scope.roles,
            valueProp: 'id',
            labelProp: 'name'
          }
        }
      );
    scopeEditForm.conditionEditDetail = function(row) {
      return $scope.rights.edit && !row.locked;
    };
    scopeEditForm.onSubmit = function(model) {
      return saveUser(model);
    };

    /**
     *  FORM Add user
     *
     */
    var scopeAddForm = $scope.addFormContainer = {};
    scopeAddForm.model = {};
    scopeAddForm.fields = [
      {

        // the key to be used in the model values so this will be bound to vm.user.username
        key: 'name',
        type: 'horizontalInput',
        templateOptions: {
          label: $filter('translate')('USERS.FORM_ADD_NAME'),
          required: true,
          description: $filter('translate')('USERS.FORM_ADD_NAME_DESC')
        }
      },
      {
        key: 'email',
        type: 'horizontalInput',
        templateOptions: {
          type: 'email',
          label: $filter('translate')('USERS.FORM_ADD_EMAIL'),
          required: true,
          description: $filter('translate')('USERS.FORM_ADD_EMAIL_DESC'),
          pattern: '^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$'
        },
        expressionProperties: {
          'templateOptions.disabled': '!model.name' // disabled when username is blank
        }
      },
      {
        key: 'password',
        type: 'horizontalInput',
        templateOptions: {
          type: 'password',
          label: $filter('translate')('USERS.FORM_ADD_PASSWORD'),
          required: true,
          description: $filter('translate')('USERS.FORM_ADD_PASSWORD_DESC')
        },
        expressionProperties: {
          'templateOptions.disabled': '!model.email' // disabled when username is blank
        }
      },
      {
        key: 'passwordValidate',
        type: 'horizontalInput',
        templateOptions: {
          type: 'password',
          label: $filter('translate')('USERS.FORM_ADD_PASSWORD_VALIDATE'),
          required: true,
          description: $filter('translate')('USERS.FORM_ADD_PASSWORD_VALIDATE_DESC')
        },
        expressionProperties: {
          'templateOptions.disabled': '!model.password' // disabled when username is blank
        }
      }
    ];
    if ($scope.roles.length == 0)
      scopeAddForm.fields.push({
        noFormControl: true,
        type: 'emptyrow',
        templateOptions: {
          label: $filter('translate')('USERS.FORM_ADD_ROLE'),
          message: $filter('translate')('USERS.NO_ROLE')
        }
      });
    else
      scopeAddForm.fields.push(
        {
          key: 'roles',
          type: 'horizontalCheckList',
          templateOptions: {
            label: $filter('translate')('USERS.FORM_ADD_ROLE'),
            required: false,
            options: $scope.roles,
            valueProp: 'id',
            labelProp: 'name',
            description: $filter('translate')('USERS.FORM_ADD_ROLE_DESC')
          },
          expressionProperties: {
            'templateOptions.disabled': '!model.passwordValidate' // disabled when username is blank
          }
        }
      );

    scopeAddForm.onSubmit = function(model) {
      return addUser(model);
    };

  }

  app.controller('UserController', UserController);
  UserController.$inject = ['$scope', '$filter', 'userService', 'entityService', 'roles'];

})(angular.module('ov'));
