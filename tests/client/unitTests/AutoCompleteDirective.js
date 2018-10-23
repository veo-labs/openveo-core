'use strict';

window.assert = chai.assert;

describe('AutoCompleteDirective', function() {
  var $q;
  var $compile;
  var $rootScope;
  var scope;

  // Load modules
  beforeEach(function() {
    module('ov');
    module('inline-templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$q_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
  });

  describe('placeholder', function() {

    it('should be configurable', function() {
      scope.data = null;
      scope.placeholder = 'placeholder';

      var element = angular.element(
        '<ov-auto-complete ng-model="data" ov-placeholder="placeholder"></ov-auto-complete>'
      );
      element = $compile(element)(scope);
      scope.$digest();

      var tagsInput = angular.element(element.find('input')[0]);
      assert.equal(tagsInput.attr('placeholder'), scope.placeholder, 'Wrong placeholder');
    });

  });

  it('should be considered empty if there is no value', function() {
    var element = angular.element('<ov-auto-complete ng-model="data"></ov-auto-complete>');
    element = $compile(element)(scope);
    scope.$digest();

    var ngModelController = element.controller('ngModel');

    assert.ok(ngModelController.$isEmpty(), 'Exepected model to be empty');
  });

  it('should display the value', function() {
    scope.data = {
      name: 'Suggestion 1',
      value: 42
    };
    var element = angular.element('<ov-auto-complete ng-model="data"></ov-auto-complete>');
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);
    assert.equal(tagsInput.val(), scope.data.name, 'Wrong name');
  });

  it('should set model to input value corresponding suggestion and display other suggestions', function() {
    var expectedSuggestions = [
      {
        name: 'Suggestion 1',
        value: 42
      },
      {
        name: 'Suggestion 2',
        value: 43
      }
    ];
    scope.data = null;
    scope.getSuggestions = function() {
      return $q.when(expectedSuggestions);
    };
    var element = angular.element(
      '<ov-auto-complete ng-model="data" ov-get-suggestions="getSuggestions"></ov-auto-complete>'
    );
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);
    var ngModelController = tagsInput.controller('ngModel');
    ngModelController.$setViewValue(expectedSuggestions[0].name);
    scope.$apply();

    assert.deepEqual(scope.data, expectedSuggestions[0], 'Wrong model value');
    assert.equal(element.find('div').text(), expectedSuggestions[1].name, 'Wrong suggestions');
  });

  it('should set model to null and display suggestions if input value does not correspond to a suggestion', function() {
    var expectedSuggestions = [
      {
        name: 'Suggestion 1',
        value: 42
      }
    ];
    scope.data = null;
    scope.getSuggestions = function() {
      return $q.when(expectedSuggestions);
    };
    var element = angular.element(
      '<ov-auto-complete ng-model="data" ov-get-suggestions="getSuggestions"></ov-auto-complete>'
    );
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);
    var ngModelController = tagsInput.controller('ngModel');
    ngModelController.$setViewValue('Wrong');
    scope.$apply();

    assert.isNull(scope.data, 'Wrong model value');
    assert.equal(element.find('li').length, expectedSuggestions.length, 'Wrong suggestions');
  });

  it('should set model to null and clear suggestions if input value becomes empty', function() {
    var expectedSuggestions = [
      {
        name: 'Suggestion 1',
        value: 42
      },
      {
        name: 'Suggestion 2',
        value: 43
      }
    ];
    scope.data = null;
    scope.getSuggestions = function() {
      return $q.when(expectedSuggestions);
    };
    var element = angular.element(
      '<ov-auto-complete ng-model="data" ov-get-suggestions="getSuggestions"></ov-auto-complete>'
    );
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);
    var ngModelController = tagsInput.controller('ngModel');
    ngModelController.$setViewValue('Something');
    scope.$apply();

    var liElements = element.find('li');
    assert.equal(liElements.length, expectedSuggestions.length, 'Wrong number of suggestions');

    ngModelController.$setViewValue('');
    scope.$apply();

    assert.isNull(scope.data, 'Wrong model value');
    assert.isEmpty(element.find('li'), 'Unexpected suggestions');
  });

  it('should not display actual input value in the list of suggestions', function() {
    var expectedSuggestions = [
      {
        name: 'Suggestion 1',
        value: 42
      },
      {
        name: 'Suggestion 2',
        value: 43
      }
    ];
    scope.data = null;
    scope.getSuggestions = function() {
      return $q.when(expectedSuggestions);
    };
    var element = angular.element(
      '<ov-auto-complete ng-model="data" ov-get-suggestions="getSuggestions"></ov-auto-complete>'
    );
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);
    var ngModelController = tagsInput.controller('ngModel');
    ngModelController.$setViewValue(expectedSuggestions[0].name);
    scope.$apply();

    assert.equal(element.find('li').length, expectedSuggestions.length - 1, 'Wrong number of suggestions');
  });

  it('should be considered invalid if value is null while required', function() {
    scope.data = null;
    scope.getSuggestions = function() {
      return $q.when([]);
    };
    var element = angular.element(
      '<ov-auto-complete ng-model="data" ng-required="true" ov-get-suggestions="getSuggestions"></ov-auto-complete>'
    );
    element = $compile(element)(scope);
    scope.$digest();

    assert.ok(element.controller('ngModel').$invalid, 'Expected model to be invalid');
  });

  it('should set model and input value to suggestion if a suggestion is chosen from suggestions', function() {
    var expectedSuggestions = [
      {
        name: 'Suggestion 1',
        value: 42
      },
      {
        name: 'Suggestion 2',
        value: 43
      }
    ];
    scope.data = null;
    scope.getSuggestions = function() {
      return $q.when(expectedSuggestions);
    };
    var element = angular.element(
      '<ov-auto-complete ng-model="data" ov-get-suggestions="getSuggestions"></ov-auto-complete>'
    );
    element = $compile(element)(scope);
    scope.$digest();

    var tagsInput = angular.element(element.find('input')[0]);
    var ngModelController = tagsInput.controller('ngModel');
    ngModelController.$setViewValue(expectedSuggestions[0].name);
    scope.$apply();

    angular.element(element.find('li')[0]).triggerHandler('click', 0);
    scope.$apply();

    assert.equal(scope.data.name, expectedSuggestions[1].name, 'Wrong model name');
    assert.equal(scope.data.value, expectedSuggestions[1].value, 'Wrong model value');
    assert.equal(tagsInput.val(), expectedSuggestions[1].name, 'Wrong input value');
  });

});
