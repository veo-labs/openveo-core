'use strict';

(function(angular) {

  var app = angular.module('ov.tableForm', ['ov.i18n', 'ngSanitize']);

  /**
   * Defines a service reload Table.
   */
  function TableReloadEventService($rootScope) {
    var sharedService = {};

    // deliver a broadcast service to reload datatable
    sharedService.broadcast = function(callback) {
      $rootScope.$broadcast('reloadDataTable', {callback: callback});
    };
    return sharedService;
  }

  /**
   * Defines a DatePicker controller.
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
    var pluginName = $scope.editFormContainer.pluginName;

    // Formly form options
    // "showForm" property helps switching between edition and literals representation of fields
    this.options = {
      formState: {
        showForm: false
      }
    };

    // Force formly fields to execute their expressions when showForm changes
    // This will execute all hideExpressions
    $scope.$watch('fec.options.formState.showForm', function() {
      angular.forEach(self.fields, function(field) {
        field.runExpressions && field.runExpressions();
      });
    }, true);

    // Reset form model when the scope is destroyed
    $scope.$on('$destroy', function() {
      self.cancelForm();
    });

    // init the form on a row
    this.init = function(row) {
      self.model = row;

      // Call init function if defined to set up dynamically some fields
      if ($scope.editFormContainer.init)
        $scope.editFormContainer.init(row);

      self.fields = $scope.editFormContainer.fields;
    };

    // Condition on a row to be edited
    this.conditionEditDetail = $scope.editFormContainer.conditionEditDetail || function() {
      return true;
    };

    this.updateRowBeforeEdit = function(tableRow, lastValueInDb) {
      if ($scope.editFormContainer.updateRowObjectBeforeEdit)
        $scope.editFormContainer.updateRowObjectBeforeEdit(tableRow, lastValueInDb);
      var cacheMustBeDeleted = false;
      for (var attrname in lastValueInDb) {
        if (tableRow[attrname] && typeof tableRow[attrname] !== 'object' &&
                tableRow[attrname] != lastValueInDb[attrname]) {
          cacheMustBeDeleted = true;
          tableRow[attrname] = lastValueInDb[attrname];
        }
      }

      // return if cache need to be deleted (true if any value is change between TableRow and lastValueInDb
      return cacheMustBeDeleted;
    };

    var oldEditModel;

    // When submit the form
    this.onSubmit = function() {
      self.model.saving = true;

      // Call submit function must return Promises
      $scope.editFormContainer.onSubmit(self.model).then(function() {

        // on success
        // save value in the fields as initial value
        self.options.updateInitialValue();
        self.model.saving = false;
        self.options.formState.showForm = false;
        tableReloadEventService.broadcast();
      }, function() {

        // on error
        // reset the form
        self.options.resetModel();
        self.model.saving = false;
        self.model = oldEditModel;
      });
    };

    // Toggle between show and editable information
    this.editForm = function() {
      oldEditModel = angular.copy(self.model);
      entityService.getEntity(type, pluginName, self.model.id).then(function(response) {
        if (response.data.entity) {
          var lastValue = response.data.entity;
          var cacheMustBeDeleted = self.updateRowBeforeEdit(self.model, lastValue);

          if (cacheMustBeDeleted) {
            $scope.$emit('setAlert', 'warning', $filter('translate')('CORE.UI.WARNING_ENTITY_MODIFIED'), 8000);
            entityService.deleteCache(type, pluginName);
          }
        } else {
          entityService.deleteCache(type, pluginName);
          $scope.$emit('setAlert', 'danger', $filter('translate')('CORE.UI.WARNING_ENTITY_DELETED'), 8000);
          tableReloadEventService.broadcast();
          return;
        }
        $scope.editFormContainer.pendingEdition = true;
        self.options.formState.showForm = true;
      });
    };

    this.cancelForm = function() {
      $scope.editFormContainer.pendingEdition = false;
      if (!self.options.formState)
        self.options.formState = {};

      self.options.formState.showForm = false;

      self.options.resetModel();
      self.model = oldEditModel;
    };
  }

  /**
   * Defines a FormAddController.
   */
  function FormAddController($scope, $filter, tableReloadEventService) {
    var self = this;
    this.model = $scope.addFormContainer.model;
    this.fields = $scope.addFormContainer.fields;
    this.isAddButtonDisabled = false;

    this.onSubmit = function() {
      self.isAddButtonDisabled = true;

      // Call submit function must return Promises
      $scope.addFormContainer.onSubmit(self.model).then(function() {

        // on success
        // reset the form
        self.options.resetModel();

        // Reload the table
        tableReloadEventService.broadcast();

        // Emit a success message
        $scope.$emit('setAlert', 'success', $filter('translate')('CORE.UI.SAVE_SUCCESS'), 4000);

        self.isAddButtonDisabled = false;
      }, function() {
        self.isAddButtonDisabled = false;
      });
    };
    this.options = {};
  }

  /**
   * Defines a DataTableController.
   */
  function DataTableController($scope, $uibModal, entityService, $q) {
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
    this.notSortBy = ($scope.tableContainer.init ? $scope.tableContainer.init.notSortBy : []).concat(['action']);

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

    // The name of the plugin the entity belongs to
    var pluginName = $scope.tableContainer.pluginName;

    // Promise that cancel $http
    var canceller = $q.defer();

    // Array of callback to execute on reload success
    var callbackArrayOnReload = [];

    // callback to load Resource on filter, pagination or sort change
    this.getResource = function(params, paramsObj) {
      var param = {};
      if (canceller) {

        // Hack to differentiate cancel from server not repond on HttpInterceptor
        canceller.promise.status = true;
        canceller.resolve();
      }
      canceller = $q.defer();

      // Build query parameters
      var query = [];
      param['limit'] = paramsObj.count;
      param['page'] = paramsObj.page - 1;
      param['sortBy'] = paramsObj.sortBy;
      param['sortOrder'] = paramsObj.sortOrder === 'dsc' ? 'desc' : 'asc';

      self.filterBy.forEach(function(filter) {
        if (filter.value && filter.value != '') {
          switch (filter.type) {
            case 'date':
              var date = new Date(filter.value);
              var datePlus = new Date(date);
              datePlus.setDate(date.getDate() + 1);

              param[filter.param + 'Start'] = date.getTime();
              param[filter.param + 'End'] = datePlus.getTime();
              break;
            case 'select':
              var values = [filter.value];
              if (filter.filterWithChildren) {
                for (var i = 0; i < filter.options.length; i++) {
                  if (filter.options[i].value === filter.value) {
                    if (filter.options[i].children !== '')
                      values = values.concat(filter.options[i].children.split(','));
                    break;
                  }
                }
              }

              param[filter.param] = values;
              break;
            default:
              query.push(filter.value);
              break;
          }
        }
      });

      if (query.length)
        param['query'] = query.join(' ');

      // call entities that match params
      return entityService.getEntities(self.entityType, pluginName, param, canceller.promise).then(function(response) {
        self.rows = response.data.entities;
        self.selectAll = false;
        self.isRowSelected = false;
        response.data.pagination.page++;

        // Execute callback array
        if (callbackArrayOnReload.length) {
          for (var i = 0; i < callbackArrayOnReload.length; i++) {
            callbackArrayOnReload[i]();
          }
          callbackArrayOnReload = [];
        }

        return {
          rows: self.rows,
          header: self.header,
          pagination: response.data.pagination
        };
      }, function(reject) {
        return {};
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
    $scope.$on('reloadDataTable', function(e, arg) {
      if (arg.callback) callbackArrayOnReload.push(arg.callback);
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

    /**
     * Checks / unchecks a table row.
     *
     * @method check
     */
    this.check = function() {
      var allChecked = true;
      self.isRowSelected = false;
      self.commonActionExist = false;

      // Check if at least one row is selected and if all rows are selected or not
      angular.forEach(self.rows, function(row) {
        if (row.selected)
          self.isRowSelected = true;
        else
          allChecked = false;
      });

      self.selectAll = allChecked;
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

      var modalInstance = $uibModal.open({
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
  function ModalInstanceTableController($scope, $uibModalInstance) {
    $scope.ok = function() {
      $uibModalInstance.close(true);
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  }

  app.controller('DataTableController', DataTableController);
  app.controller('FormEditController', FormEditController);
  app.controller('FormAddController', FormAddController);
  app.controller('ModalInstanceTableController', ModalInstanceTableController);
  app.controller('DatePickerController', DatePickerController);
  app.factory('tableReloadEventService', TableReloadEventService);

  // Controller for table, form in table and form outside table
  DataTableController.$inject = ['$scope', '$uibModal', 'entityService', '$q'];
  FormEditController.$inject = ['$scope', '$filter', 'entityService', 'tableReloadEventService'];
  FormAddController.$inject = ['$scope', '$filter', 'tableReloadEventService'];
  ModalInstanceTableController.$inject = ['$scope', '$uibModalInstance'];
  DatePickerController.$inject = ['$scope'];

  // Service to reload a displayed table
  TableReloadEventService.$inject = ['$rootScope'];

})(angular);
