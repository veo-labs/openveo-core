'use strict';

window.assert = chai.assert;

// DateTimePickerDirective.js
describe('DateTimePickerDirective', function() {
  var $compile;
  var $rootScope;
  var $filter;
  var $timeout;
  var scope;

  // Load modules
  beforeEach(function() {
    module('ov');
    module('inline-templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$filter_, _$timeout_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $filter = _$filter_;
    $timeout = _$timeout_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
  });

  it('should be able to open the date picker when clicking on the calendar button', function() {
    scope.date = new Date('2018-05-16 05:42:12');
    var element = angular.element('<ov-date-time-picker ng-model="date"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var datePickerButton = angular.element(element.find('button')[0]);

    datePickerButton.triggerHandler({type: 'click'});
    scope.$apply();

    assert.isNotEmpty(element[0].querySelector('.uib-datepicker-popup'), 'Expected date picker to be opened');
  });

  it('should be able to configure button texts of the date picker', function() {
    scope.date = new Date('2018-05-16 05:42:12');
    scope.expectedTodayText = 'Today text';
    scope.expectedClearText = 'Clear text';
    scope.expectedCloseText = 'Close text';
    var element = angular.element('<ov-date-time-picker ng-model="date"' +
                                  ' ov-current-text="{{expectedTodayText}}"' +
                                  ' ov-clear-text="{{expectedClearText}}"' +
                                  ' ov-close-text="{{expectedCloseText}}"' +
                                  '></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var datePickerButton = angular.element(element.find('button')[0]);

    datePickerButton.triggerHandler({type: 'click'});
    scope.$apply();

    assert.equal(
      angular.element(element[0].querySelector('.uib-datepicker-current')).text(),
      scope.expectedTodayText,
      'Wrong today button text'
    );

    assert.equal(
      angular.element(element[0].querySelector('.uib-clear')).text(),
      scope.expectedClearText,
      'Wrong clear button text'
    );

    assert.equal(
      angular.element(element[0].querySelector('.uib-close')).text(),
      scope.expectedCloseText,
      'Wrong close button text'
    );
  });

  it('should render model value as separated date and time', function() {
    scope.date = new Date('2018-05-16 05:42:12');
    var element = angular.element('<ov-date-time-picker ng-model="date"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var dateInput = angular.element(element[0].querySelector('input'));
    var hoursInput = angular.element(element[0].querySelector('.hours input'));
    var minutesInput = angular.element(element[0].querySelector('.minutes input'));

    assert.equal(
      dateInput.val(),
      $filter('date')(scope.date, 'shortDate'),
      'Wrong date'
    );

    assert.equal(
      hoursInput.val(),
      scope.date.getHours(),
      'Wrong hours'
    );

    assert.equal(
      minutesInput.val(),
      scope.date.getMinutes(),
      'Wrong minutes'
    );
  });

  it('should set component as invalid if date is not defined when required', function() {
    scope.date = null;
    var element = angular.element('<ov-date-time-picker ng-model="date" ng-required="true"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var ngModelController = element.controller('ngModel');

    assert.ok(ngModelController.$invalid, 'Expected field to be invalid');
  });

  it('should set component as invalid if date is removed when required', function() {
    scope.date = new Date('2018-05-16 05:42:12');
    var element = angular.element('<ov-date-time-picker ng-model="date" ng-required="true"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var ngModelController = element.controller('ngModel');
    var dateInput = angular.element(element[0].querySelector('input'));

    dateInput.val(null).triggerHandler('input');
    scope.$apply();

    assert.ok(ngModelController.$invalid, 'Expected field to be invalid');
  });

  it('should update model when date or time change', function() {
    scope.date = null;
    var element = angular.element('<ov-date-time-picker ng-model="date"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var ngModelController = element.controller('ngModel');
    var expectedDate = $filter('date')(new Date('2018-05-16 00:00:00'), 'shortDate');
    var expectedHours = 5;
    var expectedMinutes = 42;
    var dateInput = angular.element(element[0].querySelector('input'));
    var hoursInput = angular.element(element[0].querySelector('.hours input'));
    var minutesInput = angular.element(element[0].querySelector('.minutes input'));

    dateInput.val(expectedDate).triggerHandler('input');
    hoursInput.val(expectedHours).triggerHandler('input');
    minutesInput.val(expectedMinutes).triggerHandler('input');
    scope.$apply();

    assert.ok(ngModelController.$valid, 'Expected field to be valid');
    assert.equal(
      scope.date.toString(),
      new Date(expectedDate + ' ' + expectedHours + ':' + expectedMinutes + ':00').toString(),
      'Wrong date time'
    );
  });

  it('should set component as valid without time when required', function() {
    scope.date = null;
    var element = angular.element('<ov-date-time-picker ng-model="date" ng-required="true"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var ngModelController = element.controller('ngModel');
    var expectedDate = new Date('2018-05-16 00:00:00');
    var dateInput = angular.element(element[0].querySelector('input'));
    var hoursInput = angular.element(element[0].querySelector('.hours input'));
    var minutesInput = angular.element(element[0].querySelector('.minutes input'));

    dateInput.val($filter('date')(expectedDate, 'shortDate')).triggerHandler('input');
    hoursInput.val(null).triggerHandler('input');
    minutesInput.val(null).triggerHandler('input');
    scope.$apply();

    assert.ok(ngModelController.$valid, 'Expected field to be valid');
    assert.equal(scope.date.toString(), expectedDate.toString(), 'Wrong date time');
  });

  it('should set component as invalid without date when required', function() {
    scope.date = new Date('2018-05-16 05:42:00');
    var element = angular.element('<ov-date-time-picker ng-model="date" ng-required="true"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var ngModelController = element.controller('ngModel');
    var dateInput = angular.element(element[0].querySelector('input'));

    dateInput.val(null).triggerHandler('input');
    scope.$apply();

    assert.ok(ngModelController.$invalid, 'Expected field to be invalid');
  });

  it('should set time to 0 if not specified', function() {
    scope.date = null;
    var element = angular.element('<ov-date-time-picker ng-model="date"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var ngModelController = element.controller('ngModel');
    var dateInput = angular.element(element[0].querySelector('input'));
    var hoursInput = angular.element(element[0].querySelector('.hours input'));
    var minutesInput = angular.element(element[0].querySelector('.minutes input'));
    var expectedDate = '2018-05-16';

    dateInput.val($filter('date')(new Date(expectedDate), 'shortDate')).triggerHandler('input');
    hoursInput.val(null).triggerHandler('input');
    minutesInput.val(null).triggerHandler('input');
    scope.$apply();

    assert.ok(ngModelController.$valid, 'Expected field to be valid');
    assert.equal(scope.date.toString(), new Date(expectedDate + ' 00:00:00').toString(), 'Wrong date time');
  });

  it('should set component as touched when leaving date input', function() {
    scope.date = null;
    var element = angular.element('<ov-date-time-picker ng-model="date"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var ngModelController = element.controller('ngModel');
    var dateInput = angular.element(element[0].querySelector('input'));

    dateInput.triggerHandler('blur');
    scope.$apply();

    assert.ok(ngModelController.$touched, 'Expected field to be touched');
  });

  it('should set component as touched when leaving hours input', function() {
    scope.date = null;
    var element = angular.element('<ov-date-time-picker ng-model="date"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var ngModelController = element.controller('ngModel');
    var hoursInput = angular.element(element[0].querySelector('.hours input'));

    hoursInput.triggerHandler('blur');
    scope.$apply();

    assert.ok(ngModelController.$touched, 'Expected field to be touched');
  });

  it('should set component as touched when leaving minutes input', function() {
    scope.date = null;
    var element = angular.element('<ov-date-time-picker ng-model="date"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var ngModelController = element.controller('ngModel');
    var minutesInput = angular.element(element[0].querySelector('.minutes input'));

    minutesInput.triggerHandler('blur');
    scope.$apply();

    assert.ok(ngModelController.$touched, 'Expected field to be touched');
  });

  it('should set component as invalid if date is invalid', function() {
    scope.date = null;
    var element = angular.element('<ov-date-time-picker ng-model="date"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var ngModelController = element.controller('ngModel');
    var dateInput = angular.element(element[0].querySelector('input'));

    dateInput.val('Wrong date').triggerHandler('input');
    scope.$apply();

    assert.ok(ngModelController.$invalid, 'Expected field to be invalid');
    assert.ok(ngModelController.$error.dateTime, 'Expected dateTime validator to be on error');
  });

  it('should set component as invalid if hours field is invalid', function() {
    scope.date = null;
    var element = angular.element('<ov-date-time-picker ng-model="date"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var ngModelController = element.controller('ngModel');
    var dateInput = angular.element(element[0].querySelector('input'));
    var hoursInput = angular.element(element[0].querySelector('.hours input'));

    dateInput.val(new Date('2018-05-18 06:42:23')).triggerHandler('input');
    hoursInput.val(42).triggerHandler('input');
    scope.$apply();

    assert.ok(ngModelController.$invalid, 'Expected field to be invalid');
    assert.ok(ngModelController.$error.dateTime, 'Expected dateTime validator to be on error');
  });

  it('should set component as invalid if minutes field is invalid', function() {
    scope.date = null;
    var element = angular.element('<ov-date-time-picker ng-model="date"></ov-date-time-picker>');
    element = $compile(element)(scope);
    scope.$apply();
    $timeout.flush();

    var ngModelController = element.controller('ngModel');
    var dateInput = angular.element(element[0].querySelector('input'));
    var minutesInput = angular.element(element[0].querySelector('.minutes input'));

    dateInput.val(new Date('2018-05-18 06:42:23')).triggerHandler('input');
    minutesInput.val(80).triggerHandler('input');
    scope.$apply();

    assert.ok(ngModelController.$invalid, 'Expected field to be invalid');
    assert.ok(ngModelController.$error.dateTime, 'Expected dateTime validator to be on error');
  });

});
