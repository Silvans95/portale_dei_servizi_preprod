(function () {
    'use strict';
    angular.module('sphaApp')
        .factory('sphaMonthServices', [ '$http', '$cookies', '$translate',
            function ($http, $cookies, $translate) {
                var service = {};

                
		/**
		 * Get months list.
		 * Returns all list of countries.
		 * (localized)
		 * 
		 * @param callback function
		 */
		service.getMonths = function ( callback ){
			var months = [];
			for (var i = 0; i< 12; i++) {
				months.push({label: $translate.instant("month."+i), value: i+1});
			}
			callback ( months );
		};
		
		return service;

	}]);
})();