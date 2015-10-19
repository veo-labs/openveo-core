'use strict';

(function(angular, app) {

  /**
   * Defines a menu service to manage the menu of the application.
   *
   * @module ov
   * @class menuService
   */
  function MenuService($http, $q, $location) {
    var basePath = '/be/';
    var menu;

    /**
     * Sets menu items corresponding to the actual path to active and the other menu items to inactive.
     *
     * @method setActiveMenuItem
     */
    function setActiveMenuItem() {
      if (menu) {
        var path = $location.path();

        for (var menuItem in menu) {

          // Sub menu
          if (angular.isArray(menu[menuItem].subMenu)) {
            menu[menuItem].active = false;
            for (var i = 0; i < menu[menuItem].subMenu.length; i++) {
              menu[menuItem].subMenu[i].active = '/' + menu[menuItem].subMenu[i].path === path;
              menu[menuItem].active = menu[menuItem].active || menu[menuItem].subMenu[i].active;
            }
          }

          // Menu item
          else
            menu[menuItem].active = '/' + menu[menuItem].path === path;
        }
      }
    }

    /**
     * Loads the menu from server.
     *
     * @return {Promise} The Http promise
     * @method loadMenu
     */
    function loadMenu() {
      if (!menu) {

        // Get menu from server
        return $http.get(basePath + 'getMenu').success(function(menuObj) {
          menu = menuObj;
          setActiveMenuItem();
        });

      }

      return $q.when(menu);
    }

    /**
     * Gets the menu.
     *
     * @return {Object} The menu
     * @method getMenu
     */
    function getMenu() {
      return menu;
    }

    /**
     * Destroys MenuService cached data.
     *
     * @method destroyMenu
     */
    function destroyMenu() {
      menu = null;
    }

    return {
      loadMenu: loadMenu,
      getMenu: getMenu,
      destroyMenu: destroyMenu,
      setActiveMenuItem: setActiveMenuItem
    };

  }

  app.factory('menuService', MenuService);
  MenuService.$inject = ['$http', '$q', '$location'];

})(angular, angular.module('ov'));
