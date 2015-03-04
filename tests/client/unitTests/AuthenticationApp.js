"use strict"

window.assert = chai.assert;

describe("AuthenticationApp", function(){
  var authenticationService, $httpBackend;
  
  beforeEach(function(){
    module("ov");
    module("ov.authentication");
    module("ov.storage");
  });
  
  beforeEach(inject(function(_$controller_, _$httpBackend_, _authenticationService_){
    $httpBackend = _$httpBackend_;
    authenticationService = _authenticationService_;
    
    $httpBackend.when("POST", /.*/).respond(200, {"username" : "openveo"});
    $httpBackend.when("GET", /.*/).respond(200, "");
  }));
  
  it("Should be able to authenticate a user", function(){
    $httpBackend.expectPOST("/authenticate", {
      "userName" : "openveo",
      "password" : "openveo"
    });
    
    authenticationService.login("openveo", "openveo").then(function(result){
      assert.ok(true);
    }, function(error){
      assert.ok(false);
    });
    
    $httpBackend.flush();
  });   
  
  it("Should be able to logout the authenticated user", function(){
    $httpBackend.expectGET("/logout");
    
    authenticationService.logout().then(function(){
      authenticationService.setUserInfo();
      assert.notOk(authenticationService.getUserInfo());
      assert.ok(true);
    }, function(error){
      assert.ok(false);
    });
    
    $httpBackend.flush();
  });

  it("Should be able to get / set authenticated user information", function(){
    authenticationService.setUserInfo({
      "userName" : "openveo"
    });
    
    assert.isDefined(authenticationService.getUserInfo());
  });
  
  afterEach(function(){
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });  
  
});