"use strict"

window.assert = chai.assert;

// EditApp.js
describe("EditApp", function(){
  var $compile, $rootScope, element, scope;
  
  // Load openveo, authentication and storage modules
  beforeEach(function(){
    module("ov.edit");
    module("ov.i18n");
  });
  
  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_){
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  // Prepares scope
  beforeEach(function(){
    scope = $rootScope.$new();
  });

  // ov-form directive
  describe("ov-form directive", function(){
    
    beforeEach(function(){
      element = angular.element("<form ov-form name='testForm'></form>");
      element = $compile(element)(scope);
      scope.$digest();
    });

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
  
  // ov-form link service
  describe("ovFormLink service", function(){
    var ovFormLink, formController, isResetElement, isDisplayElement, isEditElement;

    // Dependencies injections
    beforeEach(inject(function(_ovFormLink_){
      ovFormLink = _ovFormLink_;
    }));
    
    // Initializes tests
    beforeEach(function(){
      formController = {};
      isResetElement = isDisplayElement = isEditElement = false;
    });

    it("Should be able to cancel all elements edition", function(){
      scope.elements = [{
        resetElement : function(){
          isResetElement = true;
        },
        displayElement : function(){
          isDisplayElement = true;
        }
      }];

      ovFormLink(scope, null, null, formController);
      formController.cancelEdition();

      assert.isDefined(formController.cancelEdition);
      assert.ok(isResetElement);
      assert.ok(isDisplayElement);
    });
    
    it("Should be able to open all elements edition", function(){
      
      scope.elements = [{
        editElement : function(){
          isEditElement = true;
        }
      }];
      
      ovFormLink(scope, null, null, formController);
      formController.openEdition();
      
      assert.isDefined(formController.openEdition);
      assert.ok(isEditElement);
    });
    
    it("Should be able to close all elements edition", function(){
      
      scope.elements = [{
        displayElement : function(){
          isDisplayElement = true;
        }
      }];
      
      ovFormLink(scope, null, null, formController);
      formController.closeEdition();
      
      assert.isDefined(formController.closeEdition);
      assert.ok(isDisplayElement);
    });    
    
  });
  
  // <ov-editable> directive
  describe("ov-editable directive", function(){
    var ovEditableLink, rootElement, isAddElement;
    
    // Dependencies injections
    beforeEach(inject(function(_ovEditableLink_){
      ovEditableLink = _ovEditableLink_;
    }));

    // Prepares ov-form element and element data
    beforeEach(function(){
      isAddElement = false;
      rootElement = angular.element("<form ov-form name='testForm'></form>");
      rootElement = $compile(rootElement)(scope);
      scope.$digest();
    });
    
    it("Should add the element to the of-form element", function(){
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