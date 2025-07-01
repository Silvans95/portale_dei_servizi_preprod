'use strict';
/**
 * @ngdoc function
 * @name sphaProcedureEditCtrl
 * @description controller for edit a procedure
 * # sphaProcedureEditCtrl
 * Controller of the sbAdminApp
 */
(function () {
    angular.module('sphaApp')
        .controller('sphaProcedureEditCtrl', ['$location', '$anchorScroll', '$window', '$rootScope', 'PropertiesServiceSpha', 
        	'$scope', '$state', '$stateParams', '$cookies', 'shareDataServices', 'sphaProcedureServices', 'sphaPaymentServices', '$translate',
            function ($location, $anchorScroll, $window, $rootScope, PropertiesServiceSpha, $scope, $state, 
            		$stateParams, $cookies, shareDataServices, sphaProcedureServices, sphaPaymentServices, $translate) {

                var vm = this;
                vm.message = '';
                vm.alertClass = '';
                vm.phases = { 1: 'FASE_PROCEDIMENTO_1', 2: 'FASE_PROCEDIMENTO_2'};

                vm.data = null;
                vm.readOnly = false;
                vm.startNewPhase = false;
                vm.isLoadingPhase2 = false;
                
                var procedimentiBaseUrl = PropertiesServiceSpha.get('baseUrlProcedure');
                var checkProcedureTypeUrl = procedimentiBaseUrl + 'api/procedures/check';
                var procedureStartNewPhase = shareDataServices.get('PROCEDURE_START_NEW_PHASE');
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
				
				
				function initProcedure() {
					
				
	                /**
	                 * Init of input fields with :id procedure Values
	                 */
	                sphaProcedureServices.readProcedure( $stateParams.id, function( data, errors ){
	                    if( errors ){
	                        vm.message = errors.message;
	                        vm.alertClass = errors.alertClass;
	                    }
	                    if( data ){
	                        vm.data = data;
	                        vm.data.startDate = sphaProcedureServices.serverToClientDate(data.startDate);
	                        vm.data.endDate = sphaProcedureServices.serverToClientDate(data.endDate);
	                        vm.data.startPeriodDate = sphaProcedureServices.serverToClientDate(data.startPeriodDate);
	                        vm.data.endPeriodDate = sphaProcedureServices.serverToClientDate(data.endPeriodDate);
	                        vm.data.feeExpireDates = null;
	                        
	                        if(vm.data.actions.indexOf('PROCEDURE_START_PHASE_2') && 
	                                procedureStartNewPhase &&
	                                procedureStartNewPhase.newPhase !== vm.data.phase &&
	                                procedureStartNewPhase.parentId === $stateParams.id) {
	                            vm.data.id = null;
	                            vm.data.phase = procedureStartNewPhase.newPhase;
	                            vm.data.parentId = procedureStartNewPhase.parentId;
	                            vm.startNewPhase = true;
	                        }
	                        // TODO ILI è necessaria questa logica?
	                        // -> inibire modifica da BE o mettere watch?
	                        // -> inibire reset
	                        var todayDate = new Date();
	                        if(vm.data.startDate < todayDate){
	                            vm.readOnly = true;
	                        }
	                        
	                        if(vm.data.id && vm.data.phase === 2) {
                                getAllPaymentFeeDateIfExists(vm.data.id);
                            }
	                        
	                    }
	                });
                
				}

                function getAllPaymentFeeDateIfExists(procedureId) {
                	vm.isLoadingPhase2 = true;
                	sphaPaymentServices.getPaybackPaymentFeeDates({procedureId: {equals: procedureId}}, function (data, error) {
                		if (error && error.message) {
                            vm.message = error.message;
                            vm.alertClass = error.alertClass;
                        } else {
                        	if(data) {
                        		vm.data.feeExpireDates = [];
                        		vm.data.feeExpireDates = data;
                            	vm.data.feeExpireDates.forEach(feeData => {
                            		feeData.feeExpireDate = sphaProcedureServices.serverToClientDate(feeData.feeExpireDate); 
                            	});
                            	
                            	
                            	// prima di fare questo devo capire come prendere gli ultimi per ogni rata

                            	vm.data.feeExpireDates = vm.data.feeExpireDates.sort(
                    			   function(a, b) {          
                    			      if (a.feeNumber === b.feeNumber) {
                    			         // id is only important when feeNumber are the same
                    			         return b.id - a.id;
                    			      }
                    			      return a.feeNumber > b.feeNumber ? 1 : -1;
                    			   });
                            	vm.data.feeExpireDates = vm.data.feeExpireDates.slice(0, vm.data.feeNumber);  
                        	}
                        	
                        }
                        vm.isLoadingPhase2 = false;
                    });
                }
               
                /**
                 * Funzione per il submit della creazione tramite input
                 */
                vm.submitForm = function(form){
                    if(form.$valid) {
                        var body = Object.assign({}, vm.data);
						if (!body.id) {
							body.description = vm.data.description + " (" + $translate.instant(vm.phases[vm.data.phase]) + ")";
						}
                        // vm.data.startDate = vm.data.startDate ? sphaProcedureServices.clientToServerDate(vm.data.startDate) : null;
                        // vm.data.endDate = vm.data.endDate ? sphaProcedureServices.clientToServerDate(vm.data.endDate) : null;
                        // vm.data.startPeriodDate = vm.data.startPeriodDate ? sphaProcedureServices.clientToServerDate(vm.data.startPeriodDate) : null;
                        // vm.data.endPeriodDate = vm.data.endPeriodDate ? sphaProcedureServices.clientToServerDate(vm.data.endPeriodDate) : null;
                        sphaProcedureServices.writeProcedure(body, function( data, success, errors ){
                            if( success ){
                            	
                            	writeFeeDate(data);                            	
                                
                            } else {
                                if (errors.message) {
                                    vm.message = errors.message;
                                    vm.alertClass = errors.alertClass;                                    
                                } else {
                                    vm.message = errors;
                                    vm.alertClass = 'alert alert-danger';
                                }
                            }
                        });
                    }
                };

                function writeFeeDate(procedure) {
                	// registrazione date!
                	var paymentFeeDates = [];
                	var allValidDate = true;
                	vm.data.feeExpireDates.forEach(date => {
                		if(date.feeExpireDate != null) {
                			var newFeeDate = {
                        			feeNumber: date.feeNumber,
                        			feeExpireDate: date.feeExpireDate,
                        			procedureId: procedure.id
                        		};
                    		if(date.id) {
                    			newFeeDate.id = date.id;
                    		}
                    		paymentFeeDates.push(newFeeDate);
                		} else {
                			allValidDate = false;
                		}
                		
                	}
                	
                		
                	);

                	if(allValidDate){
                		sphaPaymentServices.insertPaymentFeeDates({feeExpireDates: paymentFeeDates}, function (feeExpireDate, error) {
                    		if (error && error.message) {
                                vm.message = error.message;
                                vm.alertClass = error.alertClass;
                            } else {
                            	vm.data.feeExpireDates = feeExpireDate;
                            	vm.data.feeExpireDates.forEach(feeData => {
                            		feeData.feeExpireDate = sphaProcedureServices.serverToClientDate(feeData.feeExpireDate); 
                            	})
                            	
                            	$state.go('spha.searchProcedimenti');
                            }
                        });
                	} else {
                		vm.message = 'NOT_POSSIBILE_DELETE_DATE';
                        vm.alertClass = 'alert alert-danger';
                	}
                }
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
                    form.$setPristine();

                };

				function isToday(date) {
					return moment(date).isSame(moment(), 'day');
				}

				vm.canActivate = function(form) {
					return form && vm.data && form.$valid && form.$pristine && ((isToday(vm.data.startDate) && vm.data.status === 'DRAFT') || vm.data.status === 'SUSPENDED');
				}

				vm.canClose = function(form) {
					return form && vm.data && form.$valid && form.$pristine && isToday(vm.data.endDate) && vm.data.status === 'STARTED';
				}

			    vm.canSuspend = function(form) {
					return form && vm.data && form.$valid && form.$pristine  && vm.data.status === 'STARTED';
				}


				vm.onActivate = function() {
					if (vm.data.status === 'DRAFT') {
						sphaProcedureServices.activateProcedure(vm.data, function( data, success, errors ){
							if( success ){
								
								$state.go('spha.searchProcedimenti');                          	
								
							} else {
								if (errors.message) {
									vm.message = errors.message;
									vm.alertClass = errors.alertClass;                                    
								} else {
									vm.message = errors;
									vm.alertClass = 'alert alert-danger';
								}
							}
						});
					} else if(vm.data.status === 'SUSPENDED'){
						sphaProcedureServices.reactivateProcedure(vm.data, function( data, success, errors ){
							if( success ){
								
								$state.go('spha.searchProcedimenti');                          	
								
							} else {
								if (errors.message) {
									vm.message = errors.message;
									vm.alertClass = errors.alertClass;                                    
								} else {
									vm.message = errors;
									vm.alertClass = 'alert alert-danger';
								}
							}
						});
					}
					
				}

				vm.onReactivate = function() {
					sphaProcedureServices.reactivateProcedure(vm.data, function( data, success, errors ){
						if( success ){
							
							$state.go('spha.searchProcedimenti');                          	
							
						} else {
							if (errors.message) {
								vm.message = errors.message;
								vm.alertClass = errors.alertClass;                                    
							} else {
								vm.message = errors;
								vm.alertClass = 'alert alert-danger';
							}
						}
					});
					}
				
	    	vm.onSuspend = function() {
					sphaProcedureServices.suspendProcedure(vm.data, function( data, success, errors ){
						if( success ){
							
							$state.go('spha.searchProcedimenti');                          	
							
						} else {
							if (errors.message) {
								vm.message = errors.message;
								vm.alertClass = errors.alertClass;                                    
							} else {
								vm.message = errors;
								vm.alertClass = 'alert alert-danger';
							}
						}
					});
				}
				vm.onClose = function() {
					sphaProcedureServices.closeProcedure(vm.data, function( data, success, errors ){
						if( success ){
							
							$state.go('spha.searchProcedimenti');                          	
							
						} else {
							if (errors.message) {
								vm.message = errors.message;
								vm.alertClass = errors.alertClass;                                    
							} else {
								vm.message = errors;
								vm.alertClass = 'alert alert-danger';
							}
						}
					});
				}
                
                initProcedure();

            }]);

})();
