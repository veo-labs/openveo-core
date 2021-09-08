'use strict';

(function(app) {

  /**
   * Manages ovDateTimePicker directive.
   *
   * @param {Object} $element The HTML element holding the component
   * @param {Object} $timeout AngularJS $timeout service
   * @param {Object} $scope Directive isolated scope
   */
  function OvDateTimePickerController($element, $timeout, $scope) {
    var ctrl = this;
    var ngModelCtrl = $element.controller('ngModel');
    var datePickerNgModelCtrl;
    var timePickerNgModelCtrl;

    Object.defineProperties(ctrl,

      /** @lends module:ov~ovDateTimePicker */
      {

        /**
         * Indicates if the calendar is opened or not.
         *
         * @type {Boolean}
         * @default false
         * @instance
         */
        calendarIsOpened: {
          value: false,
          writable: true
        },

        /**
         * The date.
         *
         * @type {Date}
         * @default null
         * @instance
         */
        date: {
          value: null,
          writable: true
        },

        /**
         * The time.
         *
         * @type {Date}
         * @default null
         * @instance
         */
        time: {
          value: null,
          writable: true
        },

        /**
         * Sets blur listeners on AngularJS Bootstrap time picker inputs.
         *
         * Date time picker component should be set as touched focus leaves one of the time picker inputs.
         *
         * @ignore
         */
        $postLink: {
          value: function() {

            // Wait for the end of the digest loop to be able to access time picker template elements.
            // Time picker template is loaded from templates cache
            $timeout(function() {
              var inputElements = $element[0].querySelectorAll('.ov-time-picker input');
              var datePickerElement = angular.element($element[0].querySelector('input[uib-datepicker-popup]'));
              var timePickerElement = angular.element($element[0].querySelector('div[uib-timepicker]'));

              for (var i = 0; i < inputElements.length; i++) {
                var inputElement = inputElements[i];
                angular.element(inputElement).on('blur', ctrl.setAsTouched.bind(ctrl));
              }

              // Retrieve date picker and time picker ngModel controllers
              datePickerNgModelCtrl = datePickerElement.controller('ngModel');
              timePickerNgModelCtrl = timePickerElement.controller('ngModel');
            });

          }
        },

        /**
         * Opens the date picker.
         *
         * @method
         * @memberof module:ov~ovDateTimePicker
         * @instance
         */
        openDatePicker: {
          value: function() {
            ctrl.calendarIsOpened = true;
          }
        },

        /**
         * Sets the model using both date and time.
         *
         * @method
         * @memberof module:ov~ovDateTimePicker
         * @instance
         */
        updateModelValue: {
          value: function() {
            if (!datePickerNgModelCtrl || !timePickerNgModelCtrl) return;
            ngModelCtrl.$setValidity('dateTime', (datePickerNgModelCtrl.$valid && timePickerNgModelCtrl.$valid));

            if (datePickerNgModelCtrl.$invalid || timePickerNgModelCtrl.$invalid) return;

            if (!ctrl.date) return ngModelCtrl.$validate();

            var date = angular.copy(ctrl.date);
            date.setHours(ctrl.time ? ctrl.time.getHours() : 0);
            date.setMinutes(ctrl.time ? ctrl.time.getMinutes() : 0);
            date.setSeconds(0);
            ngModelCtrl.$setViewValue(date);
            ngModelCtrl.$validate();
          }
        },

        /**
         * Sets form element as touched.
         *
         * @method
         * @memberof module:ov~ovDateTimePicker
         * @instance
         */
        setAsTouched: {
          value: function() {
            ngModelCtrl.$setTouched();
          }
        }
      }
    );

    /**
     * Renders the value using the model.
     *
     * The directive stores two dates: one for the date and one for the time. The model is a single date with both
     * date and time.
     *
     * It overrides AngularJS $render.
     */
    ngModelCtrl.$render = function() {
      ctrl.date = angular.copy(ngModelCtrl.$viewValue);
      ctrl.time = angular.copy(ngModelCtrl.$viewValue);
    };

    /**
     * Tests if the model is empty.
     *
     * It overrides AngularJS $isEmpty.
     *
     * @param {Date} value The date
     * @return {Boolean} true if no date, false otherwise
     */
    ngModelCtrl.$isEmpty = function(value) {
      return !ctrl.date;
    };

    /**
     * Tests if Bootstrap date picker and time picker are valid.
     *
     * @return {Boolean} true if both date picker and time picker are valid, false otherwise
     */
    ngModelCtrl.$validators.dateTime = function() {
      if (!datePickerNgModelCtrl || !timePickerNgModelCtrl) return true;
      return (datePickerNgModelCtrl.$valid && timePickerNgModelCtrl.$valid);
    };

    // Listen to date picker and time picker modifications
    $scope.$watch('$ctrl.date', ctrl.updateModelValue.bind(ctrl));
    $scope.$watch('$ctrl.time', ctrl.updateModelValue.bind(ctrl));

  }

  app.controller('OvDateTimePickerController', OvDateTimePickerController);
  OvDateTimePickerController.$inject = ['$element', '$timeout', '$scope'];

})(angular.module('ov'));
