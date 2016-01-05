'use strict';

var path = require('path');

module.exports = {
  root: [path.join(__dirname, '..', '..')],
  app: ['./app'],
  be: ['<%= project.app %>/client/admin'],
  beJS: ['<%= project.be %>/js/'],
  beSASS: ['<%= project.be %>/compass/sass'],
  beAssets: ['assets/be'],
  beCSSAssets: ['<%= project.beAssets %>/css'],
  beJSAssets: ['<%= project.beAssets %>/js'],
  font: ['<%= project.root %>/lib/bootstrap-sass/assets/fonts/'],
  uglify: ['build/uglify'],
  tests: ['<%= project.root %>/tests']
};
