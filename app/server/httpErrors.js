'use strict';

/**
 * @module core
 */

/**
 * The list of HTTP errors with, for each error, its associated
 * hexadecimal code and HTTP return code.
 * HTTP errors are sent by {{#crossLinkModule "controllers"}}{{/crossLinkModule}}.
 *
 * @example
 *     var httpErrors = process.require('app/server/httpErrors.js');
 *     console.log(httpErrors.UNKNOWN_ERROR);
 *
 * @class HTTP_ERRORS
 * @static
 */
var HTTP_ERRORS = {

  // Server errors

  /**
   * A server error occurring when no error were specified.
   *
   * @property UNKNOWN_ERROR
   * @type Object
   * @final
   * @default 0
   */
  UNKNOWN_ERROR: {
    code: 0x000,
    httpCode: 500
  },

  /**
   * A server error occurring when getting a dictionary of translations.
   *
   * @property I18N_DICTIONARY_ERROR
   * @type Object
   * @final
   * @default 1
   */
  I18N_DICTIONARY_ERROR: {
    code: 0x001,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of taxonomies.
   *
   * @property GET_TAXONOMIES_ERROR
   * @type Object
   * @final
   * @default 2
   */
  GET_TAXONOMIES_ERROR: {
    code: 0x002,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of groups.
   *
   * @property GET_GROUPS_ERROR
   * @type Object
   * @final
   * @default 3
   */
  GET_GROUPS_ERROR: {
    code: 0x003,
    httpCode: 500
  },

  /**
   * A server error occurring when authenticating the user to the back end.
   *
   * @property BACK_END_AUTHENTICATION_ERROR
   * @type Object
   * @final
   * @default 4
   */
  BACK_END_AUTHENTICATION_ERROR: {
    code: 0x004,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of applications.
   *
   * @property GET_APPLICATIONS_ERROR
   * @type Object
   * @final
   * @default 5
   */
  GET_APPLICATIONS_ERROR: {
    code: 0x005,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of roles.
   *
   * @property GET_ROLES_ERROR
   * @type Object
   * @final
   * @default 6
   */
  GET_ROLES_ERROR: {
    code: 0x006,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of users.
   *
   * @property GET_USERS_ERROR
   * @type Object
   * @final
   * @default 7
   */
  GET_USERS_ERROR: {
    code: 0x007,
    httpCode: 500
  },

  /**
   * A server error occurring when updating information about a user.
   *
   * @property UPDATE_USER_ERROR
   * @type Object
   * @final
   * @default 8
   */
  UPDATE_USER_ERROR: {
    code: 0x008,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of terms of a taxonomy.
   *
   * @property GET_TAXONOMY_ERROR
   * @type Object
   * @final
   * @default 9
   */
  GET_TAXONOMY_ERROR: {
    code: 0x009,
    httpCode: 500
  },

  /**
   * A server error occurring when authenticating using an external provider (which require redirection).
   *
   * @property BACK_END_EXTERNAL_AUTHENTICATION_ERROR
   * @type Object
   * @final
   * @default 10
   */
  BACK_END_EXTERNAL_AUTHENTICATION_ERROR: {
    code: 0x00a,
    httpCode: 500
  },

  /**
   * A server error occurring when getting the list of settings.
   *
   * @property GET_SETTINGS_ERROR
   * @type Object
   * @final
   * @default 11
   */
  GET_SETTINGS_ERROR: {
    code: 0x00b,
    httpCode: 500
  },

  /**
   * A server error occurring when getting a setting.
   *
   * @property GET_SETTING_ERROR
   * @type Object
   * @final
   * @default 14
   */
  GET_SETTING_ERROR: {
    code: 0x00e,
    httpCode: 500
  },

  // Not found errors

  /**
   * A server error occurring when requested path does not exist.
   *
   * @property PATH_NOT_FOUND
   * @type Object
   * @final
   * @default 256
   */
  PATH_NOT_FOUND: {
    code: 0x100,
    httpCode: 404
  },

  /**
   * A server error occurring when requested dictionary does not exist.
   *
   * @property I18N_DICTIONARY_NOT_FOUND
   * @type Object
   * @final
   * @default 257
   */
  I18N_DICTIONARY_NOT_FOUND: {
    code: 0x101,
    httpCode: 404
  },

  /**
   * A server error occurring when requested taxonomy does not exist.
   *
   * @property GET_TAXONOMY_NOT_FOUND
   * @type Object
   * @final
   * @default 258
   */
  GET_TAXONOMY_NOT_FOUND: {
    code: 0x102,
    httpCode: 404
  },

  // Authentication errors

  /**
   * A server error occurring when user authentication to the back end failed.
   *
   * @property BACK_END_AUTHENTICATION_FAILED
   * @type Object
   * @final
   * @default 512
   */
  BACK_END_AUTHENTICATION_FAILED: {
    code: 0x200,
    httpCode: 401
  },

  /**
   * A server error occurring when a back end authentication is needed to perform the action.
   *
   * @property BACK_END_UNAUTHORIZED
   * @type Object
   * @final
   * @default 513
   */
  BACK_END_UNAUTHORIZED: {
    code: 0x201,
    httpCode: 401
  },

  /**
   * A server error occurring when user connected to the back end is not authorized to perform an action.
   *
   * @property BACK_END_FORBIDDEN
   * @type Object
   * @final
   * @default 514
   */
  BACK_END_FORBIDDEN: {
    code: 0x202,
    httpCode: 403
  },

  /**
   * A server error occurring when user connected to the Web Service is not authorized to perform an action.
   *
   * @property WS_FORBIDDEN
   * @type Object
   * @final
   * @default 515
   */
  WS_FORBIDDEN: {
    code: 0x203,
    httpCode: 403
  },

  /**
   * A server error occurring when a Web Service authentication is needed to perform an action.
   *
   * @property WS_UNAUTHORIZED
   * @type Object
   * @final
   * @default 516
   */
  WS_UNAUTHORIZED: {
    code: 0x204,
    httpCode: 401
  },

  /**
   * A server error occurring when user authentication to the back end failed using an external provider.
   *
   * @property BACK_END_EXTERNAL_AUTHENTICATION_FAILED
   * @type Object
   * @final
   * @default 519
   */
  BACK_END_EXTERNAL_AUTHENTICATION_FAILED: {
    code: 0x207,
    httpCode: 401
  },

  // Wrong parameters

  /**
   * A server error occurring when getting users with wrong parameters.
   *
   * @property GET_USERS_WRONG_PARAMETERS
   * @type Object
   * @final
   * @default 768
   */
  GET_USERS_WRONG_PARAMETERS: {
    code: 0x300,
    httpCode: 400
  },

  /**
   * A server error occurring when updating a user with missing parameters.
   *
   * @property UPDATE_USER_MISSING_PARAMETERS
   * @type Object
   * @final
   * @default 769
   */
  UPDATE_USER_MISSING_PARAMETERS: {
    code: 0x301,
    httpCode: 400
  },

  /**
   * A server error occurring when updating a user with wrong parameters.
   *
   * @property UPDATE_USER_WRONG_PARAMETERS
   * @type Object
   * @final
   * @default 770
   */
  UPDATE_USER_WRONG_PARAMETERS: {
    code: 0x302,
    httpCode: 400
  },

  /**
   * A server error occurring when getting taxonomies with wrong parameters.
   *
   * @property GET_TAXONOMIES_WRONG_PARAMETERS
   * @type Object
   * @final
   * @default 771
   */
  GET_TAXONOMIES_WRONG_PARAMETERS: {
    code: 0x303,
    httpCode: 400
  },

  /**
   * A server error occurring when getting applications with wrong parameters.
   *
   * @property GET_APPLICATIONS_WRONG_PARAMETERS
   * @type Object
   * @final
   * @default 772
   */
  GET_APPLICATIONS_WRONG_PARAMETERS: {
    code: 0x304,
    httpCode: 400
  },

  /**
   * A server error occurring when getting groups with wrong parameters.
   *
   * @property GET_GROUPS_WRONG_PARAMETERS
   * @type Object
   * @final
   * @default 773
   */
  GET_GROUPS_WRONG_PARAMETERS: {
    code: 0x305,
    httpCode: 400
  },

  /**
   * A server error occurring when getting roles with wrong parameters.
   *
   * @property GET_ROLES_WRONG_PARAMETERS
   * @type Object
   * @final
   * @default 774
   */
  GET_ROLES_WRONG_PARAMETERS: {
    code: 0x306,
    httpCode: 400
  },

  /**
   * A server error occurring when getting taxonomy terms with missing parameters.
   *
   * @property GET_TAXONOMY_TERMS_MISSING_PARAMETERS
   * @type Object
   * @final
   * @default 775
   */
  GET_TAXONOMY_TERMS_MISSING_PARAMETERS: {
    code: 0x307,
    httpCode: 400
  },

  /**
   * A server error occurring when authenticating to an internal provider using wrong parameters.
   *
   * @property AUTHENTICATE_INTERNAL_WRONG_PARAMETERS
   * @type Object
   * @final
   * @default 776
   */
  AUTHENTICATE_INTERNAL_WRONG_PARAMETERS: {
    code: 0x308,
    httpCode: 400
  },

  /**
   * A server error occurring when authenticating to an external provider using wrong parameters.
   *
   * @property AUTHENTICATE_EXTERNAL_WRONG_PARAMETERS
   * @type Object
   * @final
   * @default 777
   */
  AUTHENTICATE_EXTERNAL_WRONG_PARAMETERS: {
    code: 0x309,
    httpCode: 400
  },

  /**
   * A server error occurring when getting settings with wrong parameters.
   *
   * @property GET_SETTINGS_WRONG_PARAMETERS
   * @type Object
   * @final
   * @default 778
   */
  GET_SETTINGS_WRONG_PARAMETERS: {
    code: 0x30a,
    httpCode: 400
  },

  /**
   * A server error occurring when getting a setting with missing parameters.
   *
   * @property GET_SETTING_MISSING_PARAMETERS
   * @type Object
   * @final
   * @default 782
   */
  GET_SETTING_MISSING_PARAMETERS: {
    code: 0x30e,
    httpCode: 400
  }

};

Object.freeze(HTTP_ERRORS);
module.exports = HTTP_ERRORS;
