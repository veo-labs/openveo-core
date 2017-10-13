'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as an HTML element ov-tags to be able to create a tags form element.
   *
   * Tags form element is composed of an input element to add tags followed by the list of added tags.
   *
   * Attributes are:
   *   - ov-available-options to define possible values. If set, only values inside ov-available-options can
   *     be added and auto-completion is activated. (This must be an assignable variable evaluated as an array)
   *     e.g.
   *     [
   *       {
   *         name: 'First name',
   *         value: 'firstValue'
   *       }
   *       {
   *         name: 'Second name',
   *         value: 'secondValue'
   *       }
   *     ];
   *   - ov-placeholder to set the input placeholder
   *
   * @example
   *     var placeholder = 'Enter tags';
   *     var listOfTags = ['tag1', 'tag2'];
   *     var availableOptions = [
   *       {
   *         name: 'Tag 1',
   *         value: 'tag1'
   *       },
   *       {
   *         name: 'Tag 2',
   *         value: 'tag2'
   *       },
   *       {
   *         name: 'Tag 3',
   *         value: 'tag3'
   *       }
   *     ];
   *     <ov-tags ng-model="listOfTags"
   *              ng-model-options="{ allowInvalid: true }"
   *              ov-available-options="availableOptions"
   *              ov-placeholder="placeholder">
   *     </ov-tags>
   *
   * @module ov
   * @class ovTags
   */
  function ovTags() {
    return {
      restrict: 'E',
      templateUrl: 'ov-core-tags.html',
      require: ['?ngModel'],
      replace: true,
      scope: {
        ovAvailableOptions: '=?',
        ovPlaceholder: '=?'
      },
      link: function(scope, el, attrs, controllers) {
        var ngModelCtrl = controllers[0];
        scope.editableTagsInput = '';
        scope.autoCompleteValues = [];

        /**
         * Updates and validates directive attributes.
         */
        function updateAttributes() {
          scope.ovAvailableOptions =
          scope.availableOptions = (typeof scope.ovAvailableOptions === 'undefined') ? null : scope.ovAvailableOptions;

          scope.ovPlaceholder =
          scope.placeholder = (typeof scope.ovPlaceholder === 'undefined') ? '' : scope.ovPlaceholder;
        }

        /**
         * Gets tag values.
         *
         * The directive stores either the list of values or the list of options depending
         * on ovAvailableOptions attribute. Model should receive only the list of values.
         *
         * When directive does not have ovAvailableOptions, scope.tags stores values.
         * When directive has ovAvailableOptions, scope.tags contains options (objects with name and value properties).
         *
         * @return {Array} The list of values
         */
        function getValues() {

          // Directive without options
          if (!scope.availableOptions)
            return angular.copy(scope.tags);

          // Directive with options
          // Retrieve values from available options
          var values = [];
          scope.tags.forEach(function(name) {
            for (var i = 0; i < scope.availableOptions.length; i++) {
              if (scope.availableOptions[i].name === name) {
                values.push(scope.availableOptions[i].value);
                break;
              }
            }
          });

          return values;
        }

        /**
         * Renders the list of values using the model.
         *
         * The directive stores either the list of values or the list of options depending
         * on ovAvailableOptions attribute. Model should receive only the list of values.
         *
         * When directive does not have ovAvailableOptions, scope.tags stores values.
         * When directive has ovAvailableOptions, scope.tags contains options (objects with name and value properties).
         *
         * It overrides AngularJS $render.
         */
        ngModelCtrl.$render = function() {

          // Directive without options
          if (!scope.availableOptions)
            scope.tags = angular.copy(ngModelCtrl.$viewValue) || [];
          else {

            // Directive with options
            // Retrieve values from available options
            scope.tags = [];
            (ngModelCtrl.$viewValue || []).forEach(function(value) {
              for (var i = 0; i < scope.availableOptions.length; i++) {
                if (scope.availableOptions[i].value === value) {
                  scope.tags.push(scope.availableOptions[i].name);
                  break;
                }
              }
            });

          }
        };

        /**
         * Add a new tag.
         *
         * @param {String} tag Either the name of the option if ovAvailableOptions is specified or the value if not
         */
        scope.addTag = function(tag) {

          // Without options
          if ((!scope.availableOptions) &&
              (tag && scope.tags.indexOf(tag) === -1)
             ) {
            scope.editableTagsInput = '';
            scope.tags.push(tag);
            ngModelCtrl.$setViewValue(getValues());

            // Validate the model
            ngModelCtrl.$validate();
            return;
          }

          // With options
          // Make sure tag is part of available values
          if (scope.availableOptions) {
            for (var i = 0; i < scope.availableOptions.length; i++) {
              if (scope.availableOptions[i].name === tag) {

                // Only register not already entered tags
                if (tag && scope.tags.indexOf(scope.availableOptions[i].name) === -1) {
                  scope.tags.push(tag);
                  ngModelCtrl.$setViewValue(getValues());

                  // Validate the model
                  ngModelCtrl.$validate();
                }

                // Clean up input and auto complete
                scope.editableTagsInput = '';
                scope.autoComplete();

                break;
              }
            }
          }

        };

        /**
         * Handles keys.
         *
         * Add a new tag when user press "enter".
         *
         * @param {Event} event The keyboard event
         */
        scope.handleKeys = function(event) {

          // Capture "enter" key
          if (event.keyCode === 13) {

            scope.addTag(scope.editableTagsInput);

            // Stop event propagation and default
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();

          }

        };

        /**
         * Removes a tag when user click on the delete icon.
         *
         * @param {Event} event The click event
         * @param {Number} index The index of the tag to remove in the list of tags
         */
        scope.removeTag = function(event, index) {

          // Remove tag
          scope.tags.splice(index, 1);
          ngModelCtrl.$setViewValue(getValues());

          // Stop event propagation and default
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();

          // Validate the model
          ngModelCtrl.$validate();

        };

        /**
         * Displays auto-complete depending on the given input value.
         */
        scope.autoComplete = function() {

          // No predefined options, thus no auto-complete
          if (!scope.availableOptions) return;

          // Clear actual auto-complete list
          scope.autoCompleteValues.splice(0, scope.autoCompleteValues.length);

          // Search all auto-complete names which start by the input value (case insensitive)
          if (scope.editableTagsInput) {
            scope.availableOptions.forEach(function(option) {
              if (option.name.toLowerCase().indexOf(scope.editableTagsInput.toLowerCase()) === 0)
                scope.autoCompleteValues.push(option);
            });
          }
        };

        /**
         * Tests if the model is empty.
         *
         * It overrides AngularJS $isEmpty.
         *
         * @param {Array} values The list of tags
         * @return {Boolean} true if there is no tags, false otherwise
         */
        ngModelCtrl.$isEmpty = function(values) {
          return !values || values.length === 0;
        };

        // Watch for attributes changes
        scope.$watch('ovAvailableOptions', updateAttributes);
        scope.$watch('ovPlaceholder', updateAttributes);

        updateAttributes();
      }
    };
  }

  app.directive('ovTags', ovTags);

})(angular.module('ov'));
