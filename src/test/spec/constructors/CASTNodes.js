'use strict';

describe ( 'Item constructors', function ( ) {


//todo propper vcode parsing 

var root
var folder
var file;

	beforeEach(function() {

		root = new RootNode();
		folder = new FolderNode('afolder',root);
		file = new FileNode('afile.js',folder,{},"var x = 1 + 1;");
		root.children['afolder'] = folder;
		folder.children['afile.js'] = file;
	});


	it(' should get the subnodes by their path ', function() {  

		expect( root.getNode('/afolder')).toEqual(folder);
		expect( root.getNode('/afolder/afile.js') ).toEqual(file);


	});





});