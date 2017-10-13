'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as an HTML element ov-match to be able to associate  a value with
   * a list of values.
   *
   * Match form element is composed of an input element and an ov-tags element.
   *
   * Attributes are:
   *   - ov-available-options to define possible values for the ov-tags element (This must be an assignable
   *     variable evaluated as an array)
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
   *   - ov-multiple to authorize multiple association (This must be an assignable variable evaluated as a boolean)
   *   - ov-add-label to set the add button label (This must be an assignable variable evaluated as a string)
   *   - ov-input-placeholder to set the input placeholder (This must be an assignable variable evaluated as a string)
   *   - ov-tags-placeholder to set the ov-tags placeholder (This must be an assignable variable evaluated as a string)
   *   - ov-input-property to set the name of the property used to store the input value (This must be an assignable
   *     variable evaluated as a string)
   *   - ov-tags-property to set the name of the property used to store the ov-tags values (This must be an assignable
   *     variable evaluated as a string)
   *
   * @example
   *     // Associates "value" with "associatedValue1", "associatedValue2"
   *     var matches = [
   *       {
   *         value: 'value',
   *         values: ['associatedValue1', 'associatedValue2'],
   *       }
   *     ];
   *
   *     // Available options which can be entered in ov-tags element
   *     var availableOptions = [
   *       {
   *         name: 'Associated value 1',
   *         value: 'associatedValue1'
   *       },
   *       {
   *         name: 'Associated value 2',
   *         value: 'associatedValue2'
   *       },
   *       {
   *         name: 'Associated value 3',
   *         value: 'associatedValue3'
   *       }
   *     ];
   *
   *     var inputPlaceholder = 'Input placeholder';
   *     var tagsPlaceholder = 'Tags placeholder';
   *     var inputProperty = 'firstElement';
   *     var tagsProperty = 'secondElement';
   *     var addLabel = 'Add a new association';
   *
   *     <ov-match ng-model="matches"
   *               ng-model-options="{allowInvalid: true}"
   *               ov-multiple="{{true}}"
   *               ov-available-options="availableOptions"
   *               ov-input-placeholder="inputPlaceholder"
   *               ov-tags-placeholder="tagsPlaceholder"
   *               ov-input-property="inputProperty"
   *               ov-tags-property="tagsProperty"
   *               ov-add-label="addLabel">
   *     </ov-match>
   *
   * @module ov
   * @class ovMatch
   */
  function ovMatch() {
    return {
      restrict: 'E',
      templateUrl: 'ov-core-match.html',
      require: ['?ngModel'],
      replace: true,
      scope: {
        ovMultiple: '=?',
        ovAvailableOptions: '=?',
        ovAddLabel: '=?',
        ovInputPlaceholder: '=?',
        ovTagsPlaceholder: '=?',
        ovInputProperty: '=?',
        ovTagsProperty: '=?'
      },
      link: function(scope, el, attrs, controllers) {
        var ngModelCtrl = controllers[0];

        /**
         * Updates and validates directive attributes.
         */
        function updateAttributes() {
          scope.ovAddLabel =
          scope.addLabel = (typeof scope.ovAddLabel === 'undefined') ? '' : scope.ovAddLabel;

          scope.ovMultiple =
          scope.multiple = (typeof scope.ovMultiple === 'undefined') ? true : scope.ovMultiple;

          scope.ovAvailableOptions =
          scope.availableOptions = (typeof scope.ovAvailableOptions === 'undefined') ? null : scope.ovAvailableOptions;

          scope.ovInputPlaceholder =
          scope.inputPlaceholder = (typeof scope.ovInputPlaceholder === 'undefined') ? '' : scope.ovInputPlaceholder;

          scope.ovTagsPlaceholder =
          scope.tagsPlaceholder = (typeof scope.ovTagsPlaceholder === 'undefined') ? '' : scope.ovTagsPlaceholder;

          scope.ovInputProperty =
          scope.inputProperty = (typeof scope.ovInputProperty === 'undefined') ? 'value' : scope.ovInputProperty;

          scope.ovTagsProperty =
          scope.tagsProperty = (typeof scope.ovTagsProperty === 'undefined') ? 'values' : scope.ovTagsProperty;
        }

        /**
         * Renders the list of matches using the model.
         *
         * It overrides AngularJS $render.
         */
        ngModelCtrl.$render = function() {
          scope.matches = angular.copy(ngModelCtrl.$viewValue) || [];
        };

        /**
         * Adds a new match.
         *
         * @method addMatch
         */
        scope.addMatch = function() {
          scope.matches.push({});
          scope.updateModel();
        };

        /**
         * Removes a match.
         *
         * @method removeMatch
         * @param {Number} index The index of the match to remove in the list of matches
         */
        scope.removeMatch = function(index) {
          scope.matches.splice(index, 1);
          scope.updateModel();
        };

        /**
         * Updates model with actual value.
         *
         * @method updateModel
         */
        scope.updateModel = function() {
          ngModelCtrl.$setViewValue(angular.copy(scope.matches));
          ngModelCtrl.$validate();
        };

        /**
         * Tests if the model is empty.
         *
         * It overrides AngularJS $isEmpty.
         * The input and the ov-tags elements must be filled otherwise ov-match is considered empty.
         *
         * @param {Array} values The list of matches
         * @return {Boolean} true if there is no matches, false otherwise
         */
        ngModelCtrl.$isEmpty = function(values) {
          return !values ||
            values.length === 0 ||
            (values.length === 1 && (!values[0].value || !values[0].values || !values[0].values.length));
        };

        // Watch for attributes changes
        scope.$watch('ovAddLabel', updateAttributes);
        scope.$watch('ovMultiple', updateAttributes);
        scope.$watch('ovAvailableOptions', updateAttributes);
        scope.$watch('ovInputPlaceholder', updateAttributes);
        scope.$watch('ovTagsPlaceholder', updateAttributes);

        updateAttributes();
      }
    };
  }

  app.directive('ovMatch', ovMatch);

})(angular.module('ov'));
