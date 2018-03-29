'use strict';

(function(app) {

  /**
   * Defines the user controller for the user page.
   */
  function ApplicationController($scope, $filter, entityService, scopes) {
    var entityType = 'applications';

    /**
     * Translates name and description of each scope.
     */
    function translateScopes() {
      angular.forEach($scope.scopes, function(value) {
        value.name = $filter('translate')(value.name);
        value.description = $filter('translate')(value.description);
      });
    }

    /**
     * Removes a list of applications.
     *
     * @param {Array} selected The list of application ids to remove
     * @param {Function} reload The reload Function to force reloading the table
     */
    function removeRows(selected, reload) {
      entityService.removeEntities(entityType, null, selected.join(','))
        .then(function() {
          $scope.$emit('setAlert', 'success', $filter('translate')('CORE.APPLICATIONS.REMOVE_SUCCESS'), 4000);
          reload();
        });
    }

    /**
     * Saves application.
     *
     * @param {Object} application The application to save
     * @return {Promise} Promise resolving when application has been saved
     */
    function saveApplication(application) {
      return entityService.updateEntity(entityType, null, application.id, {
        name: application.name,
        scopes: application.scopes
      });
    }

    /**
     * Adds an application.
     *
     * @param {Object} application The application to add
     * @return {Promise} Promise resolving when application has been added
     */
    function addApplication(application) {
      return entityService.addEntities(entityType, null, [application]);
    }

    $scope.scopes = scopes.data.scopes;
    translateScopes();

    /*
     *
     * RIGHTS
     *
     */
    $scope.rights = {};
    $scope.rights.add = $scope.checkAccess('core-add-' + entityType);
    $scope.rights.edit = $scope.checkAccess('core-update-' + entityType);
    $scope.rights.delete = $scope.checkAccess('core-delete-' + entityType);

    /*
     *
     * DATATABLE
     */
    var scopeDataTable = $scope.tableContainer = {};
    scopeDataTable.entityType = entityType;
    scopeDataTable.filterBy = [
      {
        key: 'query',
        value: '',
        label: $filter('translate')('CORE.APPLICATIONS.QUERY_FILTER')
      }
    ];
    scopeDataTable.header = [{
      key: 'name',
      name: $filter('translate')('CORE.APPLICATIONS.NAME_COLUMN'),
      class: ['col-xs-11']
    },
    {
      key: 'action',
      name: $filter('translate')('CORE.UI.ACTIONS_COLUMN'),
      class: ['col-xs-1']
    }];

    scopeDataTable.actions = [{
      label: $filter('translate')('CORE.UI.REMOVE'),
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
      scopeEditForm.fields[1].templateOptions.message = row.id;
      scopeEditForm.fields[2].templateOptions.message = row.secret;
    };
    scopeEditForm.fields = [
      {
        key: 'name',
        type: 'horizontalEditableInput',
        templateOptions: {
          label: $filter('translate')('CORE.APPLICATIONS.ATTR_NAME'),
          required: true
        }
      },
      {
        noFormControl: true,
        type: 'emptyrow',
        templateOptions: {
          label: $filter('translate')('CORE.APPLICATIONS.ATTR_ID'),
          message: ''
        }
      },
      {
        noFormControl: true,
        type: 'emptyrow',
        templateOptions: {
          label: $filter('translate')('CORE.APPLICATIONS.ATTR_SECRET'),
          message: ''
        }
      }
    ];
    if ($scope.scopes.length != 0)
      scopeEditForm.fields.push(
        {
          key: 'scopes',
          type: 'horizontalEditableMultiCheckbox',
          templateOptions: {
            label: $filter('translate')('CORE.APPLICATIONS.ATTR_SCOPES'),
            options: $scope.scopes,
            valueProperty: 'id',
            labelProperty: 'name'
          }
        }
      );
    scopeEditForm.conditionEditDetail = function(row) {
      return $scope.rights.edit && !row.locked;
    };
    scopeEditForm.onSubmit = function(model) {
      return saveApplication(model);
    };

    /*
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
          label: $filter('translate')('CORE.APPLICATIONS.FORM_ADD_NAME'),
          required: true,
          description: $filter('translate')('CORE.APPLICATIONS.FORM_ADD_NAME_DESC')
        }
      }
    ];
    if ($scope.scopes.length == 0)
      scopeAddForm.fields.push({
        noFormControl: true,
        template: '<p>' + $filter('translate')('CORE.APPLICATIONS.NO_APPLICATIONS') + '</p>'
      });
    else
      scopeAddForm.fields.push({
        key: 'scopes',
        type: 'horizontalMultiCheckbox',
        templateOptions: {
          label: $filter('translate')('CORE.APPLICATIONS.FORM_ADD_SCOPES'),
          required: false,
          options: $scope.scopes,
          valueProperty: 'id',
          labelProperty: 'name',
          description: $filter('translate')('CORE.APPLICATIONS.FORM_ADD_SCOPES_DESC')
        },
        expressionProperties: {
          'templateOptions.disabled': '!model.name' // disabled when username is blank
        }
      });

    scopeAddForm.onSubmit = function(model) {
      return addApplication(model);
    };

  }

  app.controller('ApplicationController', ApplicationController);
  ApplicationController.$inject = ['$scope', '$filter', 'entityService', 'scopes'];

})(angular.module('ov'));
