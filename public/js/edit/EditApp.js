(function(angular){

  "use strict"

  /**
   * Defines an application to facilitate inline editions of properties.
   * It defines two directives : 
   *  - ov-form As an attribute to transform an angular form into an
   *    inline editable form. ov-form exposes three methods : 
   *    - openEdition
   *      Make all ov-editable elements editable
   *    - closeEdition
   *      Make all ov-editable elements non editable
   *    - cancelEdition
   *      Cancel the edition (reset values) and close the edition
   *  - ov-editable As an element to add an inline editable element.
   *    Supported types are : 
   *    - text (transformed into an input text in edition)
   *
   * ov-editable elements must be within a form element with attribute 
   * ov-form.
   *
   * e.g.
   * <!-- The name of the form is also important to access 
   *      ov-form methods
   * -->
   * <form ov-form name="myForm" ng-submit="saveForm()">
   *  <ov-editable ov-value="value" ov-type="text"></ov-editable>
   *  <button type="button" ng-click="cancelEdition.cancelEdition()"></button>
   * </form>
   */
  var app = angular.module("ov.edit", []);
  app.directive("ovForm", ovForm);
  app.directive("ovEditable", ovEditable);
  ovForm.$inject = ["ovFormLink"];
  ovEditable.$inject = ["ovEditableLink", "$compile"];

  function ovForm(ovFormLink){
    return{
      restrict : "A",
      require : "^form",
      scope : {},
      link : ovFormLink,
      controller: ["$scope", function($scope){
        var form;
        $scope.fields = [];
        
        /**
         * Adds an editable field.
         * @param Object field The field scope to attach
         * @param Object formController The form controller to attach
         * the field to
         */
        this.addField = function(field, formController){
          form = formController;
          $scope.fields.push(field);
        };
        
        /**
         * Attaches field's model controller to the form controller.
         * This will attach the field model controller to the form to be 
         * able to keep benefit of the validation system.
         * @param Object controller The ng model controller associated to 
         * the field
         */
        this.addFieldController = function(controller){
          if(controller)
            form.$addControl(controller);
        };
        
        /**
         * Removes field model controller from form controller.
         * @param Object controller The ng model controller associated to 
         * the field
         */
        this.removeFieldController = function(controller){
          if(controller)
            form.$removeControl(controller);
        };
        
        /**
         * Validates form by validating each field.
         * TODO Find a way to attach the field to the form that the 
         * status of the form is automatically updated when the status
         * of a field has changed.
         */
        this.validateForm = function(){
          var valid = true;
          
          for(var i = 0 ; i < $scope.fields.length ; i++)
            if(!$scope.fields[i].validateField())
              valid = false;
          
          form.$setValidity(null, valid);
        };
      }]
    };
  };
  
  app.factory("ovFormLink", function(){
    return function(scope, element, attrs, formController){

      /**
       * Cancels edition.
       * This will reset all editable fields to their initial value.
       */
      formController.cancelEdition = function(){
        cancelEdition();
        formController.closeEdition();
      };
      
      /**
       * Opens the edition.
       * It transforms all editable fields into form elements.
       */
      formController.openEdition = function(){
        openCloseEdition(true);
      };      
      
      /**
       * Closes the edition.
       * It transforms all form elements into simple texts.
       */      
      formController.closeEdition = function(){
        openCloseEdition(false);
      };
      
      /**
       * Resets all editable fields to their original value.
       */
      var cancelEdition = function(){
        for(var i = 0 ; i < scope.fields.length ; i++)
          scope.fields[i].resetField();
      };
      
      /**
       * Toggles the edition. 
       * @param Boolean open true to open the edition mode, false
       * for the display mode
       */
      var openCloseEdition = function(open){
        for(var i = 0 ; i < scope.fields.length ; i++){
          open ? scope.fields[i].editField() : scope.fields[i].displayField();
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
        ovType : "@",
        ovOptions : "=?"
      },
      link : ovEditableLink
    };
  };
  
  app.factory("ovEditableLink", ["$compile", "$timeout", function($compile, $timeout){
    return function(scope, element, attrs, controllers, transclude){
      var transcludeElements, formElement, initialValue, formElementController;
      var ovFormController = controllers[0];

      /**
       * Sets field's value.
       * @param String value The new value for the field
       */
      var setFieldValue = function(value){
        if(!formElement)
          return;

          scope.ovValue = value;
      };

      /**
       * Opens field edition mode. 
       * It transforms the field into an editable field.
       */
      scope.editField = function(){
        element.html("");
        
        // Text field
        if(scope.ovType === "text"){
          
          // Set a change listener on field to launch form validation
          formElement.on("change", function(event){
            scope.$apply(function(){
              ovFormController.validateForm();
            });
          });
          
        }
        
        element.append(transcludeElements);
        $compile(formElement)(scope.$parent);
        
      };
      
      /**
       * Displays field into static mode.
       */
      scope.displayField = function(){
        
        // Text
        if(scope.ovType === "text")
          formElement.off("change");

        initialValue = scope.ovValue;
        element.html("<span>" + scope.ovValue + "</span>");
        
      };
      
      /**
       * Resets field with its initial value.
       */
      scope.resetField = function(){
        setFieldValue(initialValue);
      };
      
      /**
       * Tests if the field is valid or not using the ng model controller.
       * @return Boolean true if valid, false otherwise
       */
      scope.validateField = function(){
        return formElementController && formElementController.$valid;
      };
      
      /**
       * Handles destroy event to remove field ng model controller from 
       * form controller when scope is destroyed.
       */
      scope.$on("destroy", function(){
         ovFormController.removeFieldController(formElementController);
      });
      
      transclude(function(clone, cloneScope){
        transcludeElements = clone;
        
        // Retrieve the form element from transcluded elements
        // (because other HTML elements can be in 
        // the transcluded elements)
        for(var i = 0 ; i < transcludeElements.length ; i++){
          var tagName = transcludeElements[i].tagName && transcludeElements[i].tagName.toLowerCase();
          if((scope.ovType === "text" && tagName === "input")
            || (scope.ovType === "select" && tagName === "select")
          ){
            formElement = angular.element(transcludeElements[i]);
            
            // Wait for next loop to let parser creates the ng model
            // controller
            $timeout(function(){

              // Set field value
              initialValue = scope.ovValue || "";
              setFieldValue(initialValue);

              // Add editable field to the form and display field
              ovFormController.addField(scope, controllers[1]);
              scope.displayField();

              // Retrieve field ng model controller
              formElementController = formElement.controller("ngModel");

              // Attach field ng model controller to the form controller
              ovFormController.addFieldController(formElementController);

            });

            return;
          }
        }

      });

    };
  }]);

})(angular);