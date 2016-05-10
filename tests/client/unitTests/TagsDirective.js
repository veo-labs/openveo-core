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

  it('should define a list of tags using the model', function() {
    $rootScope.data = ['tag1', 'tag2'];

    var element = angular.element('<ov-tags ng-model="data"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var elementScope = element.scope();

    assert.isDefined(elementScope.tags);
    assert.sameMembers(elementScope.tags, $rootScope.data);
  });

  it('should be able to add a tag using enter key', function() {
    var value = 'value';
    $rootScope.data = [];

    var element = angular.element('<ov-tags ng-model="data"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var elementScope = element.scope();
    var tagsInput = angular.element(element.find('input')[0]);
    elementScope.editableTagsInput = value;
    elementScope.$digest();
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});

    assert.equal(elementScope.tags[0], value);
  });

  it('should be not able to add an empty tag', function() {
    $rootScope.data = [];

    var element = angular.element('<ov-tags ng-model="data"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var elementScope = element.scope();
    var tagsInput = angular.element(element.find('input')[0]);
    tagsInput.triggerHandler({type: 'keydown', keyCode: 13});

    assert.equal(elementScope.tags.length, 0);
  });

  it('should be able to remove a tag', function() {
    $rootScope.data = ['value'];

    var element = angular.element('<ov-tags ng-model="data"></ov-tags>');
    element = $compile(element)(scope);
    scope.$digest();

    var elementScope = element.scope();
    var removeLink = angular.element(element.find('a')[0]);
    removeLink.triggerHandler('click', 0);

    assert.equal(elementScope.tags.length, 0);
  });

});
