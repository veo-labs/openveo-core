'use strict';

/**
 * @module core-plugin
 */

/**
 * Defines the list of hooks sent by core.
 *
 * @example
 *     var coreApi = process.api.getCoreApi();
 *     var CORE_HOOKS = process.api.getCoreApi().getHooks();
 *     coreApi.registerAction(CORE_HOOKS.USERS_DELETED, function(ids, callback) {
 *       console.log(ids);
 *       callback();
 *     );
 *
 * @class CORE_HOOKS
 * @static
 */

var CORE_HOOKS = {

  /**
   * One or several OpenVeo users have been deleted.
   *
   * With:
   * - **Array** The list of deleted user ids
   * - **Function** The function to call when action is done
   *
   * @property USERS_DELETED
   * @type String
   * @default 'users.deleted'
   * @final
   */
  USERS_DELETED: 'users.deleted',

  /**
   * One or several OpenVeo roles have been deleted.
   *
   * With:
   * - **Array** The list of deleted role ids
   * - **Function** The function to call when action is done
   *
   * @property ROLES_DELETED
   * @type String
   * @default 'roles.deleted'
   * @final
   */
  ROLES_DELETED: 'roles.deleted'

};

Object.freeze(CORE_HOOKS);
module.exports = CORE_HOOKS;
