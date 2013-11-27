module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      gruntfile: 'Gruntfile.js',
      server: 'server/**/*.js',
      options: {
        globals: {
          eqeqeq: true
        }
      }
    },

    nodemon: {
      dev: {
        options: {
          file: 'server.js',
          nodeArgs: ['--debug'],
        }
      }
    },

    mochacov: {
      unit: {
        options: {
          reporter: 'spec'
        }
      },

      coveralls: {
        options: {
          coveralls: {
            serviceName: 'travis-ci'
          }
        }
      },

      options: {
        files: 'test/**/*_spec.js',
        ui: 'bdd',
        timeout: '15000',
        colors: true
      }
    },

    watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: 'jshint:gruntfile'
      },
      server: {
        files: 'server/**/*.js',
        tasks: 'jshint:server'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-mocha-cov');

  // Running the test suites

  grunt.registerTask('test', 'Run unit tests', ['mochacov:unit']);

  grunt.registerTask('travis', 'Run tests', ['mochacov:unit']);

  //  Starting the server

  grunt.registerTask('server', 'Run the Node.js server on localhost', ['nodemon']);

  // When you just say 'grunt'
  grunt.registerTask('default', ['jshint', 'mochacov:unit', 'watch']);
};
