 (function () { 
 'use strict';
angular.module( 'sphaApp' )
 .directive( 'ngFlows',
 	[ '$rootScope', '$state', '$window', '$stateParams', '$cookies', 'cityServicesSpha',
 function( $rootScope, $state, $window, $stateParams, $cookies, cityServicesSpha) {
	 return {
		 restrict: 'E',
		 templateUrl: 'modules/spha/js/directives/flows/flows.html',
		 controllerAs: 'vm',
		 scope : {
			 prova : '=prova',
			 region: '=region',
			 form : '=form',
			 readOnly: "=readOnly",
		 },
		 link: function( scope, el, attrs ) {

			// Init Filters' domains
			scope.filters = {
				region: []
			};
			cityServicesSpha.getRegions( function ( response ){
				if( response ){
					scope.filters['region'] = response;
				}
			});


			// se l'elemento del form è invalido -> bordo rosso
			scope.addClass = function ( idField ){
				if( !scope.readOnly && scope.form[idField] && scope.form[idField].$invalid ){
					return 'has-errors'; 
				}
				return ''; 
			}

		 }
	 }	  
  }]);
})();
