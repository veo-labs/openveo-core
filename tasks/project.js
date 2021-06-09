'use strict';

var path = require('path');

module.exports = {
  root: [path.join(__dirname, '..')],
  app: ['./app'],
  be: ['<%= project.app %>/client/admin'],
  beJS: ['<%= project.be %>/js/'],
  beSASS: ['<%= project.be %>/compass/sass'],
  beAssets: ['assets/be'],
  beCSSAssets: ['<%= project.beAssets %>/css'],
  beJSAssets: ['<%= project.beAssets %>/js'],
  beViews: ['<%= project.beAssets %>/views'],
  font: ['<%= project.root %>/node_modules/bootstrap-sass/assets/fonts/'],
  fontHttpPath: '/bootstrap-sass/assets/fonts/',
  uglify: ['build/uglify'],
  tests: ['<%= project.root %>/tests']
};
