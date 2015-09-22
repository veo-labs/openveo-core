'use strict';

window.assert = chai.assert;

// UserController.js
describe('UserController', function() {
  var $rootScope,
    $controller,
    $httpBackend,
    $scope,
    users,
    roles;

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
        id: '146574894654',
        name: 'Example',
        email: 'example@example.com',
        roles: ['154867']
      },
      {
        id: '156789123456',
        name: 'Example2',
        email: 'example2@example2.com',
        roles: ['154867']
      }
    ];

    roles = {
      data: {
        entities: [
          {
            id: '154867',
            name: 'Role example',
            permissions: [
              'perm1',
              'perm2'
            ]
          }
        ]
      }
    };

    $controller('UserController', {
      $scope: $scope,
      users: users,
      roles: roles
    });
  });

  // Checks if no HTTP request stays without response
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // removeUser method
  describe('removeUser', function() {

    it('Should be able to remove a user ', function(done) {
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('DELETE', '/admin/crud/user/146574894654').respond(200);
      $httpBackend.expectDELETE('/admin/crud/user/146574894654');

      $scope.tableContainer.actions[0].callback($scope.test.rows[0], done);

      $httpBackend.flush();
    });

    it('Should be able to remove many users ', function(done) {
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('DELETE', '/admin/crud/user/146574894654,156789123456').respond(200);
      $httpBackend.expectDELETE('/admin/crud/user/146574894654,156789123456');

      $scope.tableContainer.actions[0].global([$scope.test.rows[0].id, $scope.test.rows[1].id], done);

      $httpBackend.flush();
    });

    it('Should logout user if a 401 is returned by the server', function(done) {
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('DELETE', '/admin/crud/user/146574894654').respond(401);
      $httpBackend.expectDELETE('/admin/crud/user/146574894654');

      $rootScope.logout = function() {
        done();
      };

      $scope.tableContainer.actions[0].callback($scope.test.rows[0], function() {
        assert.notOk(true);
      });
      $httpBackend.flush();
    });

  });

  // saveUser method
  describe('saveUser', function() {

    it('Should be able to save a user if not already saving', function(done) {
      $httpBackend.when('DELETE', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('POST', '/admin/crud/user/146574894654').respond(200);
      $httpBackend.expectPOST('/admin/crud/user/146574894654');

      $scope.editFormContainer.onSubmit($scope.test.rows[0], done, function() {
        assert.notOk(true);
      });

      $httpBackend.flush();
    });

    it('Should logout user if a 401 is returned by the server', function(done) {
      $httpBackend.when('DELETE', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('POST', '/admin/crud/user/146574894654').respond(401);
      $httpBackend.expectPOST('/admin/crud/user/146574894654');

      $rootScope.logout = function() {
        done();
      };

      $scope.editFormContainer.onSubmit($scope.test.rows[0], function() {
        assert.notOk(true);
      }, function() {
        assert.ok(true);
      });
      $httpBackend.flush();
    });

  });


  // addUser method
  describe('addUser', function() {

    it('Should be able to add a new user', function(done) {
      $httpBackend.when('DELETE', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('PUT', '/admin/crud/user').respond(200);
      $httpBackend.expectPUT('/admin/crud/user');

      $scope.addFormContainer.onSubmit({},
        done,
        function() {
          assert.notOk(true);
        }
      );

      $httpBackend.flush();
    });

    it('Should logout user if a 401 is returned by the server', function(done) {
      $httpBackend.when('DELETE', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('PUT', '/admin/crud/user').respond(401);
      $httpBackend.expectPUT('/admin/crud/user');

      $rootScope.logout = function() {
        done();
      };

      $scope.addFormContainer.onSubmit({}, function() {
        assert.notOk(true);
      }, function() {
        assert.ok(true);
      });

      $httpBackend.flush();
    });

  });

});
