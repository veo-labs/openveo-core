'use strict';

window.assert = chai.assert;

// TagsDirective.js
describe('TagsDirective', function() {
  var $compile,
    $rootScope,
    scope;

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

  describe('placeholder', function() {

    it('should be configurable', function() {
      scope.data = [];
      scope.placeholder = 'placeholder';

      var element = angular.element('<ov-tags ng-model="data" ov-placeholder="placeholder"></ov-tags>');
      element = $compile(element)(scope);
      scope.$digest();

      var tagsInput = angular.element(element.find('input')[0]);
      assert.equal(tagsInput.attr('placeholder'), scope.placeholder);
    });

  });

  describe('autocomplete', function() {

    it('should be displayed when current input value is found in options', function() {
      scope.data = [];
      scope.options = [
        {
          name: 'name',
          value: 'value'
        }
      ];

      var element = angular.element('<ov-tags ng-model="data" ov-available-options="options"></ov-tags>');
      element = $compile(element)(scope);
      scope.$digest();

      var elementScope = element.isolateScope();
      var tagsInput = angular.element(element.find('input')[0]);

      // Set input value to the first character of the first option name
      var ngModelController = tagsInput.controller('ngModel');
      ngModelController.$setViewValue(scope.options[0].name[0]);
      scope.$apply();

      assert.equal(elementScope.autoCompleteValues.length, 1);
    });

    it('should not be displayed when ov-available-options is not set', function() {
      scope.data = [];

      var element = angular.element('<ov-tags ng-model="data">></ov-tags>');
      element = $compile(element)(scope);
      scope.$digest();

      var elementScope = element.isolateScope();
      var tagsInput = angular.element(element.find('input')[0]);

      // Set input value to a character
      var ngModelController = tagsInput.controller('ngModel');
      ngModelController.$setViewValue('n');
      scope.$apply();

      assert.equal(elementScope.autoCompleteValues.length, 0);
    });

    it('should be case insensitive', function() {
      scope.data = [];
      scope.options = [
        {
          name: 'name',
          value: 'value'
        }
      ];

      var element = angular.element('<ov-tags ng-model="data" ov-available-options="options"></ov-tags>');
      element = $compile(element)(scope);
      scope.$digest();

      var elementScope = element.isolateScope();
      var tagsInput = angular.element(element.find('input')[0]);

      // Set input value to the first letter of the first option name in upper case
      var ngModelController = tagsInput.controller('ngModel');
      ngModelController.$setViewValue(scope.options[0].name[0].toUpperCase());
      scope.$apply();

      assert.equal(elementScope.autoCompleteValues.length, 1);
    });

    it('should not be displayed if input is empty', function() {
      scope.data = [];
      scope.options = [
        {
          name: 'name',
          value: 'value'
        }
      ];

      var element = angular.element('<ov-tags ng-model="data" ov-available-options="options"></ov-tags>');
      element = $compile(element)(scope);
      scope.$digest();

      var elementScope = element.isolateScope();

      assert.equal(elementScope.autoCompleteValues.length, 0);
    });

  });

  it('should be able to add a tag using the "enter" key', function() {
    var value = 'value';
    scope.data = [];

    var element = angular.element('<ov-tags ng-model="data"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);

    tagsInput.controller('ngModel').$setViewValue(value);
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});
    scope.$apply();

    assert.equal(scope.data[0], value);
  });

  it('should not be able to add an empty tag', function() {
    scope.data = [];

    var element = angular.element('<ov-tags ng-model="data"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});
    scope.$apply();

    assert.equal(scope.data.length, 0);
  });

  it('should not be able to add an already entered tag', function() {
    var value = 'value';
    scope.data = [];

    var element = angular.element('<ov-tags ng-model="data"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);

    tagsInput.controller('ngModel').$setViewValue(value);
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});

    tagsInput.controller('ngModel').$setViewValue(value);
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});

    scope.$apply();

    assert.equal(scope.data.length, 1);
  });

  it('should not be able to add an empty tag when using options', function() {
    scope.data = [];
    scope.options = [
      {
        name: 'name',
        value: 'value'
      }
    ];

    var element = angular.element('<ov-tags ng-model="data" ov-available-options="options"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);

    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});
    scope.$apply();

    assert.equal(scope.data.length, 0);
  });

  it('should be able to add a tag present in available options when using options', function() {
    scope.data = [];
    scope.options = [
      {
        name: 'name',
        value: 'value'
      }
    ];

    var element = angular.element('<ov-tags ng-model="data" ov-available-options="options"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);

    tagsInput.controller('ngModel').$setViewValue(scope.options[0].name);
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});
    scope.$apply();

    assert.equal(scope.data[0], scope.options[0].value);
  });

  it('should not be able to add a tag not present in available options when using options', function() {
    scope.data = [];
    scope.options = [
      {
        name: 'name',
        value: 'value'
      }
    ];

    var element = angular.element('<ov-tags ng-model="data" ov-available-options="options"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);

    tagsInput.controller('ngModel').$setViewValue('Tags not in options');
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});
    scope.$apply();

    assert.equal(scope.data.length, 0);
  });

  it('should not be able to add an already entered tag when using options', function() {
    scope.data = [];
    scope.options = [
      {
        name: 'name',
        value: 'value'
      }
    ];

    var element = angular.element('<ov-tags ng-model="data" ov-available-options="options"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);

    tagsInput.controller('ngModel').$setViewValue(scope.options[0].name);
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});

    tagsInput.controller('ngModel').$setViewValue(scope.options[0].name);
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});

    scope.$apply();

    assert.equal(scope.data.length, 1);
  });

  it('should empty the autocomplete after tag has been added when using options', function() {
    scope.data = [];
    scope.options = [
      {
        name: 'name',
        value: 'value'
      }
    ];

    var element = angular.element('<ov-tags ng-model="data" ov-available-options="options"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var elementScope = element.isolateScope();
    var tagsInput = angular.element(element.find('input')[0]);

    tagsInput.controller('ngModel').$setViewValue(scope.options[0].name);
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});

    scope.$apply();

    assert.equal(elementScope.autoCompleteValues.length, 0);
  });

  it('should empty the input after adding a tag', function() {
    var value = 'value';
    scope.data = [];

    var element = angular.element('<ov-tags ng-model="data"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);

    tagsInput.controller('ngModel').$setViewValue(value);
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});
    scope.$apply();

    assert.isEmpty(tagsInput.val());
  });

  it('should not empty the input if adding a tag which already exists', function() {
    var value = 'value';
    scope.data = [];

    var element = angular.element('<ov-tags ng-model="data"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);

    tagsInput.controller('ngModel').$setViewValue(value);
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});

    tagsInput.controller('ngModel').$setViewValue(value);
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});
    scope.$apply();

    assert.equal(element.isolateScope().editableTagsInput, value);
  });

  it('should be able to remove a tag using the close button', function() {
    scope.data = ['value'];

    var element = angular.element('<ov-tags ng-model="data"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var removeLink = angular.element(element.find('a')[0]);

    removeLink.triggerHandler('click', 0);
    scope.$apply();

    assert.equal(scope.data.length, 0);
  });

  it('should be considered empty if there is no value', function() {
    var element = angular.element('<ov-tags ng-model="data"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var ngModelController = element.controller('ngModel');

    assert.ok(ngModelController.$isEmpty());
    assert.ok(ngModelController.$isEmpty([]));
  });

});
