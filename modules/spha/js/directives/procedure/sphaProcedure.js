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
        .directive( 'sphaProcedure',
                ['$translate','$timeout', 'blockUI', 'PropertiesServiceSpha', '$state', 'sphaProcedureServices',
		function ( $translate, $timeout, blockUI, PropertiesServiceSpha, $state, sphaProcedureServices ){
            return {
                restrict: 'E',
                templateUrl: 'modules/spha/js/directives/procedure/sphaProcedure.html',
                scope: {
                    data: "=data",
                    form: "=form",
                    startNewPhase: "=startNewPhase",
                    readOnly: "=readOnly",
                },
                link: function( scope, el, attrs ){
                    if( blockUI.isBlocking() == false ){
                        blockUI.start();
                    }

                    function init(){
                        var apiProcedimentiUrl = PropertiesServiceSpha.get("baseUrlProcedure");

                        scope.phase_label = [{value: 1, label: 'FASE_PROCEDIMENTO_1'}, {value: 2, label: 'FASE_PROCEDIMENTO_2'}];
                        // init Procedure fields domains
                        scope.domain = {
                            phases: [],
                            fees: {
                                min: 1,
                                max: 5,
                                step: 1
                            }
                        };
                        /**
                         * Date Pickers
                         */
                        scope.datesOptions = {
                            'DATA_APERTURA' : {
                                opened: false
                            },
                            'DATA_CHIUSURA' : {
                                opened: false
                            },
                            'DATA_INIZIO_PERIODO' : {
                                opened: false
                            },
                            'DATA_FINE_PERIODO' : {
                                opened: false
                            }
                        };

                        scope.periodTypes = [
                            {label: 'Annuale', value: '' },
                            {label: 'I semestre', value: 'I semestre' },
                            {label: 'II semestre', value: 'II semestre' }
                        ];

                        scope.feeExpireDatesCopy = [];
                        if(scope.data && scope.data.feeExpireDates) {
                    		scope.feeExpireDatesCopy = scope.data.feeExpireDates.slice();
                        } else {
                        	if(scope.data) {
                        	scope.data.feeExpireDates = [];
                        	}
                        }
                        
                        scope.updateDescription = function() {
                            if (scope.readOnly || scope.startDateLessThanToday) return;
                            scope.data.description = $translate.instant(scope.data.type) + (scope.data.period ? ' ' + scope.data.period : '') + (scope.data.year ? ' ' + scope.data.year : '')
                        }
                        
                        function getFeeExpireDates() {                        	
                        	if(scope.data && scope.data.feeExpireDates) {
                        		
                        		scope.data.feeExpireDates.forEach(feeExpireDate => {
                            		var obj = { label: 'DATE_FEE_' + (feeExpireDate.feeNumber) };
                            		scope.datesOptions[obj.label] =  {
                                    	opened: false
                                    };                            		
                            		feeExpireDate.label = 'DATE_FEE_' + (feeExpireDate.feeNumber);
                            	});
                        		
                            }
                        }
                        
                        getFeeExpireDates();
                        
                        scope.isCleaned = false;
                        scope.startDateLessThanToday = scope.readOnly;
                       	scope.startDateEditableIfprocedureDraft = scope.readOnly;
                        // Init Procedure Types
                        sphaProcedureServices.getProcedureTypesPromise()
                            .then( function( response ){ // success
                                scope.allProcedureTypes = response;
                            }, function( response ){ // error
                                scope.message = response;
                                scope.alertClass = "alert alert-danger";
                                scope.allProcedureTypes = scope.data.type ? [scope.data.type] : [];
                            });

                        // handle change of ProcedureType
                        scope.$watch( function() {
                            if( scope.data && scope.data.type ){
                                return scope.data.type;
                            }
                        }, function( newType ){
                            if( newType ){
                                sphaProcedureServices.getMetadataByType(newType, function( domain, errors ){
                                    if( domain ){
                                        scope.domain = domain;
                                    }
                                });
                            }
                        });
                        


                        scope.openDatePopup = function(dateField) {
                            scope.datesOptions[dateField].opened = !scope.datesOptions[dateField].opened;
                        };

                        // watch on start date
                        scope.$watch( function() {
                            
                            if( scope.data && scope.data.startDate ){                            	
                            	//se la data di apertura è precedente a quella odierna, è possibile modificare 
                                // esclusivamente il campo “Data chiusura
                                var today = new Date().setHours( 0,0,0,0 );
                                var startDateFormatted = new Date(scope.data.startDate).setHours( 0,0,0,0 );
            					if(startDateFormatted <= today && !scope.data.isNewProcedure) {
            						scope.startDateLessThanToday = true;
            					}
								/* 
	  							*	@author Mediacom s.r.l. - <br>
	          					*	<p><b>MAC1</b> - MAC: sia per la Fase 1 che per la Fase 2 il sistema deve consentire di poter modificare in qualsiasi momento la "Data apertura" ovvero di inizio del procedimento, ma solo se il procedimento e' in bozza;</p><br>
 								*/
            					if( scope.data.status === 'DRAFT' ){  
									scope.startDateEditableIfprocedureDraft = true;
								}
                                return scope.data.startDate;
                            }
                        }, function( startDate ){
                            validateStartEndDate();
                        });

                        // watch on end date
                        scope.$watch( function() {
                            
                            if( scope.data && scope.data.endDate ){
                                return scope.data.endDate;
                            }
                        }, function( startDate ){
                            validateStartEndDate();
                        });

                        // watch on start Period date
                        scope.$watch( function() {
                          
                            if( scope.data && scope.data.startPeriodDate ){
                               
                                return scope.data.startPeriodDate;
                            }
                        }, function( startPeriodDate ){
                           
                            validateStartEndPeriodDate();
                        });

                        // watch on end Period date
                        scope.$watch( function() {
                            
                            if( scope.data && scope.data.endPeriodDate ){
                               
                                return scope.data.endPeriodDate;
                            }
                        }, function( endPeriodDate ){
                           
                            validateStartEndPeriodDate();
                        });
                        
                        scope.addNewFeeDate = function() {
                        	if(scope.data.feeExpireDates.length < scope.data.feeNumber ) {
                        		var obj = { label: 'DATE_FEE_' + (scope.data.feeExpireDates.length), feeNumber: scope.data.feeExpireDates.length + 1};
                        		scope.datesOptions[obj.label] =  {
                                	opened: false
                                };
                        		scope.data.feeExpireDates.push(obj);
                        	}
                        }
                        
						scope.cleanInputDate = function () {
							if(scope.data.feeExpireDates) {
	                    		scope.data.feeExpireDates = scope.feeExpireDatesCopy.slice();
	                        }    	
						}

                        /**
                         * Controllo sulla Data Apertura e Data Chiusura
                         */
                        function validateStartEndDate() {
                            if( scope.data && scope.data.startDate && scope.data.endDate ){
                                var valid = scope.data.startDate <= scope.data.endDate
                                scope.form.DATA_APERTURA.$setValidity("daterange",valid);
                                scope.form.DATA_CHIUSURA.$setValidity("daterange",valid);
                            }
                            
                            clearAllEditableField();
                        }
                        
                        function clearAllEditableField () {
                        	 if(scope.startNewPhase && !scope.isCleaned){
                        		scope.isCleaned = true;
                                if (scope.data.description) {
                                    scope.data.description = scope.data.description.split('(1 - Verifica dei dati)')[0];
                                    scope.data.description = scope.data.description.split('(1 - Verification of data)')[0];
                                    scope.data.description = scope.data.description.trim();
                                }
     	                    	scope.data.startDate = null;
     	                    	scope.data.endDate = null;
     	                    	scope.data.feeNumber = null;
     	                    	// scope.data.pec = null;
     	                    	// scope.data.email = null;
     	                    }
                        }

                        /**
                         * Controllo sulla Data Inizio Periodo e Data Fine Periodo
                         */
                        function validateStartEndPeriodDate() {
                            if ( scope.data && scope.data.startPeriodDate && scope.data.endPeriodDate ){
                                var valid = scope.data.startPeriodDate <= scope.data.endPeriodDate
                                scope.form.DATA_INIZIO_PERIODO.$setValidity("daterange",valid);
                                scope.form.DATA_FINE_PERIODO.$setValidity("daterange",valid);
                            }
                        }

                        // se l'elemento del form è invalido -> bordo rosso
                        scope.addClass = function ( idField ){
                            if( !scope.readOnly && scope.form[idField] && scope.form[idField].$invalid ){
                                return 'has-errors'; 
                            }
                            return ''; 
                        }

                        /**
                         * Navigazione vs lista files
                         */
                        scope.gotoAllegati = function(){
                            if (scope.data.id) {
                                scope.readOnly ? 
                                    $state.go('spha.procedureFilesList', {"id": scope.data.id}) :
                                    $state.go('spha.procedureFilesEdit', {"id": scope.data.id});
                            }
                        }
                        
                        
                        if(scope.data && scope.data.phase == 2 ) { // fare anche controllo su status
                        	scope.isAvailablePaymentFeeDate = true;
                        }
                        
                        
                    }

                    $timeout(function(){
                        init(); 
                        blockUI.stop();
                    },0);
                }
            };		 
        }]);
})();