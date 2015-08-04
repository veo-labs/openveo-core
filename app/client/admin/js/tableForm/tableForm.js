(function (angular) {

  'use strict';

  var app = angular.module("ov.tableForm", ["ov.i18n", "ngSanitize"]);

  app.controller("DataTableController", DataTableController);
  app.controller("FormEditController", FormEditController);
  app.controller("FormAddController", FormAddController);
  app.factory("tableReloadEventService", TableReloadEventService);
  app.filter('status',StatusFilter);
  app.filter('category',CategoryFilter);

  // Controller for table, form in table and form outside table
  DataTableController.$inject = ["$scope", "entityService", "$filter"];
  FormEditController.$inject = ["$scope", "$filter"];
  FormAddController.$inject = ["$scope", "$filter", "tableReloadEventService"];

  // Service to reload a displayed table
  TableReloadEventService.$inject = ["$rootScope"];
  
  // Filter to display content in the table (cf. dataTable.html)
  StatusFilter.$inject = ['$filter'];
  CategoryFilter.$inject = ['jsonPath'];
  
  function StatusFilter($filter){
    return function (input, status, errorCode) {
      var type = 'label-danger';
      if(status == 1){
        if(input == 7) type = 'label-success';
        if(input == 6) type = 'label-warning';
      } else if (status == 2){
        type = 'label-info';
      }
      var label = $filter('translate')('VIDEOS.STATE_' + input);
      if(!status) label = label +'('+errorCode+')';
      return "<span class='label "+type+"'>"+label+"</span>";
    };
  };

  function CategoryFilter(jsonPath){
    return function(input, rubrics) {
      var name = jsonPath(rubrics, '$..*[?(@.id=="'+input+'")].title');
      if (name && name.length>0)  return name[0];
      else return "";
    };
  };
  
/**
 * 
 * Service reload Table
 */
 function TableReloadEventService($rootScope) {
    var sharedService = {};
    sharedService.broadcast = function () {
      $rootScope.$broadcast('reloadDataTable');
    };
    return sharedService;
  };
  
  /**
   * 
   * FormController
   *  
   */
  function FormEditController($scope, $filter) {
    var fec = this;
    fec.init = function(row){
      fec.model = row;
      if($scope.editFormContainer.init) $scope.editFormContainer.init(row) ;
      fec.fields = angular.copy($scope.editFormContainer.fields);
      fec.originalFields = angular.copy(fec.fields);
    };
    
    fec.onSubmit = function () {
      $scope.editFormContainer.onSubmit(fec.model, function () {
        fec.options.updateInitialValue();
//        fec.originalFields = angular.copy(fec.fields);
      }, function () {
        fec.options.resetModel();
        $scope.$emit("setAlert", 'danger', $filter('translate')('UI.SAVE_ERROR'), 4000);
      });
    }
    fec.options = {};
  }
  
  /**
   * 
   * FormController
   *  
   */
  function FormAddController($scope, $filter, tableReloadEventService) {
    var vm = this;
    vm.model = $scope.addFormContainer.model;
    vm.originalFields = angular.copy(vm.fields);
    vm.fields = $scope.addFormContainer.fields;
    
    vm.onSubmit = function () {
      $scope.addFormContainer.onSubmit(vm.model, function () {
        vm.options.resetModel();
        tableReloadEventService.broadcast();
        $scope.$emit("setAlert", 'success', $filter('translate')('UI.SAVE_SUCCESS'), 4000);
      }, function () {
        $scope.$emit("setAlert", 'danger', $filter('translate')('UI.SAVE_ERROR'), 4000);
      });
    }
    vm.options = {};
  }


  /**
   * 
   * DataTableController
   *  
   */
  function DataTableController($scope, entityService) {
    var dataTable = this;
    //init value
    dataTable.rows = $scope.tableContainer.rows || {};
    dataTable.entityType = $scope.tableContainer.entityType || "";
    dataTable.conditionTogleDetail = $scope.tableContainer.conditionTogleDetail || function(val){return true};
    dataTable.filterBy = angular.copy($scope.tableContainer.filterBy);
    dataTable.header = $scope.tableContainer.header || [];
    dataTable.actions = $scope.tableContainer.actions || [];
    dataTable.notSortBy = ["action"];
    
    dataTable.init = {
      'count': 10,
      'page': 1,
      'sortBy': dataTable.header[0]['key'],
      'sortOrder': 'asc'
    };
   
    dataTable.customTheme = {
      iconUp: 'glyphicon glyphicon-triangle-bottom',
      iconDown: 'glyphicon glyphicon-triangle-top',
      listItemsPerPage: [5, 10, 20, 30],
      itemsPerPage: 10,
      loadOnInit: true
    };


    dataTable.getResource = function (params, paramsObj) {
      var param = {};
      param['count'] = paramsObj.count;
      param['page'] = paramsObj.page;
      param['sort'] = {};
      param['sort'][paramsObj.sortBy] = paramsObj.sortOrder == "dsc" ? -1 : 1;
      param['filter'] = {};
      for (var key in dataTable.filterBy) {
        if ( dataTable.filterBy[key] != "")
          param['filter'][key] = {"$regex": ".*" + dataTable.filterBy[key] + ".*"}
      }

      return entityService.getEntities(dataTable.entityType, param).then(function (response) {
        dataTable.rows = response.data.rows;

        return {
          'rows': dataTable.rows,
          'header': dataTable.header,
          'pagination': response.data.pagination,
          'sortBy': dataTable.init.sortBy,
          'sortOrder': dataTable.init.sortOrder == -1 ? "dsc" : "asc"
        }
      });
    }
    dataTable.toggleRowDetails = function (row, condition) {
      
      if (!row.saving && condition) {
        angular.forEach(dataTable.rows, function (value, key) {
          value.opened = (value.id === row.id) ? !value.opened : false;
        })
      }
    };
    dataTable.reloadCallback = function () {
    };
    
    $scope.$on('reloadDataTable', function() {
        dataTable.reloadCallback();
    });
    
    dataTable.getDescendantProp = function(obj, desc) {
      var arr = desc.split(".");
      while(arr.length && (obj = obj[arr.shift()]));
      return obj;
    }
  }

})(angular);