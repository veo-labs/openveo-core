'use strict';

(function(app) {

  /**
   * Creates a new AngularJS directive as an HTML element ov-auto-complete to be able to create a text field with
   * suggestions.
   *
   * Auto complete form element is composed of a simple input element and a list of suggestions which can be fetched
   * asynchronously.
   *
   * Attributes are:
   *   - ng-model The model value (This must be an assignable variable evaluated as an Object) with a property "name"
   *     and a property "value"
   *   - ov-placeholder The input placeholder text (This must be an assignable variable evaluated as a String)
   *   - ov-get-suggestions The function to get the list of suggestions (This must be an assignable variable evaluated
   *     as a Function). This function must return an AngularJS Promise resolving with a list of suggestions with,
   *     for each suggestion, a property "name" and a property "value"
   *
   * @example
   *     var placeholder = 'Placeholder';
   *     var getSuggestions = function() {
   *       return $q.when([
   *         {
   *           name: 'First suggestion',
   *           value: 1
   *         },
   *         {
   *           name: 'Second suggestion',
   *           value: 2
   *         }
   *       ]);
   *     };
   *     var model = {
   *       value: 42,
   *       name: 'Element name'
   *     };
   *     <ov-auto-complete ng-model="model"
   *                       ov-placeholder="placeholder"
   *                       ov-get-suggestions="getSuggestions">
   *     </ov-auto-complete>
   *
   * @module ov
   * @class ovAutoComplete
   */
  function ovAutoComplete() {
    return {
      restrict: 'E',
      templateUrl: 'ov-core-auto-complete.html',
      require: ['?ngModel'],
      replace: true,
      scope: {
        ovPlaceholder: '=?',
        ovGetSuggestions: '='
      },
      link: function(scope, el, attrs, controllers) {
        var ngModelCtrl = controllers[0];
        scope.element = {};
        scope.suggestions = [];

        /**
         * Updates and validates directive attributes.
         */
        function updateAttributes() {
          scope.ovPlaceholder =
          scope.placeholder = (typeof scope.ovPlaceholder === 'undefined') ? '' : scope.ovPlaceholder;
          scope.getSuggestions = scope.ovGetSuggestions;
        }

        /**
         * Updates model with actual value.
         *
         * @method updateModel
         */
        function updateModel() {
          if (scope.element.name && scope.element.value) {
            ngModelCtrl.$setViewValue({
              value: scope.element.value,
              name: scope.element.name
            });
          } else
            ngModelCtrl.$setViewValue(null);

          ngModelCtrl.$validate();
        }

        /**
         * Renders the input value using the model.
         *
         * It overrides AngularJS $render.
         */
        ngModelCtrl.$render = function() {
          scope.element.name = ngModelCtrl.$viewValue && ngModelCtrl.$viewValue.name;
          scope.element.value = ngModelCtrl.$viewValue && ngModelCtrl.$viewValue.value;
        };

        /**
         * Validates the input value and displays suggestions.
         *
         * @method validateValue
         */
        scope.validateValue = function() {
          if (!scope.element.name) {

            // Input is empty
            // Clear suggestions and update the model
            scope.updateSuggestions([]);
            return updateModel();

          }

          // Get suggestions for the input value
          scope.getSuggestions(scope.element.name).then(function(suggestions) {

            if (suggestions.length) {

              // Suggestions have been found for the input value
              // Find out if current input value match a suggestion
              for (var i = 0; i < suggestions.length; i++) {
                if (suggestions[i].name.toLowerCase() === scope.element.name.toLowerCase()) {

                  // Found a suggestion corresponding to the input value
                  // Validate suggestion
                  scope.validateSuggestion(suggestions[i]);
                  break;

                }
              }

              // Update the list of suggestions
              scope.updateSuggestions(suggestions);

            } else {

              // Input value does not correspond to any suggestion
              // Clear suggestions and update the model
              scope.updateSuggestions([]);
              scope.element.value = null;
              updateModel();

            }

          });
        };

        /**
         * Validates the suggestion and clear the list of suggestions.
         *
         * @method validateSuggestion
         * @param {Object} suggestion The suggestion
         * @param {String} suggestion.name The suggestion name
         * @param {String} suggestion.value The suggestion value
         */
        scope.validateSuggestion = function(suggestion) {
          scope.element.name = suggestion.name;
          scope.element.value = suggestion.value;
          scope.updateSuggestions([]);
          updateModel();
        };

        /**
         * Updates suggestions.
         *
         * @param {Array} suggestions The list of suggestions with, for each suggestion, a property "name" and a
         * property "value"
         */
        scope.updateSuggestions = function(suggestions) {

          // Clear actual list of suggestions
          scope.suggestions.splice(0, scope.suggestions.length);

          suggestions.forEach(function(suggestion) {
            if (suggestion.name.toLowerCase() !== scope.element.name.toLowerCase()) {

              // Suggestion is not the one in the input
              // Suggest it
              scope.suggestions.push({
                name: suggestion.name,
                value: suggestion.value
              });

            }
          });
        };

        /**
         * Tests if the model is empty.
         *
         * It overrides AngularJS $isEmpty.
         *
         * @param {String} value The model value
         * @return {Boolean} true if value is empty, false otherwise
         */
        ngModelCtrl.$isEmpty = function(value) {
          return !value;
        };

        // Watch for attributes changes
        scope.$watch('ovPlaceholder', updateAttributes);
        scope.$watch('ovGetSuggestions', updateAttributes);

        updateAttributes();
      }
    };
  }

  app.directive('ovAutoComplete', ovAutoComplete);

})(angular.module('ov'));
