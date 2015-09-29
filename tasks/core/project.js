'use strict';

module.exports = {
  app: ['./app'],
  be: ['<%= project.app %>/client/admin'],
  beJS: ['<%= project.be %>/js/'],
  beSASS: ['<%= project.be %>/compass/sass'],
  beAssets: ['assets/be'],
  beCSSAssets: ['<%= project.beAssets %>/css'],
  beJSAssets: ['<%= project.beAssets %>/js'],
  font: ['../../lib/bootstrap-sass/assets/fonts/'],
  uglify: ['build/uglify']
};
