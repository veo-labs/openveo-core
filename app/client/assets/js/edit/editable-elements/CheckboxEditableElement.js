(function(angular, app){

  "use strict"

  /**
   * Defines a checkbox editable element to be able to edit a list of 
   * values.
   * Text display : The element's values are just displayed as a
   * simple comma separated text wrapped in an HTMLSpanElement 
   * (e.g <span>option 1, option 2</span>)
   * Edition display : A list of HTMLInputElement is displayed wrapped 
   * in an HTMLSpanElement
   * e.g.
   * <span>
   *   <label>
   *     <input type='checkbox' ng-disabled='ovDisabled' required name='myElement' ng-checked='true' value='option1' /> 
   *     <span ng-bind='"option 1" | translate'></span>
   *   </label>
   * </span>
   */
  app.factory("OvCheckboxEditableElement", OvCheckboxEditableElement);
  OvCheckboxEditableElement.$inject = ["OvEditableElementInterface", "i18nService"];
  
  function OvCheckboxEditableElement(OvEditableElementInterface, i18nService){

    /**
     * Creates a new checkbox editable element with one or
     * more checkboxes (depending on the number of options).
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
     * @param Scope scope The AngularJS scope the list of values 
     * belongs to
     */
    function CheckboxEditableElement(name, value, required, options, scope){
      this.protectedFunctions = OvEditableElementInterface.prototype.init.call(this, name, value, required);
      this.setValue(this.initialValue);
      this.options = options;
      this.scope = scope;

      if(!this.options || !this.scope)
        throw new Error("Options and scope are expected as checkbox editable element arguments");
    }

    CheckboxEditableElement.prototype = new OvEditableElementInterface();
    CheckboxEditableElement.prototype.constructor = CheckboxEditableElement;
    
    /**
     * Sets editable element value.
     * @param Array values The list of values 
     * (e.g. ["option1", "option2"])
     */
    CheckboxEditableElement.prototype.setValue = function(values){
      if(values){
        this.protectedFunctions.clearArray(this.value);
        
        for(var i in values)
          this.value.push(values[i]);
      }
    };

    /**
     * Gets HTML form to edit checkboxes
     * @return JQLite The form to edit the values
     * e.g. 
     * <span>
     *   <label>
     *     <input type='checkbox' ng-disabled='ovDisabled' required name='myElement' ng-checked='true' value='option1' /> 
     *     <span ng-bind='"option 1" | translate'></span>
     *   </label>
     *   <label>
     *     <input type='checkbox' ng-disabled='ovDisabled' required name='myElement' ng-checked='true' value='option2' /> 
     *     <span ng-bind='"option 2" | translate'></span>
     *   </label>     
     * </span>     
     */
    CheckboxEditableElement.prototype.getFormDisplay = function(){
      var self = this;
      
      if(!this.value)
        return null;
      
      // Wrap all checkboxes into an HTMLSpanElement
      var form = angular.element(document.createElement("span"));
      
      // Create the list of checbkoxes
      for(var i in this.options){
        
        // Check if option is part of the list of values
        var index = this.value.indexOf(this.options[i].value);
        
        form.append("<label><input type='checkbox' ng-disabled='ovDisabled' " + ((this.required) ? "required" : "") + " name='" + this.name + "' ng-checked='" + (index > -1) + "' value='" + this.options[i].value + "' /> <span ng-bind='\"" + this.options[i].label + "\" | translate'></span></label>");
        
      }
      
      // Bind change event listener on checkboxes to update model
      // values when changing
      this.inputs = form.find("input");
      this.inputs.on("change", function(event){
        
        // Set new values
        self.scope.$apply(function(){
          var values = [];
          for(var i = 0 ; i < self.inputs.length ; i++){
            var input = angular.element(self.inputs[i]);
            if(angular.element(self.inputs[i]).prop("checked"))
              values.push(input.val());
          }
          self.setValue(values);
        });    
        
      });
      
      return form;
    };
    
    /**
     * Gets the list of values separated by commas.
     * @return JQLite The editable element's text representation
     * (e.g <span>option 1, option 2</span>)
     */
    CheckboxEditableElement.prototype.getTextDisplay = function(){
      if(!this.value)
        return null;
      
      // Remove change listener on checkboxes
      if(this.inputs)
        this.inputs.off("change");

      var values = [];

      for(var i in this.options)
         if(this.value.indexOf(this.options[i].value) > -1)
           values.push(i18nService.translate(this.options[i].label));

      return angular.element("<span>" + values.join(", ") + "</span>");
    };

    return CheckboxEditableElement;
  }
  
})(angular, angular.module("ov.edit"));