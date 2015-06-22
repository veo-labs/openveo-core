(function(angular){

  "use strict"

  /**
   * Defines an application to facilitate inline editions of properties.
   * It defines two directives : 
   *  - ov-form As an HTML attribute to transform an angular form into an
   *    inline editable form. ov-form exposes three methods to 
   *    sub directives :
   *    - openEdition
   *      Make all ov-editable elements editable
   *    - closeEdition
   *      Make all ov-editable elements non editable
   *    - cancelEdition
   *      Cancel the edition (reset values) and close the edition
   *  - ov-editable As an element to add an inline editable element
   *    Supported types are : 
   *    - text (transformed into an input text in edition)
   *    - checkbox (transformed into a list of checkboxes in edition)
   *    - select (transformed into a combobox in edition)
   *
   * ov-editable elements must be within an HTML form element
   * with the ov-form attribute.
   *
   * ov-editable defines several attributes : 
   *  - ov-type : The type of the editable element, one of 
   *    text, checkbox or select
   *  - ov-name : The name of the form element
   *  - ov-value : The value of the element, it depends on the type 
   *    of the element, a single String for "text" type, an array 
   *    of Strings for "select" and "checkbox" types
   *  - ov-options : Only used for elements of types "select"
   *    and "checkbox", this is the list of options as
   *    [
   *      {
   *        "value" : "option1",
   *        "label" : "option 1"
   *      },
   *      {
   *        "value" : "option2",
   *        "label" : "option 2"
   *      }
   *    ]
   *  - ov-required : An expression evaluated into a boolean to indicate
   *    if the element is required or not
   *  - ov-disabled : An expression evaluated into a boolean to indicate
   *    if the element can be edited or not
   *  - ov-multiple : Only for elements of type "select", a boolean to 
   *    indicate if the element can have several values or not
   *
   * e.g.
   * <!-- The name of the form is also important to access 
   *      ov-form exposed methods
   * -->
   * <form ov-form name="myForm" ng-submit="myForm.$valid && saveForm()" novalidate>
   *
   *    <!-- Example of a text editable element -->
   *    <ov-editable ov-name="textElementName" ov-value="textValue" ov-type="text" ov-required="true" ov-disabled="true">
   *    </ov-editable>
   * 
   *    <!-- Example of checkbox editable element -->
   *    <ov-editable ov-name="checkboxElementName" ov-options="checkboxElementOptions" ov-value="checkboxElementValues" ov-type="checkbox" ov-required="false" ov-disabled="false">
   *    </ov-editable>
   * 
   *    <!-- Example of select editable element -->
   *    <ov-editable ov-name="selectElementName" ov-options="selectElementOptions" ov-value="selectElementValues" ov-type="select" ov-required="false" ov-disabled="false">
   *    </ov-editable>   
   *
   *    <button type="button" ng-click="myForm.cancelEdition()"></button>
   * </form>
   */
  var app = angular.module("ov.edit", []);
  app.directive("ovForm", ovForm);
  app.directive("ovEditable", ovEditable);
  ovForm.$inject = ["ovFormLink"];
  ovEditable.$inject = ["ovEditableLink"]

  function ovForm(ovFormLink){
    return{
      restrict : "A",
      require : "^form",
      scope : {},
      link : ovFormLink,
      controller: ["$scope", function($scope){
        var form;
        $scope.elements = [];
        
        /**
         * Adds ov-editable element scope to the form controller to be 
         * able to have form validation.
         * @param Object elementScope The element scope to attach
         * @param Object formController The form controller to attach
         * the element to
         */
        this.addElement = function(elementScope, formController){
          form = formController;
          $scope.elements.push(elementScope);
        };
        
      }]
    };
  };
  
  app.factory("ovFormLink", function(){
    return function(scope, element, attrs, formController){

      /**
       * Cancels edition of all editable elements.
       * This will reset all editable elements to their initial value.
       * This method is exposed to the HTML form element marked with 
       * attribute ov-form.
       */
      formController.cancelEdition = function(){
        cancelEdition();
        formController.closeEdition();
      };
      
      /**
       * Opens the edition of all editable elements.
       * It transforms all editable elements into form elements.
       * This method is exposed to the HTML form element marked with 
       * attribute ov-form.
       */
      formController.openEdition = function(){
        openCloseEdition(true);
      };
      
      /**
       * Closes the edition of all editable elements.
       * It transforms all editable elements into simple texts.
       * This method is exposed to the HTML form element marked with 
       * attribute ov-form.
       */      
      formController.closeEdition = function(){
        openCloseEdition(false);
      };
      
      /**
       * Resets all editable elements to their original value.
       */
      var cancelEdition = function(){
        for(var i = 0 ; i < scope.elements.length ; i++)
          scope.elements[i].resetElement();
      };
      
      /**
       * Toggles the edition of all editable elements. 
       * @param Boolean open true to open the edition mode, false
       * for the display mode
       */
      var openCloseEdition = function(open){
        for(var i = 0 ; i < scope.elements.length ; i++){
          open ? scope.elements[i].editElement() : scope.elements[i].displayElement();
        }
      };
    };
  });
  
  function ovEditable(ovEditableLink){
    return{
      restrict : "E",
      require : ["^ovForm", "^form"],
      transclude : true,
      scope : {
        ovValue : "=",
        ovOptions : "=?",
        ovRequired : "@",
        ovType : "@",
        ovMultiple : "@",
        ovDisabled : "=?",
        ovName : "@"
      },
      link : ovEditableLink
    };
  };
  
  app.factory("ovEditableLink", ["$compile", "$injector", function($compile, $injector){
    return function(scope, element, attrs, controllers, transclude){
      var editableElement;
      var ovFormController = controllers[0];
      
      // Get an instance of the editable element depending on
      // it's type
      switch(scope.ovType){
          
        // Text editable element
        case "text" :
          var TextEditableElement = $injector.get("OvTextEditableElement");
          editableElement = new TextEditableElement(scope.ovName, scope.ovValue, scope.ovRequired);
        break; 
          
        // Select editable element
        case "select" :
          var SelectEditableElement = $injector.get("OvSelectEditableElement");
          editableElement = new SelectEditableElement(scope.ovName, scope.ovValue, scope.ovRequired, scope.ovOptions, scope.ovMultiple, scope);
        break;
          
        // Checkbox editable element
        case "checkbox" :
          var CheckboxEditableElement = $injector.get("OvCheckboxEditableElement");
          editableElement = new CheckboxEditableElement(scope.ovName, scope.ovValue, scope.ovRequired, scope.ovOptions, scope);
        break;
          
        default : 
          throw new Error("Editable element type " + scope.ovType + " is not supported");
        break;

      }
      
      /**
       * Opens element edition mode.
       * It transforms the element into an editable one.
       */
      scope.editElement = function(){
        element.empty();
        
        var editableElementForm = editableElement.getFormDisplay();
        
        // Add editable HTML to the element
        // The new HTML needs to be compiled because it contains 
        // angular instructions
        element.append(editableElementForm);
        $compile(editableElementForm)(scope);
      };
      
      /**
       * Displays element into text.
       */
      scope.displayElement = function(){
        element.empty();
        
        var editableElementText = editableElement.getTextDisplay();
        element.append(editableElementText);        
      };
      
      /**
       * Resets element to its initial value.
       */
      scope.resetElement = function(){
        editableElement.reset();
      };
      
      // By default display the element as text
      scope.displayElement();
      ovFormController.addElement(scope, controllers[1]);
    };
  }]);

})(angular);