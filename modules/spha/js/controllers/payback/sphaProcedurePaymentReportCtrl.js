
/**
 * @ngdoc function
 * @name sphaProcedurePaymentReportCtrl
 * @description controller for report procedimenti
 * # sphaProcedurePaymentReportCtrl Controller of the sphaApp
 */
(function () { 
 'use strict';
	angular.module('sphaApp')
	.controller('sphaProcedurePaymentReportCtrl',
		['PropertiesServiceSpha', '$rootScope', '$state', '$window', '$scope', '$cookies', '$q', 
			'httpServices', 'NgTableParams','shareDataServices', 'SweetAlert',
			'sphaCompanyServices', 'sphaPaymentServices', 'cityServicesSpha', '$translate',
		function ( PropertiesServiceSpha, $rootScope, $state, $window, $scope, $cookies, $q,
				httpServices, NgTableParams, shareDataServices, SweetAlert,
				sphaCompanyServices, sphaPaymentServices, cityServicesSpha, $translate) {
			
				// variabili
				var vm = this;
				var apiProcedimentiUrl = PropertiesServiceSpha.get("baseUrlProcedure");
				var instanceReportUrl = apiProcedimentiUrl + "api/payments/procedure-payment/report";
				var ownerTypesProcedimentiUrl =  apiProcedimentiUrl + "api/procedures/types";
				var exportXlsxUrl = apiProcedimentiUrl + "api/payments/procedure-payment/report/";
				var apiProceduresUrl = apiProcedimentiUrl + 'api/procedures/list-all';
				var searchUrl = apiProcedimentiUrl + "api/procedures/list";
				
				var initialSortingKey = null;
				var initialSortingDirection = null;
				var lastProcedureType = null;
				
				$rootScope.goBack=null;				

				// variabili this
				vm.message = "";	
				vm.companies=null;
				vm.procedureType = $state.params.type;
				vm.region = null;
				vm.paymentFrom = null;
				vm.paymentTo = null;
				vm.procedures = [];
				vm.procedure=null;
		
				
				// variabili e metodi di scope
				$scope.filtersRequest = {
                        companies: {companies: []},
                        procedures: {procedures: []},
				}
			
				$scope.columns = null;
				
				// se l'elemento del form è invalido -> bordo rosso
				$scope.addClass = function (idField, form) {
					if (!$scope.readOnly && form && form[idField] && form[idField].$invalid) {
						return 'has-errors';
					}
					return '';
				};


				/**
                 * Date Pickers
                 */
                $scope.datesOptions = {
                    'PAYMENT_FROM': {
                        opened: false,
                        datepickerOptions: {}
                    },
                    'PAYMENT_TO': {
                        opened: false,
                        datepickerOptions: {}
                    }
                };
				

				/**
				 * 
				 * @param dateField dateField
				 */
				$scope.openDatePopup = function (dateField) {
					$scope.datesOptions[dateField].opened = !$scope.datesOptions[dateField].opened;
				};
						

				$scope.filters = {
					companies: {elements: [], page: 0},
					region: [],
					procedures: {elements: [], page: 0},
				};

				
				$scope.getCompaniesPossibleValues = function (page,search) {
                	if(!page) {
            			$scope.filters.companies.elements = [];
            		}
                	$scope.filters.companies.page = page;
                	sphaCompanyServices.getPossibleValues(page,
                        ($scope.filtersRequest.companies.companies!= null &&
                            $scope.filtersRequest.companies.companies.length > 0)
                            ? $scope.filtersRequest.companies
                            : null, search,
                        function (data, error) {
                            if (error && error.message) {
                                vm.message = error.message;
                                vm.alertClass = error.alertClass
                            } else {
                                mapSearchFilterResponse([data]);
                            }
                        });
                }
				
				
				$scope.getProceduresPossibleValues = function (page,search) {
                	if(!page) {
            			$scope.filters.procedures.elements = [];
            		}
                	$scope.filters.procedures.page = page;
                	
                	var obj = {
							start : page* 10,
							length : 10,
							search : "",
							filters: {
							    type: vm.typeProcedimenti ? vm.typeProcedimenti : null,
							    phase: 2,
							},
							order: [{property : "startDate",
								direction : "DESC"}]
						};
						
                	httpServices.post( searchUrl, obj, function ( data, success, error ) {
						if( success ){ 
							
							data.items.forEach(meta => {
		                            $scope.filters.procedures.elements = $scope.filters.procedures.elements.concat(meta);
		                    });
							if (data.page) {
                            	$scope.filters.procedures.page = data.page;
                            }
                            if (data.total) {
                                $scope.filters.procedures.total = data.total;
                            }
                            
						}else{
							vm.message = error;
							vm.alertClass = "alert alert-danger";
						}
					});
                	
                	
                }
				

								
				$scope.resetOrderBy=function(){
					$cookies.remove( 'sortingKeyPaymentReport' );
					$cookies.remove( 'sortingValuePaymentReport' );
					
					vm.procedureReportTable.sorting({id:'desc'});
					vm.procedureReportTable.reload();
				};

				
				/**
				 * Funzione per il submit della ricerca tramite input 
				 */
				vm.submitSearch = function(){
					updateCookie('paymentReportCompanies', vm.companies ? JSON.stringify(vm.companies) : null);
					updateCookie('paymentReportProcedure', vm.procedure ? JSON.stringify(vm.procedure) : null );
					if( vm.typeProcedimenti ){
						$cookies.put( 'procedimentiTypes', vm.typeProcedimenti );
					}

					vm.procedureReportTable.page( 1 );
					vm.procedureReportTable.reload();
				};

				vm.onTypeChange = function(){
					if( vm.typeProcedimenti && lastProcedureType != vm.typeProcedimenti ){
						lastProcedureType = vm.typeProcedimenti;
					}
				}
				
		        /** varibili e metodi utili per switchare il tipo di export (pdf/excel) per dar il via all'export vero e proprio */
		        vm.switchExportType = function (form, type) {
		            SweetAlert.swal({
		                    title: $translate.instant('CONFIRM_EXPORT_TYPE_SELECTED') + $translate.instant($scope.exportTypes[type].label) + '?',
		                    text: null,
		                    type: 'warning',
		                    showCancelButton: true,
		                    confirmButtonColor: '#337ab7',
		                    confirmButtonText: $translate.instant('YES'),
		                    cancelButtonText: $translate.instant('NO'),
		                    closeOnConfirm: true,
		                    closeOnCancel: true,
		                }, function (isConfirm) {
		                    if (isConfirm) {
		                        vm.exportReport(form, type);
		                    }
		                }
		            );
		        };

				/**
				* Set shared data between controllers
				*/
				vm.setObject = function ( object , id ){
					shareDataServices.set( object, id + 'Procedimenti' );
				};

				vm.goToTop = function() {
					document.documentElement.scrollTop = 0;
				}


				vm.exportReport = function(form) {
					var obj = {
						unpaged: true,
				 		filters: {
				 			procedureType: { equals: vm.procedureType },
				 			paymentFeeStatus: {equals: 'STAMPED'},
							procedureId: vm.procedure ?  {equals: vm.procedure} : null
				 		},
				 	};
					if(vm.region && vm.region.length > 0) {
						obj.filters.regionCode = {in: getRegionCodes(vm.region)};
					}

					if(vm.companies && vm.companies.length > 0 ) {
						obj.filters.codiceSis = {in: vm.companies};
					}
					
					var reportType =  "PAYMENT_" + vm.procedureType;
					var userFileType = "/PAYMENT_" + vm.procedureType + "_REPORT";
					
					var parametersUrl = reportType + userFileType;
					
					vm.filtersForm = form;
		             
		            exportData(obj, parametersUrl).then(function (result) {
		                SweetAlert.swal({
		                    title: $translate.instant('EXPORT_DATA'),
		                    text: null,
		                    type: 'success',
		                    confirmButtonColor: '#337ab7',
		                    confirmButtonText: $translate.instant('OK'),
		                    closeOnConfirm: true,
		                });
		                return result.data;
		            });
				}
			    
				

				
				
		        /**
		         * Funzione per esportare i dati
		         */
		        function exportData(obj, parametersUrl) {
		            var deferred = $q.defer();
		           

		            if (!vm.filtersForm || vm.filtersForm.$invalid) {
		                deferred.resolve({
		                    data: null,
		                    total: 0,
		                });
		            } else {
		                httpServices.post(exportXlsxUrl + parametersUrl, obj, function (data, success, error) {
		                    if (success) {
		                        deferred.resolve({
		                            data: data.items,
		                            total: data.total,
		                        });
		                    } else {
		                        vm.message = error;
		                        vm.alertClass = 'alert alert-danger';
		                    }
		                });
		            }
		            return deferred.promise;
		        }
		        
				/**
				 * Reset search
				 */
				vm.reset = function(){
					vm.companies=null;
					vm.region = null;
					vm.paymentFrom = null;
					vm.paymentTo = null;
					updateCookie('paymentReportCompanies', vm.companies ? JSON.stringify(vm.companies) : null);
					updateCookie('paymentReportProcedure', vm.procedure ? JSON.stringify(vm.procedure) : null);
					updateCookie('paymentReportRegion', vm.region ? JSON.stringify(vm.region) : null);
					vm.procedureReportTable.reload();
				};
				

				function getAllowedColumns() {
					sphaPaymentServices.getAllowedColumnsPayment(vm.procedureType, function (data, error) {
							if (error && error.message) {
								vm.message = error.message;
								vm.alertClass = error.alertClass;
							} else {
								if (data && Array.isArray(data) && data.length > 0) {
									$scope.columns = data;
								}
							}
						});
				}      
				/**
				 * Inizializzazione NGTable
				 */
				function initTable() {
					vm.procedureReportTable = new NgTableParams({
							page : 1,
							count : 10,
							sorting : {
								[initialSortingKey] : initialSortingDirection.toLowerCase(),
							}
						}, {
							enableRowSelection:true,
							//number of element option to visualize for page
							counts : [5, 10, 25, 50],
							//get data : server side processing
							getData : function (params) {
								//for filtering data
								var filter = params.filter();
								//count of element
								var count = params.count();
								//page
								var page = params.page();
								//sorting
								var sorting = params.sorting();
								var sortingKey = Object.keys( sorting )[0];
								var sortingValue = sortingKey ? sorting[sortingKey] : null;
								var order = [{
										"property" : sortingKey ? sortingKey : '',
										"direction" : sortingValue ? sortingValue.toUpperCase() : null,
									}
								];
								//enable loading spinner
								//object for api rest
								var obj = {
									start : ( page - 1 ) * count,
									length : count,
									search : "",
									filters: {
										procedureType: { equals: vm.procedureType },
										paymentFeeStatus: {equals: 'STAMPED'},
										procedureId: vm.procedure ?  {equals: vm.procedure} : null,
										regionCode : vm.region && vm.region.length > 0 ? {in: getRegionCodes(vm.region)} : null,
										codiceSis:  vm.companies && vm.companies.length > 0 ? {in: vm.companies} : null,
										paymentFrom: vm.paymentFrom ? {greaterThanOrEqual: vm.paymentFrom} : null,
										procedurePhase: {equals: 2 },
										paymentTo: vm.paymentTo ? {lessThanOrEqual: vm.paymentTo} : null,
									},
								};

								
								
								if ( sortingKey ) {
									obj.order = order;
									$cookies.put( 'sortingKeyPaymentReport', order[0].property );
									$cookies.put( 'sortingValuePaymentReport', order[0].direction );
								}
															
								return getData( obj ).then( function ( result ) {
									
									params.total( result.data.total );
									return result.data.items;
								});
							}
										
						});
				
				}

		
				function initCookie() {
					//Recupero i filtri salvati nei cookies				
					if(vm.companies != null){
						$scope.filtersRequest.companies.companies = (vm.companies);
					}
					
					if(vm.procedure != null){
						$scope.filtersRequest.procedures.procedures = Array.isArray(vm.procedure) ? vm.procedure : [vm.procedure];
					}
					
					if($cookies.get('paymentReportCompanies') ){
						vm.companies = JSON.parse($cookies.get('paymentReportCompanies'));
					}
					
					if($cookies.get('paymentReportProcedure') ){
	                    vm.procedure = JSON.parse($cookies.get('paymentReportProcedure'));
	                }

					
					//Contiene i vari tipi di procedimenti disponibili in base all'utente autenticato
					vm.typeProcedimenti = $cookies.get( 'ownerTypeProcedimenti' ) ? $cookies.get( 'ownerTypeProcedimenti' ) : null;
					
					initialSortingKey = 'desc';
					initialSortingDirection = 'desc';
					
				}
				

				/**
				 * Init of Procedimento Type values
				 */

				function initProcedureTypeValue() {
					httpServices.get( ownerTypesProcedimentiUrl, function( data, success, error ){
						if( success ){
							if( error ){
								vm.message = error;
								vm.alertClass = "alert alert-warning";
							}
							if( data && data.length==1 ){
								vm.typeProcedimenti = data[0];
							}
							$scope.ownerTypesProcedimenti = data;
							var index = $scope.ownerTypesProcedimenti.indexOf("BUDGET");
							if (index != -1) {
								$scope.ownerTypesProcedimenti.splice(index, 1);  
							}
						}
						else{
							vm.message = error;
							vm.alertClass = "alert alert-danger";
						}
					});
				}
				
				function initProcedureReport() {

					cityServicesSpha.getRegions(function (response) {
						if (response) {
							$scope.filters['region'] = response;
						}
					});
					initCookie();
					initProcedureTypeValue();
					initTable();
					getAllowedColumns();
					getAllProcedures();

				}
				
                vm.goBack = function( ){
					if( $rootScope.goBack ){
						$state.go( $rootScope.goBack );
					}else{
						$window.history.back();
					}
				}; 

                function mapSearchFilterResponse(data) {
                    data.forEach(meta => {
                        if (meta.name && $scope.filters[meta.name]) {
                            $scope.filters[meta.name].elements = $scope.filters[meta.name].elements.concat(meta.options);
                            if (meta.page) {
                                $scope.filters[meta.name].page = meta.page;
                            }
                            if (meta.total) {
                                $scope.filters[meta.name].total = meta.total;
                            }
                        }
                    });
                }
                
				/**
				 * Funzione per recuperare i dati per popolare la NGTable 
				 */
				function getData(obj) {
					var deferred = $q.defer();

					httpServices.post( instanceReportUrl + "/" + vm.procedureType, obj, function ( data, success, error ) {
						if( success ){ 
							deferred.resolve({
								data: data ? data : null,
							});
						}else{
							vm.message = error;
							vm.alertClass = "alert alert-danger";
						}
					});
					return deferred.promise;
				}

				function getRegionCodes(regions) {
					var regionCodes = [];
					regions.forEach(region => {
						regionCodes.push(region.object);
					});
					return regionCodes;
				}
				
				function updateCookie(cookieName, cookieValue) {
                    if (cookieValue) {
                        $cookies.put(cookieName, cookieValue);
                    } else {
                        $cookies.remove(cookieName);
                    }
                }

			
				function getAllProcedures() {
					
					var params= {type:  {equals: vm.procedureType}};
					
					httpServices.post( apiProceduresUrl , params, function ( data, success, error ) {
		        		
							if (error && error.message) {
			                    vm.message = error.message;
			                    vm.alertClass = error.alertClass;
			                } else {
			                	
			                	if(data && data != [] ) {
			                		vm.procedures = data;
			                	}
			                }
							
						});
					
				}
					
				initProcedureReport();

				
			}
		]);
})();