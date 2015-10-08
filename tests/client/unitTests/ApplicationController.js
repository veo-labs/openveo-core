'use strict';

window.assert = chai.assert;

// ApplicationController.js
describe('ApplicationController', function() {
  var $rootScope,
    $controller,
    $httpBackend,
    $scope,
    scopes;

  // Load openveo application
  beforeEach(module('ov'));

  // Dependencies injections
  beforeEach(inject(function(_$rootScope_, _$controller_, _$httpBackend_) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $controller = _$controller_;
  }));

  // Generates scope and data
  beforeEach(function() {
    $scope = $rootScope.$new();
    $scope.checkAccess = function() {
      return true;
    };
    $scope.test = {};
    $scope.test.rows = [
      {
        id: '7bff6606c8fc4e1259ff44342ad870502dbcf9d5',
        name: 'Example',
        scopes: [
          'scope1',
          'scope2'
        ],
        secret: '7532552b97cba918c5118a8a10bb7b5f8dbd5ab0'
      },
      {
        id: '4e125dbcf9d9fa7bff6606c8fc0f44342',
        name: 'Example2',
        scopes: [
          'scope2',
          'scope3'
        ],
        secret: '7532552b97cba918c5118a8a10bb7b5f8dbd5ab0'
      }
    ];

    scopes = {
      data: {
        scopes: [
          {
            id: 'scope1',
            description: 'description 1',
            name: 'name 1'
          },
          {
            id: 'scope2',
            description: 'description 2',
            name: 'name 2'
          },
          {
            id: 'scope3',
            description: 'description 3',
            name: 'name 3'
          }
        ]
      }
    };

    $controller('ApplicationController', {
      $scope: $scope,
      scopes: scopes
    });
  });

  // Checks if no HTTP request stays without response
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // removeApplication method
  describe('removeApplication', function() {

    it('Should be able to remove an application ', function(done) {
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('DELETE',
        '/be/crud/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5').respond(
        200);
      $httpBackend.expectDELETE(
        '/be/crud/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5');

      $scope.tableContainer.actions[0].callback($scope.test.rows[0], done);

      $httpBackend.flush();
    });

    it('Should be able to remove many applications ', function(done) {
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('DELETE',
        '/be/crud/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5,4e125dbcf9d9fa7bff6606c8fc0f44342').respond(
        200);
      $httpBackend.expectDELETE(
        '/be/crud/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5,4e125dbcf9d9fa7bff6606c8fc0f44342');

      $scope.tableContainer.actions[0].global(
        [$scope.test.rows[0].id, $scope.test.rows[1].id], done);

      $httpBackend.flush();
    });

    it('Should logout user if a 401 is returned by the server',
      function(done) {
        $httpBackend.when('POST', /.*/).respond(200, '');
        $httpBackend.when('GET', /.*/).respond(200, '');
        $httpBackend.when('PUT', /.*/).respond(200, '');
        $httpBackend.when('DELETE',
          '/be/crud/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5').respond(
          401);
        $httpBackend.expectDELETE(
          '/be/crud/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5');

        $rootScope.$on('forceLogout', function() {
          done();
        });

        $scope.tableContainer.actions[0].callback($scope.test.rows[0],
          function() {
            assert.notOk('everything');
          });
        $httpBackend.flush();
      });

  });

  // saveApplication method
  describe('saveApplication', function() {

    it('Should be able to save an application ', function(done) {
      $httpBackend.when('DELETE', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('POST',
        '/be/crud/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5').respond(
        200);
      $httpBackend.expectPOST(
        '/be/crud/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5');

      $scope.editFormContainer.onSubmit($scope.test.rows[0], done,
        function() {
          assert.notOk(true);
        });

      $httpBackend.flush();
    });

    it('Should logout user if a 401 is returned by the server',
      function(done) {
        $httpBackend.when('DELETE', /.*/).respond(200, '');
        $httpBackend.when('GET', /.*/).respond(200, '');
        $httpBackend.when('PUT', /.*/).respond(200, '');
        $httpBackend.when('POST',
          '/be/crud/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5').respond(
          401);
        $httpBackend.expectPOST(
          '/be/crud/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5');

        $rootScope.$on('forceLogout', function() {
          done();
        });

        $scope.editFormContainer.onSubmit($scope.test.rows[0], function() {
          assert.notOk(true);
        }, function() {
          assert.ok(true);
        });
        $httpBackend.flush();
      });

  });

  // addApplication method
  describe('addApplication', function() {

    it('Should be able to add a new application', function(done) {
      $httpBackend.when('DELETE', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('PUT', '/be/crud/application').respond(200);
      $httpBackend.expectPUT('/be/crud/application');

      $scope.addFormContainer.onSubmit({},
        done,
        function() {
          assert.notOk(true);
        }
      );

      $httpBackend.flush();
    });

    it('Should logout user if a 401 is returned by the server',
      function(done) {
        $httpBackend.when('DELETE', /.*/).respond(200, '');
        $httpBackend.when('GET', /.*/).respond(200, '');
        $httpBackend.when('POST', /.*/).respond(200, '');
        $httpBackend.when('PUT', '/be/crud/application').respond(401);
        $httpBackend.expectPUT('/be/crud/application');

        $rootScope.$on('forceLogout', function() {
          done();
        });

        $scope.addFormContainer.onSubmit({}, function() {
          assert.notOk(true);
        }, function() {
          assert.ok(true);
        });

        $httpBackend.flush();
      });

  });

});
