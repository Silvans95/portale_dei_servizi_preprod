(function () { 
 'use strict';
	angular.module('sphaApp')
	.controller('sphaDebugCtrl',
		['$rootScope','$scope','$state','$stateParams','sphaVersionService', 'PropertiesServiceSpha',
			function ( $rootScope, $scope, $state, $stateParams, sphaVersionService, PropertiesServiceSpha ) {

				$scope.enable = false;
				if( $rootScope.debugMode ){
					$scope.enable = $rootScope.debugMode; 	
				}
				
				$rootScope.version = sphaVersionService.getVersion();
				
				sphaVersionService.getAbilitationMicroserviceVersion().then( 
					function( response ){ // success
						$rootScope.abilitationMicroserviceVersion = response;
					}, 
					function( response ){ // error
						$scope.message = response;
						$scope.alertClass = "alert alert-danger";
						$rootScope.abilitationMicroserviceVersion = 'Error: ' + response;
					});
				
				sphaVersionService.getProcedureMicroserviceVersion().then( 
					function( response ){ // success
						$rootScope.procedureMicroserviceVersion = response;
					}, 
					function( response ){ // error
						$scope.message = response;
						$scope.alertClass = "alert alert-danger";
						$rootScope.procedureMicroserviceVersion = 'Error: ' + response;
					});
				
				sphaVersionService.getAnagraphicMicroserviceVersion().then( 
					function( response ){ // success
						$rootScope.anagraphicMicroserviceVersion = response;
					}, 
					function( response ){ // error
						$scope.message = response;
						$scope.alertClass = "alert alert-danger";
						$rootScope.anagraphicMicroserviceVersion = 'Error: ' + response;
					});
			}
		]);
})();
