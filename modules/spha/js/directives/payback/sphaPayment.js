 (function () { 
 'use strict';
angular.module( 'sphaApp' )
 .directive( 'ngPaymentOperations', function() {
	 return {
		 restrict: 'E',
		 templateUrl: 'modules/spha/js/directives/payback/sphaPayment.html',
		 controllerAs: 'vm',
		 scope : {
			 operations : '=operations',
			 sort : '=sort',
		 },
		 link: function( scope, el, attrs ) {
			scope.icons = {
				PAYMENT_PROTOCOL : "fa fa-eye",
				PAYMENT_MANAGE : "fa fa-share-square",
				PAYMENT_FEE_DELETE : 'fa fa-trash',
				PAYMENT_FEE_SHOW:   "fa fa-eye",
				PAYMENT_VIEW_REGION_DETAIL: "fa fa-search",
				PAYMENT_VIEW_DETAIL: "fa fa-eye",
				PAYMENT_VIEW_DETAIL_SHELF: "fa fa-eye",
			};

			var order = function(operation) {
				if( scope.sort ){
					return operation[scope.sort];
				}
				switch( operation ){
					case 'PAYMENT_PROTOCOL':
						return 0;
					case 'PAYMENT_MANAGE':
						return 1;
					case 'PAYMENT_FEE_SHOW':
						return 2;
					case 'PAYMENT_FEE_DELETE':
						return 3;
					case 'PAYMENT_VIEW_REGION_DETAIL':
						return 4;
					case 'PAYMENT_VIEW_DETAIL':
						return 5;
					case 'PAYMENT_VIEW_DETAIL_SHELF':
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
