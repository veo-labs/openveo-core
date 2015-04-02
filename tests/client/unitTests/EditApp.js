"use strict"

window.assert = chai.assert;

describe("EditApp", function(){
  var $compile, $rootScope, element;
  
  beforeEach(module("ov.edit"));
  
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
    
    it("Should be able to add a new field", function(){
      var ovFormController = element.controller("ovForm");
      var formController = element.controller("form");
      var isolateScope = element.isolateScope();
      isolateScope.fields = [];
      ovFormController.addField({ fieldProperty : "propertyValue" }, formController);
      
      assert.equal(isolateScope.fields.length, 1);
      assert.equal(isolateScope.fields[0].fieldProperty, "propertyValue");
    });
    
    it("Should be able to attach a field controller to form controller", function(done){
      var isolateScope = element.isolateScope();
      var ovFormController = element.controller("ovForm");
      var modelController = {};
      var formController = {
        $addControl : function(controller){
          assert.strictEqual(modelController, controller);
          done();
        }
      };
      isolateScope.fields = [];
      ovFormController.addField({ fieldProperty : "propertyValue" }, formController);
      ovFormController.addFieldController(modelController);
    });  
    
    it("Should be able to remove a field controller from form controller", function(done){
      var isolateScope = element.isolateScope();
      var ovFormController = element.controller("ovForm");
      var modelController = {};
      var formController = {
        $removeControl : function(controller){
          assert.strictEqual(modelController, controller);
          done();
        }
      };
      isolateScope.fields = [];
      ovFormController.addField({ fieldProperty : "propertyValue" }, formController);
      ovFormController.removeFieldController(modelController);
    });
    
    it("Should be able to validate the form controller", function(){
      var isolateScope = element.isolateScope();
      var ovFormController = element.controller("ovForm");
      var modelController = {};
      var formController = {
        $setValidity : function(validationErrorKey, isValid){
          this.valid = isValid;
        }, 
        valid : false
      };

      isolateScope.fields = [];
      ovFormController.addField({ fieldProperty : "propertyValue", validateField : function(){return true; } }, formController);
      
      ovFormController.validateForm();
      assert.ok(formController.valid);
      
      ovFormController.addField({ fieldProperty2 : "propertyValue2", validateField : function(){ return false; } }, formController);
      ovFormController.validateForm();
      assert.notOk(formController.valid);
    });

  });
  
  describe("ovFormLink service", function(){
    var ovFormLink, $rootScope;

    beforeEach(inject(function(_ovFormLink_, _$rootScope_){
      $rootScope = _$rootScope_;
      ovFormLink = _ovFormLink_;
    }));
    
    it("Should be able to cancel fields edition", function(){
      var scope = $rootScope.$new();
      var isResetField = false;
      var isDisplayField = false;
      
      scope.fields = [{
        resetField : function(){
          isResetField = true;
        },
        displayField : function(){
          isDisplayField = true;
        }
      }];
      var formController = {};
      ovFormLink(scope, null, null, formController);
      formController.cancelEdition();
      
      assert.isDefined(formController.cancelEdition);
      assert.ok(isResetField);
      assert.ok(isDisplayField);
    });
    
    it("Should be able to open fields edition", function(){
      var scope = $rootScope.$new();
      var isEditField = false;
      
      scope.fields = [{
        editField : function(){
          isEditField = true;
        }
      }];
      
      var formController = {};
      ovFormLink(scope, null, null, formController);
      formController.openEdition();
      
      assert.isDefined(formController.openEdition);
      assert.ok(isEditField);
    });
    
    it("Should be able to close fields edition", function(){
      var scope = $rootScope.$new();
      var isDisplayField = false;
      
      scope.fields = [{
        displayField : function(){
          isDisplayField = true;
        }
      }];
      
      var formController = {};
      ovFormLink(scope, null, null, formController);
      formController.closeEdition();
      
      assert.isDefined(formController.closeEdition);
      assert.ok(isDisplayField);
    });    
    
  });
  
  describe("ov-editable directive", function(){
    var ovEditableLink, $rootScope, $timeout, scope, cloneScope, rootElement, element;

    beforeEach(inject(function(_ovEditableLink_, _$rootScope_, _$timeout_){
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      ovEditableLink = _ovEditableLink_;
      
      scope = $rootScope.$new();
      cloneScope = $rootScope.$new();
      cloneScope.value = "Initial value";
      cloneScope.name = "fieldName";
      scope.ovValue = "Initial value";
      scope.ovType = "text";
      
      rootElement = angular.element("<form ov-form name='testForm'></form>");
      rootElement = $compile(rootElement)(scope);
      scope.$digest();
      
      element = angular.element("<input type='text' ng-model='value' name='[[name]]' required/>");
      element = $compile(element)(cloneScope);
    }));
    
    it("Should be able to initialize the directive and its transluded content", function(){
      var isAddField = false;
      var isAddFieldController = false;
      var controllers = [
        {
          addField : function(fieldScope){
            isAddField = true;
            assert.strictEqual(scope, fieldScope);
          },
          addFieldController : function(controller){
            isAddFieldController = true;
            assert.isDefined(controller);
            assert.isNotNull(controller);
            assert.equal(controller.$modelValue, scope.ovValue);
          }
        }
      ];
      
      ovEditableLink(scope, rootElement, null, controllers, function(transclude){
        transclude([element[0]], cloneScope);
      });
      
      $timeout.flush();
      assert.ok(isAddField);
      assert.ok(isAddFieldController);
      assert.equal(rootElement.html(), "<span>" + scope.ovValue + "</span>");
    });
    
    it("Should be able to switch between edition and display modes", function(){
      var controllers = [
        {
          addField : function(fieldScope){},
          addFieldController : function(controller){}
        }
      ];
      
      ovEditableLink(scope, rootElement, null, controllers, function(transclude){
        transclude([element[0]], cloneScope);
      });
      
      $timeout.flush();
      scope.editField();

      var child = rootElement.children()[0];
      var childNg = angular.element(child)
      
      assert.equal(child.tagName.toLowerCase(), "input");
      assert.equal(childNg.attr("ng-model"), "value");
      assert.equal(childNg.attr("name"), "[[name]]");
      
      scope.displayField();
      assert.equal(rootElement.html(), "<span>" + scope.ovValue + "</span>");
    });

    it("Should be able to validate field", function(){
      var controllers = [
        {
          addField : function(fieldScope){},
          addFieldController : function(controller){}
        }
      ];

      ovEditableLink(scope, rootElement, null, controllers, function(transclude){
        transclude([element[0]], cloneScope);
      });

      $timeout.flush();
      assert.equal(scope.validateField(), element.controller("ngModel").$valid);

    });

    it("Should be able to reset field to its initial value", function(){
      var controllers = [
        {
          addField : function(fieldScope){},
          addFieldController : function(controller){}
        }
      ];

      ovEditableLink(scope, rootElement, null, controllers, function(transclude){
        transclude([element[0]], cloneScope);
      });

      $timeout.flush();
      scope.ovValue = "new value";
      scope.resetField();
      assert.equal(scope.ovValue, "Initial value");
    });
    
  });

});