'use strict';

(function(angular) {
  var app = angular.module('ov.storage', []);

  /**
   * Defines a storage provider to help store information.
   * For now sessionStorage and localStorage are supported.
   */
  function StorageProvider() {
    var self = this;

    // Provider parameters
    // Prefix to use when adding an entry to the storage
    // Using a prefix is transparent when using the provider
    this.prefix = 'ov-';

    // Type of storage to use
    this.type = 'sessionStorage';

    this.$get = ['$window', function($window) {

      /**
       * Gets information from storage using the given key.
       * @param String key The key of the element to retrieve
       */
      var getFromStorage = function(key) {
        return $window[self.type][self.prefix + key];
      };

      /**
       * Adds information to the storage.
       * @param String key The key of the element to add
       * @param String value The value of the element to add
       */
      var addToStorage = function(key, value) {
        $window[self.type][self.prefix + key] = value;
      };

      /**
       * Removes a key from the storage.
       * @param String key The key of the element to remove
       */
      var removeFromStorage = function(key) {
        $window[self.type].removeItem(self.prefix + key);
      };

      return {
        get: getFromStorage,
        add: addToStorage,
        set: addToStorage,
        remove: removeFromStorage
      };

    }];

  }

  app.provider('storage', StorageProvider);

})(angular);
