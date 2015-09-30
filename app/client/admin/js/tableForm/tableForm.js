'use strict';

(function(angular) {

  var app = angular.module('ov.tableForm', ['ov.i18n', 'ngSanitize']);

  /**
   * Defines a service reload Table
   */
  function TableReloadEventService($rootScope) {
    var sharedService = {};

    // deliver a broadcast service to reload datatable
    sharedService.broadcast = function() {
      $rootScope.$broadcast('reloadDataTable');
    };
    return sharedService;
  }

  /**
   *  Defines a DatePicker controller.
   */
  function DatePickerController() {
    var self = this;

    self.today = function() {
      self.dt = new Date();
    };
    self.today();

    self.clear = function() {
      self.dt = null;
    };

    self.toggleMax = function() {
      self.maxDate = self.maxDate ? null : new Date();
    };
    self.toggleMax();

    self.open = function() {
      self.status.opened = true;
    };

    self.dateOptions = {
      startingDay: 1
    };
    self.status = {
      opened: false
    };
  }

  /**
   * Defines a FormEditController.
   */
  function FormEditController($scope, $filter, entityService, tableReloadEventService) {

    var self = this;
    var type = $scope.editFormContainer.entityType || '';

    // init the form on a row
    this.init = function(row) {
      self.model = row;

      // Call init function if defined to set up dynamically some fields
      if ($scope.editFormContainer.init)
        $scope.editFormContainer.init(row);
      self.fields = $scope.editFormContainer.fields;
      self.originalFields = self.fields;
    };

    // Condition on a row to be edited
    this.conditionEditDetail = $scope.editFormContainer.conditionEditDetail || function() {
      return true;
    };

    // When submit the form
    this.onSubmit = function() {
      if ($scope.editFormContainer.onSubmit) {
        self.model.saving = true;

        // Call submit function
        $scope.editFormContainer.onSubmit(self.model, function() {

          // on success
          // save value in the fields as initial value
          self.options.updateInitialValue();
          self.model.saving = false;
        }, function() {

          // on error
          // reset the form
          self.options.resetModel();
          $scope.$emit('setAlert', 'danger', $filter('translate')('UI.SAVE_ERROR'), 4000);
          self.model.saving = false;
        });
      } else {

        // if there is no submit function : alert
        $scope.$emit('setAlert', 'danger', $filter('translate')('UI.SAVE_ERROR'), 4000);
      }
    };
    this.options = {};
    var cacheMustBeDeleted = false;

    // Toggle between show and editable information
    this.editForm = function() {
      entityService.getEntity(type, self.model.id).then(function(response) {
        if (response.data.entity) {
          var lastValue = response.data.entity;

          for (var attrname in lastValue) {
            if (self.model[attrname] != lastValue[attrname]) {
              cacheMustBeDeleted = true;
            }
            self.model[attrname] = lastValue[attrname];
          }
          if (cacheMustBeDeleted) {
            $scope.$emit('setAlert', 'warning', $filter('translate')('UI.WARNING_ENTITY_MODIFIED'), 8000);
            entityService.deleteCache(type);
            cacheMustBeDeleted = false;
          }
        } else {
          entityService.deleteCache(type);
          $scope.$emit('setAlert', 'danger', $filter('translate')('UI.WARNING_ENTITY_DELETED'), 8000);
          tableReloadEventService.broadcast();
          return;
        }
        $scope.editFormContainer.pendingEdition = true;
        self.form.$show();
      });
    };

    this.cancelForm = function() {
      $scope.editFormContainer.pendingEdition = false;
      self.form.$cancel();
    };
  }

  /**
   * Defines a FormAddController.
   */
  function FormAddController($scope, $filter, tableReloadEventService) {
    var self = this;
    this.model = $scope.addFormContainer.model;
    this.fields = $scope.addFormContainer.fields;

    this.onSubmit = function() {

      // Call submit function
      $scope.addFormContainer.onSubmit(self.model, function() {

        // on success
        // reset the form
        self.options.resetModel();

        // Reload the table
        tableReloadEventService.broadcast();

        // Emit a succeed message
        $scope.$emit('setAlert', 'success', $filter('translate')('UI.SAVE_SUCCESS'), 4000);
      }, function() {
        $scope.$emit('setAlert', 'danger', $filter('translate')('UI.SAVE_ERROR'), 4000);
      });
    };
    this.options = {};
  }

  /**
   * Defines a DataTableController.
   */
  function DataTableController($scope, $modal, entityService) {
    var self = this;

    // All data
    this.rows = $scope.tableContainer.rows || {};

    // Entity to call
    this.entityType = $scope.tableContainer.entityType || '';

    // Filter key list
    this.filterBy = angular.copy($scope.tableContainer.filterBy);

    // Header list
    this.header = $scope.tableContainer.header || [];

    // action object to display in le actions list
    this.actions = $scope.tableContainer.actions || [];

    // Column unsortable
    this.notSortBy = ['action'];

    this.conditionToggleDetail = $scope.editFormContainer.conditionToggleDetail || function() {
      return true;
    };

    // hide selected checkbox
    this.showSelectAll = $scope.tableContainer.showSelectAll || true;

    // is a row selected
    this.isRowSelected = false;

    // Init Datatable
    this.init = {
      count: 10,
      page: 1,
      sortBy: $scope.tableContainer.init ? $scope.tableContainer.init.sortBy : this.header[0]['key'],
      sortOrder: $scope.tableContainer.init ? $scope.tableContainer.init.sortOrder : 'asc'
    };

    this.customTheme = {
      iconUp: 'glyphicon glyphicon-triangle-bottom',
      iconDown: 'glyphicon glyphicon-triangle-top',
      listItemsPerPage: [5, 10, 20, 30],
      itemsPerPage: 10,
      loadOnInit: true,
      cellTheme: $scope.tableContainer.cellTheme
    };

    // Enable selectAll option
    if (this.showSelectAll)
      this.customTheme['templateHeadUrl'] = 'views/elements/head.html';

    // Pagination template
    this.customTheme['templateUrl'] = 'views/elements/pagination.html';

    // callback to load Resource on filter, pagination or sort change
    this.getResource = function(params, paramsObj) {
      var param = {};
      param['count'] = paramsObj.count;
      param['page'] = paramsObj.page;
      param['sort'] = {};
      param['sort'][paramsObj.sortBy] = paramsObj.sortOrder == 'dsc' ? -1 : 1;
      param['filter'] = {};
      self.filterBy.forEach(function(filter) {
        if (filter.value && filter.value != '') {
          if (filter.type == 'date') {
            var date = new Date(filter.value);
            var datePlus = new Date(date);
            datePlus.setDate(date.getDate() + 1);
            param['filter'][filter.key] = {
              $gte: date.getTime(),
              $lt: datePlus.getTime()
            };
          } else if (filter.type == 'select') {
            var values = [filter.value];
            if (filter.filterWithChildren) {
              for (var i = 0; i < filter.options.length; i++) {
                if (filter.options[i].value === filter.value) {
                  values = values.concat(filter.options[i].children.split(','));
                  break;
                }
              }
            }

            param['filter'][filter.key] = {
              $in: values
            };
          } else
            param['filter'][filter.key] = {
              $regex: '.*' + filter.value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '.*'
            };
        }
      });

      // call entities that match params
      return entityService.getEntities(self.entityType, param).then(function(response) {
        self.rows = response.data.rows;
        self.selectAll = false;
        self.isRowSelected = false;
        return {
          rows: self.rows,
          header: self.header,
          pagination: response.data.pagination
        };
      });
    };

    // function to toggle detail
    this.toggleRowDetails = function(row) {
      if (self.conditionToggleDetail(row))
        angular.forEach(self.rows, function(value) {
          value.opened = (value.id === row.id) ? !value.opened : false;
          $scope.editFormContainer.pendingEdition = false;
        });
    };

    // function to call manually to reload dataTable
    this.reloadCallback = function() {
      self.selectAll = false;
    };

    // Broadcast listner to reload dataTable (on add row for exemple)
    $scope.$on('reloadDataTable', function() {
      self.reloadCallback();
    });

    this.commonActionExist = false;

    // call to check all unlocked selection checkbox
    this.checkAll = function() {
      self.commonActionExist = false;
      angular.forEach(self.rows, function(row) {
        row.selected = self.selectAll;
      });
      self.isRowSelected = self.selectAll;
    };

    // call to uncheck the global selection checkbox
    this.uncheckOne = function() {
      self.commonActionExist = false;
      self.selectAll = false;
      self.isRowSelected = false;

      // if one still selected, isRowSelected = true
      angular.forEach(self.rows, function(row) {
        if (row.selected)
          self.isRowSelected = true;
      });
    };

    // Verify if an action is enable for all selected row
    this.verifyCondition = function(action) {
      var enable = true;
      for (var i = 0; i < self.rows.length && enable; i++) {
        var row = self.rows[i];
        if (row.selected) {
          var condition = !action.condition || action.condition(row);
          enable = enable && action.global && condition;
        }
      }
      self.commonActionExist = self.commonActionExist || enable;
      return enable;
    };

    // Execute an action on row after calling a popup verifying and reload table
    this.prepareSingleAction = function(action, row) {
      if (action.warningPopup)
        self.openModal(action.callback, row);
      else {
        action.callback(row, self.reloadCallback);
      }
    };

    // Execute an action on all selected row after calling a popup verifying
    this.executeGlobalAction = function(action) {
      var selected = self.getSelectedId();
      self.openModal(action.global, selected);
    };

    // Get All selected row id
    this.getSelectedId = function() {
      var selected = [];
      for (var i = 0; i < self.rows.length; i++) {
        var row = self.rows[i];
        if (row.selected)
          selected.push(row.id);
      }
      return selected;
    };

    // Open a modal, apply callback on OK promise and reload datatable
    this.openModal = function(action, item) {

      var modalInstance = $modal.open({
        templateUrl: 'tableModal.html',
        controller: 'ModalInstanceTableController'
      });

      modalInstance.result.then(function() {
        action(item, self.reloadCallback);
      }, function() {

        // Do nothing

      });
    };
  }

  /**
   * Defines a modal instance for all modals related to the table form.
   */
  function ModalInstanceTableController($scope, $modalInstance) {
    $scope.ok = function() {
      $modalInstance.close(true);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  }

  app.controller('DataTableController', DataTableController);
  app.controller('FormEditController', FormEditController);
  app.controller('FormAddController', FormAddController);
  app.controller('ModalInstanceTableController', ModalInstanceTableController);
  app.controller('DatePickerController', DatePickerController);
  app.factory('tableReloadEventService', TableReloadEventService);

  // Controller for table, form in table and form outside table
  DataTableController.$inject = ['$scope', '$modal', 'entityService'];
  FormEditController.$inject = ['$scope', '$filter', 'entityService', 'tableReloadEventService'];
  FormAddController.$inject = ['$scope', '$filter', 'tableReloadEventService'];
  ModalInstanceTableController.$inject = ['$scope', '$modalInstance'];
  DatePickerController.$inject = ['$scope'];

  // Service to reload a displayed table
  TableReloadEventService.$inject = ['$rootScope'];

})(angular);
