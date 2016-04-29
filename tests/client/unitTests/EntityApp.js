'use strict';

window.assert = chai.assert;

// EntityApp.js
describe('EntityApp', function() {

  // Load entity module
  beforeEach(function() {
    module('ov.entity');
  });

  // entityService
  describe('entityService', function() {
    var $httpBackend,
      entityService;

    // Dependencies injections
    beforeEach(inject(function(_$httpBackend_, _entityService_) {
      $httpBackend = _$httpBackend_;
      entityService = _entityService_;
    }));

    // Prepares HTTP responses
    beforeEach(function() {
      $httpBackend.when('POST', /.*/).respond(200, '');
      $httpBackend.when('DELETE', /.*/).respond(200, '');
      $httpBackend.when('PUT', /.*/).respond(200, '');
    });

    // Checks if no HTTP request stays without response
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('Should be able to ask server to remove an entity', function() {
      $httpBackend.when('GET', /.*/).respond(200, '');
      $httpBackend.expectDELETE('/be/roles/1');
      entityService.removeEntity('roles', null, 1);
      $httpBackend.flush();
    });

    it('Should be able to ask server to add a new entity', function() {
      $httpBackend.when('GET', /.*/).respond(200, '');
      var role = {
        name: 'Example',
        permissions: {
          perm1: {
            activated: true
          }
        }
      };
      $httpBackend.expectPUT('/be/roles', role);

      entityService.addEntity('roles', null, {
        name: role.name,
        permissions: role.permissions
      });
      $httpBackend.flush();
    });

    it('Should be able to ask server to update an entity', function() {
      $httpBackend.when('GET', /.*/).respond(200, '');
      var role = {
        name: 'Example',
        permissions: {
          perm1: {
            activated: true
          }
        }
      };
      $httpBackend.expectPOST('/be/roles/1', role);
      entityService.updateEntity('roles', null, '1', {
        name: role.name,
        permissions: role.permissions
      });
      $httpBackend.flush();
    });

  });

});
