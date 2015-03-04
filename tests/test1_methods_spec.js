'use strict';

var _ = require("lodash-node")
	,fse = require("fs-extra");

describe("test 1 - wigitor testable methods", function() {

	var wigitor = require("../tasks/wigitor.js")
		,testableMethods = wigitor( require("grunt") ).tests;

	describe("clearReadMeAdditions()", function() {
		it("should clear test between custom tags", function() {

			var path = "dist/test1/clearReadMeAdditions/"
				,cons = testableMethods.constants
				,CONTENT = "\nxxxxx\n";

			fse.outputFileSync(path+"README.md", "# Heading 1\n"+cons.START_ADD + CONTENT + cons.END_ADD );

			testableMethods.clearReadMeAdditions(path);

			expect( fse.readFileSync(path+"README.md").toString().indexOf(CONTENT) ).toEqual(-1);
		});
	});

	describe("writeReadMe()", function() {

		var dest = "dist/test1/writeReadMe/"
			,cons = testableMethods.constants
			,pre = "# Heading 1\n"
			,post = "\n## Heading 2"
			,dblBreak = "\n\n"
			,readmeAdditions = "Github stuff here";

		it("should place readme content between the custom tags", function() {

			testableMethods.writeReadMe( dest, readmeAdditions, pre + cons.START_ADD + cons.END_ADD + post );

			var content = fse.readFileSync(dest+"README.md").toString();

			expect( content ).toBe( pre + cons.START_ADD + dblBreak + readmeAdditions + dblBreak + cons.END_ADD + post );

			// clean up
			fse.removeSync( dest+"README.md" );
		});

		it("should place readme content before the h2/##", function() {

			testableMethods.writeReadMe( dest, readmeAdditions, pre + post );

			var content = fse.readFileSync(dest+"README.md").toString();

			expect( content ).toBe( pre + "\n" + cons.START_ADD + dblBreak + readmeAdditions + dblBreak + cons.END_ADD + "\n" + post );

			// clean up
			fse.removeSync( dest+"README.md" );
		});

		it("should place readme content at the end of the doc", function() {

			testableMethods.writeReadMe( dest, readmeAdditions, pre ); // note: no 'post'

			var content = fse.readFileSync(dest+"README.md").toString();

			expect( content ).toBe( pre + dblBreak + cons.START_ADD + dblBreak + readmeAdditions + dblBreak + cons.END_ADD );

			// clean up
			fse.removeSync( dest+"README.md" );
		});
	});

	describe("removeScriptTags()", function() {
		it("should remove script tags in markup", function() {

			var start = "<p>xxxx</p>"
				,end = "<ul><li>lllll</li></ul>";

			// test without attributes
			var scr = "<script>var a = 0;</script>"
				,result = testableMethods.removeScriptTags( start + scr + end );

			expect( result ).toBe( start + end );

			// test with attributes
			scr = "<script src=\"/wwwwww/dddd.js\">var b = 0;</script>";
			result = testableMethods.removeScriptTags( start + scr + end );

			expect( result ).toBe( start + end );

			// test multiple script tags
			scr = "<script src=\"/wwwwww/dddd.js\">var b = 0;</script>";
			result = testableMethods.removeScriptTags( start + scr + start + scr + scr + end + scr + end );

			expect( result.indexOf("<script") ).toEqual( -1 );
		});
	});

	describe("widgetNameChecks()", function() {
		it("should throw an error if 'wgtName' is not string", function() {
			expectError( {} );
		});

		it("should throw an error if 'wgtName' is does not end in 'wgt'", function() {
			expectError( "mywidget" );
		});

		it("should throw an error if 'wgtName' has a space in it", function() {
			expectError( "my wgt" );
		});

		it("should throw an error if 'wgtName' has a '_' character in it", function() {
			expectError( "my_wgt" );
		});

		it("should throw an error if 'wgtName' has a '-' character in it", function() {
			expectError( "my-wgt" );
		});

		it("should throw an error if 'wgtName' has uppercase characters in it", function() {
			expectError( "myWgt" );
		});

		it("should throw an error if 'wgtName' starts with a number", function() {
			expectError( "0mywgt" );
		});

		it("should throw an error if 'wgtName' contains characters that are not CSS friendly", function() {
			expectError( "my?wgt" );
			expectError( "my~wgt" );
			expectError( "my.wgt" );
			expectError( "my,wgt" );
			expectError( "my*wgt" );
			expectError( "my&wgt" );
			expectError( "my%wgt" );
			expectError( "my$wgt" );
			expectError( "my#wgt" );
			expectError( "my@wgt" );
			expectError( "my!wgt" );
			expectError( "my+wgt" );
			expectError( "my[wgt" );
			expectError( "my{wgt" );
			expectError( "my(wgt" );
		});

		function expectError( wgtName, flip ) {
			// use flip=true to expect NO errors

			var itErrored = false;

			try {
				testableMethods.widgetNameChecks( wgtName );
			} catch(e) {
				itErrored = true;
				// console.log( e );
			}

			expect( itErrored ).toBe( flip ? false : true );
		}
	});

	
	describe("addDepsConfigs()", function() {
		it("should add configs of other widgets that are specified as `deps`", function() {
			var customPageCnf = testableMethods.addDepsConfigs( testableMethods.configs.standardPageCnf, "resources/widgets/",  ["handlebarswgt"] );
			expect( customPageCnf.handlebarswgt ).toBeDefined();
		});
	});


	describe("renderPartialHelper", function() {
		it("should check that the function returns rendered markup", function() {

			var wgtCnf = getWidgetConfig( "resources/widgets/ejswgt/", "example1", false )
				,rendered = testableMethods.renderPartialHelper( process.cwd()+"/", "resources/widgets/", "resources/widgets/ejswgt/markup.ejs", wgtCnf );

			expect( rendered.indexOf("<div") === 0 ).toBe( true );
			expect( rendered.indexOf("<%") === -1 ).toBe( true );
		});
	});


	describe("writeDemo()", function() {
		var pluginCnf = {
			justContent: false
			,multiProps: false
			,omitScriptTags: true
			,pluginDir: ""
			,pathToRoot: ""
			,pathToWidgets: "resources/widgets/"
		}
		,wgtName = "ejswgt"
		,wgtDir = "resources/widgets/"+wgtName+"/"
		,dest = "dist/test1/writeDemo/";


		it("should write to file when 'multiProps' is false", function() {

			var multiPropsConfig = basicPrep(function(thisPluginCnf) {
				thisPluginCnf.multiProps = false;
			});

			// check file created
			var genFile = dest + wgtName+"-example1.html";
			expect( fse.existsSync( genFile ) ).toBe( true );

			// clean up
			fse.removeSync( genFile );
		});


		it("should NOT write to file when 'multiProps' is true", function() {

			var multiPropsConfig = basicPrep(function(thisPluginCnf) {
				thisPluginCnf.multiProps = true;
			});

			// check file created
			var genFile = dest + wgtName+"-example1.html";
			expect( fse.existsSync( genFile ) ).toBe( false );
		});


		it("should return a config when 'multiProps' is true", function() {

			var thisPluginCnf, wgtOpts;

			var multiPropsConfig = basicPrep(function(_pluginCnf, _wgtOpts) {
				_pluginCnf.multiProps = true;
				thisPluginCnf = _pluginCnf;
				wgtOpts = _wgtOpts;
			}, "example1");

			expect( multiPropsConfig ).toBeDefined();

			var propertiesJSONPath = wgtDir+"properties/example2.json";
			multiPropsConfig = testableMethods.writeDemo( thisPluginCnf, wgtName, wgtOpts, "example2", multiPropsConfig, testableMethods.configs.standardPageCnf, wgtDir, dest, propertiesJSONPath );

			// this is the normal config, based on example1 - maybe this should be removed?
			expect( multiPropsConfig[ wgtOpts.configName ] ).toBeDefined();

			// these are the multi properties, based on widget's 'properties' folder contents
			expect( multiPropsConfig[ wgtName ].example1 ).toBeDefined();
			expect( multiPropsConfig[ wgtName ].example2 ).toBeDefined();
		});


		it("should return 'undefined' when 'multiProps' is false", function() {

			var multiPropsConfig = basicPrep(function(thisPluginCnf) {
				thisPluginCnf.multiProps = false;
			});

			expect( multiPropsConfig ).not.toBeDefined();

			// check file created
			var genFile = dest + wgtName+"-example1.html";
			expect( fse.existsSync( genFile ) ).toBe( true );

			// clean up
			fse.removeSync( genFile );
		});


		it("should contain 'handlebarswgt' config data", function() {

			var multiPropsConfig = basicPrep(function(thisPluginCnf) {
				thisPluginCnf.multiProps = true;
				thisPluginCnf.deps = ["handlebarswgt"];
			});

			expect( multiPropsConfig ).toBeDefined();
			expect( multiPropsConfig.handlebarswgt.example1 ).toBeDefined();
		});

		function basicPrep( cb, propName ) {
			var thisPluginCnf = _.clone( pluginCnf )
				,wgtOpts = fse.readJsonSync( wgtDir + "options.json" )
				,exampleName = propName || "example1";

			cb( thisPluginCnf, wgtOpts );

			var customPageCnf = getWidgetConfig( wgtDir, exampleName, true );

			var propertiesJSONPath = propName ? wgtDir+"properties/"+propName+".json" : null;

			return testableMethods.writeDemo( thisPluginCnf, wgtName, wgtOpts, exampleName, customPageCnf, testableMethods.configs.standardPageCnf, wgtDir, dest, propertiesJSONPath );
		}
	});


	describe("writeTemplate()", function() {
		var pluginCnf = {
			justContent: false
			,omitScriptTags: true
			,pluginDir: ""
			,pathToRoot: ""
		},
		wigitor = {
			"container-classes": null
		}
		,wgtName = "ejswgt"
		,wgtDir = "resources/widgets/"+wgtName+"/"
		,dest = "dist/test1/writeTemplate/";

		it("shoud check that, when 'justContent' is true, an html file is created", function() {

			basicPrep(function( thisPluginCnf ) {
				thisPluginCnf.justContent = true;
			});

			// check file created
			var genFile = dest + wgtName+"-example1.html";
			expect( fse.existsSync( genFile ) ).toBe( true );

			// clean up
			fse.removeSync( genFile );
		});

		it("shoud check that, when 'justContent' is false, an html file is created and contains template", function() {

			basicPrep(function( thisPluginCnf ) {
				thisPluginCnf.justContent = false;
			});

			// check file created
			var genFile = dest + wgtName+"-example1.html";
			expect( fse.existsSync( genFile ) ).toBe( true );

			// check that the template has been used
			var markup = fse.readFileSync( genFile ).toString();
			expect( markup.indexOf("<!DOCTYPE") === 0 ).toBe( true );

			// clean up
			fse.removeSync( genFile );
		});

		it("shoud check that, when 'omitScriptTags' is true, script tags get removed", function() {

			basicPrep(function( thisPluginCnf ) {
				thisPluginCnf.omitScriptTags = true;
				thisPluginCnf.justContent = true;
			});

			// check file created
			var genFile = dest + wgtName+"-example1.html";
			expect( fse.existsSync( genFile ) ).toBe( true );

			// check that script tags are gone
			var markup = fse.readFileSync( genFile ).toString();
			expect( markup.indexOf("<script") === -1 ).toBe( true );
			expect( markup.indexOf("</script>") === -1 ).toBe( true );

			// clean up
			fse.removeSync( genFile );
		});

		it("shoud check that, when 'omitScriptTags' is false, script tags DO NOT get removed", function() {

			basicPrep(function( thisPluginCnf ) {
				thisPluginCnf.omitScriptTags = false;
				thisPluginCnf.justContent = true;
			});

			// check file created
			var genFile = dest + wgtName+"-example1.html";
			expect( fse.existsSync( genFile ) ).toBe( true );

			// check that script tags are still there
			var markup = fse.readFileSync( genFile ).toString();
			expect( markup.indexOf("<script") === -1 ).toBe( false );
			expect( markup.indexOf("</script>") === -1 ).toBe( false );

			// clean up
			fse.removeSync( genFile );
		});

		function basicPrep(cb) {
			
			var thisPluginCnf = _.clone( pluginCnf )
				,wgtOpts = _.clone( { "wigitor": wigitor } )
				,exampleName = "example1";

			cb( thisPluginCnf );

			var customPageCnf = getWidgetConfig( wgtDir, exampleName, true );

			// console.log( customPageCnf )
			testableMethods.writeTemplate( thisPluginCnf, wgtName, wgtOpts, exampleName, testableMethods.configs.standardPageCnf, wgtDir, dest, customPageCnf );

			// just making sure ejs-render polyfill exists
			expect( customPageCnf.helpers.renderPartial ).toBeDefined();
		}
	});


	function getWidgetConfig( wgtDir, exampleName, includePageConfig ) {
		// merge standard page config with widget properties
		var wgtCnf = {}
			,wgtOpts = fse.readJsonSync( wgtDir + "options.json" )
		wgtCnf[ wgtOpts.configName ] = fse.readJsonSync( wgtDir + "properties/" + exampleName + ".json" );

		var rtnCnf;

		if( includePageConfig )
			rtnCnf = _.extend( {}, testableMethods.configs.standardPageCnf, wgtCnf );
		else
			rtnCnf = wgtCnf;

		// add config from handlebarswgt
		rtnCnf = testableMethods.addDepsConfigs( rtnCnf, "resources/widgets/",  ["handlebarswgt"] );
		expect( rtnCnf.handlebarswgt ).toBeDefined();

		return rtnCnf;
	}
});
