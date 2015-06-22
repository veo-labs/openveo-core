"use strict"

window.assert = chai.assert;

// SelectEditableElement.js
describe("SelectEditableElement", function(){
  var $rootScope, element, $injector, OvEditableElementInterface, scope, SelectEditableElement;
  
  // Load openveo, authentication and storage modules
  beforeEach(function(){
    module("ov.edit");
    module("ov.i18n");
  });

  // Dependencies injections
  beforeEach(inject(function(_$injector_, _$rootScope_, _OvEditableElementInterface_){
    $rootScope = _$rootScope_;
    $injector = _$injector_;
    OvEditableElementInterface = _OvEditableElementInterface_;
  }));

  // Initializes tests
  beforeEach(function(){
    SelectEditableElement = $injector.get("OvSelectEditableElement");
    scope = $rootScope.$new();
  });

  it("Should expose a SelectEditableElement object", function(){
    assert.isDefined(SelectEditableElement);
    assert.isFunction(SelectEditableElement);
  });
  
  it("Should be able to set a new value", function(){
    var selectElement = new SelectEditableElement("test", ["value"], false, [{
       value: "option1",
       label: "option 1"
    }], true, scope);

    assert.equal(selectElement.value[0], "value");
    assert.equal(selectElement.value.length, 1);

    selectElement.setValue(["new value"]);
    assert.equal(selectElement.value[0], ["new value"]);

    assert.equal(selectElement.value.length, 1);
  });
  
  it("Should be of type OvEditableElementInterface", function(){
    var selectElement = new SelectEditableElement("test", ["value"], false, [{
       value: "option1",
       label: "option 1"
    }], true, scope);
    assert.ok(selectElement instanceof OvEditableElementInterface);
  });
  
  it("Should be able to generate text display as a comma separated list of values", function(){
    var selectElement = new SelectEditableElement("test", ["option1", "option2"], false, [{
       value: "option1",
       label: "option 1"
    },
    {
       value: "option2",
       label: "option 2"
    }                                                                        ], true, scope);
    assert.equal(angular.element('<div>').append(selectElement.getTextDisplay().clone()).html(), "<span>option 1, option 2</span>");
  });
  
  it("Should display an empty span if no values for text display", function(){
    var selectElement = new SelectEditableElement("test", [], false, [{
       value: "option1",
       label: "option 1"
    },
    {
       value: "option2",
       label: "option 2"
    }                                                                        ], true, scope);
    assert.equal(angular.element('<div>').append(selectElement.getTextDisplay().clone()).html(), "<span></span>");
  });
  
  it("Should display an empty span if value does not correspond to any options", function(){
    var selectElement = new SelectEditableElement("test", ["option1"], false, [{
       value: "wrongOption",
       label: "wrong option"
      }
    ], true, scope);
    assert.equal(angular.element('<div>').append(selectElement.getTextDisplay().clone()).html(), "<span></span>");
  });  

});