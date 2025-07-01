 (function () { 
 'use strict';
angular.module( 'sphaApp' )
 .directive( 'ngTableOperations', function() {
	 return {
		 restrict: 'E',
		 templateUrl: 'modules/spha/js/directives/tableOperations/tableOperations.html',
		 controllerAs: 'vm',
		 scope : {
			 actions : '=actions',
			 sort : '=sort',
		 },
		 link: function( scope, el, attrs ) {
			scope.icons = {
				NEW : 'fa fa-plus',
				EDIT : 'glyphicon glyphicon-pencil',
				VIEW : 'fa fa-eye',
				DELETE : 'fa fa-trash',
				IMPORT : 'fa fa-upload',
				EXPORT : 'fa fa-download',
				DEFAULT : 'glyphicon glyphicon-asterisk',
				PROCEDURE_EDIT: 'glyphicon glyphicon-pencil',
				PROCEDURE_DELETE : 'fa fa-trash',
				PROCEDURE_VIEW: 'fa fa-eye',
				PROCEDURE_FILE_VIEW: 'fa fa-file', 
				PROCEDURE_FILE_EDIT: 'fa fa-edit',
				PROCEDURE_DETAIL: 'fa fa-eye',
				PROCEDURE_REPORT: 'fa fa-file',
				PROCEDURE_START_PHASE_2:'fa fa-sign-in',
			};

			var order = function(action) {
				if( scope.sort ){
					return action[scope.sort];
				}
				switch( action.action ){
					case 'VIEW':
						return 0;
					case 'EDIT':
						return 1;					
					case 'NEW':
						return 2;
					case 'DELETE':
						return 3;
					case 'IMPORT':
						return 4;
					case 'EXPORT':
						return 5;
					case 'PROCEDURE_VIEW':
						return 6;
					case 'PROCEDURE_EDIT':
						return 7;
					case 'PROCEDURE_FILE_VIEW':
						return 8;
					case 'PROCEDURE_FILE_EDIT':
						return 9;
					case 'PROCEDURE_DELETE':
						return 10;
					case 'PROCEDURE_DETAIL':
						return 11;
					case 'PROCEDURE_REPORT':
						return 12;
					default:
						return 100;
				}
			};

			scope.clickCallback = function( actionObj ){
				actionObj.callback(actionObj.action, actionObj);
			};
			
			scope.actions = scope.actions ? scope.actions.sort(function(a, b){
				var o1 = order(a);
				var o2 = order(b);
				return ( o1 === o2 ) ? 0 : ( ( o1 > o2 ) ? 1 : -1 );
			}) : null;
		 }
	 };
  });
})();
