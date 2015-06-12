(function(app, angular){

  "use strict"
  
  /**
   * Defines a service describing the "interface" which much be 
   * implemented by all editable elements.
   * An editable element is an element with two displays, the edition
   * form to change element's value or simple text representation.
   * All editable elements must implement the methods of this "interface".
   */
  app.factory("OvEditableElementInterface", OvEditableElementInterface);
  
  function OvEditableElementInterface(){
    
    function EditableElementInterface(){}
    
    // Holds "protected" functions
    var protectedFunctions = {};
    
    /**
     * Clears the given array without creating a new one.
     * @param Array arrayToClear The array to clear
     */
    protectedFunctions.clearArray = function(arrayToClear){
      if(arrayToClear && angular.isArray(arrayToClear))
        while(arrayToClear.length > 0)
          arrayToClear.pop();
    };
    
    /**
     * Initializes a new editable element.
     * @param String name Name of the element
     * @param Mixed value The value of the element, it's type depend on 
     * the element's type
     * @param Boolean required true if the element is required, 
     * false otherwise
     */
    EditableElementInterface.prototype.init = function(name, value, required){
      if(!name)
        throw new Error("Name is expected as editable element arguments");
      
      this.name = name;
      this.value = value || "";
      this.required = (required === true || required === "true") || false;
      this.initialValue = angular.copy(this.value) || "";
      
      return protectedFunctions;
    };
    
    /**
     * Sets editable element value.
     * @param Mixed value The value of the element, it's type depend on 
     * the element's type
     */
    EditableElementInterface.prototype.setValue = function(value){throw new Error("setValue method not implemented for this editable element");};
    
    /**
     * Gets editable element's form to be able to edit the 
     * element's value.
     * @return The form to edit the element
     */
    EditableElementInterface.prototype.getFormDisplay = function(){throw new Error("getFormDisplay method not implemented for this editable element");};
    
    /**
     * Gets editable element text representation.
     * @return The editable element's text representation
     */
    EditableElementInterface.prototype.getTextDisplay = function(){throw new Error("getText method not implemented for this editable element");};    
    
    /**
     * Resets element's value to its initial value.
     */
    EditableElementInterface.prototype.reset = function(){
      this.setValue(this.initialValue);  
    };

    return EditableElementInterface;
  }
  
})(angular.module("ov.edit"), angular);