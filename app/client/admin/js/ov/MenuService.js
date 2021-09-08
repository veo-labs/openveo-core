'use strict';

(function(angular, app) {

  /**
   * Defines a menu service to manage the menu of the application.
   *
   * @example
   * MyAngularObject.$inject = ['menuService'];
   *
   * @class MenuService
   * @memberof module:ov
   * @inner
   */
  function MenuService($http, $q, $location) {
    var basePath = '/be/';
    var menu;

    /**
     * Sets menu items corresponding to the actual path to active and the other menu items to inactive.
     *
     * @memberof module:ov~MenuService
     * @instance
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
          } else {

            // Menu item
            menu[menuItem].active = '/' + menu[menuItem].path === path;

          }
        }
      }
    }

    /**
     * Loads the menu from server.
     *
     * @memberof module:ov~MenuService
     * @instance
     * @async
     * @return {Promise} The Http promise
     */
    function loadMenu() {
      if (!menu) {

        // Get menu from server
        return $http.get(basePath + 'getMenu').then(function(response) {
          menu = response.data;
          setActiveMenuItem();
          return $q.when(response);
        });

      }

      return $q.when({
        data: menu
      });
    }

    /**
     * Gets the menu.
     *
     * @memberof module:ov~MenuService
     * @instance
     * @return {Object} The menu
     */
    function getMenu() {
      return menu;
    }

    /**
     * Destroys MenuService cached data.
     *
     * @memberof module:ov~MenuService
     * @instance
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
