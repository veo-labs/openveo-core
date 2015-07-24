(function (angular) {

  'use strict';

  var app = angular.module("ov.tableForm", []);

  app.controller("DataTableController", DataTableController);
  app.controller("FormController", FormController);
  
  DataTableController.$inject = ["$scope", "entityService"];
  FormController.$inject = ["$scope"];
  
  /**
   * 
   * FormController
   *  
   */
  function FormController($scope){
     var vm = this;
     vm.model = $scope.formContainer.model;
     vm.originalFields = angular.copy(vm.fields);
     vm.fields = $scope.formContainer.fields;
     vm.onSubmit = function(){
       vm.originalFields = angular.copy(vm.fields);
       vm.options.updateInitialValue();
       $scope.formContainer.onSubmit(vm.model);
     }
     vm.options = {};
  }
  
    
  /**
   * 
   * DataTableController
   *  
   */
  function DataTableController($scope, entityService){
    var dataTable = this;
    dataTable.init = {
      'count': 5,
      'page': 1,
      'sortBy': 'name',
      'sortOrder': 'asc'
    };
    
    dataTable.rows = {};
    dataTable.filterBy = angular.copy($scope.tableContainer.filterBy);
    dataTable.header = $scope.tableContainer.header;
    dataTable.actions = $scope.tableContainer.actions;
    dataTable.notSortBy = ["action"];
    dataTable.customTheme = {
      iconUp: 'glyphicon glyphicon-triangle-bottom',
      iconDown: 'glyphicon glyphicon-triangle-top',
      listItemsPerPage: [5, 10, 20, 30],
      itemsPerPage: 10,
      loadOnInit: true
    };
     
    
    dataTable.getResource = function (params, paramsObj) {
      console.log(dataTable.filterBy);
      var param = {};
      param['count'] = paramsObj.count;
      param['page'] = paramsObj.page;
      param['sort'] = {};
      param['sort'][paramsObj.sortBy] = paramsObj.sortOrder=="dsc"? -1: 1;
      param['filter'] = {};
      for (var key in dataTable.filterBy) {
        param['filter'][key] = {"$regex":".*"+dataTable.filterBy[key]+".*"}
      }
      
      return entityService.getEntities('property',param).then(function (response) {
        dataTable.rows = response.data.rows;

        return {
          'rows': dataTable.rows ,
          'header': dataTable.header,
          'pagination': response.data.pagination,
          'sortBy': dataTable.init.sortBy,
          'sortOrder': dataTable.init.sortOrder==-1?"dsc": "asc"
        }
      });
    }
    dataTable.toggleRowDetails = function(row){
      if(!row.saving){
        angular.forEach(dataTable.rows, function (value, key){
          value.opened= (value.id === row.id) ? !value.opened : false;
        })
      }
    };
    dataTable.reloadCallback = function () {};
  }
  
})(angular);