(function (app) {

  "use strict"

  app.controller("UserController", UserController);
  UserController.$inject = ["$scope", "$filter", "userService", "entityService", "roles"];

  /**
   * Defines the user controller for the user page.
   */
  function UserController($scope, $filter, userService, entityService, roles) {
  
    $scope.roles = roles.data.entities;
    /**
     * 
     * DATATABLE
     */
    var scopeDataTable = $scope.tableContainer = {};
    scopeDataTable.entityType = "user";
    scopeDataTable.filterBy = {
      'name': ''
    };
    scopeDataTable.header = [{
        'key': "name",
        'name': $filter('translate')('USERS.NAME_COLUMN')
      },
      {
        'key': "action",
        'name': $filter('translate')('UI.ACTIONS_COLUMN')
      }];

    scopeDataTable.actions = [{
        "label": $filter('translate')('UI.REMOVE'),
        "condition": function(row) {return !row.locked;},
        "callback": function (row) {
          removeRow(row);
        }
      }];
    scopeDataTable.conditionTogleDetail = function (row) {
      return !row.locked;
    }


    /**
     * FORM
     */
    var scopeEditForm = $scope.editFormContainer = {};
    scopeEditForm.model = {};
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
      }]
    if($scope.roles.length != 0) scopeEditForm.fields.push(
      {
        key: 'roles',
        type: 'horizontalExtendCheckList',
        templateOptions: {
          label: $filter('translate')('USERS.ATTR_ROLE'),
          required: true,
          options: $scope.roles,
          valueProp: 'id',
          labelProp: 'name',
        }
      }
    );

    scopeEditForm.onSubmit = function (model, successCb, errorCb) {
      saveUser(model, successCb, errorCb);
    }

    /**
     * Removes the user.
     * Can't remove a user if its saving.
     * @param Object user The user to remove
     */
    var removeRow = function (row) {
      if (!row.saving) {
        row.saving = true;
        entityService.removeEntity('user', row.id)
                .success(function (data) {
                  $scope.$emit("setAlert", 'success', 'users deleted', 4000);
                })
                .error(function (data, status, headers, config) {
                  $scope.$emit("setAlert", 'danger', 'Fail remove users! Try later.', 4000);
                  row.saving = false;
                  if (status === 401)
                    $scope.$parent.logout();
                });
      }
    };

    /**
     * Saves user.
     * @param Object form The angular edition form controller
     * @param Object user The user associated to the form
     */
    var saveUser = function(user, successCb, errorCb){
      user.saving = true;

      entityService.updateEntity("user", user.id, {
        name : user.name, 
        email : user.email, 
        roles : user.roles
      }).success(function(data, status, headers, config){
        user.saving = false;
        successCb();
      }).error(function(data, status, headers, config){
        user.saving = false;
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
          label: $filter('translate')('USERS.FORM_ADD_NAME'),
          required: true,
          description : $filter('translate')('USERS.FORM_ADD_NAME_DESC')
        }
      },
      {
        key: 'email',
        type: 'horizontalInput',
        templateOptions: {
          type: "email",
          label: $filter('translate')('USERS.FORM_ADD_EMAIL'),
          required: true,
          description : $filter('translate')('USERS.FORM_ADD_EMAIL_DESC')
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
          description : $filter('translate')('USERS.FORM_ADD_PASSWORD_DESC')
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
          description : $filter('translate')('USERS.FORM_ADD_PASSWORD_VALIDATE_DESC')
        },
        expressionProperties: {
          'templateOptions.disabled': '!model.password' // disabled when username is blank
        }
      }
    ];
    if($scope.roles.length == 0)
      scopeAddForm.fields.push({
        noFormControl :true,
        type:"emptyrow",
        templateOptions: {
          label:  $filter('translate')('USERS.FORM_ADD_ROLE'),
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
                  required: true,
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

   
   
    scopeAddForm.onSubmit = function (model, successCb, errorCb) {
      addUser(model, successCb, errorCb);
    }

    /**
     * Adds a user.
     * @param Object form The angular form controller
     */
    var addUser = function(model, successCb, errorCb){   
      if(!model.roles) model.roles = [];
      entityService.addEntity("user", model).success(function(data, status, headers, config){
        successCb();
      }).error(function(data, status, headers, config){
        errorCb();
        if(status === 401)
          $scope.$parent.logout();
      });
    };
  }

})(angular.module("ov"));