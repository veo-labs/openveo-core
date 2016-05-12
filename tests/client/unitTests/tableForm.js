'use strict';

window.assert = chai.assert;

// EntityApp.js
describe('tableForm', function() {
  var $rootScope,
    $controller,
    $filter,
    $scope,
    entityService,
    tableReloadEventService,
    $q;

  // Load entity module
  beforeEach(function() {
    module('ov');
    module('ov.tableForm');
  });

  beforeEach(inject(function(_$rootScope_, _$controller_, _$filter_, _entityService_, _tableReloadEventService_, _$q_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $filter = _$filter_;
    entityService = _entityService_;
    tableReloadEventService = _tableReloadEventService_;
    $q = _$q_;
  }));

  beforeEach(function() {
    $scope = $rootScope.$new();
    $scope.test = {};
    $scope.test.row = [{
      key1: 'test',
      key2: 'test'
    }];
  });

  describe('FormEdit', function() {
    var fec;

    // Initializes tests
    beforeEach(function() {
      $scope.test = {};
      $scope.test.row = [{
        key1: 'test',
        key2: 'test'
      }];
      $scope.editFormContainer = {};
      $scope.editFormContainer.fields = [];

      fec = $controller('FormEditController', {
        $scope: $scope,
        $filter: $filter,
        entityService: entityService,
        tableReloadEventService: tableReloadEventService
      });
      fec.options.resetModel = function() {
      };
    });

    it('Should use fields if defined', function() {
      $scope.editFormContainer.fields = [{
        key: 'key1',
        type: 'test'
      }];

      fec.init({});

      assert.ok(fec.fields.length == 1);
      assert.ok(fec.fields[0].key == 'key1');
    });

    it('Should launch an init function if defined', function() {
      $scope.editFormContainer.init = function(row) {
        angular.forEach(row, function(value, key) {
          $scope.editFormContainer.fields.push({
            key: key,
            type: 'test'
          });
        });
      };

      fec = $controller('FormEditController', {
        $scope: $scope,
        $filter: $filter
      });
      fec.options.resetModel = function() {
      };

      fec.init($scope.test.row[0]);

      // Expect onError to be true
      assert.ok(fec.fields.length == 2);
      assert.ok(fec.fields[0].key == 'key1');
    });

    it('Should launch a submit function and set row saving key to false and call success', function(done) {

      fec = $controller('FormEditController', {
        $scope: $scope,
        $filter: $filter
      });

      // mock
      fec.options = {};
      fec.options.updateInitialValue = function() {
        done();
      };
      fec.options.resetModel = function() {
      };

      $scope.editFormContainer.onSubmit = function(row) {
        assert.ok(row.saving);
        var deferred = $q.defer();
        deferred.resolve();

        return deferred.promise;
      };
      fec.init({});
      fec.onSubmit();
      $rootScope.$apply();
    });

    it('Should launch a submit function and set row saving key to false and call error', function(done) {

      fec = $controller('FormEditController', {
        $scope: $scope,
        $filter: $filter
      });

      // mock
      fec.options = {};
      fec.options.resetModel = function() {
        done();
      };

      $scope.editFormContainer.onSubmit = function(row) {
        assert.ok(row.saving);
        var deferred = $q.defer();
        deferred.reject();

        return deferred.promise;
      };
      fec.init({});
      fec.onSubmit();
      $rootScope.$apply();
    });

  });


  describe('FormAdd', function() {
    var vm;

    // Initializes tests
    beforeEach(function() {
      $scope.test = {};
      $scope.test.row = [{
        key1: 'test',
        key2: 'test'
      }];
      $scope.addFormContainer = {};
      $scope.addFormContainer.fields = [];
    });

    it('Should launch a submit function and call success', function(done) {
      $scope.addFormContainer.model = $scope.test.row[0];
      vm = $controller('FormAddController', {
        $scope: $scope,
        $filter: $filter
      });

      // mock
      vm.options = {};
      vm.options.resetModel = done();

      $scope.addFormContainer.onSubmit = function(row) {
        return $q(function(rs, rj) {});
      };

      vm.onSubmit();
    });

  });

});
