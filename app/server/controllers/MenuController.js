'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var storage = process.require('app/server/storage.js');
var Controller = openVeoApi.controllers.Controller;

/**
 * Checks if user has the given permission.
 *
 * @method isAuthorized
 * @private
 * @static
 * @param {Object} user The user to test
 * @param {Array} user.permissions The user's permissions
 * @param {String} permission The permission id to check
 */
function isAuthorized(user, permission) {
  if (user && user.permissions) {
    if (user.permissions.indexOf(permission) >= 0)
      return true;
  }
  return false;
}

/**
 * Filters the given menu depending on user permissions and requested
 * menu items permissions.
 *
 * @method filterMenuByPermissions
 * @private
 * @static
 * @param {Array} menu The menu to filter
 * @param {Object} user The authenticated user
 */
function filterMenuByPermissions(menu, user) {
  var filteredMenu = [];

  // Iterate through menu items
  for (var i = 0; i < menu.length; i++) {
    var filteredSubMenu;
    var menuItem = menu[i];
    var filteredMenuItem = {};
    if (menuItem.weight)
      filteredMenuItem.weight = menuItem.weight;
    if (menuItem.label)
      filteredMenuItem.label = menuItem.label;
    if (menuItem.path)
      filteredMenuItem.path = menuItem.path;

    // Got a specific permission for this menu item
    if (menuItem.permission) {

      // Find if user is authorized to access this menu item
      if (isAuthorized(user, menuItem.permission)) {

        // Menu item has sub menu
        if (menuItem.subMenu) {
          filteredSubMenu = filterMenuByPermissions(menuItem.subMenu, user);

          if (filteredSubMenu.length)
            filteredMenuItem.subMenu = filteredSubMenu;
        }

        filteredMenu.push(filteredMenuItem);
      }

    } else if (menuItem.subMenu) {

      // No specific permission needed for this menu item : grant access

      // Menu item has sub items
      if (menuItem.subMenu) {
        filteredSubMenu = filterMenuByPermissions(menuItem.subMenu, user);
        if (filteredSubMenu.length) {
          filteredMenuItem.subMenu = filteredSubMenu;
          filteredMenu.push(filteredMenuItem);
        }
      }

    } else {

      // No sub menu
      filteredMenu.push(filteredMenuItem);

    }

  }

  return filteredMenu;
}

/**
 * Defines a controller to handle requests relative to the back end menu.
 *
 * @class MenuController
 * @extends Controller
 * @constructor
 */
function MenuController() {
  MenuController.super_.call(this);
}

module.exports = MenuController;
util.inherits(MenuController, Controller);

/**
 * Gets the backend menu as a JSON object.
 *
 * If menu is empty a 404 Not Found is sent.
 * Menu is filtered regarding user permissions.
 *
 * @method getMenuAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.user The connected user
 * @param {String} request.user.id The connected user id
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
MenuController.prototype.getMenuAction = function(request, response, next) {
  var menu = storage.getMenu();
  if (menu) {

    if (request.user && request.user.id !== storage.getSuperAdminId()) {

      // Filters menu by permissions
      response.send(filterMenuByPermissions(menu, request.user));

    } else {

      // User is the administrator (do not filter menu)
      response.send(menu);

    }

  } else
    next();
};
