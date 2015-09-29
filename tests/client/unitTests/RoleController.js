'use strict';

window.assert = chai.assert;

// RoleController.js
describe('RoleController', function() {
  var $rootScope,
    $controller,
    $httpBackend,
    scope,
    roles,
    permissions;

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
    scope = $rootScope.$new();
    scope.checkAccess = function() {
      return true;
    };
    scope.test = {};
    scope.test.rows = [
      {
        id: '146574894654',
        name: 'Example',
        permissions: [
          'perm1',
          'perm2'
        ]
      },
      {
        id: '146571234567',
        name: 'Example2',
        permissions: [
          'perm1',
          'perm3'
        ]
      }
    ];

    permissions = {
      data: {
        permissions: [
          {
            label: 'Group label',
            permissions: [
              {
                id: 'perm1',
                description: 'description 1',
                name: 'name 1'
              },
              {
                id: 'perm2',
                description: 'description 2',
                name: 'name 2'
              },
              {
                label: 'Group 2 label',
                permissions: [
                  {
                    id: 'perm3',
                    description: 'description 3',
                    name: 'name 3'
                  }
                ]
              }
            ]
          }
        ]
      }
    };

    $controller('RoleController', {
      $scope: scope,
      roles: roles,
      permissions: permissions
    });
  });

  // Checks if no HTTP request stays without response
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // removeRole method
  describe('removeRole', function() {

    it('Should be able to remove a role ', function(done) {
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('DELETE', '/be/crud/role/146574894654').respond(200);
      $httpBackend.expectDELETE('/be/crud/role/146574894654');

      scope.tableContainer.actions[0].callback(scope.test.rows[0], done);

      $httpBackend.flush();
    });

    it('Should be able to remove many roles ', function(done) {
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('DELETE', '/be/crud/role/146574894654,146571234567').respond(200);
      $httpBackend.expectDELETE('/be/crud/role/146574894654,146571234567');

      scope.tableContainer.actions[0].global([scope.test.rows[0].id, scope.test.rows[1].id], done);

      $httpBackend.flush();
    });

    it('Should logout user if a 401 is returned by the server', function(done) {
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('DELETE', '/be/crud/role/146574894654').respond(401);
      $httpBackend.expectDELETE('/be/crud/role/146574894654');

      $rootScope.logout = function() {
        done();
      };

      scope.tableContainer.actions[0].callback(scope.test.rows[0], function() {
        assert.notOk('everything');
      });
      $httpBackend.flush();
    });

  });

  // saveRole method
  describe('saveRole', function() {

    it('Should be able to save a role if not already saving', function(done) {
      $httpBackend.when('DELETE', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('POST', '/be/crud/role/146574894654').respond(200);
      $httpBackend.expectPOST('/be/crud/role/146574894654');

      var editRole = {
        id: '146574894654',
        name: 'Example',
        permissions: {
          group1: [
            'perm1',
            'perm2'
          ],
          group2: [
            'perm3'
          ]
        }
      };
      scope.editFormContainer.onSubmit(editRole, done, function() {
        assert.notOk(true);
      });

      $httpBackend.flush();
    });

    it('Should logout user if a 401 is returned by the server', function(done) {
      $httpBackend.when('DELETE', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
      $httpBackend.when('POST', '/be/crud/role/146574894654').respond(401);
      $httpBackend.expectPOST('/be/crud/role/146574894654');

      $rootScope.logout = function() {
        done();
      };
      var editRole = {
        id: '146574894654',
        name: 'Example',
        permissions: {
          group1: [
            'perm1',
            'perm2'
          ],
          group2: [
            'perm3'
          ]
        }
      };

      scope.editFormContainer.onSubmit(editRole, function() {
        assert.notOk(true);
      }, function() {
        assert.ok(true);
      });
      $httpBackend.flush();
    });

  });

  // addRole method
  describe('addRole', function() {

    it('Should be able to add a new role', function(done) {
      $httpBackend.when('DELETE', /.*/).respond(200, '');
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('PUT', '/be/crud/role').respond(200);

      var addRole = {
        name: 'Example',
        permissions: {
          group0: [
            'perm1',
            'perm2'
          ],
          group1: [
            'perm3'
          ]
        }
      };

      scope.addFormContainer.onSubmit(addRole,
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
      $httpBackend.when('PUT', '/be/crud/role').respond(401);
      $httpBackend.expectPUT('/be/crud/role');

      var addRole = {
        name: 'Example',
        permissions: {
          group0: [
            'perm1',
            'perm2'
          ],
          group1: [
            'perm3'
          ]
        }
      };

      $rootScope.logout = function() {
        done();
      };

      scope.addFormContainer.onSubmit(addRole, function() {
        assert.notOk(true);
      }, function() {
        assert.ok(true);
      });

      $httpBackend.flush();
    });

  });
});
