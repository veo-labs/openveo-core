'use strict';

/**
 * @module core/plugin/hooks
 */

/**
 * Defines the list of hooks sent by core.
 *
 * @example
 * var coreApi = process.api.getCoreApi();
 * var CORE_HOOKS = process.api.getCoreApi().getHooks();
 * coreApi.registerAction(CORE_HOOKS.USERS_DELETED, function(ids, callback) {
 *   console.log(ids);
 *   callback();
 * );
 *
 * @namespace
 */
var CORE_HOOKS = {

  /**
   * One or several OpenVeo users have been deleted.
   *
   * With:
   * - **Array** The list of deleted user ids
   * - **Function** The function to call when action is done
   *
   * @const
   * @type {String}
   * @default
   * @inner
   */
  USERS_DELETED: 'users.deleted',

  /**
   * One or several OpenVeo roles have been deleted.
   *
   * With:
   * - **Array** The list of deleted role ids
   * - **Function** The function to call when action is done
   *
   * @const
   * @type {String}
   * @default
   * @inner
   */
  ROLES_DELETED: 'roles.deleted',

  /**
   * One or several content groups have been added.
   *
   * With:
   * - **Array** The list of added groups
   * - **Function** The function to call when action is done
   *
   * @const
   * @type {String}
   * @default
   * @inner
   */
  GROUPS_ADDED: 'groups.added',

  /**
   * A content group has been updated.
   *
   * With:
   * - **Object** The hook data with:
   *   - **String** id The id of updated group
   *   - **Object** modifications The list of modifications applied
   * - **Function** The function to call when action is done
   *
   * @const
   * @type {String}
   * @default
   * @inner
   */
  GROUP_UPDATED: 'group.updated',

  /**
   * One or several content groups have been deleted.
   *
   * With:
   * - **Array** The list of deleted groups
   * - **Function** The function to call when action is done
   *
   * @const
   * @type {String}
   * @default
   * @inner
   */
  GROUPS_DELETED: 'groups.deleted'

};

Object.freeze(CORE_HOOKS);
module.exports = CORE_HOOKS;
