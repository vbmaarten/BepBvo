'use strict';

/**
 * @ngdoc function
 * @name explorer.controller:ExplorerCtrl
 * @description
 * @requires cast.factory:CAST 
 * 
 * Provides functionality to the CAST Explorer
 */

angular.module('explorer')
  .controller('ExplorerCtrl', ['$scope', 'CAST', '$state', 'writerFactory',
    function ($scope, CAST, $state, writerFactory) {
    $scope.directory = CAST.cast;
    $scope.project = CAST.project;
    $scope.selected = CAST.selected;
    $scope.content = CAST.content;

    /**
    * @ngdoc method
    * @name getASTNodeByRange
    * @methodOf explorer.controller:ExplorerCtrl
    * @description
    * Determines the node at a given position
    *
    * @param {int} pos The position at which the closest AST Node has to be found
	* @return {ASTNode} The node that corresponds to the given position in the code
    */


    var getASTNodeByRange = function(pos){
      var node = $scope.selected;
      if(node.isFile())
      {
        node = node.getChild('Program');
      }
      var hasBetterSelection = true;
      while(!node.containsPosition(pos) && node.isASTNode()){
        node = node.parent;
      }

      while(hasBetterSelection){
        hasBetterSelection = false;
        var child, children = node.getChildren();
        for( child in children){
          if( children[child].containsPosition(pos) ){
            hasBetterSelection = true;
            node = children[child];
          }
        }
      }
      if(node.tnode instanceof Array)
        node = node.getParent()
      return node;
    }

    var getRange = function(node) {
      var range = {};
      range.start = {};
      range.end = {};
      range.start.row = node.tnode.loc.start.line - 1;
      range.start.column = node.tnode.loc.start.column;
      range.end.row = node.tnode.loc.end.line - 1;
      range.end.column = node.tnode.loc.end.column;
      return range;
    }


    $scope.aceLoaded = function(_editor){
	    // Editor part
	    var _session = _editor.getSession();
	    var _renderer = _editor.renderer;

	    _editor.$blockScrolling = Infinity;
      var Range = ace.require('ace/range').Range;

	    // Options
	    _editor.setReadOnly(true);
	    _editor.setValue($scope.content, -1);


      // Node selection
      if($scope.selected.isASTNode()){
        var range = getRange($scope.selected);
        var newrange =  new Range(range.start.row, range.start.column, range.end.row, range.end.column);
        var marker =  _session.addMarker(newrange,"selected-node","line", false);

        if(writerFactory.selectedNarrative && $state.is('narrating.writing.editing')){
          var rangeNarrative = getRange(CAST.getNode(writerFactory.selectedNarrative.CASTPath));
          var newRangeNarrative =  new Range(rangeNarrative.start.row, rangeNarrative.start.column, rangeNarrative.end.row, rangeNarrative.end.column);
          _session.addMarker(newRangeNarrative,"selected-narrative","line", false);
        }
        _editor.scrollToRow(range.start.row);
        //_editor.getSession().selection.setSelectionRange(range);
      }

	    var selectNode = function(e,selection){
        // if statement to handle bug in changeCursor event of ace editor
        if(!$scope.editorLoaded){
    		  var cursor = selection.getCursor();
    		  var pos = _session.getDocument().positionToIndex(cursor,0);
          var node = getASTNodeByRange(pos);
          $scope.editorLoaded = true;
    		  $state.go('.', {'path': node.getPath()});
        } else {
          $scope.editorLoaded = false;
        }
  		}; 

  		_session.selection.on("changeCursor", selectNode);
  	};
  }]);
