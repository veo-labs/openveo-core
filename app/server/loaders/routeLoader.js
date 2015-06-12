"use scrict"

// Module dependencies
var path = require("path");
var util = require("util");
var winston = require("winston");

// Get logger
var logger = winston.loggers.get("openveo");

/**
 * Gets the list of routes from a route configuration object with,
 * for each one, the method, the path and the action to call.
 *
 * @param String pluginPath The root path of the plugin associated to the routes
 * @param Object routes An object of routes as follow : 
 * {
 *   "get /test" : "app/server/controllers/TestController.getTestAction",
 *   "post /test" : "app/server/controllers/TestController.postTestAction",
 *   "/anotherTest" : "app/server/controllers/TestController.anotherTestAction",
 *   "/" : "app/server/controllers/HomeController.homeAction",
 *   "*" : [
 *      "app/server/controllers/HomeController.homeAction",
 *      "app/server/controllers/HomeController.defaultAction"
 *    ]
 * }
 * @return Array The decoded list of routes as follow : 
 * [
 *   {
 *     "method" : "get",
 *     "path" : "/test",
 *     "action" : Function
 *   },
 *   {
 *     "method" : "post",
 *     "path" : "test",
 *     "action" : Function
 *   }
 *   ...
 * ]
 */
module.exports.decodeRoutes = function(pluginPath, routes){
   
  var decodedRoutes = [];
  
  if(routes){
    
    for(var match in routes){

      // e.g. get /test
      // Extract HTTP method and path
      var matchChunks = /^(get|post|delete|put)? ?(\/?.*)$/.exec(match.toLowerCase());
      
      var actions = [];
      
      // If the action associated to the path is an array
      // keep it this way
      if(util.isArray(routes[match]))
        actions = routes[match];
      
      // If not an array, make it an array
      else
        actions.push(routes[match]);

      actions.forEach(function(action){
        
        // e.g. app/server/controllers/TestController.getTestAction
        var actionChunks = action.split(".");

        // Got a path and an action for this route
        if(matchChunks && matchChunks[2] && actionChunks.length === 2){

          try{

            // Try to register the controller
            var controller = require(path.join(pluginPath, actionChunks[0] + ".js"));

            // Got a method to call on the controller
            if(controller[actionChunks[1]]){

              // Store the new route
              decodedRoutes.push({
                "method" : matchChunks[1] || "all",
                "path" : matchChunks[2],
                "action" : controller[actionChunks[1]]
              });

            }
            else
              logger.warn("Action for route " + match + " is not valid", {action : "decodeRoutes"});

          }
          catch(e){
            logger.warn(e.message, {action : "decodeRoutes"});
          }

        }
        
      });


    }
    
  }

  return decodedRoutes;
  
};