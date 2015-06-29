"use strict"

window.assert = chai.assert;

// RoleController.js
describe("RoleController", function(){
  var $rootScope, $controller, $httpBackend, scope, roles, permissions;

  // Load openveo application
  beforeEach(module("ov"));

  // Dependencies injections
  beforeEach(inject(function(_$rootScope_, _$controller_, _$httpBackend_){
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $controller = _$controller_;
  }));

  // Generates scope and data
  beforeEach(function(){
    scope = $rootScope.$new();
    roles = {
       data : {
         entities : [
          {
            id : "146574894654",
            name : "Example",
            permissions : [
              {
                id : "perm1",
                activated : true
              },
              {
                id : "perm2",
                activated : true
              }
            ]
          }
        ]
      }
    };

    permissions = {
      data : {
        permissions : [
          {
            label : "Group label",
            permissions : [
              {
                id : "perm1",
                description : "description 1",
                name : "name 1",
                activated : true
              },
              {
                id : "perm2",
                description : "description 2",
                name : "name 2",
                activated : true
              },
              {
                label : "Group 2 label",
                permissions : [
                  {
                    id : "perm3",
                    description : "description 3",
                    name : "name 3",
                    activated : true
                  }
                ]
              }
            ]
          }
        ]
      }
    };

    $controller("RoleController", {
      $scope: scope,
      roles : roles,
      permissions : permissions
    });
  });
  
  // Checks if no HTTP request stays without response
  afterEach(function(){
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  
  // toggleRoleDetails method
  describe("toggleRoleDetails", function(){
    
    it("Should be able to open the role details", function(){
      scope.toggleRoleDetails(scope.roles[0]);
      assert.ok(scope.roles[0].opened);
    });
    
    it("Should not open / close role details if role is saving", function(){
      scope.roles[0].saving = true;
      scope.toggleRoleDetails(scope.roles[0]);
      assert.notOk(scope.roles[0].opened);
    });
    
  });
  
  // removeRole method
  describe("removeRole", function(){

    it("Should be able to remove a role if not saving", function(){
      $httpBackend.when("DELETE", "/admin/crud/role/146574894654").respond(200);
      $httpBackend.expectDELETE("/admin/crud/role/146574894654");

      scope.roles[0].saving = true;
      scope.removeRole(scope.roles[0]);

      scope.roles[0].saving = false;
      scope.removeRole(scope.roles[0]);

      $httpBackend.flush();
      assert.equal(scope.roles.length, 0);
    });

    it("Should logout user if a 401 is returned by the server", function(done){
      $httpBackend.when("DELETE", "/admin/crud/role/146574894654").respond(401);
      $httpBackend.expectDELETE("/admin/crud/role/146574894654");

      $rootScope.logout = function(){
        done();
      };

      scope.removeRole(scope.roles[0]);
      $httpBackend.flush();
    });

  });  
  
  // saveRole method
  describe("saveRole", function(){

    it("Should be able to save a role if not already saving", function(done){
      $httpBackend.when("POST", "/admin/crud/role/146574894654").respond(200);
      $httpBackend.expectPOST("/admin/crud/role/146574894654");

      var form = {
        edition : true,
        closeEdition : function(){
          assert.notOk(this.edition);
          done();
        }
      };

      scope.roles[0].saving = true;
      scope.saveRole(form, scope.roles[0]);

      scope.roles[0].saving = false;
      scope.roles[0].title = "title";
      scope.saveRole(form, scope.roles[0]);

      $httpBackend.flush();
    });

    it("Should logout user if a 401 is returned by the server", function(done){
      $httpBackend.when("POST", "/admin/crud/role/146574894654").respond(401);
      $httpBackend.expectPOST("/admin/crud/role/146574894654");

      $rootScope.logout = function(){
        done();
      };

      scope.saveRole({}, scope.roles[0]);
      $httpBackend.flush();
    });

  });  
  
  // toggleEdition method
  describe("toggleEdition", function(){

    it("Should be able to cancel role edition", function(done){

      var form = {
        edition : true,
        cancelEdition : function(){
          assert.notOk(this.edition);
          done();
        }
      };

      scope.cancelEdition(form);
    });

    it("Should be able to open role edition", function(done){

      var form = {
        edition : false,
        openEdition : function(){
          assert.ok(this.edition);
          done();
        }
      };

      scope.openEdition(form);

    });
    
  });    
  
  // addRole method
  describe("addRole", function(){
    
    it("Should be able to add a new role", function(){
      $httpBackend.when("PUT", "/admin/crud/role").respond(200, { entity : {
        id : "new role id",
        name : "New role",
        permissions : {
          perm1 : {
            description : "description 1",
            name : "name 1",
            activated : true
          }
        }
      }});
      $httpBackend.expectPUT("/admin/crud/role");
      
      scope.roleName = "Role name";
      scope.addRole({});

      $httpBackend.flush();
      assert.equal(scope.roles.length, 2);
    });
    
    it("Should logout user if a 401 is returned by the server", function(done){
      $httpBackend.when("PUT", "/admin/crud/role").respond(401);
      $httpBackend.expectPUT("/admin/crud/role");
      
      $rootScope.logout = function(){
        done();
      };

      scope.roleName = "Role name";
      scope.addRole({});

      $httpBackend.flush();
    });

  });  
  
  // prepareRolesPermissions method
  describe("prepareRolesPermissions", function(){

    it("Should prepare the list of permissions for add form", function(){
      assert.isArray(scope.addRolePermissions);
      assert.equal(scope.addRolePermissions[0].label, scope.permissions[0].label);
      assert.isArray(scope.addRolePermissions[0].options);
      assert.isArray(scope.addRolePermissions[0].values);
    });

  });

  it("Should prepare the list of permissions for each role", function(){
      assert.isArray(scope.roles[0].permissionsValues);
      assert.equal(scope.roles[0].permissionsValues[0].label, scope.permissions[0].label);
      assert.isArray(scope.roles[0].permissionsValues[0].options);
      assert.isArray(scope.roles[0].permissionsValues[0].values);
      assert.equal(scope.roles[0].permissionsValues[0].values[0], "perm1");
      assert.equal(scope.roles[0].permissionsValues[0].values[1], "perm2");
      assert.isArray(scope.roles[0].permissionsValues[0].permissions);
      assert.isArray(scope.roles[0].permissionsValues[0].permissions[0].values);
  });

});