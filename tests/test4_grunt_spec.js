'use strict';

var _ = require("lodash-node")
	,fse = require("fs-extra")


describe("test 4 - check generated files and folders", function() {

	it("should generate html and image files", function() {
		expect( fse.existsSync( "dist/test4/handlebarswgt-example1.html" ) ).toBe( true );
		expect( fse.existsSync( "dist/test4/img/octocat.png" ) ).toBe( true );
	});

	it("should generate ensure html files have no EJS syntax", function() {
		
		var markup = fse.readFileSync( "dist/test4/handlebarswgt-example1.html" ).toString();
		expect( markup.indexOf("<%") ).toEqual( -1 );
	});

	it("should check that json properties exists in html files", function() {

		var ejs2MyProps = fse.readJsonSync( "resources/widgets/handlebarswgt/properties/example1.json" );
		expect( typeof ejs2MyProps.stuff ).toBe( "string" );

		// check that handlebarswgt example1 and handlebarswgt example1 props exist
		var markup = fse.readFileSync( "dist/test4/handlebarswgt-example1.html" ).toString();
		expect( markup.indexOf( ejs2MyProps.stuff ) ).not.toEqual( -1 );
	});

});