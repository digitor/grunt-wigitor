'use strict';

var _ = require("lodash-node")
	,fse = require("fs-extra")


describe("test 2 - check generated files and folders", function() {

	it("should generate html and image files", function() {
		expect( fse.existsSync( "dist/test2/ejswgt-example1.html" ) ).toBe( true );
		expect( fse.existsSync( "dist/test2/ejswgt-example2.html" ) ).toBe( true );
		expect( fse.existsSync( "dist/test2/img/octocat.png" ) ).toBe( true );
	});

	it("should generate ensure html files have no EJS syntax", function() {
		
		var markup = fse.readFileSync( "dist/test2/ejswgt-example1.html" ).toString();
		expect( markup.indexOf("<%") ).toEqual( -1 );

		markup = fse.readFileSync( "dist/test2/ejswgt-example2.html" ).toString();
		expect( markup.indexOf("<%") ).toEqual( -1 );
	});

	it("should check that json properties exists in html files", function() {

		// get example1.json props and verify property in question is a string
		var hbsEx1 = fse.readJsonSync( "resources/widgets/handlebarswgt/properties/example1.json" );
		expect( typeof hbsEx1.stuff ).toBe( "string" );

		var ejsEx1 = fse.readJsonSync( "resources/widgets/ejswgt/properties/example1.json" );
		expect( typeof ejsEx1.stuff ).toBe( "string" );

		var ejsEx2 = fse.readJsonSync( "resources/widgets/ejswgt/properties/example2.json" );
		expect( typeof ejsEx2.stuff ).toBe( "string" );

		// check that ejswgt example1 and handlebarswgt example1 props exist
		var markup = fse.readFileSync( "dist/test2/ejswgt-example1.html" ).toString();
		expect( markup.indexOf( ejsEx1.stuff ) ).not.toEqual( -1 );
		expect( markup.indexOf( hbsEx1.stuff ) ).not.toEqual( -1 );

		// check that ejswgt example2 and handlebarswgt example1 props exist
		markup = fse.readFileSync( "dist/test2/ejswgt-example2.html" ).toString();
		expect( markup.indexOf( ejsEx2.stuff ) ).not.toEqual( -1 );
		expect( markup.indexOf( hbsEx1.stuff ) ).not.toEqual( -1 );
	});

});