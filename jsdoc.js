'use strict';

module.exports = {
  recurseDepth: 10,
  sourceType: 'module',
  tags: {
    allowUnknownTags: false,
    dictionaries: ['jsdoc', 'closure']
  },
  source: {
    include: [],
    includePattern: '.+\\.js(doc|x)?$',
    excludePattern: '(^|\\/|\\\\)_'
  },
  plugins: ['plugins/markdown'],
  templates: {
    cleverLinks: true,
    monospaceLinks: false,
    default: {
      outputSourceFiles: true,
      useLongnameInNav: true
    }
  }
};
