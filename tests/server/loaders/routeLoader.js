'use strict';

var path = require('path');
var assert = require('chai').assert;
var routeLoader = process.require('app/server/loaders/routeLoader.js');

// routeLoader.js
describe('routeLoader', function() {
  var pluginPath;
  var pluginConf;

  // decodeRoutes method
  describe('decodeRoutes', function() {

    beforeEach(function() {
      pluginPath = path.join(__dirname, 'resources/plugins/node_modules/@openveo/official-plugin-example');
      pluginConf = require(path.join(pluginPath, 'conf.js'));
    });

    it('should be able to decode routes and eliminate invalid routes', function() {
      var publicRoutes = routeLoader.decodeRoutes(pluginPath, pluginConf['http']['routes']['public']);
      var privateRoutes = routeLoader.decodeRoutes(pluginPath, pluginConf['http']['routes']['private']);
      assert.equal(publicRoutes.length, 4, 'Expected 4 public routes');
      assert.equal(privateRoutes.length, 6, 'Expected 6 private routes');
    });

    it('should throw an error if plugin path is not a String', function() {
      var invalidValues = [undefined, null, 42, {}, []];

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          routeLoader.decodeRoutes(invalidValue, pluginConf['routes']['routes']['public']);
        }, TypeError, null, 'Expected exception when pluginPath is ' + typeof invalidValue);
      });
    });

  });

});
