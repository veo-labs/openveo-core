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

  // General errors
  UNKNOWN_ERROR: {
    code: 0x000,
    httpCode: 500
  },
  PATH_NOT_FOUND: {
    code: 0x001,
    httpCode: 404
  },

  // Authentication errors
  BACK_END_AUTHENTICATION_ERROR: {
    code: 0x100,
    httpCode: 500
  },
  BACK_END_AUTHENTICATION_FAILED: {
    code: 0x101,
    httpCode: 401
  },
  BACK_END_UNAUTHORIZED: {
    code: 0x102,
    httpCode: 401
  },
  BACK_END_FORBIDDEN: {
    code: 0x103,
    httpCode: 403
  },
  WS_FORBIDDEN: {
    code: 0x104,
    httpCode: 403
  },
  WS_UNAUTHORIZED: {
    code: 0x105,
    httpCode: 401
  },

  // Missing parameters errors
  GET_TAXONOMY_MISSING_PARAMETERS: {
    code: 0x200,
    httpCode: 400
  },
  GET_GROUP_MISSING_PARAMETERS: {
    code: 0x201,
    httpCode: 400
  },

  // Other errors
  I18N_DICTIONARY_NOT_FOUND: {
    code: 0x300,
    httpCode: 404
  },
  GET_TAXONOMY_ERROR: {
    code: 0x301,
    httpCode: 500
  },
  GET_TAXONOMIES_ERROR: {
    code: 0x302,
    httpCode: 500
  },
  GET_GROUP_ERROR: {
    code: 0x303,
    httpCode: 500
  },
  GET_GROUPS_ERROR: {
    code: 0x304,
    httpCode: 500
  }

};
