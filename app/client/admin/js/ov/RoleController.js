'use strict';

(function(app) {

  /**
   * Defines the role controller for the role page.
   */
  function RoleController($scope, $filter, entityService, userService, permissions) {
    var entityType = 'roles';

    /**
     * Translates label, name and description keys of each permission.
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

    /**
     * Gets the list of permissions inside a group.
     *
     * @param {Object} model Roles model
     */
    function getEntitiesFromModel(model) {
      var entity = {
        name: model.name,
        permissions: []
      };
      angular.forEach(model, function(value, key) {
        var startsStr = 'permissions_';
        if (key.slice(0, startsStr.length) == startsStr) {
          entity.permissions = entity.permissions.concat(value);
        }
      });
      return entity;
    }

    /**
     * Saves a role.
     *
     * @param {Object} role Role data
     * @param {Function} successCb Function to call in case of success
     */
    function saveRole(role) {
      var entity = getEntitiesFromModel(role);
      return entityService.updateEntity(entityType, null, role.id, entity).then(function() {
        role.permissions = angular.copy(entity.permissions);
        userService.cacheClear(entityType);
      });
    }

    /**
     * Adds a role.
     *
     * @param {Object} role Role information
     * @param {Function} successCb Function to call in case of success
     */
    function addRole(role) {
      var entity = getEntitiesFromModel(role);
      return entityService.addEntity(entityType, null, entity).then(function() {
        role.permissions = angular.copy(entity.permissions);
        userService.cacheClear(entityType);
      });
    }

    /**
     * Prepares permissions for HTMLCheckboxElement(s).
     *
     * @param {Array} perms The list of permission groups
     * @param {Array} rolePermissions The list of permission ids
     */
    function prepareRolePermission(perms, rolePermissions) {
      var modelPerm = {};
      angular.forEach(perms, function(value, key) {
        angular.forEach(value.permissions, function(valuePerm) {
          if (!modelPerm['permissions_' + key])
            modelPerm['permissions_' + key] = [];
          if (rolePermissions.indexOf(valuePerm.id) >= 0) {
            modelPerm['permissions_' + key].push(valuePerm.id);
          }
        });
      });
      return modelPerm;
    }

    /**
     * Removes a list of roles.
     *
     * @param {Array} selected The list of role ids to remove
     * @param {Function} reload The reload Function to force reloading the table
     */
    function removeRows(selected, reload) {
      entityService.removeEntity(entityType, null, selected.join(','))
        .then(function() {
          userService.cacheClear(entityType);
          $scope.$emit('setAlert', 'success', $filter('translate')('ROLES.REMOVE_SUCCESS'), 4000);
          reload();
        });
    }

    $scope.permissions = permissions.data.permissions;
    var accordionArray;
    translatePermissions();

    /*
     *
     * RIGHTS
     *
     */
    $scope.rights = {};
    $scope.rights.add = $scope.checkAccess('create-' + entityType);
    $scope.rights.edit = $scope.checkAccess('update-' + entityType);
    $scope.rights.delete = $scope.checkAccess('delete-' + entityType);

    /*
     *
     * DATATABLE
     */
    var scopeDataTable = $scope.tableContainer = {};
    scopeDataTable.entityType = entityType;
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
      class: ['col-xs-11']
    },
    {
      key: 'action',
      name: $filter('translate')('UI.ACTIONS_COLUMN'),
      class: ['col-xs-1']
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

    /*
     * FORM
     */
    var scopeEditForm = $scope.editFormContainer = {};
    scopeEditForm.model = {};
    scopeEditForm.entityType = entityType;
    scopeEditForm.init = function(row) {
      var modelPerm = prepareRolePermission($scope.permissions, row.permissions);
      angular.forEach(modelPerm, function(value, key) {
        row[key] = value;
      });
    };
    scopeEditForm.fields = [
      {
        key: 'name',
        type: 'horizontalEditableInput',
        templateOptions: {
          label: $filter('translate')('ROLES.ATTR_NAME'),
          required: true
        }
      }
    ];
    if ($scope.permissions.length == 0) {
      scopeEditForm.fields.push({
        noFormControl: true,
        template: '<p>' + $filter('translate')('ROLES.NO_DATA') + '</p>'
      });
    } else {
      accordionArray = [];
      scopeEditForm.fields.push({
        noFormControl: true,
        templateOptions: {
          label: $filter('translate')('ROLES.FORM_ADD_PERMISSIONS')
        },
        wrapper: ['horizontalBootstrapLabelOnly'],
        template: ''
      });
      angular.forEach($scope.permissions, function(value, key) {
        accordionArray.push({
          key: 'permissions_' + key,
          type: 'ovEditableMultiCheckBox',
          wrapper: ['editableWrapper', 'collapse'],
          templateOptions: {
            label: '',
            labelCollapse: value.label,
            options: value.permissions,
            valueProperty: 'id',
            labelProperty: 'name'
          }
        });
      });

      scopeEditForm.fields.push({
        className: 'col-md-8 col-push-md-4',
        fieldGroup: accordionArray
      });
    }

    scopeEditForm.conditionEditDetail = function(row) {
      return $scope.rights.edit && !row.locked;
    };
    scopeEditForm.onSubmit = function(model) {
      return saveRole(model);
    };

    /*
     *  FORM Add role
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
        wrapper: ['horizontalBootstrapLabelOnly'],
        template: ''

      });
      angular.forEach($scope.permissions, function(value, key) {
        accordionArray.push({
          key: 'permissions_' + key,
          type: 'ovMultiCheckBox',
          wrapper: ['collapse'],
          templateOptions: {
            label: '',
            labelCollapse: value.label,
            options: value.permissions,
            valueProperty: 'id',
            labelProperty: 'name'
          }
        });
      });

      scopeAddForm.fields.push({
        className: 'col-md-8 col-push-md-4',
        fieldGroup: accordionArray
      });
    }

    scopeAddForm.onSubmit = function(model) {
      return addRole(model);
    };
  }

  app.controller('RoleController', RoleController);
  RoleController.$inject = ['$scope', '$filter', 'entityService', 'userService', 'permissions'];

})(angular.module('ov'));
