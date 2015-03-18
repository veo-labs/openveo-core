(function(angular, app){

  "use strict"
  
  app.factory("menuService", MenuService);
  MenuService.$inject = ["$http", "$q", "$location"];
  
  /**
   * Defines a menu service to manage the menu of the application.
   */
  function MenuService($http, $q, $location){
    var menu;
    
    /**
     * Loads the menu from server.
     * @return Promise The promise used to retrieve menu from server
     */
    var loadMenu = function(){
      if(!menu){
        
        // Get menu from server
        return $http.get("/admin/getMenu").success(function(menuObj){
          menu = menuObj;
          setActiveMenuItem();
        });
        
      }

      return $q.when(menu);
    };
    
    /**
     * Gets the menu.
     * @param Object The menu
     */
    var getMenu = function(){
      return menu;
    };
    
    /**
     * Destroys menu instance.
     */
    var destroyMenu = function(){
      menu = null;
    };
    
    /**
     * Sets menu items corresponding to the actual path to active and the
     * others to inactive.
     */
    var setActiveMenuItem = function(){
      if(menu){
        var path = $location.path();
        
        for(var menuItem in menu){
          
          // Sub menu
          if(angular.isArray(menu[menuItem])){
            for(var i = 0 ; i < menu[menuItem].length ; i++){
              menu[menuItem][i].active = menu[menuItem][i].path === path;
            }
          }
          
          // Menu item
          else
            menu[menuItem].active = menu[menuItem].path === path;
        }
      }
    };

    return{
      loadMenu : loadMenu,
      getMenu : getMenu,
      destroyMenu : destroyMenu,
      setActiveMenuItem : setActiveMenuItem
    };

  }

})(angular, angular.module("ov"));