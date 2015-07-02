module.exports = {
  publishprod: {
    files: [
      {
        expand: true, // Enable dynamic expansion.
        cwd: '<%= publish.srcjs %>/', // Src matches are relative to this path.
        src: ['ovPub/*.js'], // Actual pattern(s) to match.
        dest: '<%= publish.uglify %>/', // Destination path prefix.
        ext: '.min.js', // Dest filepaths will have this extension.
        extDot: 'first'   // Extensions in filenames begin after the first dot
      }
    ]
  }
}