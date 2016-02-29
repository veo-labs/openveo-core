'use strict';

/**
 * @module core-loaders
 */

/**
 * Provides functions to load routes from core and plugins
 * configuration.
 *
 * @class routeLoader
 */

var path = require('path');
var util = require('util');
var openVeoAPI = require('@openveo/api');

/**
 * Gets the list of routes from a route configuration object with,
 * for each one, the method, the path and the action to call.
 *
 * @example
 *     var routeLoader = process.require("app/server/loaders/routeLoader.js");
 *     var routes = {
 *       "get /test" : "app/server/controllers/TestController.getTestAction",
 *       "post /test" : "app/server/controllers/TestController.postTestAction"
 *     };
 *
 *     console.log(routeLoader.decodeRoutes("/", routes));
 *     // [
 *     //   {
 *     //     "method" : "get",
 *     //     "path" : "/test",
 *     //     "action" : Function
 *     //   },
 *     //   {
 *     //     "method" : "post",
 *     //     "path" : "test",
 *     //     "action" : Function
 *     //   }
 *     // ]
 *
 * @method decodeRoutes
 * @static
 * @param {String} pluginPath The root path of the plugin associated to the routes
 * @param {Object} routes An object of routes
 * @return {Array} The decoded list of routes
 */
module.exports.decodeRoutes = function(pluginPath, routes) {

  var decodedRoutes = [];

  if (routes) {

    for (var match in routes) {

      // e.g. get /test
      // Extract HTTP method and path
      var matchChunks = /^(get|post|delete|put)? ?(\/?.*)$/.exec(match.toLowerCase());

      var actions = [];

      // If the action associated to the path is an array
      // keep it this way
      if (util.isArray(routes[match]))
        actions = routes[match];

      // If not an array, make it an array
      else
        actions.push(routes[match]);

      actions.forEach(function(action) {

        // e.g. app/server/controllers/TestController.getTestAction
        var actionChunks = action.split('.');

        // Got a path and an action for this route
        if (matchChunks && matchChunks[2] && actionChunks.length === 2) {

          try {

            // Try to register the controller
            var controller = require(path.join(pluginPath, actionChunks[0] + '.js'));

            // Got a method to call on the controller
            if (controller[actionChunks[1]]) {

              // Store the new route
              decodedRoutes.push({
                method: (matchChunks[1] && matchChunks[1].toLowerCase()) || 'all',
                path: matchChunks[2],
                action: controller[actionChunks[1]]
              });

            }
            else
              process.logger.warn('Action for route ' + match + ' is not valid', {
                action: 'decodeRoutes'
              });

          } catch (e) {
            process.logger.warn('Error while loading route ' + match, {
              action: 'decodeRoutes',
              error: e.message,
              stack: e.stack
            });
          }

        }

      });


    }

  }

  return decodedRoutes;

};

/**
 * Applies a list of routes to a router.
 *
 * @example
 *     var router = express.Router();
 *     var routeLoader = process.require("app/server/loaders/routeLoader.js");
 *     var routes = [
 *       {
 *         method : "get",
 *         path : "/logout",
 *         action : [Function]
 *       }
 *     ];
 *     routeLoader.applyRoutes(routes, router);
 *
 * @method applyRoutes
 * @static
 * @param {Array} routes The list of routes to apply
 * @param {Object} router An express router to attach the routes to
 */
module.exports.applyRoutes = function(routes, router) {
  if (routes && routes.length && router) {
    routes.forEach(function(route) {
      process.logger.debug('Route loaded', {
        route: route.method + ' ' + route.path
      });

      // Deactivate cache on all requests made on this router
      if (route.method === 'get')
        router[route.method](route.path, openVeoAPI.middlewares.disableCacheMiddleware);

      router[route.method](route.path, route.action);
    });
  }
};
