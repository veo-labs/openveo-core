'use strict';

// For more information about Grunt rename, have a look at https://www.npmjs.com/package/grunt-rename
module.exports = {

  // Rename version documentation directory to the target version
  doc: {
    src: 'site/version',
    dest: 'site/<%= pkg.version %>'
  }

};
