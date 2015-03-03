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
				,con = testableMethods.constants;

			fse.outputFileSync(path+"README.md", "# TEST\n"+con.START_ADD + "\nxxxxx\n" + con.END_ADD );

			testableMethods.clearReadMeAdditions(path);
			expect(1).toEqual(1);
		});
	});


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
