'use strict';

// Module dependencies
var assert = require('chai').assert;

// path.js
describe('path', function() {
  var path;

  before(function() {
    path = process.require('app/server/path.js');
  });

  // validate method
  describe('validate', function() {

    it('Should be able to validate a path against a rule', function() {
      assert.ok(path.validate('get /test', 'get /test'));
      assert.ok(path.validate('get /test', '/test'));
      assert.ok(path.validate('get /test', '/*'));
      assert.ok(path.validate('get /test', '*'));
      assert.ok(path.validate('post /test', 'post /test'));
      assert.ok(path.validate('put /test', 'put /test'));
      assert.ok(path.validate('delete /test', 'delete /test'));
      assert.ok(path.validate('/test', '/test'));
      assert.notOk(path.validate('get /test', ''));
      assert.notOk(path.validate('get /test', '/'));
      assert.notOk(path.validate('get /test', '/other'));
      assert.notOk(path.validate('get /test', 'post /test'));
      assert.notOk(path.validate('get /test', 'post'));
      assert.notOk(path.validate('get /test', 'get'));
      assert.notOk(path.validate('get /test', 'unknwon /test'));
    });

  });

});
