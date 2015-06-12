"use strict"

window.assert = chai.assert;

describe("ApplicationService", function(){
  
  beforeEach(module("ov"));
    
  var $httpBackend, applicationService;

  beforeEach(inject(function(_$httpBackend_, _applicationService_){
    $httpBackend = _$httpBackend_;
    applicationService = _applicationService_;

    $httpBackend.when("POST", /.*/).respond(200, "");
    $httpBackend.when("DELETE", /.*/).respond(200, "");
    $httpBackend.when("PUT", /.*/).respond(200, "");
  }));
  
  afterEach(function(){
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });  
  
  it("Should be able to ask server for the list of applications", function(){
    $httpBackend.when("GET", /.*/).respond(200, "");
    $httpBackend.expectGET("/admin/ws/applications");
    applicationService.loadApplications();
    $httpBackend.flush();
  });
  
  it("Should be able to ask server for the list of scopes", function(){
    $httpBackend.when("GET", /.*/).respond(200, "");
    $httpBackend.expectGET("/admin/ws/scopes");
    applicationService.loadScopes();
    $httpBackend.flush();
  });  
  
  it("Should be able to ask server to remove an application", function(){
    $httpBackend.when("GET", /.*/).respond(200, "");
    $httpBackend.expectDELETE("/admin/ws/application/1");
    applicationService.removeApplication(1);
    $httpBackend.flush();
  });

  it("Should be able to ask server to add a new application", function(){
    $httpBackend.when("GET", /.*/).respond(200, "");
    var application = {
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
      }
    };
    
    $httpBackend.expectPUT("/admin/ws/application", application);
    applicationService.addApplication(application.name, application.scopes);
    $httpBackend.flush();
  });  
  
  it("Should be able to ask server to update an application", function(){
    $httpBackend.when("GET", /.*/).respond(200, "");
    var application = {
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
      }
    };
    $httpBackend.expectPOST("/admin/ws/updateApplication/1", application);
    applicationService.updateApplication(1, application.name, application.scopes);
    $httpBackend.flush();
  });
  
  it("Should be able to store applications", function(){
    $httpBackend.when("GET", "/admin/ws/applications").respond(200, [
      {
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
        }
      }]
    );
    $httpBackend.expectGET("/admin/ws/applications");
    applicationService.loadApplications();
    $httpBackend.flush();
    
    var applications = applicationService.getApplications();
    assert.isDefined(applications);
    assert.equal(applications.length, 1);
  });
  
  it("Should be able to store scopes", function(){
    $httpBackend.when("GET", "/admin/ws/scopes").respond(200,
      {
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
    );
    $httpBackend.expectGET("/admin/ws/scopes");
    applicationService.loadScopes();
    $httpBackend.flush();
    
    var scopes = applicationService.getScopes();
    assert.isDefined(scopes);
  });  

});