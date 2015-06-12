(function(angular, app){

  "use strict"

  /**
   * Defines a text editable element to be able to edit a simple text.
   * Text display : The element's value is just displayed as a simple text
   * in a HTMLSpanElement
   * Edition display : An HTMLInputElement is displayed
   */
  app.factory("OvTextEditableElement", OvTextEditableElement);
  OvTextEditableElement.$inject = ["OvEditableElementInterface"];
  
  function OvTextEditableElement(OvEditableElementInterface){

    /**
     * Creates a new text editable element.
     * @param String name Name of the element (will be used as input name)
     * @param String value The text of the element
     * @param Boolean required true if the element is required, 
     * false otherwise
     */
    function TextEditableElement(name, value, required){
      OvEditableElementInterface.prototype.init.call(this, name, value, required);
      this.setValue(this.initialValue);
    }

    TextEditableElement.prototype = new OvEditableElementInterface();
    TextEditableElement.prototype.constructor = TextEditableElement;
    
    /**
     * Sets element's value.
     * @param String value The text of the element
     */
    TextEditableElement.prototype.setValue = function(value){
      this.value = value || "";
    };

    /**
     * Gets HTML form to edit text.
     * @return JQLite The form to edit the text
     */
    TextEditableElement.prototype.getFormDisplay = function(){
      var form = angular.element("<input type='text' ng-model='ovValue' name='" + this.name + "' " + ((this.required) ? "required" : "") + " ng-disabled='ovDisabled'/>");
      
      return form;
    };
    
    /**
     * Gets the element's value as a simple text.
     * @return JQLite The editable element's text representation
     */
    TextEditableElement.prototype.getTextDisplay = function(){
      return angular.element("<span>" + this.value + "</span>");
    };

    return TextEditableElement;
  }
  
})(angular, angular.module("ov.edit"));