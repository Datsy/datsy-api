module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      gruntfile: 'Gruntfile.js',
      server: 'server/**/*.js',
      client: 'client/*.js',
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
          watchedExtensions: ['js', 'jade']
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

    env: {
      dev: {
        NODE_ENV: 'development'
      },
      prod: {
        NODE_ENV: 'production'
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
      },
      jade: {
        files: 'server/views/*.jade',
        tasks: 'nodemon'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-mocha-cov');
  grunt.loadNpmTasks('grunt-env');

  // Running the test suites

  grunt.registerTask('test', 'Run unit tests', ['mochacov:unit']);

  grunt.registerTask('travis', 'Run tests', ['mochacov:unit']);

  //  Running different environment builds

  grunt.registerTask('dev', 'Run the development build', ['env:dev', 'nodemon']);

  grunt.registerTask('prod', 'Run the production build', ['env:prod', 'nodemon']);

  // When you just say 'grunt'
  grunt.registerTask('default', ['jshint', 'mochacov:unit', 'watch']);
};
