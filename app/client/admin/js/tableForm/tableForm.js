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
  DataTableController.$inject = ["$scope", "entityService"];
  FormEditController.$inject = ["$scope", "$filter"];
  FormAddController.$inject = ["$scope", "$filter", "tableReloadEventService"];

  // Service to reload a displayed table
  TableReloadEventService.$inject = ["$rootScope"];
  
  // Filter to display content in the table (cf. dataTable.html)
  StatusFilter.$inject = ['$filter'];
  CategoryFilter.$inject = ['jsonPath'];
  
 /**
 * 
 * Filter to print Satus in cells
 * 
 */
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
  
/**
 * 
 * Filter to print Category in cells
 * 
 */
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
      //Call init function if defined to set up dynamically some fields
      if($scope.editFormContainer.init) $scope.editFormContainer.init(row) ;
      fec.fields = $scope.editFormContainer.fields;
      fec.originalFields = fec.fields;
    };
    
    fec.onSubmit = function () {
      //Call submit function
      $scope.editFormContainer.onSubmit(fec.model, function () {
        //on success 
        //save value in the fields as initial value
        fec.options.updateInitialValue();
      }, function () {
        //on error 
        //reset the form
        fec.options.resetModel();
        $scope.$emit("setAlert", 'danger', $filter('translate')('UI.SAVE_ERROR'), 4000);
      });
    }
    fec.options = {};
    fec.editForm = function(){
      $scope.editFormContainer.pendingEdition = true;
      fec.form.$show();
    }
    fec.cancelForm = function(){
      $scope.editFormContainer.pendingEdition = false;
      fec.form.$cancel();
    }
  }
  
  /**
   * 
   * FormController
   *  
   */
  function FormAddController($scope, $filter, tableReloadEventService) {
    var vm = this;
    vm.model = $scope.addFormContainer.model;
//    vm.originalFields = angular.copy(vm.fields);
    vm.fields = $scope.addFormContainer.fields;
    
    vm.onSubmit = function () {
      //Call submit function
      $scope.addFormContainer.onSubmit(vm.model, function () {
        //on success 
        //reset the form
        vm.options.resetModel();
        // reload the table
        tableReloadEventService.broadcast();
        // emit a succeed message
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
    // All data
    dataTable.rows = $scope.tableContainer.rows || {};
    //Entity to call
    dataTable.entityType = $scope.tableContainer.entityType || "";
    
    //Condition on a row to alow toggle detail
    dataTable.conditionTogleDetail = $scope.tableContainer.conditionTogleDetail || function(val){return true};
    
    //Filter key list
    dataTable.filterBy = angular.copy($scope.tableContainer.filterBy);
    
    //Header list
    dataTable.header = $scope.tableContainer.header || [];
    
    //action object to display in le actions list
    dataTable.actions = $scope.tableContainer.actions || [];
    
    //Column unsortable
    dataTable.notSortBy = ["action"];
    
    //hide selected checkbox
    dataTable.showSelectAll = $scope.tableContainer.showSelectAll || true;
    //is a row selected
    dataTable.isRowSelected = false;
    
    // Init Datatable
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
    
    if(dataTable.showSelectAll) dataTable.customTheme['templateHeadUrl'] = 'views/elements/head.html';
    
    //callback to load Resource on filter, pagination or sort change
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
      //call entities that match params
      return entityService.getEntities(dataTable.entityType, param).then(function (response) {
        dataTable.rows = response.data.rows;
        dataTable.selectAll = false;
        dataTable.isRowSelected = false;
        return {
          'rows': dataTable.rows,
          'header': dataTable.header,
          'pagination': response.data.pagination,
          'sortBy': dataTable.init.sortBy,
          'sortOrder': dataTable.init.sortOrder == -1 ? "dsc" : "asc"
        }
      });
    }
    
    //function to toggle detail
    dataTable.toggleRowDetails = function (row, condition) {
      if (!row.saving && condition) {
        angular.forEach(dataTable.rows, function (value, key) {
          value.opened = (value.id === row.id) ? !value.opened : false;
          $scope.editFormContainer.pendingEdition=false;
        })
      }
    };
    
    //function to call manually to reload dataTable
    dataTable.reloadCallback = function () {
    };
    
    //Broadcast listner to reload dataTable (on add row for exemple)
    $scope.$on('reloadDataTable', function() {
        dataTable.reloadCallback();
         dataTable.selectAll = false;
    });
    
    // helper to get value of en entity by accessing is property by a string 'ob1.prop1.child1'
    dataTable.getDescendantProp = function(obj, desc) {
      var arr = desc.split(".");
      while(arr.length && (obj = obj[arr.shift()]));
      return obj;
    }
    // call to check all selection checkbox
    dataTable.checkAllCondition = function(){
      for(var i=0; i<dataTable.rows.length; i++){
        var row = dataTable.rows[i];
        if(!row.locked){
          return true;
        }
      }
      return false;
    }
    
    // call to check all selection checkbox
    dataTable.checkAll = function () {
        angular.forEach(dataTable.rows, function (row) {
            row.selected = dataTable.selectAll;
            dataTable.isRowSelected = dataTable.selectAll;
        });
    };
    // call to uncheck the global selection checkbox
    dataTable.uncheckOne = function(){
        dataTable.selectAll = false;
        dataTable.isRowSelected = false;
        angular.forEach(dataTable.rows, function (row) {
          if(row.selected) dataTable.isRowSelected = true;
        });
    };
    
    // Verify if an action is enable for all row
    dataTable.verifyCondition = function(action){
      var enable = true;
      for(var i=0; i<dataTable.rows.length && enable; i++){
        var row = dataTable.rows[i];
        if(row.selected && !row.locked){
          var condition = !action.condition || action.condition(row);
          enable = enable && action.global && condition;
        }
      }
      return enable;
    }
    
    // Execute an action on all selected row
    dataTable.executeGlobalAction = function(action){
      var selected = [];
      for(var i=0; i<dataTable.rows.length; i++){
        var  row = dataTable.rows[i];
        if(row.selected && !row.locked)
          selected.push(row.id);
      }
      action.global(selected);
    }
  }

})(angular);