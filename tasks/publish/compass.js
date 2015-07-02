module.exports = {
  publishdev: {
    options: {
      sourcemap: true,
      sassDir: '<%= publish.sass %>',
      cssDir: '<%= publish.css %>',
      environment: 'development'
    }
  },
  publishdist: {
    options: {
      sourcemap: true,
      sassDir: '<%= publish.sass %>',
      cssDir: '<%= publish.css %>',
      environment: 'production'
    }
  }
}