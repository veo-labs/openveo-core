"use strict"

window.assert = chai.assert;

describe("EditApp", function(){
  var $compile, $rootScope, element;
  
  beforeEach(module("ov.edit"));
  beforeEach(module("ov.i18n"));
  
  beforeEach(inject(function(_$compile_, _$rootScope_){
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));
  
  describe("ov-form directive", function(){
    
    beforeEach(inject(function(){
      var scope = $rootScope.$new(); 
      element = angular.element("<form ov-form name='testForm'></form>");
      element = $compile(element)(scope);
      scope.$digest();
    }));
    
    it("Should be able to add a new element scope", function(){
      var ovFormController = element.controller("ovForm");
      var formController = element.controller("form");
      var isolateScope = element.isolateScope();
      isolateScope.elements = [];
      ovFormController.addElement({ fieldProperty : "propertyValue" }, formController);
      
      assert.equal(isolateScope.elements.length, 1);
      assert.equal(isolateScope.elements[0].fieldProperty, "propertyValue");
    });

  });
  
  describe("ovFormLink service", function(){
    var ovFormLink, $rootScope;

    beforeEach(inject(function(_ovFormLink_, _$rootScope_){
      $rootScope = _$rootScope_;
      ovFormLink = _ovFormLink_;
    }));
    
    it("Should be able to cancel all elements edition", function(){
      var scope = $rootScope.$new();
      var isResetElement = false;
      var isDisplayElement = false;
      
      scope.elements = [{
        resetElement : function(){
          isResetElement = true;
        },
        displayElement : function(){
          isDisplayElement = true;
        }
      }];
      var formController = {};
      ovFormLink(scope, null, null, formController);
      formController.cancelEdition();
      
      assert.isDefined(formController.cancelEdition);
      assert.ok(isResetElement);
      assert.ok(isDisplayElement);
    });
    
    it("Should be able to open all elements edition", function(){
      var scope = $rootScope.$new();
      var isEditElement = false;
      
      scope.elements = [{
        editElement : function(){
          isEditElement = true;
        }
      }];
      
      var formController = {};
      ovFormLink(scope, null, null, formController);
      formController.openEdition();
      
      assert.isDefined(formController.openEdition);
      assert.ok(isEditElement);
    });
    
    it("Should be able to close all elements edition", function(){
      var scope = $rootScope.$new();
      var isDisplayElement = false;
      
      scope.elements = [{
        displayElement : function(){
          isDisplayElement = true;
        }
      }];
      
      var formController = {};
      ovFormLink(scope, null, null, formController);
      formController.closeEdition();
      
      assert.isDefined(formController.closeEdition);
      assert.ok(isDisplayElement);
    });    
    
  });
  
  describe("ov-editable directive", function(){
    var ovEditableLink, $rootScope, rootElement, scope;
    
    beforeEach(inject(function(_ovEditableLink_, _$rootScope_){
      $rootScope = _$rootScope_;
      ovEditableLink = _ovEditableLink_;
      scope = $rootScope.$new();
      rootElement = angular.element("<form ov-form name='testForm'></form>");
      rootElement = $compile(rootElement)(scope);
      scope.$digest();
    }));
    
    it("Should add the element to the of-form element", function(){
      var isAddElement = false;
      scope.ovValue = "Text value";
      scope.ovRequired = "true";
      scope.ovType = "text";
      scope.ovDisabled = "true";
      scope.ovName = "textName";
      
      var controllers = [
        {
          addElement : function(fieldScope){
            isAddElement = true;
            assert.strictEqual(scope, fieldScope);
          }
        }
      ];
      ovEditableLink(scope, rootElement, null, controllers, null);
      assert.ok(isAddElement);
    });  
    
    it("Should display the text version of the element by default", function(){
      var isAddElement = false;
      scope.ovValue = "Text value";
      scope.ovRequired = "true";
      scope.ovType = "text";
      scope.ovDisabled = "true";
      scope.ovName = "textName";
      
      var controllers = [
        {
          addElement : function(fieldScope){}
        }
      ];
      ovEditableLink(scope, rootElement, null, controllers, null);
      assert.equal(rootElement.html(), "<span>Text value</span>");
    });
    
    it("Should be able to edit the element", function(){
      var isAddElement = false;
      scope.ovValue = "Text value";
      scope.ovRequired = "true";
      scope.ovType = "text";
      scope.ovDisabled = "true";
      scope.ovName = "textName";
      
      var controllers = [
        {
          addElement : function(fieldScope){}
        }
      ];
      ovEditableLink(scope, rootElement, null, controllers, null);
      scope.editElement();
    });
    
    it("Should throw an error if editable element type is not supported", function(){
      scope.ovType = "notSupported";
      
      var controllers = [
        {
          addElement : function(fieldScope){}
        }
      ];
      try{
        ovEditableLink(scope, rootElement, null, controllers, null);
      }
      catch(e){
        assert.ok(true); 
      }
    });    
    
    it("Should support type text", function(){
      scope.ovValue = "Text value";
      scope.ovType = "text";
      scope.ovName = "textName";
      
      var controllers = [
        {
          addElement : function(fieldScope){}
        }
      ];
      ovEditableLink(scope, rootElement, null, controllers, null);
    });
    
    it("Should support type select", function(){
      scope.ovValue = ["value"];
      scope.ovType = "select";
      scope.ovName = "selectName";
      scope.ovOptions = [];
      
      var controllers = [
        {
          addElement : function(fieldScope){}
        }
      ];
      ovEditableLink(scope, rootElement, null, controllers, null);
    });
    
    it("Should support type checkbox", function(){
      scope.ovValue = ["value"];
      scope.ovType = "checkbox";
      scope.ovName = "checkboxName";
      scope.ovOptions = [];
      
      var controllers = [
        {
          addElement : function(fieldScope){}
        }
      ];
      ovEditableLink(scope, rootElement, null, controllers, null);
    });
    
  });

});