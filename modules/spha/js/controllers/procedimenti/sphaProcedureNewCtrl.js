'use strict';
/**
 * @ngdoc function
 * @name sphaProcedureNewCtrl
 * @description controller for create new Procedure
 * # sphaProcedureNewCtrl
 * Controller of the sbAdminApp
 */
(function () {
    angular.module('sphaApp')
        .controller('sphaProcedureNewCtrl', ['$location', '$anchorScroll', '$window','$rootScope', 'httpServices', 'PropertiesServiceSpha', '$scope', '$state', 'sphaProcedureServices', 'shareDataServices', '$translate',
            function ($location, $anchorScroll, $window, $rootScope, httpServices, PropertiesServiceSpha, $scope, $state, sphaProcedureServices, shareDataServices, $translate) {

                var vm = this;
                vm.message = "";
                vm.alertClass = "";

                vm.phases = { 1: 'FASE_PROCEDIMENTO_1', 2: 'FASE_PROCEDIMENTO_2'};

                vm.data = {};
                vm.readOnly = false;
                var procedimentiBaseUrl = PropertiesServiceSpha.get("baseUrlProcedure");
                var checkProcedureType = procedimentiBaseUrl + "api/procedures/check";
                var type = shareDataServices.get( 'Type-Procedimenti' );
                vm.data.type = type!=null ? type : null;
                vm.data.phase = 1;
                vm.data.isNewProcedure = true;

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
                /**
                 * Funzione per il submit della creazione tramite input
                 */
                vm.submitCreate = function (form) {
                    if (form.$valid) {
                        var body = Object.assign({}, vm.data);
                        body.description = vm.data.description + " (" + $translate.instant(vm.phases[vm.data.phase]) + ")";
                        sphaProcedureServices.writeProcedure(body, function (data, success, errors) {
                            if (success) {
                                $state.go('spha.searchProcedimenti');
                            } else {
                                if (errors.message) {
                                    vm.message = errors.message;
                                    vm.alertClass = errors.alertClass;
                                } else {
                                    vm.message = errors;
                                    vm.alertClass = "alert alert-danger";
                                }
                            }
                        });
                    }
                };

                /**
                 * Funzione per il reset degli input
                 */
                vm.reset = function(form){
                    // vm.data.type = null; // TODO ILI CHECK
                    vm.data.description = null;
                    vm.data.startDate = null;
                    vm.data.endDate = null;
                    vm.data.startPeriodDate = null;
                    vm.data.endPeriodDate = null;
                    vm.data.feeNumber = null;
                    vm.data.phase = null;
                    vm.data.year = null;
                    vm.data.email = null;
                    vm.data.pec = null;
                    form.$setPristine();
                };
            }]);

})();
