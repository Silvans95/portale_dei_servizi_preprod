(function () { 
	'use strict';
   angular.module( 'sphaApp' )
	.directive( 'therapeutic', function() {
		return {
			restrict: 'E',
			templateUrl: 'modules/spha/js/directives/therapeuticIndicationsList/therapeuticIndicationsList.html',
			controllerAs: 'vm',
			scope : {
				data: '=data',
			 	disabled: '=disabled',
			 	index : '=index',
			 	form:'=form'
			}
		};
	 });
   })();
   