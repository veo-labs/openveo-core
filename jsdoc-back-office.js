'use strict';

const jsdocConfiguration = require('./jsdoc.js');

jsdocConfiguration.source.include = ['app/client/admin/js', 'DOC-BACK-OFFICE.md'];
module.exports = jsdocConfiguration;
