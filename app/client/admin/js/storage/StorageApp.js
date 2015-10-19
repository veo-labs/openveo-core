'use strict';

/**
 * Helper module to manipulate local storage.
 *
 * @module ov.storage
 * @main ov.storage
 */

(function(angular) {
  var app = angular.module('ov.storage', []);

  /**
   * Defines a storage provider to help store information.
   * For now sessionStorage and localStorage are supported.
   *
   * @class storageProvider
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
       *
       * @param {String} key The key of the element to retrieve
       * @return {Object} The stored value for the given key
       * @method getFromStorage
       */
      function getFromStorage(key) {
        return $window[self.type][self.prefix + key];
      }

      /**
       * Adds information to the storage.
       *
       * @param {String} key The key of the element to add
       * @param {String} value The value of the element to add
       * @method addToStorage
       */
      function addToStorage(key, value) {
        $window[self.type][self.prefix + key] = value;
      }

      /**
       * Removes a key from the storage.
       *
       * @param {String} key The key of the element to remove
       * @method removeFromStorage
       */
      function removeFromStorage(key) {
        $window[self.type].removeItem(self.prefix + key);
      }

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
