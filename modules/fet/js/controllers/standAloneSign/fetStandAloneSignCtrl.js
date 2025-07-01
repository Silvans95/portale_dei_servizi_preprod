(function() {
	'use strict';

	angular.module('fetApp')
		.controller( 'fetStandAloneSignCtrl', FET.StandAloneSignCtrl )
		.$inject = ['$scope', '$http', '$timeout', 'PropertiesService' ];

})();
