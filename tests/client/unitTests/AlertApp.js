'use strict';

window.assert = chai.assert;

// EntityApp.js
describe('AlertApp', function() {

  // Load entity module
  beforeEach(function() {
    module('ov.alert');
  });

  // entityService
  describe('alertService', function() {
    var $rootScope,
      alertService;

    // Dependencies injections
    beforeEach(inject(function(_alertService_, _$rootScope_) {
      $rootScope = _$rootScope_;
      alertService = _alertService_;
      $rootScope.alerts = [];
    }));

    it('Should be able to add message alert', function() {
      alertService.add('type', 'msg', 0);
      assert.equal($rootScope.alerts.length, 1);
    });

    it('Should be able to add message alert that can be delete', function() {
      alertService.add('type', 'msg', 50);
      assert.equal($rootScope.alerts.length, 1);
      $rootScope.alerts[0].close();
      assert.equal($rootScope.alerts.length, 0);
    });
  });

});
