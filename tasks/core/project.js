'use strict';

module.exports = {
  app: ['./app'],
  admin: ['<%= project.app %>/client/admin'],
  srcjs: ['<%= project.admin %>/js/'],
  sass: ['<%= project.admin %>/compass/sass'],
  public: ['public'],
  css: ['<%= project.public %>/css'],
  js: ['<%= project.public %>/js'],
  font: ['../../lib/bootstrap-sass/assets/fonts/'],
  uglify: ['build/uglify']
};
