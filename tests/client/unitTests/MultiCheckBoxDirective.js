'use strict';

window.assert = chai.assert;

// MultiCheckBoxDirective.js
describe('MultiCheckBoxDirective', function() {
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

  it('should be able to check a list of checkboxes using the model', function() {
    $rootScope.data = ['value2'];
    $rootScope.options = [
      {
        name: 'name1',
        value: 'value1'
      },
      {
        name: 'name2',
        value: 'value2'
      }
    ];

    var element = angular.element('<ov-multi-check-box ' +
                                  'ng-model="data" ' +
                                  'options="options" ' +
                                  'disabled="disabled"' +
                                  'ng-model-options="{ allowInvalid: true }"' +
                                  '></ov-multi-check-box>');
    element = $compile(element)(scope);
    scope.$digest();

    var elementScope = element.isolateScope();
    assert.equal(elementScope.options.length, $rootScope.options.length, 'Expected options to be set');
    assert.equal(elementScope.values.length, $rootScope.options.length, 'Expected values to be set');
    assert.isUndefined(elementScope.values[0], 'Unexpected value');
    assert.ok(elementScope.values[1], 'Expected a selected value');
  });

  it('should be able to choose the property to use as name and value in the list of options', function() {
    $rootScope.data = ['value1', 'value2'];
    $rootScope.labelProperty = 'label';
    $rootScope.valueProperty = 'id';
    $rootScope.options = [
      {
        label: 'name1',
        id: 'value1'
      },
      {
        label: 'name2',
        id: 'value2'
      }
    ];

    var element = angular.element('<ov-multi-check-box ' +
                                  'ng-model="data" ' +
                                  'options="options" ' +
                                  'label-property="labelProperty"' +
                                  'value-property="valueProperty"' +
                                  'disabled="disabled"' +
                                  'ng-model-options="{ allowInvalid: true }"' +
                                  '></ov-multi-check-box>');
    element = $compile(element)(scope);
    scope.$digest();

    var elementScope = element.isolateScope();
    assert.equal(elementScope.labelProperty, $rootScope.labelProperty, 'Unexpected label property');
    assert.equal(elementScope.valueProperty, $rootScope.valueProperty, 'Unexpected value property');
    assert.equal(elementScope.options.length, $rootScope.options.length, 'Unexpected list of options');
    assert.equal(elementScope.values.length, $rootScope.options.length, 'Unexpected list of values');
  });

});
