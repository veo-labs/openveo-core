"use strict"

/**
 * Validates a path regarding a rule.
 * @param String path The path to validate
 * e.g.
 * get /publish/videos
 * @param String rule The rule to validate path
 * e.g.
 * Rules which validates the above path :
 * get /publish/videos*
 * get /publish/videos
 * get /publish/*
 * /publish/videos
 * 
 * Rules which does not validate the above path : 
 * post /publish/videos
 * put /publish/videos
 * get /publish/video
 * @return Boolean true if the rule validates the path, false otherwise
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