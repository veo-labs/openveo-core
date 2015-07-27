(function (angular) {

  'use strict';

  var app = angular.module("ov.tableForm", []);

  app.controller("DataTableController", DataTableController);
  app.controller("FormEditController", FormEditController);
  app.controller("FormAddController", FormAddController);
  app.factory("tableReloadEventService", TableReloadEventService);

  DataTableController.$inject = ["$scope", "entityService", "$filter"];
  FormEditController.$inject = ["$scope", "$filter"];
  FormAddController.$inject = ["$scope", "tableReloadEventService"];

  TableReloadEventService.$inject = ["$rootScope"];

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
    fec.model = $scope.editFormContainer.model;
    fec.originalFields = angular.copy(fec.fields);
    fec.fields = $scope.editFormContainer.fields;
    
    fec.onSubmit = function () {
      $scope.editFormContainer.onSubmit(fec.model, function () {
        fec.options.updateInitialValue();
        fec.originalFields = angular.copy(fec.fields);
      }, function () {
        fec.options.resetModel();
        $scope.$emit("setAlert", 'error', $filter('translate')('UI.SAVE_ERROR'), 4000);
      });
    }
    fec.options = {};
  }
  
  /**
   * 
   * FormController
   *  
   */
  function FormAddController($scope, tableReloadEventService, $filter) {
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
        $scope.$emit("setAlert", 'error', $filter('translate')('UI.SAVE_ERROR'), 4000);
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
    dataTable.rows = {};
    dataTable.filterBy = angular.copy($scope.tableContainer.filterBy);
    dataTable.header = $scope.tableContainer.header;
    dataTable.actions = $scope.tableContainer.actions;
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
        param['filter'][key] = {"$regex": ".*" + dataTable.filterBy[key] + ".*"}
      }

      return entityService.getEntities('property', param).then(function (response) {
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
    dataTable.toggleRowDetails = function (row) {
      if (!row.saving) {
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
  }

})(angular);