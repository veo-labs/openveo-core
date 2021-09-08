'use strict';

/**
 * @module core/httpErrors
 */

/**
 * The list of HTTP errors with, for each error, its associated
 * hexadecimal code and HTTP return code.
 * HTTP errors are sent by {{#crossLinkModule "controllers"}}{{/crossLinkModule}}.
 *
 * @example
 * var httpErrors = process.require('app/server/httpErrors.js');
 * console.log(httpErrors.UNKNOWN_ERROR);
 *
 * @namespace
 */
var HTTP_ERRORS = {

  // Server errors

  /**
   * A server error occurring when no error were specified.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  UNKNOWN_ERROR: {
    code: 0x000,
    httpCode: 500
  },

  /**
   * A server error occurring when getting a dictionary of translations.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  I18N_DICTIONARY_ERROR: {
    code: 0x001,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of taxonomies.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_TAXONOMIES_ERROR: {
    code: 0x002,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of groups.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_GROUPS_ERROR: {
    code: 0x003,
    httpCode: 500
  },

  /**
   * A server error occurring when authenticating the user to the back end.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  BACK_END_AUTHENTICATION_ERROR: {
    code: 0x004,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of applications.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_APPLICATIONS_ERROR: {
    code: 0x005,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of roles.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_ROLES_ERROR: {
    code: 0x006,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of users.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_USERS_ERROR: {
    code: 0x007,
    httpCode: 500
  },

  /**
   * A server error occurring when updating information about a user.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  UPDATE_USER_ERROR: {
    code: 0x008,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of terms of a taxonomy.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_TAXONOMY_ERROR: {
    code: 0x009,
    httpCode: 500
  },

  /**
   * A server error occurring when authenticating using an external provider (which require redirection).
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  BACK_END_EXTERNAL_AUTHENTICATION_ERROR: {
    code: 0x00a,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of settings.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_SETTINGS_ERROR: {
    code: 0x00b,
    httpCode: 500
  },

  /**
   * A server error occurring when getting a setting.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_SETTING_ERROR: {
    code: 0x00e,
    httpCode: 500
  },

  // Not found errors

  /**
   * A server error occurring when requested path does not exist.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  PATH_NOT_FOUND: {
    code: 0x100,
    httpCode: 404
  },

  /**
   * A server error occurring when requested dictionary does not exist.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  I18N_DICTIONARY_NOT_FOUND: {
    code: 0x101,
    httpCode: 404
  },

  /**
   * A server error occurring when requested taxonomy does not exist.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_TAXONOMY_NOT_FOUND: {
    code: 0x102,
    httpCode: 404
  },

  // Authentication errors

  /**
   * A server error occurring when user authentication to the back end failed.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  BACK_END_AUTHENTICATION_FAILED: {
    code: 0x200,
    httpCode: 401
  },

  /**
   * A server error occurring when a back end authentication is needed to perform the action.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  BACK_END_UNAUTHORIZED: {
    code: 0x201,
    httpCode: 401
  },

  /**
   * A server error occurring when user connected to the back end is not authorized to perform an action.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  BACK_END_FORBIDDEN: {
    code: 0x202,
    httpCode: 403
  },

  /**
   * A server error occurring when user connected to the Web Service is not authorized to perform an action.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  WS_FORBIDDEN: {
    code: 0x203,
    httpCode: 403
  },

  /**
   * A server error occurring when a Web Service authentication is needed to perform an action.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  WS_UNAUTHORIZED: {
    code: 0x204,
    httpCode: 401
  },

  /**
   * A server error occurring when user authentication to the back end failed using an external provider.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  BACK_END_EXTERNAL_AUTHENTICATION_FAILED: {
    code: 0x207,
    httpCode: 401
  },

  // Wrong parameters

  /**
   * A server error occurring when getting users with wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_USERS_WRONG_PARAMETERS: {
    code: 0x300,
    httpCode: 400
  },

  /**
   * A server error occurring when updating a user with missing parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  UPDATE_USER_MISSING_PARAMETERS: {
    code: 0x301,
    httpCode: 400
  },

  /**
   * A server error occurring when updating a user with wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  UPDATE_USER_WRONG_PARAMETERS: {
    code: 0x302,
    httpCode: 400
  },

  /**
   * A server error occurring when getting taxonomies with wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_TAXONOMIES_WRONG_PARAMETERS: {
    code: 0x303,
    httpCode: 400
  },

  /**
   * A server error occurring when getting applications with wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_APPLICATIONS_WRONG_PARAMETERS: {
    code: 0x304,
    httpCode: 400
  },

  /**
   * A server error occurring when getting groups with wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_GROUPS_WRONG_PARAMETERS: {
    code: 0x305,
    httpCode: 400
  },

  /**
   * A server error occurring when getting roles with wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_ROLES_WRONG_PARAMETERS: {
    code: 0x306,
    httpCode: 400
  },

  /**
   * A server error occurring when getting taxonomy terms with missing parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_TAXONOMY_TERMS_MISSING_PARAMETERS: {
    code: 0x307,
    httpCode: 400
  },

  /**
   * A server error occurring when authenticating to an internal provider using wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  AUTHENTICATE_INTERNAL_WRONG_PARAMETERS: {
    code: 0x308,
    httpCode: 400
  },

  /**
   * A server error occurring when authenticating to an external provider using wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  AUTHENTICATE_EXTERNAL_WRONG_PARAMETERS: {
    code: 0x309,
    httpCode: 400
  },

  /**
   * A server error occurring when getting settings with wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_SETTINGS_WRONG_PARAMETERS: {
    code: 0x30a,
    httpCode: 400
  },

  /**
   * A server error occurring when getting a setting with missing parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_SETTING_MISSING_PARAMETERS: {
    code: 0x30e,
    httpCode: 400
  }

};

Object.freeze(HTTP_ERRORS);
module.exports = HTTP_ERRORS;
