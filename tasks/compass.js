'use strict';

module.exports = {
  dev: {
    options: {
      sourcemap: true,
      sassDir: '<%= project.beSASS %>',
      cssDir: '<%= project.beCSSAssets %>',
      fontsDir: '<%= project.font %>',
      httpFontsPath: '<%= project.fontHttpPath %>',
      environment: 'development',
      force: true,
      raw: '::Sass::Script::Number.precision = 10\n'
    }
  },
  dist: {
    options: {
      sourcemap: false,
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
