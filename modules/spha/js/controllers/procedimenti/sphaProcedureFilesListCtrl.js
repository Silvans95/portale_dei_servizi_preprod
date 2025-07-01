'use strict';
/**
 * @ngdoc function
 * @name sphaProcedureFilesListCtrl
 * @description controller for handling procedure files
 * # sphaProcedureFilesListCtrl
 * Controller of the sbAdminApp
 */
(function () {
    angular.module('sphaApp')
        .controller('sphaProcedureFilesListCtrl', ['$location', '$anchorScroll', '$window', '$rootScope', 'httpServices', 'PropertiesServiceSpha', '$scope', '$state', '$stateParams', '$cookies', '$http', 'sphaProcedureServices',
            function ($location, $anchorScroll,  $window, $rootScope, httpServices, PropertiesServiceSpha, $scope, $state, $stateParams, $cookies, $http, sphaProcedureServices) {

                var vm = this;
                vm.message = "";
                vm.alertClass = "";

                vm.data = null;
                vm.idProcedure = $stateParams.id;
                vm.showImportButton = $stateParams.showImportButton;

                var apiProcedimentiUrl = PropertiesServiceSpha.get("baseUrlProcedure");
                var checkProcedureTypeUrl = apiProcedimentiUrl + "api/procedures/check";
                var getProcedureUrl = apiProcedimentiUrl + "api/procedures/";

                $rootScope.goBack=null;	

				vm.goToTop = function() {
					document.documentElement.scrollTop = 0;
				}
				
                vm.goBack = function( ){
					if( $rootScope.goBack ){
						$state.go( $rootScope.goBack );
					}else{
						$window.history.back();
					}
				}; 

            }]);

})();
