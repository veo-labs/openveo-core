'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as an HTML element ov-tags to be able to create a tags form element.
   *
   * Tags form element is composed of an input element to add tags followed by the list of added tags.
   *
   * @example
   *     var listOfTags = ['tag1', 'tag2'];
   *     <ov-tags ng-model="listOfTags" ng-model-options="{ allowInvalid: true }"></ov-tags>
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
      scope: true,
      link: function(scope, el, attrs, controllers) {
        var ngModelCtrl = controllers[0];
        scope.editableTagsInput = '';

        /**
         * Renders the list of tags using the model.
         *
         * It overrides AngularJS $render.
         */
        ngModelCtrl.$render = function() {
          scope.tags = angular.copy(ngModelCtrl.$viewValue) || [];
        };

        /**
         * Adds a new tag when user press "enter".
         *
         * @param {Event} event The keyboard event
         */
        scope.addTag = function(event) {

          // Capture "enter" key
          if (event.keyCode === 13) {

            // Only register non empty tags
            if (scope.editableTagsInput) {
              scope.tags.push(scope.editableTagsInput);
              scope.editableTagsInput = '';
              ngModelCtrl.$setViewValue(angular.copy(scope.tags));
            }

            // Stop event propagation and default
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();

            // Validate the model
            ngModelCtrl.$validate();
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
          ngModelCtrl.$setViewValue(angular.copy(scope.tags));

          // Stop event propagation and default
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();

          // Validate the model
          ngModelCtrl.$validate();

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

      }
    };
  }

  app.directive('ovTags', ovTags);

})(angular.module('ov'));
