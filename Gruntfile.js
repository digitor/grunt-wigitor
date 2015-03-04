'use strict';
module.exports = function( grunt ) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')

        ,jshint: {
          all: [
            'Gruntfile.js'
            ,'tasks/*.js'
          ],
          options: {
            jshintrc: '.jshintrc'
          },
        }

        // Unit tests.
        ,jasmine_node: {
            wigitor: {
                src: ["tests/**/*spec.js"] // for coverage
                ,options: {
                    coverage: {} // using istanbul defaults
                    ,specFolders: ['tests']
                    ,captureExceptions: true
                    ,showColors: true
                    ,forceExit: true
                }
            }
        }

        ,clean: {
            tests: ["dist:test1"]
        }

        ,wigitor: {
            options: {
                pathToRoot: ""
                ,pathToWidgets: "resources/widgets/" // immediate containing folder must be 'widgets'
                ,modifyReadMes: true
                ,justContent: true
                ,omitScriptTags: true
                ,pluginDir: ""
            }

            ,test2: require("./tests/grunt_configs/test2.js").test
            ,test3: require("./tests/grunt_configs/test3.js").test
            ,test4: require("./tests/grunt_configs/test4.js").test
        }
    });

    grunt.registerTask("test1", ['jasmine_node:wigitor'] );
    grunt.registerTask("test2", ['wigitor:test2'] );
    grunt.registerTask("test3", ['wigitor:test3'] );
    grunt.registerTask("test4", ['wigitor:test4'] );

    grunt.registerTask("test", ['test2', 'test3', 'test4', 'test1'] ); // 'test1' must go last, as this actually runs the jasmine tests

    grunt.registerTask('default', ['test'].concat(  grunt.option("dirty") ? [] : ["clean:tests"] )  );

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-jasmine-node-coverage');
}