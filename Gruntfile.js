
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
                ,pluginDir: "../custom_modules/widgetviewer/"
            }

            ,ejs: {
                src: [ 'resources/widgets/ejswgt/' ]
                ,dest: "dist/ejswgt/"
                ,options: {
                    "deps": ["handlebarswgt"]
                    ,"multi-props": true
                    ,"gitHubMsg": ('\n\n## ![Github](resources/img/octocat.png) Github\n'+
                                    'You may need to switch branches to see the latest version.\n'+
                                    '\n[master - widgets/ejswgt](https://github.com/digitor/wigitor/tree/master/resources/widgets/ejswgt)')
                }
            }
        }
    });

    grunt.registerTask("test", ['jshint', 'jasmine_node:wigitor'] );

    grunt.registerTask('default', ['test', 'wigitor']
                            .concat( grunt.option("dirty") ? [] : ["clean:tests"] )
                        );

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-jasmine-node-coverage');
}