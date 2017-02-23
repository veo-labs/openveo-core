'use strict';

(function(app) {

  /**
   * Defines the group controller for the group page.
   */
  function GroupController($scope, $filter, entityService, userService) {
    var entityType = 'groups';

    /**
     * Adds a group.
     *
     * @param {Object} group Group description object
     * @return {Promise} A promise resolving when the group has been added
     */
    function add(entity) {
      return entityService.addEntity(entityType, null, entity).then(function() {
        userService.cacheClear('permissions');
      });
    }

    /**
     * Saves a group.
     *
     * @param {Object} group Group description obect
     * @param {Promise} A promise resolving when the group has been saved
     */
    function save(entity) {
      return entityService.updateEntity(entityType, null, entity.id, entity).then(function() {
        userService.cacheClear('permissions');
      });
    }

    /**
     * Removes a group.
     *
     * @param {Array} groups The list of group ids to remove
     * @param {Function} reload The reload Function to force reloading the table
     */
    function remove(groups, reload) {
      entityService.removeEntity(entityType, null, groups.join(','))
        .then(function() {
          userService.cacheClear('permissions');
          $scope.$emit('setAlert', 'success', $filter('translate')('CORE.GROUPS.REMOVE_SUCCESS'), 4000);
          reload();
        });
    }

    // Permissions
    $scope.rights = {};
    $scope.rights.add = $scope.checkAccess('core-add-' + entityType);
    $scope.rights.edit = $scope.checkAccess('core-update-' + entityType);
    $scope.rights.delete = $scope.checkAccess('core-delete-' + entityType);

    // Configure add form
    var addForm = $scope.addFormContainer = {};
    addForm.model = {};
    addForm.fields = [
      {
        key: 'name',
        type: 'horizontalInput',
        templateOptions: {
          label: $filter('translate')('CORE.GROUPS.FORM_ADD_NAME'),
          required: true,
          description: $filter('translate')('CORE.GROUPS.FORM_ADD_NAME_DESC')
        }
      },
      {
        key: 'description',
        type: 'horizontalInput',
        templateOptions: {
          label: $filter('translate')('CORE.GROUPS.FORM_ADD_DESCRIPTION'),
          required: true,
          description: $filter('translate')('CORE.GROUPS.FORM_ADD_DESCRIPTION_DESC')
        }
      }
    ];

    addForm.onSubmit = function(model) {
      return add(model);
    };

    // Configure datatable
    var scopeDataTable = $scope.tableContainer = {};
    scopeDataTable.entityType = entityType;
    scopeDataTable.filterBy = [
      {
        key: 'query',
        label: $filter('translate')('CORE.GROUPS.QUERY_FILTER')
      }
    ];
    scopeDataTable.header = [{
      key: 'name',
      name: $filter('translate')('CORE.GROUPS.NAME_COLUMN'),
      class: ['col-xs-11']
    },
    {
      key: 'action',
      name: $filter('translate')('CORE.UI.ACTIONS_COLUMN'),
      class: ['col-xs-1']
    }];

    // Configure the list of actions
    scopeDataTable.actions = [{
      label: $filter('translate')('CORE.UI.REMOVE'),
      warningPopup: true,
      condition: function(row) {
        return $scope.rights.delete && !row.locked && !row.saving;
      },
      callback: function(row, reload) {
        remove([row.id], reload);
      },
      global: function(selected, reload) {
        remove(selected, reload);
      }
    }];

    // Configure edit form
    var editForm = $scope.editFormContainer = {};
    editForm.model = {};
    editForm.entityType = entityType;
    editForm.fields = [
      {
        key: 'name',
        type: 'horizontalEditableInput',
        templateOptions: {
          label: $filter('translate')('CORE.GROUPS.ATTR_NAME'),
          required: true
        }
      },
      {
        key: 'description',
        type: 'horizontalEditableInput',
        templateOptions: {
          label: $filter('translate')('CORE.GROUPS.ATTR_DESCRIPTION'),
          required: true
        }
      }
    ];
    editForm.conditionEditDetail = function(row) {
      return $scope.rights.edit && !row.locked;
    };
    editForm.onSubmit = function(model) {
      return save(model);
    };
  }

  app.controller('GroupController', GroupController);
  GroupController.$inject = ['$scope', '$filter', 'entityService', 'userService'];

})(angular.module('ov'));
