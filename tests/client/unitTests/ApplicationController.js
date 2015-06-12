"use strict"

window.assert = chai.assert;

describe("ApplicationController", function(){

  beforeEach(module("ov"));

  var $rootScope, $controller, $httpBackend, $scope, applications, scopes;

  beforeEach(inject(function(_$rootScope_, _$controller_, _$httpBackend_){
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $controller = _$controller_;
    $scope = $rootScope.$new();
  }));

  beforeEach(function(){
     applications = {
       data : {
         applications : [
          {
            id : "7bff6606c8fc4e1259ff44342ad870502dbcf9d5",
            name : "Example",
            scopes : {
              scope1 : {
                description : "description 1",
                name : "name 1",
                activated : true
              },
              scope2 : {
                description : "description 2",
                name : "name 2",
                activated : true
              }                  
            },
            secret : "7532552b97cba918c5118a8a10bb7b5f8dbd5ab0"
          }
        ]
      }
    };

    scopes = {
      data : {
        scopes : {
          scope1 : {
            description : "description 1",
            name : "name 1",
            activated : true
          },
          scope2 : {
            description : "description 2",
            name : "name 2",
            activated : true
          }
        }
      }
    };
  });
  
  afterEach(function(){
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  
  describe("toggleApplicationDetails", function(){
    
    it("Should be able to open the application details", function(){
      $controller("ApplicationController", {
        $scope: $scope,
        applications : applications,
        scopes : scopes
      });

      $scope.toggleApplicationDetails($scope.applications[0]);
      assert.ok($scope.applications[0].opened);
    });
    
    it("Should not open / close application details if application is saving", function(){
      $controller("ApplicationController", {
        $scope: $scope,
        applications : applications,
        scopes : scopes
      });

      $scope.applications[0].saving = true;
      $scope.toggleApplicationDetails($scope.applications[0]);
      assert.notOk($scope.applications[0].opened);
    });
    
  });
  
  describe("removeApplication", function(){

    it("Should be able to remove an application if not saving", function(){
      $httpBackend.when("DELETE", "/admin/ws/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5").respond(200);
      $httpBackend.expectDELETE("/admin/ws/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5");

      $controller("ApplicationController", {
        $scope: $scope,
        applications : applications,
        scopes : scopes
      });

      $scope.applications[0].saving = true;
      $scope.removeApplication($scope.applications[0]);

      $scope.applications[0].saving = false;
      $scope.removeApplication($scope.applications[0]);
      $httpBackend.flush();
      assert.equal($scope.applications.length, 0);
    });

    it("Should logout user if a 401 is returned by the server", function(done){
      $httpBackend.when("DELETE", "/admin/ws/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5").respond(401);
      $httpBackend.expectDELETE("/admin/ws/application/7bff6606c8fc4e1259ff44342ad870502dbcf9d5");

      $rootScope.logout = function(){
        done();
      };

      $controller("ApplicationController", {
        $scope: $scope,
        applications : applications,
        scopes : scopes
      });

      $scope.removeApplication($scope.applications[0]);
      $httpBackend.flush();
    });

  });  
  
  describe("saveApplication", function(){

    it("Should be able to save an application if not already saving", function(done){
      $httpBackend.when("POST", "/admin/ws/updateApplication/7bff6606c8fc4e1259ff44342ad870502dbcf9d5").respond(200);
      $httpBackend.expectPOST("/admin/ws/updateApplication/7bff6606c8fc4e1259ff44342ad870502dbcf9d5");

      $controller("ApplicationController", {
        $scope: $scope,
        applications : applications,
        scopes : scopes
      });

      var form = {
        edition : true,
        closeEdition : function(){
          assert.notOk(this.edition);
          done();
        }
      };

      $scope.applications[0].saving = true;
      $scope.saveApplication(form, $scope.applications[0]);

      $scope.applications[0].saving = false;
      $scope.applications[0].title = "title";
      $scope.saveApplication(form, $scope.applications[0]);
      $httpBackend.flush();
    });

    it("Should logout user if a 401 is returned by the server", function(done){
      $httpBackend.when("POST", "/admin/ws/updateApplication/7bff6606c8fc4e1259ff44342ad870502dbcf9d5").respond(401);
      $httpBackend.expectPOST("/admin/ws/updateApplication/7bff6606c8fc4e1259ff44342ad870502dbcf9d5");

      $rootScope.logout = function(){
        done();
      };

      $controller("ApplicationController", {
        $scope: $scope,
        applications : applications,
        scopes : scopes
      });

      $scope.saveApplication({}, $scope.applications[0]);
      $httpBackend.flush();
    });

  });  
  
  describe("toggleEdition", function(){

    it("Should be able to cancel application edition", function(done){
      $controller("ApplicationController", {
        $scope: $scope,
        applications : applications,
        scopes : scopes
      });

      var form = {
        edition : true,
        cancelEdition : function(){
          assert.notOk(this.edition);
          done();
        }
      };

      $scope.cancelEdition(form);
    });

    it("Should be able to open application edition", function(done){
      $controller("ApplicationController", {
        $scope: $scope,
        applications : applications,
        scopes : scopes
      });

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
  
  describe("addApplication", function(){
    
    it("Should be able to add a new application", function(){
      $httpBackend.when("PUT", "/admin/ws/application").respond(200, { application : {
        id : "new application id",
        name : "New application",
        scopes : {
          scope1 : {
            description : "description 1",
            name : "name 1",
            activated : true
          },
          scope2 : {
            description : "description 2",
            name : "name 2",
            activated : true
          }                  
        },
        secret : "new application secret"
      }});
      $httpBackend.expectPUT("/admin/ws/application");
      
      $controller("ApplicationController", {
        $scope: $scope,
        applications : applications,
        scopes : scopes
      });
      
      $scope.applicationName = "Application name";
      
      $scope.addApplication({});
      $httpBackend.flush();
      assert.equal($scope.applications.length, 2);
    });
    
    it("Should logout user if a 401 is returned by the server", function(done){
      $httpBackend.when("PUT", "/admin/ws/application").respond(401);
      $httpBackend.expectPUT("/admin/ws/application");
      
      $rootScope.logout = function(){
        done();
      };
      
      $controller("ApplicationController", {
        $scope: $scope,
        applications : applications,
        scopes : scopes
      });
      
      $scope.applicationName = "Application name";   
      
      $scope.addApplication({});
      $httpBackend.flush();
    });    

  });  
  
});