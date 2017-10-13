'use strict';

window.assert = chai.assert;

// MatchDirective.js
describe('MatchDirective', function() {
  var $compile;
  var $rootScope;
  var scope;

  // Load modules
  beforeEach(function() {
    module('ov');
    module('inline-templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
  });

  it('should be able to authorize multiple matches', function() {
    scope.multiple = true;
    scope.data = [{}];

    var element = angular.element('<ov-match ng-model="data" ov-multiple="multiple"></ov-match>');
    element = $compile(element)(scope);
    scope.$digest();

    assert.isDefined(element[0].getElementsByClassName('ov-field-match-add-button')[0]);
  });

  it('should not authorize more than one match if not multiple', function() {
    scope.multiple = false;
    scope.data = [{}];

    var element = angular.element('<ov-match ng-model="data" ov-multiple="multiple"></ov-match>');
    element = $compile(element)(scope);
    scope.$digest();

    assert.isUndefined(element[0].getElementsByClassName('ov-field-match-add-button')[0]);
  });

  it('should set ov-multiple to false by default', function() {
    scope.data = [];

    var element = angular.element('<ov-match ng-model="data"></ov-match>');
    element = $compile(element)(scope);
    scope.$digest();

    var elementScope = element.isolateScope();
    assert.ok(elementScope.multiple);
  });

  it('should be able to add a new match', function() {
    var expectedValue = 'value';
    var expectedValues = ['value1', 'value2'];
    scope.data = [];

    var element = angular.element('<ov-match ng-model="data"></ov-match>');
    element = $compile(element)(scope);
    scope.$digest();

    var addButton = angular.element(element[0].getElementsByClassName('ov-field-match-add-button')[0]);
    addButton.triggerHandler('click', 0);
    scope.$apply();

    var inputController = angular.element(element.find('input')[0]).controller('ngModel');
    var tagsController = angular.element(element[0].getElementsByClassName('ov-field-tags')[0]).controller('ngModel');

    inputController.$setViewValue(expectedValue);
    tagsController.$setViewValue(expectedValues);
    scope.$apply();

    assert.equal(scope.data.length, 1);
    assert.equal(scope.data[0].value, expectedValue);
    assert.sameMembers(scope.data[0].values, expectedValues);
  });

  it('should be able to remove a match', function() {
    scope.data = [
      {
        value: 'value',
        values: ['value1', 'value2']
      }
    ];

    var element = angular.element('<ov-match ng-model="data"></ov-match>');
    element = $compile(element)(scope);
    scope.$digest();

    var removeButton = angular.element(element[0].getElementsByClassName('ov-field-match-remove-icon')[0]);
    removeButton.triggerHandler('click', 0);
    scope.$apply();

    assert.equal(scope.data.length, 0);
  });

  it('should be considered empty if there is no value and / or no values', function() {
    var element = angular.element('<ov-match ng-model="data"></ov-match>');
    element = $compile(element)(scope);
    scope.$digest();

    var ngModelController = element.controller('ngModel');

    assert.ok(ngModelController.$isEmpty());
    assert.ok(ngModelController.$isEmpty([]));
    assert.ok(ngModelController.$isEmpty([{}]));
    assert.ok(ngModelController.$isEmpty([{value: 'value'}]));
    assert.ok(ngModelController.$isEmpty([{value: 'value', values: []}]));
  });

  it('should be able to set the add button label', function() {
    scope.addLabel = 'Add label';
    scope.data = [];

    var element = angular.element('<ov-match ng-model="data" ov-add-label="addLabel"></ov-match>');
    element = $compile(element)(scope);
    scope.$digest();

    var addLabel = angular.element(element[0].getElementsByClassName('ov-field-match-add-label')[0]);
    scope.$apply();

    assert.equal(addLabel.text(), scope.addLabel);
  });

  it('should be able to set input placeholder', function() {
    scope.placeholder = 'Placeholder';
    scope.data = [
      {
        value: 'value',
        values: ['value1', 'value2']
      }
    ];

    var element = angular.element('<ov-match ng-model="data" ov-input-placeholder="placeholder"></ov-match>');
    element = $compile(element)(scope);
    scope.$digest();

    var input = element.find('input');

    scope.$apply();
    assert.equal(input.attr('placeholder'), scope.placeholder);
  });

  it('should be able to set tags placeholder', function() {
    scope.placeholder = 'Placeholder';
    scope.data = [{}];

    var element = angular.element('<ov-match ng-model="data" ov-tags-placeholder="placeholder"></ov-match>');
    element = $compile(element)(scope);
    scope.$digest();

    var input = angular.element(element.find('input')[1]);

    scope.$apply();
    assert.equal(input.attr('placeholder'), scope.placeholder);
  });

  it('should be able to set the name of the model properties', function() {
    var expectedValue = 'value';
    var expectedValues = ['value1', 'value2'];
    scope.inputProperty = 'inputProperty';
    scope.tagsProperty = 'tagsProperty';
    scope.data = [{}];

    var element = angular.element('<ov-match ng-model="data" ' +
                                  'ov-input-property="inputProperty" ' +
                                  'ov-tags-property="tagsProperty"></ov-match>');
    element = $compile(element)(scope);
    scope.$digest();

    var inputController = angular.element(element.find('input')[0]).controller('ngModel');
    var tagsController = angular.element(element[0].getElementsByClassName('ov-field-tags')[0]).controller('ngModel');

    inputController.$setViewValue(expectedValue);
    tagsController.$setViewValue(expectedValues);
    scope.$apply();

    assert.equal(scope.data[0][scope.inputProperty], expectedValue);
    assert.sameMembers(scope.data[0][scope.tagsProperty], expectedValues);
  });

  it('should be able to set ov-tags options', function() {
    scope.data = [{}];
    scope.options = [
      {
        name: 'name',
        value: 'value'
      }
    ];

    var element = angular.element('<ov-match ng-model="data" ov-available-options="options"></ov-match>');
    element = $compile(element)(scope);
    scope.$digest();

    var tagsScope = angular.element(element[0].getElementsByClassName('ov-field-tags')[0]).isolateScope();

    assert.strictEqual(tagsScope.availableOptions, scope.options);
  });

});
