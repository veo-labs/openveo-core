'use strict';

/**
 * The list of HTTP errors with, for each error, its associated
 * hexadecimal code and HTTP return code.
 * HTTP errors are sent by {{#crossLinkModule "controllers"}}{{/crossLinkModule}}.
 *
 * @example
 *     var httpErrors = process.require("app/server/httpErrors.js");
 *     console.log(httpErrors.UNKNOWN_ERROR);
 *
 * @module core-http-errors
 * @main core-http-errors
 */
module.exports = {

  // Server errors
  UNKNOWN_ERROR: {
    code: 0x000,
    httpCode: 500
  },
  I18N_DICTIONARY_ERROR: {
    code: 0x001,
    httpCode: 500
  },
  GET_TAXONOMIES_ERROR: {
    code: 0x002,
    httpCode: 500
  },
  GET_GROUPS_ERROR: {
    code: 0x003,
    httpCode: 500
  },
  BACK_END_AUTHENTICATION_ERROR: {
    code: 0x004,
    httpCode: 500
  },
  GET_APPLICATIONS_ERROR: {
    code: 0x005,
    httpCode: 500
  },
  GET_ROLES_ERROR: {
    code: 0x006,
    httpCode: 500
  },
  GET_USERS_ERROR: {
    code: 0x007,
    httpCode: 500
  },
  UPDATE_USER_ERROR: {
    code: 0x008,
    httpCode: 500
  },
  GET_TAXONOMY_ERROR: {
    code: 0x009,
    httpCode: 500
  },

  // Not found errors
  PATH_NOT_FOUND: {
    code: 0x100,
    httpCode: 404
  },
  I18N_DICTIONARY_NOT_FOUND: {
    code: 0x101,
    httpCode: 404
  },
  GET_TAXONOMY_NOT_FOUND: {
    code: 0x102,
    httpCode: 404
  },

  // Authentication errors
  BACK_END_AUTHENTICATION_FAILED: {
    code: 0x200,
    httpCode: 401
  },
  BACK_END_UNAUTHORIZED: {
    code: 0x201,
    httpCode: 401
  },
  BACK_END_FORBIDDEN: {
    code: 0x202,
    httpCode: 403
  },
  WS_FORBIDDEN: {
    code: 0x203,
    httpCode: 403
  },
  WS_UNAUTHORIZED: {
    code: 0x204,
    httpCode: 401
  },
  UPDATE_USER_FORBIDDEN: {
    code: 0x205,
    httpCode: 403
  },
  GET_TAXONOMY_FORBIDDEN: {
    code: 0x206,
    httpCode: 403
  },

  // Wrong parameters
  GET_USERS_WRONG_PARAMETERS: {
    code: 0x300,
    httpCode: 400
  },
  UPDATE_USER_MISSING_PARAMETERS: {
    code: 0x301,
    httpCode: 400
  },
  UPDATE_USER_WRONG_PARAMETERS: {
    code: 0x302,
    httpCode: 400
  },
  GET_TAXONOMIES_WRONG_PARAMETERS: {
    code: 0x303,
    httpCode: 400
  },
  GET_APPLICATIONS_WRONG_PARAMETERS: {
    code: 0x304,
    httpCode: 400
  },
  GET_GROUPS_WRONG_PARAMETERS: {
    code: 0x305,
    httpCode: 400
  },
  GET_ROLES_WRONG_PARAMETERS: {
    code: 0x306,
    httpCode: 400
  },
  GET_TAXONOMY_TERMS_MISSING_PARAMETERS: {
    code: 0x307,
    httpCode: 400
  }

};
