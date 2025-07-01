 (function () { 
 'use strict';
angular.module( 'sphaApp' )
 .directive( 'ngRectificationOperations', function() {
	 return {
		 restrict: 'E',
		 templateUrl: 'modules/spha/js/directives/rectification/sphaRectification.html',
		 controllerAs: 'vm',
		 scope : {
			 operations : '=operations',
			 sort : '=sort',
		 },
		 link: function( scope, el, attrs ) {
			scope.icons = {
				VIEW : "fa fa-file",
				CHECKED_IN : "fa fa-lock",
				CHECKED_OUT : "fa fa-unlock-alt",
				CHECK : "fa fa-check",
				DRAFT : "fa fa-share-square",
				DELETE : "fa fa-trash",
				SUBMITTED: "fa fa-share-square",
			};

			var order = function(operation) {
				if( scope.sort ){
					return operation[scope.sort];
				}
				switch( operation ){
					case 'VIEW':
						return 0;
					case 'CHECKED_IN':
						return 1;					
					case 'CHECKED_OUT':
						return 2;
					case 'CHECK':
						return 3;
					case 'DRAFT':
						return 4;
					case 'DELETE':
						return 5;
					case 'SUBMITTED':
						return 6;
					default:
						return 100;
				}
			}

			scope.clickCallback = function( actionObj ){
				actionObj.callback(actionObj.action, actionObj.object);
			}
			
			scope.operations = scope.operations.sort(function(a, b){
				var o1 = order(a);
				var o2 = order(b);
				return ( o1 == o2 ) ? 0 : ( ( o1 > o2 ) ? 1 : -1 );
			});
		 }
	 }	  
  });
})();
