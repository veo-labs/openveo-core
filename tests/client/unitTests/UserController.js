"use strict"

window.assert = chai.assert;

// UserController.js
describe("UserController", function(){
  var $rootScope, $controller, $httpBackend, $scope, users, roles;

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
    $scope = $rootScope.$new();
    users = {
       data : {
         entities : [
          {
            id : "146574894654",
            name : "Example",
            email : "example@example.com",
            roles : [ "example" ]
          }
        ]
      }
    };

    roles = {
      data : {
        entities : [
          {
            id : "154867",
            name : "Role example",
            permissions : {
              perm1 : {
                activated : true
              },
              perm2 : {
                activated : true
              }
            }
          }
        ]
      }
    };

    $controller("UserController", {
      $scope: $scope,
      users : users,
      roles : roles
    });
  });
  
  // Checks if no HTTP request stays without response
  afterEach(function(){
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  
  // toggleUserDetails method
  describe("toggleUserDetails", function(){
    
    it("Should be able to open the user details", function(){
      $scope.toggleUserDetails($scope.users[0]);
      assert.ok($scope.users[0].opened);
    });
    
    it("Should not open / close user details if user is saving", function(){
      $scope.users[0].saving = true;
      $scope.toggleUserDetails($scope.users[0]);
      assert.notOk($scope.users[0].opened);
    });
    
  });
  
  // removeUser method
  describe("removeUser", function(){

    it("Should be able to remove a user if not saving", function(){
      $httpBackend.when("DELETE", "/admin/crud/user/146574894654").respond(200);
      $httpBackend.expectDELETE("/admin/crud/user/146574894654");

      $scope.users[0].saving = true;
      $scope.removeUser($scope.users[0]);

      $scope.users[0].saving = false;
      $scope.removeUser($scope.users[0]);

      $httpBackend.flush();
      assert.equal($scope.users.length, 0);
    });

    it("Should logout user if a 401 is returned by the server", function(done){
      $httpBackend.when("DELETE", "/admin/crud/user/146574894654").respond(401);
      $httpBackend.expectDELETE("/admin/crud/user/146574894654");

      $rootScope.logout = function(){
        done();
      };

      $scope.removeUser($scope.users[0]);
      $httpBackend.flush();
    });

  });  
  
  // saveUser method
  describe("saveUser", function(){

    it("Should be able to save a user if not already saving", function(done){
      $httpBackend.when("POST", "/admin/crud/user/146574894654").respond(200);
      $httpBackend.expectPOST("/admin/crud/user/146574894654");

      var form = {
        edition : true,
        closeEdition : function(){
          assert.notOk(this.edition);
          done();
        }
      };

      $scope.users[0].saving = true;
      $scope.saveUser(form, $scope.users[0]);

      $scope.users[0].saving = false;
      $scope.users[0].title = "title";
      $scope.saveUser(form, $scope.users[0]);

      $httpBackend.flush();
    });

    it("Should logout user if a 401 is returned by the server", function(done){
      $httpBackend.when("POST", "/admin/crud/user/146574894654").respond(401);
      $httpBackend.expectPOST("/admin/crud/user/146574894654");

      $rootScope.logout = function(){
        done();
      };

      $scope.saveUser({}, $scope.users[0]);
      $httpBackend.flush();
    });

  });  
  
  // toggleEdition method
  describe("toggleEdition", function(){

    it("Should be able to cancel user edition", function(done){

      var form = {
        edition : true,
        cancelEdition : function(){
          assert.notOk(this.edition);
          done();
        }
      };

      $scope.cancelEdition(form);
    });

    it("Should be able to open user edition", function(done){

      var form = {
        edition : false,
        openEdition : function(){
          assert.ok(this.edition);
          done();
        }
      };

      $scope.openEdition(form);

    });
    
  });    
  
  // addUser method
  describe("addUser", function(){
    
    it("Should be able to add a new user", function(){
      $httpBackend.when("PUT", "/admin/crud/user").respond(200, { entity : {
        id : "new user id",
        name : "New user",
        email : "user@user.com",
        roles : [ "role1" ]
      }});
      $httpBackend.expectPUT("/admin/crud/user");
      
      $scope.userName = "User name";
      $scope.userEmail = "User name";
      $scope.userPassword = "User password";
      $scope.userPasswordValidate = "User password";
      $scope.addUser({});

      $httpBackend.flush();
      assert.equal($scope.users.length, 2);
    });
    
    it("Should logout user if a 401 is returned by the server", function(done){
      $httpBackend.when("PUT", "/admin/crud/user").respond(401);
      $httpBackend.expectPUT("/admin/crud/user");
      
      $rootScope.logout = function(){
        done();
      };

      $scope.userName = "User name";
      $scope.addUser({});

      $httpBackend.flush();
    });

  });  
  
});