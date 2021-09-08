'use strict';

const jsdocConfiguration = require('./jsdoc.js');

jsdocConfiguration.source.include = ['app/server', 'DOC-SERVER.md'];
module.exports = jsdocConfiguration;
