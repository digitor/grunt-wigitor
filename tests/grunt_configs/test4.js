exports.test = {
   src: [ 'resources/widgets/handlebarswgt/' ]
    ,dest: "dist/test4/"
    ,options: {
    	handlebarsPartials: [{
    		name: "randompartial"
    		,path: "resources/randompartial.hbs"
    	}]
        ,"gitHubMsg": ('\n\n## ![Github](dist/handlebarswgt/img/octocat.png) Github\n'+
                        'You may need to switch branches to see the latest version.\n'+
                        '\n[master - widgets/handlebarswgt](https://github.com/digitor/wigitor/tree/master/resources/widgets/handlebarswgt)')
    }
}