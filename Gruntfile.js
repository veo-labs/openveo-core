'use strict';
var path = require("path");
process.root = __dirname;
process.require = function(filePath){
  return require(path.normalize(process.root + "/" + filePath));
};
  var applicationConf = process.require("conf.json");
  var libFile = applicationConf["backOffice"]["scriptLibFiles"]["dev"];
  var jsFile = applicationConf["backOffice"]["scriptFiles"]["dev"];
  
module.exports = function(grunt) {

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      project: {
          app: ['app'],
          assets: ['<%= project.app %>/client/assets'],
          srcjs: ['<%= project.assets %>/js/'],
          sass: ['<%= project.assets %>/compass/sass'],
          
          public: ['public'],
          css: ['<%= project.public %>/css'],
          js: ['<%= project.public %>/js'],
          font: ['<%= project.public %>/lib/bootstrap-sass-official/assets/fonts/'],
          
          uglify: ['build/uglify']
      },      
      compass: {
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
	  },
      uglify: {
        prod: {
          files: [
            {
              expand: true,     // Enable dynamic expansion.
              cwd: '<%= project.srcjs %>/',      // Src matches are relative to this path.
              src: ['**/*.js', '!ov/*.js'], // Actual pattern(s) to match.
              dest: '<%= project.uglify %>/lib',   // Destination path prefix.
              ext: '.min.js',   // Dest filepaths will have this extension.
              extDot: 'first'   // Extensions in filenames begin after the first dot
            },
            {
              expand: true,     // Enable dynamic expansion.
              cwd: '<%= project.srcjs %>/',      // Src matches are relative to this path.
              src: ['ov/*.js'], // Actual pattern(s) to match.
              dest: '<%= project.uglify %>/',   // Destination path prefix.
              ext: '.min.js',   // Dest filepaths will have this extension.
              extDot: 'first'   // Extensions in filenames begin after the first dot
            }
          ]
        }
      },
      concat: {
        options: {
          separator: ';',
        },
        lib: {
          src: (function() {
              var files = [];
              libFile.forEach(function(path) {
                files.push('<%= project.uglify %>/lib/' + path.replace('js','min.js'));
              });
              return files;
            }()),
          dest: '<%= project.js %>/libOpenveo.js',
        },
        js: {
          src:(function() {
              var files = [];
              jsFile.forEach(function(path) {
                files.push('<%= project.uglify %>/' + path.replace('js','min.js'));
              });
              return files;
            }()),
          dest: '<%= project.js %>/openveo.js',
        }
      },
      watch: {
		compass: {
              files: '**/*.scss',
              tasks: ['compass:dev']
		}
      }
    });
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('concatjs', ['uglify:prod', 'concat']);
    grunt.registerTask('prod', ['compass:dist', "concatjs"]);

};