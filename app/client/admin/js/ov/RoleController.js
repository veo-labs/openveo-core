(function (app) {

  "use strict"

  app.controller("RoleController", RoleController);
  RoleController.$inject = ["$scope", "$filter", "entityService", "permissions"];

  /**
   * Defines the user controller for the user page.
   */
  function RoleController($scope, $filter, entityService, permissions) {
  
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
    scopeDataTable.filterBy = {
      'name': ''
    };
    scopeDataTable.header = [{
        'key': "name",
        'name': $filter('translate')('ROLES.NAME_COLUMN')
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
     * Removes the user.
     * Can't remove a user if its saving.
     * @param Object user The user to remove
     */
    var removeRow = function (row) {
      if (!row.saving) {
        row.saving = true;
        entityService.removeEntity('role', row.id)
                .success(function (data) {
                  $scope.$emit("setAlert", 'success', 'Role deleted', 4000);
                })
                .error(function (data, status, headers, config) {
                  $scope.$emit("setAlert", 'danger', 'Fail remove Role! Try later.', 4000);
                  row.saving = false;
                  if (status === 401)
                    $scope.$parent.logout();
                });
      }
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