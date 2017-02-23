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
   */
  GET_TAXONOMY_ERROR: {
    code: 0x009,
    httpCode: 500
  },

  // Not found errors

  /**
   * A server error occurring when requested path does not exist.
   *
   * @property PATH_NOT_FOUND
   * @type Object
   * @final
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
   */
  WS_UNAUTHORIZED: {
    code: 0x204,
    httpCode: 401
  },

  /**
   * A server error occurring when connected user is not authorized to update a user.
   *
   * @property UPDATE_USER_FORBIDDEN
   * @type Object
   * @final
   */
  UPDATE_USER_FORBIDDEN: {
    code: 0x205,
    httpCode: 403
  },

  /**
   * A server error occurring when connected user is not authorized to update a taxonomy.
   *
   * @property GET_TAXONOMY_FORBIDDEN
   * @type Object
   * @final
   */
  GET_TAXONOMY_FORBIDDEN: {
    code: 0x206,
    httpCode: 403
  },

  // Wrong parameters

  /**
   * A server error occurring when getting users with wrong parameters.
   *
   * @property GET_USERS_WRONG_PARAMETERS
   * @type Object
   * @final
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
   */
  GET_TAXONOMY_TERMS_MISSING_PARAMETERS: {
    code: 0x307,
    httpCode: 400
  }

};
Object.freeze(HTTP_ERRORS);
module.exports = HTTP_ERRORS;
