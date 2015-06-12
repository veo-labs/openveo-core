"use strict"

window.assert = chai.assert;

describe("CheckboxEditableElement", function(){
  var $rootScope, element, $injector, OvEditableElementInterface, scope;
  
  beforeEach(module("ov.edit"));
  beforeEach(module("ov.i18n"));
  beforeEach(inject(function(_$injector_, _$rootScope_, _OvEditableElementInterface_){
    $rootScope = _$rootScope_;
    $injector = _$injector_;
    OvEditableElementInterface = _OvEditableElementInterface_;
    scope = $rootScope.$new(); 
  }));

  it("Should expose a CheckboxEditableElement object", function(){
    var CheckboxEditableElement = $injector.get("OvCheckboxEditableElement"); 
    assert.isDefined(CheckboxEditableElement);
    assert.isFunction(CheckboxEditableElement);
  });
  
  it("Should be able to set a new value", function(){
    scope = $rootScope.$new(); 
    var CheckboxEditableElement = $injector.get("OvCheckboxEditableElement"); 
    
    var checkboxElement = new CheckboxEditableElement("test", ["value"], false, [{
       value: "option1",
       label: "option 1"
    }], scope);
    
    assert.equal(checkboxElement.value[0], "value");
    assert.equal(checkboxElement.value.length, 1);
    checkboxElement.setValue(["new value"]);
    assert.equal(checkboxElement.value[0], ["new value"]);
    assert.equal(checkboxElement.value.length, 1);
  });
  
  it("Should be of type OvEditableElementInterface", function(){
    scope = $rootScope.$new(); 
    var CheckboxEditableElement = $injector.get("OvCheckboxEditableElement");
    var checkboxElement = new CheckboxEditableElement("test", ["value"], false, [{
       value: "option1",
       label: "option 1"
    }], scope);
    assert.ok(checkboxElement instanceof OvEditableElementInterface);
  });
  
  it("Should be able to generate text display as a comma separated list of values", function(){
    scope = $rootScope.$new(); 
    var CheckboxEditableElement = $injector.get("OvCheckboxEditableElement");
    var checkboxElement = new CheckboxEditableElement("test", ["option1", "option2"], false, [{
       value: "option1",
       label: "option 1"
    },
    {
       value: "option2",
       label: "option 2"
    }                                                                        ], scope);
    assert.equal(angular.element('<div>').append(checkboxElement.getTextDisplay().clone()).html(), "<span>option 1, option 2</span>");
  });
  
  it("Should display an empty span if no values for text display", function(){
    scope = $rootScope.$new(); 
    var CheckboxEditableElement = $injector.get("OvCheckboxEditableElement");
    var checkboxElement = new CheckboxEditableElement("test", [], false, [{
       value: "option1",
       label: "option 1"
    },
    {
       value: "option2",
       label: "option 2"
    }                                                                        ], scope);
    assert.equal(angular.element('<div>').append(checkboxElement.getTextDisplay().clone()).html(), "<span></span>");
  });
  
  it("Should display an empty span if value does not correspond to any options", function(){
    scope = $rootScope.$new(); 
    var CheckboxEditableElement = $injector.get("OvCheckboxEditableElement");
    var checkboxElement = new CheckboxEditableElement("test", ["option1"], false, [{
       value: "wrongOption",
       label: "wrong option"
      }
    ], scope);
    assert.equal(angular.element('<div>').append(checkboxElement.getTextDisplay().clone()).html(), "<span></span>");
  });

});