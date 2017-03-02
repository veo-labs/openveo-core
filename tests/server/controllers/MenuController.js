'use strict';

var chai = require('chai');
var spies = require('chai-spies');
var MenuController = process.require('app/server/controllers/MenuController.js');
var storage = process.require('app/server/storage.js');

var assert = chai.assert;
chai.should();
chai.use(spies);

// MenuController.js
describe('MenuController', function() {
  var request;
  var response;
  var menuController;
  var ADMIN_ID = '0';

  beforeEach(function() {
    request = {};
    response = {};
    menuController = new MenuController();
    storage.setConfiguration({
      superAdminId: ADMIN_ID
    });
  });

  afterEach(function() {
    storage.setMenu(null);
    storage.setConfiguration(null);
  });

  // getMenuAction method
  describe('getMenuAction', function() {

    it('should send response with the whole menu if user is not specified', function(done) {
      var expectedMenu = [];
      storage.setMenu(expectedMenu);

      response.send = function(menu) {
        assert.strictEqual(menu, expectedMenu, 'Wrong menu');
        done();
      };

      menuController.getMenuAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should send response with the whole menu if user is the super administrator', function(done) {
      var expectedMenu = [{label: '42'}];
      storage.setMenu(expectedMenu);

      response.send = function(menu) {
        assert.strictEqual(menu, expectedMenu, 'Wrong menu');
        done();
      };

      request.user = {id: ADMIN_ID};
      menuController.getMenuAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should send response with the filtered menu depending on user permissions', function(done) {
      var expectedPermission = 'test-permission';
      var expectedLabel = '42';
      var expectedPath = 'path';
      var expectedWeight = 20;
      var expectedMenu = [
        {
          label: expectedLabel,
          permission: expectedPermission,
          path: expectedPath,
          weight: expectedWeight,
          subMenu: [
            {
              label: '420',
              permission: 'restricted'
            }
          ]
        },
        {
          label: '43',
          permission: 'restricted',
          subMenu: [
            {
              label: '430',
              permission: expectedPermission
            }
          ]
        }];
      storage.setMenu(expectedMenu);

      response.send = function(menu) {
        assert.equal(menu.length, 1, 'Wrong menu');
        assert.isUndefined(menu[0].subMenu, 'Unexpected sub menu');
        assert.strictEqual(menu[0].label, expectedLabel, 'Wrong label');
        assert.strictEqual(menu[0].path, expectedPath, 'Wrong path');
        assert.strictEqual(menu[0].weight, expectedWeight, 'Wrong weight');
        done();
      };

      request.user = {permissions: [expectedPermission]};
      menuController.getMenuAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should call next middleware if menu is not set', function(done) {
      menuController.getMenuAction(request, response, function() {
        done();
      });
    });
  });

});
