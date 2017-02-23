'use strict';

var assert = require('chai').assert;

// path.js
describe('path', function() {
  var path;

  before(function() {
    path = process.require('app/server/path.js');
  });

  // validate method
  describe('validate', function() {

    it('should be able to validate a path against a rule', function() {
      var validTests = [
        {
          path: 'get /test',
          rule: 'get /test'
        },
        {
          path: 'get /test',
          rule: '/test'
        },
        {
          path: 'get /test',
          rule: '/*'
        },
        {
          path: 'get /test',
          rule: '*'
        },
        {
          path: 'post /test',
          rule: 'post /test'
        },
        {
          path: 'put /test',
          rule: 'put /test'
        },
        {
          path: 'delete /test',
          rule: 'delete /test'
        },
        {
          path: '/test',
          rule: '/test'
        }
      ];
      var invalidTests = [
        {
          path: 'get /test',
          rule: ''
        },
        {
          path: 'get /test',
          rule: '/'
        },
        {
          path: 'get /test',
          rule: '/other'
        },
        {
          path: 'get /test',
          rule: 'post /test'
        },
        {
          path: 'get /test',
          rule: 'post'
        },
        {
          path: 'get /test',
          rule: 'get'
        },
        {
          path: 'get /test',
          rule: 'unkown /test'
        }
      ];

      validTests.forEach(function(test) {
        var rule = test.rule;
        var testPath = test.path;
        assert.ok(path.validate(testPath, rule), 'Expected "' + rule + '" to validate rule "' + testPath + '"');
      });

      invalidTests.forEach(function(test) {
        var rule = test.rule;
        var testPath = test.path;
        assert.notOk(path.validate(testPath, rule), 'Expected "' + rule + '" to validate rule "' + testPath + '"');
      });
    });

    it('should return false if either the path or the rule is not specified', function() {
      assert.notOk(path.validate(null, '/test'), 'Expected false if path is not specified');
      assert.notOk(path.validate('/test', null), 'Expected false if rule is not specified');
      assert.notOk(path.validate(null, null), 'Expected false if both path and rule are not specified');
    });

  });

});
