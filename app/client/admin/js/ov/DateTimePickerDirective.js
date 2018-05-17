'use strict';

(function(app) {

  /**
   * Creates a new AngularJS directive as an HTML element ov-date-time-picker to be able to create a date / time form
   * element.
   *
   * Date / time form element is composed of an AngularJS Bootstrap UI datepicker and an AngularJS Bootstrap UI
   * timepicker.
   *
   * Attributes are:
   *   - [String] **ov-current-text**: The text to display for the current day button
   *   - [String] **ov-clear-text**: The text to display for the clear button
   *   - [String] **ov-close-text**: The text to display for the close button
   *
   * @example
   *     var dateTime = new Date('2018-05-15 15:48:42');
   *     <ov-date-time-picker ng-model="dateTime"
   *                          ov-current-text="Today"
   *                          ov-clear-text="Clear"
   *                          ov-close-text="Close"
   *     ></ov-date-time-picker>
   *
   * @module ov
   * @class ovDateTimePicker
   */
  function ovDateTimePicker() {
    return {
      restrict: 'E',
      templateUrl: 'ov-core-date-time-picker.html',
      require: ['?ngModel'],
      replace: true,
      scope: {
        currentText: '@?ovCurrentText',
        clearText: '@?ovClearText',
        closeText: '@?ovCloseText'
      },
      controller: 'OvDateTimePickerController',
      controllerAs: '$ctrl'
    };
  }

  app.directive('ovDateTimePicker', ovDateTimePicker);

})(angular.module('ov'));
