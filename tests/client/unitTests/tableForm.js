"use strict"

window.assert = chai.assert;

// EntityApp.js
describe("tableForm", function () {
var $rootScope, $controller, $filter, $scope, $httpBackend;
  // Load entity module
  beforeEach(function () {
    module("ov.tableForm");
  });
  beforeEach(inject(function (_$rootScope_, _$controller_, _$filter_, _$httpBackend_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $filter = _$filter_;
    $httpBackend = _$httpBackend_;
  }));
  
  beforeEach(function(){
      $scope = $rootScope.$new();
      $scope.test = {};
      $scope.test.row = [{"key1":"test", "key2":"test"}];
    });

  describe("FormEdit", function () {
    var $httpBackend, fec;

    // Initializes tests
    beforeEach(function () {
      $scope.test = {};
      $scope.test.row = [{"key1":"test", "key2":"test"}];
      $scope.editFormContainer={};
      $scope.editFormContainer.fields=[];
      
      fec = $controller("FormEditController", {
        $scope: $scope,
        $filter: $filter
      });
    });

    // Checks if no HTTP request stays without response
    afterEach(function () {     
//      $httpBackend.verifyNoOutstandingExpectation();
//      $httpBackend.verifyNoOutstandingRequest();
    });
    
    it("Should use fields if defined", function () {
      $scope.editFormContainer.fields = [{"key":"key1", "type":"test"}];

      fec.init({});

      assert.ok(fec.fields.length == 1 );
      assert.ok(fec.fields[0].key == "key1" );
    });

    it("Should launch an init function if defined", function () {
      $scope.editFormContainer.init = function(row){
        angular.forEach(row, function (value, key) {
          $scope.editFormContainer.fields.push({"key":key, "type":"test"});
        });
      }

      fec = $controller("FormEditController", {
        $scope: $scope,
        $filter: $filter
      });

      fec.init($scope.test.row[0]);
      // Expect onError to be true
      assert.ok(fec.fields.length == 2 );
      assert.ok(fec.fields[0].key == "key1" );
    });
    
    it("Should launch a submit function and set row saving key to false and call success", function () {
      
      fec = $controller("FormEditController", {
        $scope: $scope,
        $filter: $filter
      });
      //mock
      fec.options = {};
      fec.options.updateInitialValue = function(){assert.ok(true);};
      
      $scope.editFormContainer.onSubmit = function(row, success, error){
        assert.ok(fec.model.saving);
        success();
      }
      fec.init({});
      fec.onSubmit();
      
      assert.notOk(fec.model.saving);
    });
    
    it("Should launch a submit function and set row saving key to false and call error", function () {
      
      fec = $controller("FormEditController", {
        $scope: $scope,
        $filter: $filter
      });
      //mock
      fec.options = {};
      fec.options.resetModel = function(){assert.ok(true);};
      
      $scope.editFormContainer.onSubmit = function(row, success, error){
        assert.ok(fec.model.saving);
        error();
      }
      fec.init({});
      fec.onSubmit();
      
      assert.notOk(fec.model.saving);
    });

  });
  
  
  describe("FormAdd", function () {
    var $httpBackend, vm;

    // Initializes tests
    beforeEach(function () {
      $scope.test = {};
      $scope.test.row = [{"key1":"test", "key2":"test"}];
      $scope.addFormContainer={};
      $scope.addFormContainer.fields=[];
    });

    // Checks if no HTTP request stays without response
    afterEach(function () {     
//      $httpBackend.verifyNoOutstandingExpectation();
//      $httpBackend.verifyNoOutstandingRequest();
    });
    
    it("Should launch a submit function and call success", function (done) {
      $scope.addFormContainer.model = $scope.test.row[0];
      vm = $controller("FormAddController", {
        $scope: $scope,
        $filter: $filter
      });
      //mock
      vm.options = {};
      vm.options.resetModel = done;
      
      $scope.addFormContainer.onSubmit = function(row, success, error){
        success();
      }
      
      vm.onSubmit();
    });

  });

});