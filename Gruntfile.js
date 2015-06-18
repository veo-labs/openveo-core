'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      project: {
          app: ['app'],
          public: ['public'],
          assets: ['<%= project.public %>/assets'],
          css: ['<%= project.assets %>/css'],
          sass: ['<%= project.assets %>/compass/sass'],
          js: ['<%= project.public %>/js'],
      },      
      compass: {
          dev: {
            options: {
              sourcemap: true,
			  sassDir: '<%= project.sass %>',
			  cssDir: '<%= project.css %>',
              environment: 'development',
			}
          },
		  dist: {
			options: {
              sourcemap: true,
			  sassDir: '<%= project.sass %>',
			  cssDir: '<%= project.css %>',
              environment: 'production',
			}
	      }
	  },
      uglify: {
        all: {
          files:'<%= project.js %>/*.js'
        }
      },
      watch: {
		compass: {
              files: '**/*.scss',
              tasks: ['compass:dev']
		}, 
        js: {
             files: ['<%= project.js %>/*.js'],
             tasks: ['uglify']
        }
      }
    });
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('prod', ['compass:dist', 'uglify:all']);

};