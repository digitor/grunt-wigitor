'use strict';

var _ = require("lodash-node")
	,fse = require("fs-extra")
	,parserlib = require("parserlib") // for linting CSS
	,TEST_DIR = "./dist/test1/";

describe("test 1 - wigitor testable methods", function() {

	var wigitor = require("../tasks/wigitor.js")
		,testableMethods = wigitor( require("grunt") ).tests;

	describe("clearReadMeAdditions()", function() {
		it("should clear test between custom tags", function() {

			var path = "dist/test1/clearReadMeAdditions/"
				,cons = testableMethods.constants
				,CONTENT = "\nxxxxx\n";

			fse.outputFileSync(path+"README.md", "# TEST\n"+cons.START_ADD + CONTENT + cons.END_ADD );

			testableMethods.clearReadMeAdditions(path);

			expect( fse.readFileSync(path+"README.md").toString().indexOf(CONTENT) ).toEqual(-1);
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
				,thisWigitor = _.clone( { "wigitor": wigitor } )
				,exampleName = "example1";

			cb( thisPluginCnf );

			var customPageCnf = getWidgetConfig( wgtDir, exampleName, true );

			// console.log( customPageCnf )
			testableMethods.writeTemplate( thisPluginCnf, wgtName, thisWigitor, exampleName, testableMethods.configs.standardPageCnf, wgtDir, dest, customPageCnf );

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


	function lintCSS( done, returnedStr ) {
		// Now we lint the CSS
		var parser = new parserlib.css.Parser();

		// will get changed to true in error handler if errors detected
		var errorsFound = false;

		parser.addListener("error", function(event){
		    console.log("Parse error: " + event.message + " (" + event.line + "," + event.col + ")", "error");
		    errorsFound = true;
		});

		parser.addListener("endstylesheet", function(){
		    console.log("Finished parsing style sheet");

			expect( errorsFound ).toBe( false );

			// finish the test
		    done();
		});
		
		parser.parse( returnedStr );
	}


	function trimAllWhite(str) {
		return str.replace(/\s+/g, '');
	}
});
