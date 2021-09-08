'use strict';

/**
 * Helper module to manipulate local storage.
 *
 * @module ov/storage
 */

(function(angular) {
  var app = angular.module('ov.storage', []);

  /**
   * Defines a storage provider to help store information.
   * For now sessionStorage and localStorage are supported.
   *
   * @class StorageProvider
   */
  function StorageProvider() {
    var self = this;

    // Provider parameters
    // Prefix to use when adding an entry to the storage
    // Using a prefix is transparent when using the provider
    this.prefix = 'ov-';

    // Type of storage to use
    this.type = 'localStorage';

    this.$get = ['$window', function($window) {

      /**
       * Gets information from storage using the given key.
       *
       * @memberof module:ov/storage~StorageProvider
       * @private
       * @instance
       * @param {String} key The key of the element to retrieve
       * @return {Object} The stored value for the given key
       */
      function getFromStorage(key) {
        return $window[self.type][self.prefix + key];
      }

      /**
       * Adds information to the storage.
       *
       * @memberof module:ov/storage~StorageProvider
       * @private
       * @instance
       * @param {String} key The key of the element to add
       * @param {String} value The value of the element to add
       */
      function addToStorage(key, value) {
        $window[self.type][self.prefix + key] = value;
      }

      /**
       * Removes a key from the storage.
       *
       * @memberof module:ov/storage~StorageProvider
       * @private
       * @instance
       * @param {String} key The key of the element to remove
       */
      function removeFromStorage(key) {
        $window[self.type].removeItem(self.prefix + key);
      }

      return {

        /**
         * @memberof module:ov/storage~StorageProvider
         * @instance
         * @method
         * @see module:ov/storage~StorageProvider#getFromStorage
         */
        get: getFromStorage,

        /**
         * @memberof module:ov/storage~StorageProvider
         * @instance
         * @method
         * @see module:ov/storage~StorageProvider#addToStorage
         */
        add: addToStorage,

        /**
         * @memberof module:ov/storage~StorageProvider
         * @instance
         * @method
         * @see module:ov/storage~StorageProvider#addToStorage
         */
        set: addToStorage,

        /**
         * @memberof module:ov/storage~StorageProvider
         * @instance
         * @method
         * @see module:ov/storage~StorageProvider#removeFromStorage
         */
        remove: removeFromStorage
      };

    }];

  }

  app.provider('storage', StorageProvider);

})(angular);
