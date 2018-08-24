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
        },
        {
          path: '/test/with/param/and/action',
          rule: '/test/with/:the-param-placeholder/and/action'
        },
        {
          path: '/test/with/param',
          rule: '/test/with/:the-param-placeholder'
        },
        {
          path: '/test/with/param/and/wildcard',
          rule: '/test/with/:the-param-placeholder/*'
        },
        {
          path: '/param',
          rule: '/:the-param-placeholder'
        },
        {
          path: '/test/with/param1/and/param2',
          rule: '/test/with/:the-param1-placeholder/and/:the-param2-placeholder'
        },
        {
          path: '/test/with/param1/param2',
          rule: '/test/with/:the-param1-placeholder/:the-param2-placeholder'
        },
        {
          path: '/test/with/param?and=get-parameter',
          rule: '/test/with/:the-param1-placeholder'
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
        },
        {
          path: '/test/with/param/and/wildcard/without/slash',
          rule: '/test/with/:the-param-placeholder*'
        },
        {
          path: '/test/with/missing/param',
          rule: '/test/with/:the-param-placeholder/missing/param'
        },
        {
          path: '/test/with/empty/param//and/action',
          rule: '/test/with/empty/param/:the-param-placeholder/and/action'
        },
        {
          path: '/test/with/empty/param/',
          rule: '/test/with/empty/param/:the-param-placeholder'
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
