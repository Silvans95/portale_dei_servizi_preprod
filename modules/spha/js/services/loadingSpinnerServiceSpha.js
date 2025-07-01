
(function () { 
 'use strict';
	angular.module( 'loadingSpinnerServiceSpha', [] )
	
		.factory( 'loadingSpinnerService', function (){
			var service = {};
			
			service.loadingSpinner = function (){
				    return '<div class="text-center" id="loading-bar-spinner"><img src="modules/spha/images/loading.gif"></div>';
			};
			
			return service;
		});
	
	
})();