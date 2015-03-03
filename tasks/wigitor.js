module.exports = function(grunt) {
	"use strict";

	var NS = "wigitor"
		,ejs = require("ejs")
		,_ = require( 'lodash-node' );

	var START_ADD = "<!--START_WIGITOR_ADDITIONS-->"
		,END_ADD = "<!--END_WIGITOR_VIEWER_ADDITIONS-->";

	grunt.registerMultiTask( NS, "Demo generator for CRP 'widgets'", function() {

		var config = this.options({
			pluginDir: "custom_modules/"+NS+"/"
			,host: ""
			,pathToRoot: "../../"
			,pathToWidgets: "widgets/"
			,gitHubMsg: ('\n\n## ![Github](resources/img/octocat.png) Github\n'+
						'You may need to switch branches to see the latest version.\n'+
						'\n[master - widgets/xxxxwgt](https://github.com/digitor/wigitor/tree/master/resources/widgets/xxxxwgt)')
			,configName: null // will default to widget name + "Config"
			,cleanDest: false
			,modifyReadMes: true
			,justContent: false
			,omitScriptTags: false
			,deps: null
			,multiProps: false
		});

		// add slash is one doesn't exist
		if( typeof config.host === "string" ) {
			if( config.host === "" || config.host.substr( config.host.length-1 ) !== "/" )
				config.host += "/";
		}


		var done = this.async();
		grunt.log.writeln( NS.yellow );


		var fileObj = this.files[0];

		if( fileObj.src.length === 0 ) {
			grunt.log.error( "'"+NS+"' needs at least 1 src directory!".red );
			done();
			return;
		}

		// cleans out the old first
		if( config.cleanDest && grunt.file.exists(fileObj.dest) ) grunt.file.delete( fileObj.dest, {force:true} );

		var imgFiles = grunt.file.expand({ cwd: config.pluginDir + "resources" }, "img/*");
		
		_.forEach( imgFiles, function(relPath) {
			grunt.file.copy( config.pluginDir + "resources/" + relPath, fileObj.dest + "/"+relPath );
		});

		var standardConfig = {
			_:_
			,java_logic:""
			,device: "desktop"
			,page_vars: {
				isLoggedIn: true
				,hasSidebar: true
				,isLocal: false
			}
		}

		

		_.forEach( fileObj.src, function(src) {

			// console.log( src );

			var wgtOpts = grunt.file.readJSON( src + "/options.json" );

			var demoOpts = wgtOpts[ NS ];

			// only generate demos if widget options specify it
			if( !demoOpts ) return;

			var wgtName = src.split("widgets/")[1].split("/")[0];


			if( !wgtOpts["configName"] ) {
				grunt.log.error( "Widgets must define their 'configName' inside their 'options.json' file. "+
					"Stopping demo generaton for " + wgtName + "." );
				return;
			}

			var readmeSrc = src + "/README.md"
				,readmeContent = grunt.file.read( readmeSrc );

			if( grunt.option("clear") ) clearReadMeAdditions( src );

			// if github links not in README.md, append them
			var readmeAdditions = config.gitHubMsg;
			// if( config.modifyReadMes === true && readmeContent.indexOf(START_ADD) === -1 ) {
				// readmeAdditions = config.gitHubMsg;
			// }

			// console.log(readmeContent.indexOf(START_ADD))

			var ejsConfig = _.clone( standardConfig );

			// Use properties ".json" files to generate demos
			if( grunt.file.exists(src + "/properties") ) {

				var thisEjsConfig, multiPropsConfig;
				grunt.file.recurse( src + "/properties", function(abspath, rootdir, subdir, filename) {

					if( filename.lastIndexOf(".json") === filename.length - 5 ) {

						var exampleName = filename.slice(0, filename.length - 5 );

						if( config.modifyReadMes === true )
							readmeAdditions = getDemoLink( wgtName, exampleName, readmeAdditions, abspath, fileObj.dest );

						// Allows properties to accululate over each json file
						if( config.multiProps === true && multiPropsConfig )	thisEjsConfig = multiPropsConfig;
						else													thisEjsConfig = ejsConfig;

						multiPropsConfig = writeDemo( config, wgtName, wgtOpts, exampleName, thisEjsConfig, standardConfig, src, fileObj.dest, abspath );
					}
				}); // end grunt.file.recurse

				if( multiPropsConfig ) {
					// console.log( multiPropsConfig );
					writeTemplate( config, wgtName, wgtOpts, "multiprops", standardConfig, src, fileObj.dest, multiPropsConfig );
				}
			} else { // If no 'properties' dir, assume config is not needed for the demo
				var exampleName = "example1";
				if( config.modifyReadMes === true )
					readmeAdditions = getDemoLink( wgtName, exampleName, readmeAdditions, fileObj.dest );
				
				writeDemo( config, wgtName, wgtOpts, exampleName, ejsConfig, standardConfig, src, fileObj.dest );
			}
			
			if( config.modifyReadMes === true && readmeAdditions ) {
				readmeAdditions = START_ADD + "\n\n" + readmeAdditions + "\n\n" + END_ADD;

				if( readmeContent.indexOf(START_ADD) === -1 ) {

					var h2Index = readmeContent.indexOf("##");
					if( h2Index === -1 ) {
						// if no custom tags, or h2, put it at the end
						grunt.file.write( readmeSrc, readmeContent + "\n\n" + readmeAdditions );
					} else {
						// else look for h2 and place before it
						grunt.file.write( readmeSrc, readmeContent.slice(0, h2Index) + readmeAdditions + "\n\n" + readmeContent.slice(h2Index) );
					}
				} else {
					// if custom tags found, place between them
					var arr = readmeContent.split(START_ADD);
					grunt.file.write( readmeSrc, arr[0] + readmeAdditions + arr[1].split(END_ADD)[1] );
				}
			}
		});
		
		done();
	});


	function getDemoLink( wgtName, exampleName, readmeAdditions, configPath, dest ) {
		// readmeAdditions = '## [Demo - '+exampleName+'](/_dist/docs/_dev/app/widgets/'+wgtName+'-'+exampleName+'.html)\n' + readmeAdditions;
		var markup = '<a style="display:inline;" href="'+dest + wgtName+'-'+exampleName+'.html" target="_blank">'+
						'Demo - ' +exampleName+
					'</a>';

		if( configPath ) {
			/**
			 * This was a little tricky to get right. The template had to include <pre><code> tags, but keep value of popover
			 * not as HTML, otherwise line breaks and <img> tags would get rendered as HTML.
			 */
			var json = _.escape( JSON.stringify( grunt.file.readJSON(configPath), null, "\t" ) )
				,template = _.escape( '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><pre><code class="popover-content"></code></pre></div>' );

			markup +=	'<button type="button" class="btn btn-sm" '+
							'data-template="'+template+'" '+
							'data-html="false" data-toggle="popover" data-placement="bottom" title="Properties" data-content="'+json+'" '+
							'style="display:inline; margin:5px;" >'+
							'properties'+
						'</button><br>' + 
						(readmeAdditions || "");
		}

		return markup;
	}


	function writeDemo( config, wgtName, wgtOpts, exampleName, ejsConfig, standardConfig, src, dest, propertiesJSONPath ) {

		ejsConfig.filename = src + "/x"; // just needs to 1 level deeper than the widget's directory, so using '/x'

		// If no properties, skip this (probably means there is no config for this widget)
		if( propertiesJSONPath ) {
			// allows the config to be accessed via the 'configName' value or by the wgt name

			var propsConfig = grunt.file.readJSON( propertiesJSONPath );
			ejsConfig[ wgtOpts.configName ] = propsConfig;

			if( config.multiProps === true ) {
				ejsConfig[ wgtName ] = ejsConfig[ wgtName ] || {};
				ejsConfig[ wgtName ][ exampleName ] = propsConfig;

				// console.log( ejsConfig[ wgtName ] );
			}
		}

		if( config.deps ) {
			_.forEach( config.deps, function( dep ) {

				grunt.file.recurse( config.pathToWidgets + dep + "/properties", function(abspath, rootdir, subdir, filename) {

					if( filename.lastIndexOf(".json") === filename.length - 5 )
						ejsConfig[ dep ] = {};
						ejsConfig[ dep ][ filename.split(".json")[0] ] = grunt.file.readJSON( abspath );
				});
			});
		}

		// This is a polyfill for "grunt-ejs-render" method
		ejsConfig.helpers = {
			renderPartial: function( path, item ) {
				var thisEjsConfig = _.clone( standardConfig );
				thisEjsConfig.filename = src + "/x";
				item = _.extend( item, thisEjsConfig );
				
				return ejs.render( grunt.file.read( config.pathToRoot + path ), item );
			}
		}

		// console.log( ejsConfig[ wgtName ] );
		// If multiProps is set to true, then don't render anything, just return the ejsConfig so it can be added to
		if( config.multiProps === true ) return ejsConfig;

		// console.log( "writeTemplate" )
		writeTemplate( config, wgtName, wgtOpts, exampleName, standardConfig, src, dest, ejsConfig );
	}


	function writeTemplate( config, wgtName, wgtOpts, exampleName, standardConfig, src, dest, ejsConfig ) {

		var demoOpts = wgtOpts[ NS ];

		var wgtContent = ejs.render( grunt.file.read(src + "/markup.ejs"), ejsConfig );

		if( config.omitScriptTags === true ) {
			var rx = new RegExp("<script[\\d\\D]*?</script>", "g");
			wgtContent = wgtContent.replace( rx, "");
		}

		if( config.justContent === true ) {
			// console.log( dest + "/"+ wgtName + "-" + exampleName+".html" );
			grunt.file.write( dest + "/"+ wgtName + "-" + exampleName+".html", wgtContent );
			return;
		}

		var templatePath = config.pluginDir + "resources/template.ejs"
		// console.log( grunt.file.exists( templatePath ), templatePath );
		if( grunt.file.exists( templatePath ) ) {

			var thisEjsConfig = _.clone( standardConfig );

			thisEjsConfig.containerClasses = demoOpts["container-classes"];
			thisEjsConfig.filename = config.pathToRoot + src;
			thisEjsConfig.pagetitle = "Widget '"+wgtName+"' Demo";
			thisEjsConfig.pagedescription = "Widget '"+wgtName+"' Demo";
			thisEjsConfig.name = "styleguide";
			thisEjsConfig.wgtName = wgtName;
			thisEjsConfig.wgtContent = wgtContent;

			var rendered = ejs.render( grunt.file.read(templatePath), thisEjsConfig);

			// console.log( dest + "/"+ wgtName + "-" + exampleName+".html" );
			grunt.file.write( dest + "/"+ wgtName + "-" + exampleName+".html", rendered );
		}
	}


	function clearReadMeAdditions(src) {

		var readmeSrc = src + "/README.md"
			,readmeContent = grunt.file.read( readmeSrc );

		// strip out old content
		var rx = new RegExp( START_ADD + "[\\d\\D]*?" + END_ADD, "g" );
		readmeContent = readmeContent.replace(rx, START_ADD + "\n" + END_ADD);

		// stops line breaks getting too big
		readmeContent = readmeContent.split("\n\n\n\n").join("\n");

		// write it to disk
		grunt.file.write( readmeSrc, readmeContent );
	}

	return {
		tests: {
			clearReadMeAdditions: clearReadMeAdditions
			,constants: {
				START_ADD: START_ADD
				,END_ADD: END_ADD
			}
		}
	}
}