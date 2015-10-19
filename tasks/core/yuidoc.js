'use strict';

module.exports = {

  // Back end doc
  backEnd: {
    name: 'OpenVeo AngularJS back end',
    description: 'AngularJS OpenVeo back end documentation',
    version: '<%= pkg.version %>',
    options: {
      paths: 'app/client/admin/js',
      outdir: './docs/api/back-end',
      linkNatives: true,
      themedir: 'node_modules/yuidoc-theme-blue'
    }
  }

};
