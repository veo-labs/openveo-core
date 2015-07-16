"use strict"

// HTTP Error codes
module.exports = {
  
  // General errors
  UNKNOWN_ERROR: { code: 0x001, httpCode: 500 },
  PATH_NOT_FOUND: { code: 0x002, httpCode: 404 },
  
  // Authentication errors
  BACK_END_AUTHENTICATION_ERROR: { code: 0x100, httpCode: 500 },
  BACK_END_AUTHENTICATION_FAILED: { code: 0x101, httpCode: 401 },
  BACK_END_UNAUTHORIZED: { code: 0x102, httpCode: 401 },
  BACK_END_FORBIDDEN: { code: 0x103, httpCode: 403 },
  WS_FORBIDDEN: { code: 0x104, httpCode: 403 },
  WS_UNAUTHORIZED: { code: 0x105, httpCode: 401 },
  
  // Missing parameters errors
  GET_ENTITIES_MISSING_PARAMETERS: { code: 0x200, httpCode: 400 },  
  GET_ENTITY_MISSING_PARAMETERS: { code: 0x201, httpCode: 400 },
  UPDATE_ENTITY_MISSING_PARAMETERS: { code: 0x202, httpCode: 400 },
  ADD_ENTITY_MISSING_PARAMETERS: { code: 0x203, httpCode: 400 },
  REMOVE_ENTITY_MISSING_PARAMETERS: { code: 0x204, httpCode: 400 },
  GET_TAXONOMY_MISSING_PARAMETERS: { code: 0x205, httpCode: 400 },
  
  // Other errors
  I18N_DICTIONARY_NOT_FOUND: { code: 0x300, httpCode: 404 },
  GET_ENTITIES_ERROR: { code: 0x301, httpCode: 500 },
  GET_ENTITY_ERROR: { code: 0x302, httpCode: 500 },
  UPDATE_ENTITY_ERROR: { code: 0x303, httpCode: 500 },
  ADD_ENTITY_ERROR: { code: 0x304, httpCode: 500 },
  REMOVE_ENTITY_ERROR: { code: 0x305, httpCode: 500 },
  GET_ENTITIES_UNKNOWN: { code: 0x306, httpCode: 500 },
  GET_ENTITY_UNKNOWN: { code: 0x307, httpCode: 500 },  
  UPDATE_ENTITY_UNKNOWN: { code: 0x308, httpCode: 500 },  
  ADD_ENTITY_UNKNOWN: { code: 0x309, httpCode: 500 },  
  REMOVE_ENTITY_UNKNOWN: { code: 0x30A, httpCode: 500 },
  GET_TAXONOMY_ERROR: { code: 0x30B, httpCode: 500 }
  
};