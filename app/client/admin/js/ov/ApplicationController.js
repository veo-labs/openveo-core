(function (app) {

  "use strict"

  app.controller("ApplicationController", ApplicationController);
  ApplicationController.$inject = ["$scope", "$filter", "entityService", "scopes"];

  /**
   * Defines the user controller for the user page.
   */
  function ApplicationController($scope, $filter, entityService, scopes) {
  
    $scope.scopes = scopes.data.scopes;
    translateScopes();
    
    function translateScopes() {
      angular.forEach($scope.scopes, function (value, key) {
        value.name= $filter("translate")(value.name);
        value.description= $filter("translate")(value.description);
      });
    }
    /**
     * 
     * DATATABLE
     */
    var scopeDataTable = $scope.tableContainer = {};
    scopeDataTable.entityType = "application";
    scopeDataTable.filterBy = {
      'name': ''
    };
    scopeDataTable.header = [{
        'key': "name",
        'name': $filter('translate')('APPLICATIONS.NAME_COLUMN')
      },
      {
        'key': "action",
        'name': $filter('translate')('UI.ACTIONS_COLUMN')
      }];

    scopeDataTable.actions = [{
        "label": $filter('translate')('UI.REMOVE'),
        "callback": function (row) {
          removeRow(row);
        }
      }];

    /**
     * FORM
     */
    var scopeEditForm = $scope.editFormContainer = {};
    scopeEditForm.model = {};
    scopeEditForm.init = function (row) {
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
      },{
        noFormControl :true,
        type:"emptyrow",
        templateOptions: {
          label:  $filter('translate')('APPLICATIONS.ATTR_ID'),
          message: ""
        }
      },{
        noFormControl :true,
        type:"emptyrow",
        templateOptions: {
          label:  $filter('translate')('APPLICATIONS.ATTR_SECRET'),
          message: ""
        }
      }
    ];
    if($scope.scopes.length != 0) 
      scopeEditForm.fields.push(
      {
        key: 'scopes',
        type: 'horizontalExtendCheckList',
        templateOptions: {
          label: $filter('translate')('APPLICATIONS.ATTR_SCOPES'),
          options: $scope.scopes,
          valueProp: 'id',
          labelProp: 'name',
          descProp: 'description',
        }
      }
    );

    scopeEditForm.onSubmit = function (model, successCb, errorCb) {
      saveApplication(model, successCb, errorCb);
    }

    /**
     * Removes the user.
     * Can't remove a user if its saving.
     * @param Object user The user to remove
     */
    var removeRow = function (row) {
      if (!row.saving) {
        row.saving = true;
        entityService.removeEntity('application', row.id)
                .success(function (data) {
                  $scope.$emit("setAlert", 'success', 'Application deleted', 4000);
                })
                .error(function (data, status, headers, config) {
                  $scope.$emit("setAlert", 'danger', 'Fail remove Application! Try later.', 4000);
                  row.saving = false;
                  if (status === 401)
                    $scope.$parent.logout();
                });
      }
    };

    /**
     * Saves application.
     * @param Object form The angular edition form controller
     * @param Object application The application associated to the form
     */
    var saveApplication = function(application, successCb, errorCb){
      application.saving = true;

      entityService.updateEntity("application", application.id, {
        name : application.name,
        scopes : application.scopes
      }).success(function(data, status, headers, config){
        application.saving = false;
        successCb();
      }).error(function(data, status, headers, config){
        application.saving = false;
        errorCb();
        if(status === 401)
          $scope.$parent.logout();
      });
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
          label: $filter('translate')('APPLICATIONS.FORM_ADD_NAME'),
          required: true,
          description : $filter('translate')('APPLICATIONS.FORM_ADD_NAME_DESC')
        }
      }
    ];
    if($scope.scopes.length == 0)
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
          required: true,
          options: $scope.scopes,
          valueProp: 'id',
          labelProp: 'name',
          description: $filter('translate')('APPLICATIONS.FORM_ADD_SCOPES_DESC')
        },
        expressionProperties: {
          'templateOptions.disabled': '!model.name' // disabled when username is blank
        }
      });
   
    scopeAddForm.onSubmit = function (model, successCb, errorCb) {
      addApplication(model, successCb, errorCb);
    }

    /**
     * Adds a user.
     * @param Object form The angular form controller
     */
    var addApplication = function(model, successCb, errorCb){     
      entityService.addEntity("application", model).success(function(data, status, headers, config){
        successCb();
      }).error(function(data, status, headers, config){
        errorCb();
        if(status === 401)
          $scope.$parent.logout();
      });
    };
  }

})(angular.module("ov"));