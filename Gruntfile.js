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
          file: 'server/server.js',
          nodeArgs: ['--debug'],
        }
      }
    },

    mochacli: {
      options: {
        ui: 'bdd',
        reporter: 'spec',
        timeout: '15000'
      },

      unit: {
        src: ['test/unit/*_spec.js']
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
  grunt.loadNpmTasks('grunt-mocha-cli');

  // ## Running the test suites

  grunt.registerTask('test-unit', 'Run unit tests', ['mochacli:unit']);

  // When you just say 'grunt'
  grunt.registerTask('default', ['jshint', 'nodemon', 'watch']);
};
