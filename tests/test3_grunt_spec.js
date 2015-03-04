'use strict';

var _ = require("lodash-node")
	,fse = require("fs-extra")


describe("test 3 - check generated files and folders", function() {

	it("should generate html and image files", function() {
		expect( fse.existsSync( "dist/test3/ejs2wgt-myprops.html" ) ).toBe( true );
		expect( fse.existsSync( "dist/test3/img/octocat.png" ) ).toBe( true );
	});

	it("should generate ensure html files have no EJS syntax", function() {
		
		var markup = fse.readFileSync( "dist/test3/ejs2wgt-myprops.html" ).toString();
		expect( markup.indexOf("<%") ).toEqual( -1 );
	});

	it("should check that json properties exists in html files", function() {

		var ejs2MyProps = fse.readJsonSync( "resources/widgets/ejs2wgt/properties/myprops.json" );
		expect( typeof ejs2MyProps.stuff ).toBe( "string" );

		// check that ejs2wgt example1 and handlebarswgt example1 props exist
		var markup = fse.readFileSync( "dist/test3/ejs2wgt-myprops.html" ).toString();
		expect( markup.indexOf( ejs2MyProps.stuff ) ).not.toEqual( -1 );
	});

});