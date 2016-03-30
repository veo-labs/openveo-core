'use strict';

// Module dependencies
var path = require('path');
var assert = require('chai').assert;

// entityLoader.js
describe('entityLoader', function() {
  var entityLoader,
    pluginConf;

  before(function() {
    pluginConf = require('./plugins/node_modules/@openveo/example/conf.js');
    entityLoader = process.require('app/server/loaders/entityLoader.js');
  });

  // decodeEntities method
  describe('decodeEntities', function() {

    it('Should be able to load entities associated models', function() {
      var entities = entityLoader.decodeEntities(path.join(__dirname, 'plugins', 'node_modules', '@openveo/example'),
        pluginConf['entities']);
      assert.isDefined(entities['entity-example']);
    });

  });

});
