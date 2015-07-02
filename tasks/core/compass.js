module.exports = {
  dev: {
    options: {
      sourcemap: true,
      sassDir: '<%= project.sass %>',
      cssDir: '<%= project.css %>',
      fontsDir: '<%= project.font %>',
      environment: 'development'
    }
  },
  dist: {
    options: {
      sourcemap: true,
      sassDir: '<%= project.sass %>',
      cssDir: '<%= project.css %>',
      fontsDir: '<%= project.font %>',
      environment: 'production'
    }
  }
}