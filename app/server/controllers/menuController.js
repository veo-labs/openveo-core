"use strict"

/** 
 * @module core-controllers
 */

/**
 * Provides route actions to access back end menu.
 *
 * @class menuController
 */

// Module dependencies
var openVeoAPI = require("openveo-api");
var applicationStorage = openVeoAPI.applicationStorage;

/**
 * Gets the backend menu as a JSON object.
 *
 * If menu is empty a 404 Not Found is sent.  
 * Menu is filtered regarding user permissions.
 * 
 * @method getMenuAction
 * @static  
 */
module.exports.getMenuAction = function(request, response, next){
  var menu = applicationStorage.getMenu();
  
  if(menu){

    if(request.user.id != 0){

      // Filters menu by permissions
      response.send(filterMenuByPermissions(menu, request.user));

    }

    // User is the administrator (do not filter menu)
    else
      response.send(menu);

  }
  else
    next();
};

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
function filterMenuByPermissions(menu, user){
  var filteredMenu = [];

  // Iterate through menu items
  for(var i = 0 ; i < menu.length ; i++){
    var menuItem = menu[i];
    var filteredMenuItem = {};
    if(menuItem.label) filteredMenuItem.label = menuItem.label;
    if(menuItem.path) filteredMenuItem.path = menuItem.path;

    // Got a specific permission for this menu item
    if(menuItem.permission){

      // Find if user is authorized to access this menu item
      if(isAuthorized(user, menuItem.permission)){

        // Menu item has sub menu
        if(menuItem.subMenu){
          var filteredSubMenu = filterMenuByPermissions(menuItem.subMenu, user);
          if(filteredSubMenu.length){
            filteredMenuItem.subMenu = filteredSubMenu;
            filteredMenu.push(filteredMenuItem);
          }
        }

        // No sub menu
        else
          filteredMenu.push(filteredMenuItem);

      }

    }

    // No specific permission needed for this menu item : grant access
    else{

      // Menu item has sub items
      if(menuItem.subMenu){
        var filteredSubMenu = filterMenuByPermissions(menuItem.subMenu, user);
          if(filteredSubMenu.length){
            filteredMenuItem.subMenu = filteredSubMenu;
            filteredMenu.push(filteredMenuItem);
          }
      }

      // No sub menu
      else{
        filteredMenu.push(filteredMenuItem);
      }

    }

  }

  return filteredMenu;

}

/**
 * Checks if user has the given permission.
 *
 * @method isAuthorized
 * @private
 * @static  
 * @param {Object} user The user to test
 * @param {String} permission The permission id to check
 */
function isAuthorized(user, permission){
  if(user && user.roles){

    for(var i = 0 ; i < user.roles.length ; i++){
      var role = user.roles[i];

      for(var j = 0 ; j < role.permissions.length ; j++){
        if(role.permissions[j].id === permission && role.permissions[j].activated)
          return true;
      }

    }

  }

  return false;
}