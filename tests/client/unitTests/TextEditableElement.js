"use strict"

window.assert = chai.assert;

describe("TextEditableElement", function(){
  var element, $injector, OvEditableElementInterface;
  
  beforeEach(module("ov.edit"));
  beforeEach(module("ov.i18n"));
  beforeEach(inject(function(_$injector_, _OvEditableElementInterface_){
    $injector = _$injector_;
    OvEditableElementInterface = _OvEditableElementInterface_;
  }));

  it("Should expose a TextEditableElement object", function(){
    var TextEditableElement = $injector.get("OvTextEditableElement"); 
    assert.isDefined(TextEditableElement);
    assert.isFunction(TextEditableElement);
  });
  
  it("Should be of type OvEditableElementInterface", function(){
    var TextEditableElement = $injector.get("OvTextEditableElement");
    var textElement = new TextEditableElement("test", "value", false);
    assert.ok(textElement instanceof OvEditableElementInterface);
  });  
  
  it("Should be able to set a new value", function(){
    var TextEditableElement = $injector.get("OvTextEditableElement"); 
    
    var textElement = new TextEditableElement("test", "value", false);
    
    assert.equal(textElement.value, "value");
    textElement.setValue("new value");
    assert.equal(textElement.value, "new value");
  });
  
  it("Should throw an exception if name is not defined", function(){
    var TextEditableElement = $injector.get("OvTextEditableElement"); 
    
    try{
      var textElement = new TextEditableElement();
    }
    catch(e){
      assert.ok(true); 
    }
  });
  
  it("Should set value to \"\" if not defined", function(){
    var TextEditableElement = $injector.get("OvTextEditableElement");
    var textElement = new TextEditableElement("test");
    assert.equal(textElement.value, "");
    textElement.setValue(null);
    assert.equal(textElement.value, "");
  });
  
  it("Should be able to generate text display", function(){
    var TextEditableElement = $injector.get("OvTextEditableElement");
    var textElement = new TextEditableElement("test", "value", true);
    assert.equal(angular.element('<div>').append(textElement.getTextDisplay().clone()).html(), "<span>value</span>");
  }); 

});