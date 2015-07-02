module.exports = {
  basePath: ['./node_modules/openveo-publish'],
  app: ['<%= publish.basePath %>/app'],
  admin: ['<%= publish.app %>/client/admin'],
  srcjs: ['<%= publish.admin %>/js/'],
  sass: ['<%= publish.admin %>/compass/sass'],
  public: ['<%= publish.basePath %>/public'],
  css: ['<%= publish.public %>/css'],
  js: ['<%= publish.public %>/publish/js'],
  uglify: ['<%= publish.basePath %>/build/uglify']
}