'use strict';

module.exports = {

  // Obfuscate JavaScript files of the back office client
  'back-office': {
    files: [
      {
        expand: true, // Enable dynamic expansion.
        cwd: '<%= project.beJS %>/', // Src matches are relative to this path.
        src: ['**/*.js', '!ov/*.js'], // Actual pattern(s) to match.
        dest: '<%= project.uglify %>/lib', // Destination path prefix.
        ext: '.min.js', // Dest filepaths will have this extension.
        extDot: 'first' // Extensions in filenames begin after the first dot
      },
      {
        expand: true, // Enable dynamic expansion.
        cwd: '<%= project.beJS %>/', // Src matches are relative to this path.
        src: ['*.js', 'ov/*.js'], // Actual pattern(s) to match.
        dest: '<%= project.uglify %>/', // Destination path prefix.
        ext: '.min.js', // Dest filepaths will have this extension.
        extDot: 'first' // Extensions in filenames begin after the first dot
      }
    ]
  }

};
