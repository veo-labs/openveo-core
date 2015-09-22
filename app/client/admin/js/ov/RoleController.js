'use strict';

(function(app) {

  /**
   * Defines the user controller for the user page.
   */
  function RoleController($scope, $filter, entityService, userService, permissions) {

    /**
     * Translates label, name and description of each permission.
     */
    function translatePermissions() {
      angular.forEach($scope.permissions, function(value) {
        value.label = $filter('translate')(value.label);
        angular.forEach(value.permissions, function(perm) {
          perm.name = $filter('translate')(perm.name);
          perm.description = $filter('translate')(perm.description);
        });
      });
    }

    var getEntitiesFromModel = function(model) {
      var entity = {
        name: model.name,
        permissions: []
      };
      angular.forEach(model, function(value, key) {
        var startsStr = 'permissions.';
        if (key.slice(0, startsStr.length) == startsStr) {
          entity.permissions = entity.permissions.concat(value);
        }
      });
      return entity;
    };

    /**
     * Saves role.
     * @param Object form The angular edition form controller
     * @param Object role The role associated to the form
     */
    var savePerm = function(permission, successCb, errorCb) {
      var entity = getEntitiesFromModel(permission);
      entityService.updateEntity('role', permission.id, entity).success(function() {
        permission.permissions = angular.copy(entity.permissions);
        userService.cacheClear('roles');
        successCb();
      }).error(function(data, status) {
        errorCb();
        if (status === 401)
          $scope.$parent.logout();
      });
    };

    /**
     * Adds a user.
     * @param Object form The angular form controller
     */
    var addRole = function(model, successCb, errorCb) {
      var entity = getEntitiesFromModel(model);
      entityService.addEntity('role', entity).success(function() {
        model.permissions = angular.copy(entity.permissions);
        userService.cacheClear('roles');
        successCb();
      }).error(function(data, status) {
        errorCb();
        if (status === 401)
          $scope.$parent.logout();
      });
    };

    var prepareRolePermission = function(perms, rolePermissions) {
      var modelPerm = {};
      angular.forEach(perms, function(value, key) {
        angular.forEach(value.permissions, function(valuePerm) {
          if (!modelPerm['permissions.' + key])
            modelPerm['permissions.' + key] = [];
          if (rolePermissions.indexOf(valuePerm.id) >= 0) {
            modelPerm['permissions.' + key].push(valuePerm.id);
          }
        });
      });
      return modelPerm;
    };

    /**
     * Removes the role.
     * @param Object role The role to remove
     */
    var removeRows = function(selected, reload) {
      entityService.removeEntity('role', selected.join(','))
        .success(function() {
          userService.cacheClear('roles');
          $scope.$emit('setAlert', 'success', $filter('translate')('ROLES.REMOVE_SUCCESS'), 4000);
          reload();
        })
        .error(function(data, status) {
          $scope.$emit('setAlert', 'danger', $filter('translate')('ROLES.REMOVE_FAIL'), 4000);
          if (status === 401)
            $scope.$parent.logout();
        });
    };

    $scope.permissions = permissions.data.permissions;
    var accordionArray;
    translatePermissions();

    /**
     *
     * RIGHTS
     *
     */
    $scope.rights = {};
    $scope.rights.add = $scope.checkAccess('create-role');
    $scope.rights.edit = $scope.checkAccess('update-role');
    $scope.rights.delete = $scope.checkAccess('delete-role');

    /**
     *
     * DATATABLE
     */
    var scopeDataTable = $scope.tableContainer = {};
    scopeDataTable.entityType = 'role';
    scopeDataTable.filterBy = [
      {
        key: 'name',
        value: '',
        label: $filter('translate')('ROLES.TITLE_FILTER')
      }
    ];
    scopeDataTable.header = [{
      key: 'name',
      name: $filter('translate')('ROLES.NAME_COLUMN'),
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
    scopeEditForm.init = function(row) {
      var modelPerm = prepareRolePermission($scope.permissions, row.permissions);
      angular.forEach(modelPerm, function(value, key) {
        row[key] = value;
      });
    };
    scopeEditForm.fields = [
      {
        key: 'name',
        type: 'horizontalExtendInput',
        templateOptions: {
          label: $filter('translate')('ROLES.ATTR_NAME'),
          required: true
        }
      }
    ];
    if ($scope.permissions.length == 0)
      scopeEditForm.fields.push({
        noFormControl: true,
        template: '<p>' + $filter('translate')('ROLES.NO_DATA') + '</p>'
      });
    else {
      accordionArray = [];
      scopeEditForm.fields.push({
        noFormControl: true,
        templateOptions: {
          label: $filter('translate')('ROLES.FORM_ADD_PERMISSIONS')
        },
        wrapper: ['horizontalBootstrapLabel'],
        template: ''

      });
      angular.forEach($scope.permissions, function(value, key) {
        accordionArray.push({
          key: 'permissions.' + key,
          type: 'editableChecklist',
          wrapper: ['collapse'],
          templateOptions: {
            label: '',
            labelCollapse: value.label,
            options: value.permissions,
            valueProp: 'id',
            labelProp: 'name'
          }
        });
      });

      scopeEditForm.fields.push({
        className: 'col-sm-8 col-push-sm-4',
        fieldGroup: accordionArray
      });
    }

    scopeEditForm.conditionEditDetail = function(row) {
      return $scope.rights.edit && !row.locked;
    };
    scopeEditForm.onSubmit = function(model, successCb, errorCb) {
      savePerm(model, successCb, errorCb);
    };

    /**
     *  FORM Add user
     *
     */
    var scopeAddForm = $scope.addFormContainer = {};
    scopeAddForm.model = {};
    scopeAddForm.fields = [
      {

        // the key to be used in the model values
        // so this will be bound to vm.user.username
        key: 'name',
        type: 'horizontalInput',
        templateOptions: {
          label: $filter('translate')('ROLES.FORM_ADD_NAME'),
          required: true,
          description: $filter('translate')('ROLES.FORM_ADD_NAME_DESC')
        }
      }
    ];
    if ($scope.permissions.length == 0)
      scopeAddForm.fields.push({
        noFormControl: true,
        template: '<p>' + $filter('translate')('ROLES.NO_DATA') + '</p>'
      });
    else {
      accordionArray = [];
      scopeAddForm.fields.push({
        noFormControl: true,
        templateOptions: {
          label: $filter('translate')('ROLES.FORM_ADD_PERMISSIONS')
        },
        wrapper: ['horizontalBootstrapLabel'],
        template: ''

      });
      angular.forEach($scope.permissions, function(value, key) {
        accordionArray.push({
          key: 'permissions.' + key,
          type: 'multiCheckbox',
          wrapper: ['collapse'],
          templateOptions: {
            label: '',
            labelCollapse: value.label,
            options: value.permissions,
            valueProp: 'id',
            labelProp: 'name'
          }
        });
      });

      scopeAddForm.fields.push({
        className: 'col-sm-8 col-push-sm-4',
        fieldGroup: accordionArray
      });
    }

    scopeAddForm.onSubmit = function(model, successCb, errorCb) {
      addRole(model, successCb, errorCb);
    };
  }

  app.controller('RoleController', RoleController);
  RoleController.$inject = ['$scope', '$filter', 'entityService', 'userService', 'permissions'];

})(angular.module('ov'));
