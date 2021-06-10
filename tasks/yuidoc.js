'use strict';

module.exports = {

  // Back office client documentation
  admin: {
    name: 'OpenVeo AngularJS back end',
    description: 'AngularJS OpenVeo back end documentation',
    version: '<%= pkg.version %>',
    options: {
      paths: 'app/client/admin/js',
      outdir: './site/version/api/client-back-end',
      linkNatives: true,
      themedir: 'node_modules/yuidoc-theme-blue'
    }
  },

  // Server side documentation
  server: {
    name: 'OpenVeo Core server',
    description: 'Node.js OpenVeo Core documentation',
    version: '<%= pkg.version %>',
    options: {
      paths: 'app/server/',
      outdir: './site/version/api/server',
      linkNatives: true,
      themedir: 'node_modules/yuidoc-theme-blue'
    }
  }

};
