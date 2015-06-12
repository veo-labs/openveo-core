(function(angular, app){

  "use strict"

  /**
   * Defines a select editable element to be able to edit a list 
   * of values.
   * Text display : The element's values are just displayed as a
   * simple comma separated text wrapped in an HTMLSpanElement 
   * (e.g <span>option 1, option 2</span>)
   * Edition display : An HTMLSelectElement is displayed
   * e.g. 
   * <select name='myElementName' multiple>
   *   <option value='option1' ng-bind='"option 1" | translate' ng-selected='true'></option>
   *   <option value='option2' ng-bind='"option 2" | translate' ng-selected='true'></option>   
   * </select>
   */
  app.factory("OvSelectEditableElement", OvSelectEditableElement);
  OvSelectEditableElement.$inject = ["OvEditableElementInterface", "i18nService"];
  
  function OvSelectEditableElement(OvEditableElementInterface, i18nService){

    /**
     * Creates a new select editable element with one or more values.
     * @param String name Name of the element
     * @param Array value The list of values (e.g. ["option1", "option2"])
     * @param Boolean required true if the element is required, 
     * false otherwise
     * @param Array options The list of options with label and value
     * [
     *   {
     *     "value" : "option1",
     *     "label" : "option 1"
     *   },
     *   {
     *     "value" : "option2",
     *     "label" : "option 2"
     *   }  
     * ]     
     * @param Boolean multiple true if the element may have multiple
     * values, false for a single value
     * @param Scope scope The AngularJS scope the list of values 
     * belongs to
     */
    function SelectEditableElement(name, value, required, options, multiple, scope){
      this.protectedFunctions = OvEditableElementInterface.prototype.init.call(this, name, value, required);
      this.setValue(this.initialValue);
      this.options = options;
      this.multiple = (multiple === true || multiple === "true") || false;
      this.scope = scope;
      
      if(!this.options || !this.scope)
        throw new Error("Options and scope are expected as select editable element arguments");
    }

    SelectEditableElement.prototype = new OvEditableElementInterface();
    SelectEditableElement.prototype.constructor = SelectEditableElement;
    
    /**
     * Sets editable element value.
     * @param Array values The list of values 
     * (e.g. ["option1", "option2"])
     */
    SelectEditableElement.prototype.setValue = function(value){
      if(value){
        this.protectedFunctions.clearArray(this.value);
        
        for(var i in value)
          this.value.push(value[i]);
      }
    };

    /**
     * Gets HTML form to select values.
     * @return JQLite The form to edit the values
     * e.g. 
     * <select name='myElementName' multiple>
     *   <option value='option1' ng-bind='"option 1" | translate' ng-selected='true'></option>
     *   <option value='option2' ng-bind='"option 2" | translate' ng-selected='true'></option>   
     * </select>
     */
    SelectEditableElement.prototype.getFormDisplay = function(){
      var self = this;
      
      if(!this.value)
        return null;
      
      this.select = angular.element("<select name='" + this.name + "' " + ((this.multiple) ? "multiple" : "") + " " + ((this.required) ? "required" : "") + "></select>");
      
      // Add select options
      for(var i in this.options){
        
        // Check if option is part of the list of values
        var index = this.value.indexOf(this.options[i].value);
        
        this.select.append("<option value='" + this.options[i].value + "' ng-bind='\"" + this.options[i].label + "\" | translate' ng-selected='" + (index > -1) + "'></option>");
      }
      
      // Bind change event listener on select to update model
      // values when changing
      this.select.on("change", function(event){
        
        // Set new values
        self.scope.$apply(function(){
          var selectedOptions = self.select.val();
          selectedOptions = (selectedOptions && angular.isString(selectedOptions)) ? [selectedOptions] : selectedOptions;
          var values = [];

          if(selectedOptions)
            for(var i in selectedOptions)
              values.push(selectedOptions[i]);
          
          self.setValue(values);
        });
        
      });
      
      return this.select;
    };
    
    /**
     * Gets the list of select values separated by commas.
     * @return JQLite The editable element's text representation
     * (e.g <span>option 1, option 2</span>)
     */
    SelectEditableElement.prototype.getTextDisplay = function(){
      if(!this.value)
        return null;
      
      // Remove change listener on checkboxes
      if(this.select)
        this.select.off("change");
      
      var values = [];
      
      for(var i in this.options)
         if(this.value.indexOf(this.options[i].value) > -1)
           values.push(i18nService.translate(this.options[i].label));      

      return angular.element("<span>" + values.join(", ") + "</span>");
    };

    return SelectEditableElement;
  }
  
})(angular, angular.module("ov.edit"));