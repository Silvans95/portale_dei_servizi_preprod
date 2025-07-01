(function() {
	'use strict';

	angular.module('fetApp')
		.controller( 'fetSessionSignCtrl', FET.SessionSignCtrl )
		.$inject = ['$scope', '$stateParams', '$http', '$timeout', 'PropertiesService' ];

})();
