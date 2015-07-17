"use strict"

/**
 * Provides functions to manipulate HTTP paths handled by the server.
 *
 * @module core-path
 * @class core-path
 * @main core-path
 */

/**
 * Validates a path regarding a rule.
 *
 * @example
 *     var path = process.require("app/server/path.js");
 *     path.validate("get /test", "get /test"); // true
 *     path.validate("get /test", "/test"); // true
 *     path.validate("get /test", "/*"); // true
 *     path.validate("get /test", "*"); // true
 *     path.validate("post /test", "post /test"); // true
 *     path.validate("put /test", "put /test"); // true
 *     path.validate("delete /test", "delete /test"); // true
 *     path.validate("/test", "/test"); // true
 *     path.validate("get /test", ""); // false
 *     path.validate("get /test", "/"); // false
 *     path.validate("get /test", "/other"); // false
 *     path.validate("get /test", "post /test"); // false
 *     path.validate("get /test", "post"); // false
 *     path.validate("get /test", "get"); // false
 *     path.validate("get /test", "unknwon /test"); // false
 *
 * @method validate
 * @param {String} path The path to validate
 * @param String rule The rule to validate path
 * @return {Boolean} true if the rule validates the path, false
 * otherwise
 */
module.exports.validate = function(path, rule){
  if(path && rule){
    path = path.toLowerCase();
    rule = rule.toLowerCase();
    
    // Path and rule are identical, not need to go further
    if(path === rule)
      return true;
  
    // e.g. get /publish/videos
    // Extract HTTP method and path ("get" and "/publish/videos")
    var ruleChunks = /^(get|post|delete|put)? ?(\/?.*)$/.exec(rule);

    // Got a rule
    if(ruleChunks && ruleChunks[2]){
      var pattern;
      var rulePattern = ruleChunks[2].replace(/\//g, "\\/").replace(/\*/g, ".*");

      // Got HTTP method in rule
      if(ruleChunks[1])
        pattern = new RegExp("^" + ruleChunks[1] + " " + rulePattern + "$");

      // No HTTP method in rule, authorize get, post, delete and
      // put
      else
        pattern = new RegExp("^(get|post|delete|put)? ?" + rulePattern + "$");

      if(pattern.test(path))
        return true;
    }
  }
  
  return false;
};