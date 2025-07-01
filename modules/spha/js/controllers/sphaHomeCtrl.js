(function() {
	'use strict';

	angular.module('sphaApp').controller('sphaHomeCtrl',
		['$scope','$state','sphaVersionService',
			function ( $scope, $state, sphaVersionService) {
		$scope.version = sphaVersionService.getVersion().split("-RC")[0];
	}
	]);

})();
