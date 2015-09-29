'use strict';

(function(app) {

  /**
   * Defines the user controller for the user page.
   */
  function ApplicationController($scope, $filter, entityService, scopes) {

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
     * @param {Array} selected The list of application ids to remove
     * @param {Function} reload The reload Function to force reloading the table
     */
    function removeRows(selected, reload) {
      entityService.removeEntity('application', selected.join(','))
        .success(function() {
          $scope.$emit('setAlert', 'success', $filter('translate')('APPLICATIONS.REMOVE_SUCCESS'), 4000);
          reload();
        })
        .error(function(data, status) {
          $scope.$emit('setAlert', 'danger', $filter('translate')('APPLICATIONS.REMOVE_FAIL'), 4000);
          if (status === 401)
            $scope.$parent.logout();
        });
    }

    /**
     * Saves application.
     * @param {Object} application The application to save
     * @param {Function} successCb Function to call in case of success
     * @param {Function} errorCb Function to call in case of error
     */
    function saveApplication(application, successCb, errorCb) {
      entityService.updateEntity('application', application.id, {
        name: application.name,
        scopes: application.scopes
      }).success(function() {
        successCb();
      }).error(function(data, status) {
        errorCb();
        if (status === 401)
          $scope.$parent.logout();
      });
    }

    /**
     * Adds an application.
     * @param {Object} application The application to add
     * @param {Function} successCb Function to call in case of success
     * @param {Function} errorCb Function to call in case of error
     */
    function addApplication(application, successCb, errorCb) {
      entityService.addEntity('application', application).success(function() {
        successCb();
      }).error(function(data, status) {
        errorCb();
        if (status === 401)
          $scope.$parent.logout();
      });
    }

    $scope.scopes = scopes.data.scopes;
    translateScopes();

    /**
     *
     * RIGHTS
     *
     */
    $scope.rights = {};
    $scope.rights.add = $scope.checkAccess('create-application');
    $scope.rights.edit = $scope.checkAccess('update-application');
    $scope.rights.delete = $scope.checkAccess('delete-application');

    /**
     *
     * DATATABLE
     */
    var scopeDataTable = $scope.tableContainer = {};
    scopeDataTable.entityType = 'application';
    scopeDataTable.filterBy = [
      {
        key: 'name',
        value: '',
        label: $filter('translate')('APPLICATIONS.TITLE_FILTER')
      }
    ];
    scopeDataTable.header = [{
      key: 'name',
      name: $filter('translate')('APPLICATIONS.NAME_COLUMN'),
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

    /*
     * FORM
     */
    var scopeEditForm = $scope.editFormContainer = {};
    scopeEditForm.model = {};
    scopeEditForm.init = function(row) {
      scopeEditForm.fields[1].templateOptions.message = row.id;
      scopeEditForm.fields[2].templateOptions.message = row.secret;
    };
    scopeEditForm.fields = [
      {
        key: 'name',
        type: 'horizontalExtendInput',
        templateOptions: {
          label: $filter('translate')('APPLICATIONS.ATTR_NAME'),
          required: true
        }
      }, {
        noFormControl: true,
        type: 'emptyrow',
        templateOptions: {
          label: $filter('translate')('APPLICATIONS.ATTR_ID'),
          message: ''
        }
      }, {
        noFormControl: true,
        type: 'emptyrow',
        templateOptions: {
          label: $filter('translate')('APPLICATIONS.ATTR_SECRET'),
          message: ''
        }
      }
    ];
    if ($scope.scopes.length != 0)
      scopeEditForm.fields.push(
        {
          key: 'scopes',
          type: 'horizontalExtendCheckList',
          templateOptions: {
            label: $filter('translate')('APPLICATIONS.ATTR_SCOPES'),
            options: $scope.scopes,
            valueProp: 'id',
            labelProp: 'name',
            descProp: 'description'
          }
        }
      );
    scopeEditForm.conditionEditDetail = function(row) {
      return $scope.rights.edit && !row.locked;
    };
    scopeEditForm.onSubmit = function(model, successCb, errorCb) {
      saveApplication(model, successCb, errorCb);
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
          label: $filter('translate')('APPLICATIONS.FORM_ADD_NAME'),
          required: true,
          description: $filter('translate')('APPLICATIONS.FORM_ADD_NAME_DESC')
        }
      }
    ];
    if ($scope.scopes.length == 0)
      scopeAddForm.fields.push({
        noFormControl: true,
        template: '<p>' + $filter('translate')('APPLICATIONS.NO_APPLICATIONS') + '</p>'
      });
    else
      scopeAddForm.fields.push({
        key: 'scopes',
        type: 'horizontalCheckList',
        templateOptions: {
          label: $filter('translate')('APPLICATIONS.FORM_ADD_SCOPES'),
          required: false,
          options: $scope.scopes,
          valueProp: 'id',
          labelProp: 'name',
          description: $filter('translate')('APPLICATIONS.FORM_ADD_SCOPES_DESC')
        },
        expressionProperties: {
          'templateOptions.disabled': '!model.name' // disabled when username is blank
        }
      });

    scopeAddForm.onSubmit = function(model, successCb, errorCb) {
      addApplication(model, successCb, errorCb);
    };

  }

  app.controller('ApplicationController', ApplicationController);
  ApplicationController.$inject = ['$scope', '$filter', 'entityService', 'scopes'];

})(angular.module('ov'));
