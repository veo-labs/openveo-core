'use strict';

module.exports = {

  // Automatically rebuild back office when a file is modified
  admin: {
    files: [
      '<%= project.be %>/**/*',
      '<%= project.beViews %>/**/*',
      '<%= project.root %>/conf.js'
    ],
    tasks: [
      'build-back-office-client'
    ]
  }

};
