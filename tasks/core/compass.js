'use strict';

module.exports = {
  dev: {
    options: {
      sourcemap: true,
      sassDir: '<%= project.beSASS %>',
      cssDir: '<%= project.beCSSAssets %>',
      fontsDir: '<%= project.font %>',
      environment: 'development'
    }
  },
  dist: {
    options: {
      sourcemap: false,
      sassDir: '<%= project.beSASS %>',
      cssDir: '<%= project.beCSSAssets %>',
      fontsDir: '<%= project.font %>',
      environment: 'production'
    }
  }
};
