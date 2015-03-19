"use strict";
module.exports = function(grunt) {

	var NS = "wigitor"
		,ejs = require("ejs")
		,fse = require("fs-extra")
		,Handlebars = require("handlebars")
		,_ = require( 'lodash-node' );

	var START_ADD = "<!--START_WIGITOR_ADDITIONS-->"
		,END_ADD = "<!--END_WIGITOR_VIEWER_ADDITIONS-->";

	var standardPageCnf = {
		_:_
		,java_logic:""
		,device: "desktop"
		,page_vars: {
			isLoggedIn: true
			,hasSidebar: true
			,isLocal: false
		}
	}


	grunt.registerMultiTask( NS, "Demo generator for CRP 'widgets'", function() {

		var config = this.options({
			pluginDir: "node_modules/"+NS+"/"
			,host: ""
			,pathToRoot: ""
			,pathToApp: "app/"
			,gitHubMsg: ('\n\n## ![Github](resources/img/octocat.png) Github\n'+
						'You may need to switch branches to see the latest version.\n'+
						'\n[master - widgets/xxxxwgt](https://github.com/digitor/wigitor/tree/master/resources/widgets/xxxxwgt)')
			,cleanDest: false
			,modifyReadMes: true
			,justContent: false // if false, will render with page template
			,omitScriptTags: false
			,deps: null
			,multiProps: false
			,handlebarsPartials: null // this only affects handlebars widgets
			,containerClasses: null
			,pageTemplate: null
			,strictName: true
			,widgetDirName: "widgets"
			,forceTemplateType: null
		});

		 // immediate containing folder must be 'widgets'
		var pathToWidgets = config.pathToApp + config.widgetDirName + "/";

		if( !fse.existsSync( pathToWidgets ) )
			throw new Error("The 'widgets' directory could not be found. It should be in your 'pathToApp' and called 'widgets' or customised using 'widgetDirName'.");

		// add slash is one doesn't exist
		if( typeof config.host === "string" ) {
			if( config.host === "" || config.host.substr( config.host.length-1 ) !== "/" )
				config.host += "/";
		}


		var done = this.async();
		grunt.log.writeln( NS.yellow );


		var fileObj = this.files[0];

		if( fileObj.src.length === 0 ) throw new Error( "'"+NS+"' needs at least 1 src directory!" );

		// cleans out the old first
		if( config.cleanDest && grunt.file.exists(fileObj.dest) ) grunt.file.delete( fileObj.dest, {force:true} );

		var imgFiles = grunt.file.expand({ cwd: config.pluginDir + "resources" }, "img/*");
		
		_.forEach( imgFiles, function(relPath) {
			grunt.file.copy( config.pluginDir + "resources/" + relPath, fileObj.dest + "/"+relPath );
		});
		

		_.forEach( fileObj.src, function(src) {

			// src = src + "/";

			var wgtOpts = grunt.file.readJSON( src + "options.json" )
				,wgtName = src.split( config.widgetDirName+"/" )[1].split("/")[0];

			widgetNameChecks( wgtName, null, config.strictName );

			if( !wgtOpts["configName"] ) {
				throw new Error( "Widgets must define their 'configName' inside their 'options.json' file. "+
					"Stopping demo generaton for " + wgtName + "." );
			}

			if( grunt.option("clear") ) clearReadMeAdditions( src );

			var readmeAdditions = config.gitHubMsg || "";

			var pageConfig = _.clone( standardPageCnf );

			// Use properties ".json" files to generate demos
			if( grunt.file.exists(src + "properties") ) {


				var thisPageConfig, multiPropsConfig;
				grunt.file.recurse( src + "properties", function(abspath, rootdir, subdir, filename) {

					if( filename.lastIndexOf(".json") === filename.length - 5 ) {

						var exampleName = filename.slice(0, filename.length - 5 );

						if( config.modifyReadMes === true )
							readmeAdditions = getDemoLink( wgtName, exampleName, readmeAdditions, abspath, fileObj.dest );

						// Allows properties to accululate over each json file
						if( config.multiProps === true && multiPropsConfig )	thisPageConfig = multiPropsConfig;
						else													thisPageConfig = pageConfig;

						multiPropsConfig = writeDemo( config, pathToWidgets, wgtName, wgtOpts, exampleName, thisPageConfig, standardPageCnf, src, fileObj.dest, abspath );
					}
				}); // end grunt.file.recurse

				if( multiPropsConfig ) {
					// console.log( multiPropsConfig );
					writeTemplate( config, wgtName, wgtOpts, "multiprops", standardPageCnf, src, fileObj.dest, multiPropsConfig );
				}
			} else { // If no 'properties' dir, assume config is not needed for the demo
				var exampleName = "example1";
				if( config.modifyReadMes === true )
					readmeAdditions = getDemoLink( wgtName, exampleName, readmeAdditions, null, fileObj.dest );
				
				writeDemo( config, pathToWidgets, wgtName, wgtOpts, exampleName, pageConfig, standardPageCnf, src, fileObj.dest );
			}
			
			if( config.modifyReadMes === true && readmeAdditions )
				writeReadMe( src, readmeAdditions, null );
		});
		
		done();
	});


	function writeReadMe( destWgtDir, readmeAdditions, readmeContent ) {

		var readmeDest = destWgtDir + "README.md"

		// 'readmeContent' arg will only be defined in unit tests
		if(!readmeContent) readmeContent = grunt.file.read( readmeDest );

		readmeAdditions = START_ADD + "\n\n" + readmeAdditions + "\n\n" + END_ADD;

		if( readmeContent.indexOf(START_ADD) === -1 ) {

			var h2Index = readmeContent.indexOf("##");
			if( h2Index === -1 ) {
				// if no custom tags, or h2, put it at the end
				grunt.file.write( readmeDest, readmeContent + "\n\n" + readmeAdditions );
			} else {
				// else look for h2 and place before it
				grunt.file.write( readmeDest, readmeContent.slice(0, h2Index) + readmeAdditions + "\n\n" + readmeContent.slice(h2Index) );
			}
		} else {
			// if custom tags found, place between them
			var arr = readmeContent.split(START_ADD);
			grunt.file.write( readmeDest, arr[0] + readmeAdditions + arr[1].split(END_ADD)[1] );
		}
	}


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


	function writeDemo( pluginCnf, pathToWidgets, wgtName, wgtOpts, exampleName, customPageCnf, standardPageCnf, wgtDir, dest, propertiesJSONPath ) {

		customPageCnf.filename = wgtDir + "x/"; // just needs to be 1 level deeper than the widget's directory, so using '/x'

		// If no properties, skip this (probably means there is no config for this widget)
		if( propertiesJSONPath ) {
			// allows the config to be accessed via the 'configName' value or by the wgt name

			var propsConfig = grunt.file.readJSON( propertiesJSONPath );
			customPageCnf[ wgtOpts.configName ] = propsConfig;

			if( pluginCnf.multiProps === true ) {
				customPageCnf[ wgtName ] = customPageCnf[ wgtName ] || {};
				customPageCnf[ wgtName ][ exampleName ] = propsConfig;
			}
		}

		// add configs of other widgets that are specified in pluginCnf.deps
		if( pluginCnf.deps ) customPageCnf = addDepsConfigs( customPageCnf, pathToWidgets, pluginCnf.deps );


		// console.log( customPageCnf[ wgtName ] );
		// If multiProps is set to true, then don't render anything, just return the customPageCnf so it can be added to
		if( pluginCnf.multiProps === true ) return customPageCnf;

		// console.log( "writeTemplate" )
		writeTemplate( pluginCnf, wgtName, wgtOpts, exampleName, standardPageCnf, wgtDir, dest, customPageCnf );
	}


	function addDepsConfigs( customPageCnf, pathToWidgets, deps ) {

		_.forEach( deps, function( dep ) {

			grunt.file.recurse( pathToWidgets + dep + "/properties", function(abspath, rootdir, subdir, filename) {

				if( filename.lastIndexOf(".json") === filename.length - 5 )
					customPageCnf[ dep ] = {};
					customPageCnf[ dep ][ filename.split(".json")[0] ] = grunt.file.readJSON( abspath );
			});
		});

		return customPageCnf;
	}


	function writeTemplate( pluginCnf, wgtName, wgtOpts, exampleName, standardPageCnf, wgtDir, dest, customPageCnf ) {

		// var wigitor = wgtOpts[ NS ];

		var wgtContent
			,templateType = pluginCnf.forceTemplateType || (wgtOpts.templateType || "ejs");

		// defaults to "ejs"
		if( templateType === "ejs" ) {

			// This is a polyfill for "grunt-ejs-render" method
			customPageCnf.helpers = {
				renderPartial: function( path, item ) {
					renderPartialHelper( pluginCnf.pathToRoot, wgtDir, path, item );
				}
			}

			wgtContent = ejs.render( grunt.file.read(wgtDir + "markup.ejs"), customPageCnf );
		} else if( wgtOpts.templateType === "hbs" ) {

			var partials = pluginCnf.handlebarsPartials || [];

			partials.forEach(function( obj ) {
				Handlebars.registerPartial( obj.name, grunt.file.read( obj.path ) );
			});

			// automatically registers partials in the widget's root directory
			fse.readdirSync( wgtDir ).forEach(function( filename ) {
				if( filename !== "markup.hbs" && filename.lastIndexOf(".hbs") === filename.length - 4 ) {

					var partialName = wgtName + "_" + filename.replace(".hbs","");

					var duplicates = _.where( partials, function(obj) {
						return obj.name === partialName || obj.path === wgtDir + filename;
					});

					// will only auto-add partials if thier name and path does not already exist
					if( duplicates.length === 0 )
						Handlebars.registerPartial( partialName, grunt.file.read(wgtDir + filename) );
				}
			});

			var markup = grunt.file.read(wgtDir + "markup.hbs")
				,hbs = Handlebars.compile( markup );

			wgtContent = hbs(customPageCnf);
		}


		if( pluginCnf.omitScriptTags === true ) wgtContent = removeScriptTags( wgtContent );


		// If true, output the content as html, otherwise use the page template
		if( pluginCnf.justContent === true ) {
			// console.log( dest + "/"+ wgtName + "-" + exampleName+".html" );
			grunt.file.write( dest + "/"+ wgtName + "-" + exampleName+".html", wgtContent );
			return;
		}

		var pageTemplate = pluginCnf.pageTemplate || pluginCnf.pluginDir + "resources/template.ejs";

		if( grunt.file.exists( pageTemplate ) ) {

			var pageConfig = _.clone( standardPageCnf );

			pageConfig.containerClasses = pluginCnf.containerClasses; // allowed to be falsey

			// for some reason it needs to be a level deeper than the intended directory, so "x/" used
			pageConfig.filename = pluginCnf.pathToApp + "x/";

			pageConfig.pagetitle = "Widget '"+wgtName+"' Demo";
			pageConfig.pagedescription = "Widget '"+wgtName+"' Demo";
			pageConfig.name = "styleguide";
			pageConfig.wgtName = wgtName;
			pageConfig.wgtContent = wgtContent;
			pageConfig.hasJS = fse.existsSync(wgtDir+"/js/");

			var markup = grunt.file.read( pageTemplate )
				,rendered = ejs.render( markup, pageConfig);

			grunt.file.write( dest + "/"+ wgtName + "-" + exampleName+".html", rendered );
		}
	}


	function renderPartialHelper(pathToRoot, wgtDir, path, item) {
		// This is for 'ejs-render' helper includes, so needs standardPageCnf variables
		var thisPageConfig = _.clone( standardPageCnf );
		thisPageConfig.filename = wgtDir + "x/";
		item = _.extend( {}, item, thisPageConfig );
		
		return ejs.render( grunt.file.read( pathToRoot + path ), item );
	}


	function widgetNameChecks( wgtName, parentMeth, strictName ) {

		var thisMeth = parentMeth ? parentMeth +" -> widgetNameChecks() ->" : "widgetNameChecks() ->";

		if( typeof wgtName !== "string" ) 
			throw new Error(thisMeth+" 'wgtName' is not a string.");

		if( strictName && wgtName.lastIndexOf("wgt") !== wgtName.length - 3 ) 
			throw new Error(thisMeth+" 'wgtName' does not end in 'wgt'.");

		if( wgtName.indexOf(" ") !== -1 ) 
			throw new Error(thisMeth+" 'wgtName' has a space in it.");

		if( wgtName.indexOf("_") !== -1 ) 
			throw new Error(thisMeth+" 'wgtName' has a '_' character in it.");

		if( wgtName.indexOf("-") !== -1 ) 
			throw new Error(thisMeth+" 'wgtName' has a '-' character in it.");

		if( wgtName.toLowerCase() !== wgtName ) 
			throw new Error(thisMeth+" 'wgtName' has uppercase characters in it.");

		if( wgtName[0].match(/[0-9]/) )
			throw new Error(thisMeth +" 'wgtName' starts with a number. This is invalid due to CSS class name restrictions.");

		_.forEach(wgtName, function(ch, i) {
            if( !ch.match(/[a-z0-9]/) ) {
                throw new Error(thisMeth +" 'wgtName' contains characters that are not CSS friendly. Stopping at character number "+i+" - '"+ch+"'.");
            }
        });
	}


	function removeScriptTags(markup) {
		var rx = new RegExp("<script[\\d\\D]*?</script>", "g");
		return markup.replace( rx, "");
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
			,writeReadMe: writeReadMe
			,removeScriptTags: removeScriptTags
			,widgetNameChecks: widgetNameChecks
			,writeTemplate: writeTemplate
			,writeDemo: writeDemo
			,renderPartialHelper: renderPartialHelper
			,addDepsConfigs: addDepsConfigs
			,constants: {
				START_ADD: START_ADD
				,END_ADD: END_ADD
			}
			,configs: {
				standardPageCnf: _.clone( standardPageCnf ) // generates a fresh copy with each call
			}
		}
	}
}