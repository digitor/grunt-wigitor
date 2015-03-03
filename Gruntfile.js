
module.exports = function( grunt ) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')

        ,wigitor: {
            options: {
                pathToRoot: ""
                ,pathToWidgets: "resources/widgets/" // immediate containing folder must be 'widgets'
                ,modifyReadMes: false
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
                    ,"githubMsg": ('\n\n## ![Github](resources/img/octocat.png) Github\n'+
                                    'You may need to switch branches to see the latest version.\n'+
                                    '\n[master - widgets/ejswgt](https://github.com/digitor/wigitor/tree/master/resources/widgets/ejswgt)')
                }
            }
        }
    });

    grunt.registerTask("default", ["wigitor"]);

    grunt.loadTasks('tasks');
}