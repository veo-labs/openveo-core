'use strict';

var path = require('path');
var assert = require('chai').assert;
var routeLoader = process.require('app/server/loaders/routeLoader.js');
var pluginPath = path.join(__dirname, 'plugins/node_modules/@openveo/example');
var pluginConf = require(path.join(pluginPath, 'conf.js'));

// routeLoader.js
describe('routeLoader', function() {

  // decodeRoutes method
  describe('decodeRoutes', function() {

    it('should be able to decode routes and eliminate invalid routes', function() {
      var publicRoutes = routeLoader.decodeRoutes(pluginPath, pluginConf['routes']['public']);
      var privateRoutes = routeLoader.decodeRoutes(pluginPath, pluginConf['routes']['private']);
      assert.equal(publicRoutes.length, 4, 'Expected 4 public routes');
      assert.equal(privateRoutes.length, 6, 'Expected 6 private routes');
    });

    it('should be able to decode routes and eliminate invalid routes', function() {
      var invalidValues = [undefined, null, 42, {}, []];

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          routeLoader.decodeRoutes(invalidValue, pluginConf['routes']['public']);
        }, TypeError, null, 'Expected exception when pluginPath is ' + typeof invalidValue);
      });
    });

  });

});
