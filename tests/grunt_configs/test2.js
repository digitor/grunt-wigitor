exports.test = {
   src: [ 'resources/widgets/ejswgt/' ]
    ,dest: "dist/test2/"
    ,options: {
        "deps": ["handlebarswgt"]
        ,"multi-props": true
        ,"gitHubMsg": ('\n\n## ![Github](dist/ejswgt/img/octocat.png) Github\n'+
                        'You may need to switch branches to see the latest version.\n'+
                        '\n[master - widgets/ejswgt](https://github.com/digitor/wigitor/tree/master/resources/widgets/ejswgt)')
    }
}