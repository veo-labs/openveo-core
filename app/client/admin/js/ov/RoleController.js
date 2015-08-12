(function (app) {

  "use strict"

  app.controller("RoleController", RoleController);
  RoleController.$inject = ["$scope", "$filter", "entityService", "userService", "permissions"];

  /**
   * Defines the user controller for the user page.
   */
  function RoleController($scope, $filter, entityService, userService, permissions) {
  
    $scope.permissions = permissions.data.permissions;
    translatePermissions();
    
    function translatePermissions() {
      angular.forEach($scope.permissions, function (value, key) {
        value.label= $filter("translate")(value.label);
        angular.forEach(value.permissions, function (perm, key) {
          perm.name= $filter("translate")(perm.name);
          perm.description= $filter("translate")(perm.description);
        });
      });
    }
    
    /**
     * 
     * DATATABLE
     */
    var scopeDataTable = $scope.tableContainer = {};
    scopeDataTable.entityType = "role";
    scopeDataTable.filterBy = [
      {
        'key': 'name',
        'value': '',
        'label': $filter('translate')('ROLES.TITLE_FILTER')
      }
    ];
    scopeDataTable.header = [{
        'key': "name",
        'name': $filter('translate')('ROLES.NAME_COLUMN'),
        "class": ['col-xs-12 col-sm-11']
      },
      {
        'key': "action",
        'name': $filter('translate')('UI.ACTIONS_COLUMN'),
        "class": [' hidden-xs col-sm-1']
      }];

    scopeDataTable.actions = [{
        "label": $filter('translate')('UI.REMOVE'),
        "warningPopup": true,
        "callback": function (row, reload) {
          removeRows([row.id], reload);
        },
        "global": function(selected, reload){
          removeRows(selected, reload);
        }
      }];

    /**
     * FORM
     */
    var scopeEditForm = $scope.editFormContainer = {};
    scopeEditForm.model = {};
    scopeEditForm.init = function (row) {
      var modelPerm = prepareRolePermission($scope.permissions, row.permissions);
      angular.forEach(modelPerm, function (value, key) {
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
    if($scope.permissions.length == 0)
      scopeEditForm.fields.push({
        noFormControl: true,
        template: '<p>' + $filter('translate')('ROLES.NO_DATA') + '</p>'
      });
    else{ 
      var accordionArray = [];
      scopeEditForm.fields.push({
        noFormControl: true,
        templateOptions:{
          label:$filter('translate')('ROLES.FORM_ADD_PERMISSIONS')
        },
        wrapper:["horizontalBootstrapLabel"],
        template: ""
        
      });
      angular.forEach($scope.permissions, function (value, key) {
        accordionArray.push({
          key: 'permissions.'+key,
          type: 'editableChecklist',
          wrapper: ['collapse'],
          templateOptions: {
            label: "",
            labelCollapse:value.label,
            options: value.permissions,
            valueProp: 'id',
            labelProp: 'name'
          }
        });
      });
//      accordionArray.push({noFormControl: true,template:'</accordion>'});
      scopeEditForm.fields.push({
        className: 'col-sm-8 col-push-sm-4',
        fieldGroup: accordionArray
      });
    }

    scopeEditForm.onSubmit = function (model, successCb, errorCb) {
      savePerm(model, successCb, errorCb);
    }

    /**
     * Removes the role.
     * Can't remove a role if its saving.
     * @param Object role The role to remove
     */
    var removeRows = function (selected, reload) {
        entityService.removeEntity('role', selected.join(','))
                .success(function (data) {
                  userService.cacheClear("roles");
                  $scope.$emit("setAlert", 'success', $filter('translate')('ROLES.REMOVE_SUCCESS'), 4000);
                  reload();
                })
                .error(function (data, status, headers, config) {
                  $scope.$emit("setAlert", 'danger', $filter('translate')('ROLES.REMOVE_FAIL'), 4000);
                  if (status === 401)
                    $scope.$parent.logout();
                });
    };

    /**
     * Saves role.
     * @param Object form The angular edition form controller
     * @param Object role The role associated to the form
     */
    var savePerm = function(permission, successCb, errorCb){
      
      permission.saving = true;
      var entity = getEntitiesFromModel(permission);
      
      entityService.updateEntity("role", permission.id, entity).success(function(data, status, headers, config){
        permission.saving = false;
        permission.permissions = angular.copy(entity.permissions);
        userService.cacheClear("roles");
        successCb();
      }).error(function(data, status, headers, config){
        permission.saving = false;
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
          label: $filter('translate')('ROLES.FORM_ADD_NAME'),
          required: true,
          description : $filter('translate')('ROLES.FORM_ADD_NAME_DESC')
        }
      }
    ];
    if($scope.permissions.length == 0)
      scopeAddForm.fields.push({
        noFormControl: true,
        template: '<p>' + $filter('translate')('ROLES.NO_DATA') + '</p>'
      });
    else{ 
      var accordionArray = [];
      scopeAddForm.fields.push({
        noFormControl: true,
        templateOptions:{
          label:$filter('translate')('ROLES.FORM_ADD_PERMISSIONS')
        },
        wrapper:["horizontalBootstrapLabel"],
        template: ""
        
      });
      angular.forEach($scope.permissions, function (value, key) {
        accordionArray.push({
          key: 'permissions.'+key,
          type: 'multiCheckbox',
          wrapper: ['collapse'],
          templateOptions: {
            label: "",
            labelCollapse:value.label,
            options: value.permissions,
            valueProp: 'id',
            labelProp: 'name'
          }
        });
      });
//      accordionArray.push({noFormControl: true,template:'</accordion>'});
      scopeAddForm.fields.push({
        className: 'col-sm-8 col-push-sm-4',
        fieldGroup: accordionArray
      });
    }
    
      
   
    scopeAddForm.onSubmit = function (model, successCb, errorCb) {    
      addRole(model, successCb, errorCb);
    }

    /**
     * Adds a user.
     * @param Object form The angular form controller
     */
    var addRole = function(model, successCb, errorCb){    
      var entity = getEntitiesFromModel(model);
      entityService.addEntity("role", entity).success(function(data, status, headers, config){
       model.permissions = angular.copy(entity.permissions);
       userService.cacheClear("roles");
       successCb();
      }).error(function(data, status, headers, config){
        errorCb();
        if(status === 401)
          $scope.$parent.logout();
      });
    };
    
    var getEntitiesFromModel = function(model){
      var entity = {
        name:model.name, 
        permissions:[]
      };
      angular.forEach(model, function (value, key) {
        if(key.startsWith('permissions.')){
          entity.permissions = entity.permissions.concat(value);
        }
      });
      return entity;
    };
    
    var prepareRolePermission = function(permissions, rolePermissions){
      var modelPerm = {};
      angular.forEach(permissions, function (value, key) {
        angular.forEach(value.permissions, function (valuePerm, keyPerm) {
          if(!modelPerm['permissions.'+key]) modelPerm['permissions.'+key] = [];
          if(rolePermissions.indexOf(valuePerm.id) >= 0) {
            modelPerm['permissions.'+key].push(valuePerm.id);
          }
        });
      });
      return modelPerm;
    };
  }

})(angular.module("ov"));