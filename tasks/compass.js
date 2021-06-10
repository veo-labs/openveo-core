'use strict';

module.exports = {

  // Build the back office stylesheet
  // Use grunt compass:back-office --with-source-maps to add source maps generation
  'back-office': {
    options: {
      sourcemap: process.withSourceMaps,
      sassDir: '<%= project.beSASS %>',
      cssDir: '<%= project.beCSSAssets %>',
      fontsDir: '<%= project.font %>',
      httpFontsPath: '<%= project.fontHttpPath %>',
      environment: 'production',
      outputStyle: 'compressed',
      force: true,
      raw: '::Sass::Script::Number.precision = 10\n'
    }
  }

};
