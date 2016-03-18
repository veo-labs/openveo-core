'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as an HTML element ov-multi-check-box to be able to create a list of checkboxes
   * with a single model.
   *
   * @example
   *
   *     // The checkboxes to select (the model)
   *     $scope.listOfValues = ['value1'];
   *
   *     // The list of checkboxes with a name and a value for each checkbox
   *     $scope.listOfOptions = [{
   *       name: 'name1'
   *       id: 'value1'
   *     },
   *     {
   *       name: 'name2'
   *       id: 'value2'
   *     }];
   *
   *     // The property to use as a label in listOfOptions object ("name" by default)
   *     $scope.labelProperty = 'name';
   *
   *     // The property to use as a value in listOfOptions object ("value" by default)
   *     $scope.valueProperty = 'id';
   *
   *     // A boolean to activate / deactivate the group of checkboxes
   *     $scope.disabled = false;
   *
   *     <ov-multi-check-box
   *       ng-model="listOfValues"
   *       options="listOfOptions"
   *       label-property="labelProperty"
   *       value-property="valueProperty"
   *       disabled="disabled"
   *       ng-model-options="{ allowInvalid: true }">
   *     </ov-multi-check-box>
   *
   * @module ov
   * @class ovMultiCheckBox
   */
  function ovMultiCheckBox() {
    return {
      restrict: 'E',
      templateUrl: 'ov-core-mutli-check-box.html',
      require: ['?ngModel'],
      replace: true,
      scope: {
        options: '=',
        labelProperty: '=?',
        valueProperty: '=?',
        disabled: '=?'
      },
      link: function(scope, el, attrs, controllers) {
        var ngModelCtrl = controllers[0];
        var lastView, lastViewRef = NaN;
        scope.labelProperty = scope.labelProperty || 'name';
        scope.valueProperty = scope.valueProperty || 'value';

        /**
         * Finds the index of the given value in the list of checkboxes.
         *
         * @param {Number} value The value of the checkbox
         * @return {Number} The index of the checkbox in the list of checkboxes (-1 if not found)
         */
        function getValueIndex(value) {
          for (var i = 0; i < scope.options.length; i++) {
            if (scope.options[i][scope.valueProperty] === value)
              return i;
          }
          return -1;
        }

        /**
         * Renders the list of checkboxes using the model.
         *
         * It overrides AngularJS $render.
         */
        ngModelCtrl.$render = function() {
          var defaults = angular.copy(ngModelCtrl.$viewValue) || [];
          scope.values = [];

          // Build checkboxes model values
          for (var i = 0; i < defaults.length; i++) {
            var index = getValueIndex(defaults[i]);

            if (index >= 0)
              scope.values[index] = true;
          }
        };

        /**
         * Updates model when a checkbox is modified.
         */
        scope.onChange = function() {
          var values = [];

          // Get checked checkboxes
          for (var i = 0; i < scope.values.length; i++) {
            if (scope.values[i])
              values.push(scope.options[i][scope.valueProperty]);
          }

          ngModelCtrl.$setViewValue(values);
        };

        /**
         * Listens to model modifications coming from outside the directive.
         *
         * If model is modified from outside the directive, the view needs to be updated.
         */
        scope.$watch(function() {
          if (lastViewRef === ngModelCtrl.$viewValue && !angular.equals(lastView, ngModelCtrl.$viewValue)) {
            lastView = angular.copy(ngModelCtrl.$viewValue);
            ngModelCtrl.$render();
          }
          lastViewRef = ngModelCtrl.$viewValue;
        });

        /**
         * Tests if the model is empty.
         *
         * It overrides AngularJS $isEmpty.
         *
         * @param {Array} values The list of checkboxes
         * @return {Boolean} true if there is no checked checkboxes, false otherwise
         */
        ngModelCtrl.$isEmpty = function(values) {
          return !values || values.length === 0;
        };

      }
    };
  }

  app.directive('ovMultiCheckBox', ovMultiCheckBox);

})(angular.module('ov'));
