
/**
 * @ngdoc function
 * @name sphaStatisticheProcedimentiCtrl
 * @description controller for report procedimenti
 * # sphaStatisticheProcedimentiCtrl Controller of the sphaApp
 */
(function () { 
 'use strict';
	angular.module('sphaApp')
	.controller('sphaStatisticheProcedimentiCtrl',
		['PropertiesServiceSpha', '$rootScope', '$stateParams', '$state', '$window', '$scope', '$cookies', '$q', '$translate', 
			'httpServices', 'NgTableParams','$uibModal','shareDataServices', 'sphaProcedureServices', 'SweetAlert',
			'sphaCompanyServices', 'sphaProcedureInstanceServices', '$sce',
		function ( PropertiesServiceSpha, $rootScope, $stateParams, $state, $window, $scope, $cookies, $q, $translate,
				httpServices, NgTableParams, $uibModal, shareDataServices, sphaProcedureServices, SweetAlert,
				sphaCompanyServices, sphaProcedureInstanceServices, $sce) {
			
				// variabili
				var vm = this;
				var apiProcedimentiUrl = PropertiesServiceSpha.get("baseUrlProcedure");
				var searchUrl = apiProcedimentiUrl + "api/procedures/list";
				var operationReportUrl = apiProcedimentiUrl + "api/statistiche-dati/";
				var ownerTypesProcedimentiUrl =  apiProcedimentiUrl + "api/procedures/types";
				var exportReportUrl = apiProcedimentiUrl + "api/statistiche-dati/report/";
				
				$rootScope.goBack=null;				

				// variabili this
				vm.message = "";				
				vm.procedure = null;
				vm.companies = null;
				vm.operation = null;
		
				
				// variabili di scope
								
				$scope.filtersRequest = {
                        companies: {companies: []},
                        procedures: {procedures: []}
                }
				
				/**
                 * Date Pickers
                 */
                $scope.datesOptions = {
                    'OPERATION_FROM': {
                        opened: false,
                        datepickerOptions: {}
                    },
                    'OPERATION_TO': {
                        opened: false,
                        datepickerOptions: {}
                    }
                };
				
				 $scope.filters = {
                        companies: {elements: [], page: 0},
                        procedures: {elements: [], page: 0},
                        operations: [{value: 'RETTIFICHE', label: 'RECTIFICATION_SUBMISSION'}, {value: 'PAGAMENTI', label: 'PAYMENT'},
                        	{value: 'CONSULTAZIONE', label: 'CREATION_PROC_INSTANCE'}],
                    };

				 /**
					 * 
					 * @param dateField dateField
					 */
					$scope.openDatePopup = function (dateField) {
						$scope.datesOptions[dateField].opened = !$scope.datesOptions[dateField].opened;
					};
				
				// metodi di scope
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
							start : page * 10,
							length : 10,
							search : "",
							filters: {
							    type: vm.typeProcedimenti ? vm.typeProcedimenti : null,
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
				
				//Recupero i filtri salvati nei cookies				
				if(vm.companies != null){
                    $scope.filtersRequest.companies.companies = (vm.companies);
                }
				
				if(vm.procedure != null){
					 $scope.filtersRequest.procedures.procedures = Array.isArray(vm.procedure) ? vm.procedure : [vm.procedure];
                }
				
				if($cookies.get('statisticheCompanies') ){
                    vm.companies = JSON.parse($cookies.get('statisticheCompanies'));
                }
				if($cookies.get('statisticheProcedure') ){
                    vm.procedure = JSON.parse($cookies.get('statisticheProcedure'));
                }
				if($cookies.get('statisticheFrom') ){
                    vm.operationFrom = new Date($cookies.get('statisticheFrom'));
                }
				if($cookies.get('statisticheTo') ){
                    vm.operationTo = new Date($cookies.get('statisticheTo'));
                }
				if($cookies.get('statisticheOperation') ){
                    vm.operation = $cookies.get('statisticheOperation');
                }
				
				
				//Contiene i vari tipi di procedimenti disponibili in base all'utente autenticato
				vm.typeProcedimenti = $cookies.get( 'ownerTypeProcedimenti' ) ? $cookies.get( 'ownerTypeProcedimenti' ) : null;
				
				var initialSortingKey = $cookies.get( 'sortingKeyProcedimenti' ) ? $cookies.get( 'sortingKeyProcedimenti' ) : 'company';
				var initialSortingDirection = $cookies.get( 'sortingValueProcedimenti' ) ? $cookies.get( 'sortingValueProcedimenti' ) : 'desc';
				var lastProcedureType = null;

				/**
				 * Init of Procedimento Type values
				 */
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
						
						if($scope.ownerTypesProcedimenti.length == 1 && $scope.ownerTypesProcedimenti.indexOf("PB5") != -1) {
							$scope.filters.operations.push({value: 'ACCETTAZIONE', label: 'ACCEPTATION'});
						}
					}
					else{
						vm.message = error;
						vm.alertClass = "alert alert-danger";
					}
				});
				
                vm.goBack = function( ){
					if( $rootScope.goBack ){
						$state.go( $rootScope.goBack );
					}else{
						$window.history.back();
					}
				}; 
				
				/**
				 * Funzione per il submit della ricerca tramite input 
				 */
				vm.submitSearch = function(){
					updateCookie('statisticheCompanies', vm.companies ? JSON.stringify(vm.companies) : null);
					updateCookie('statisticheProcedure', vm.procedure ? JSON.stringify(vm.procedure) : null );
					updateCookie('statisticheFrom', vm.operationFrom ? new Date(vm.operationFrom) : null );
					updateCookie('statisticheTo', vm.operationTo ? new Date(vm.operationTo) : null );
					updateCookie('statisticheOperation', vm.operation ? vm.operation : null );
					
					if( vm.typeProcedimenti ){
						$cookies.put( 'procedimentiTypes', vm.typeProcedimenti );
					}

					vm.statisticheTable.page( 1 );
					vm.statisticheTable.reload();
				};

				vm.onTypeChange = function(){
					if( vm.typeProcedimenti && lastProcedureType != vm.typeProcedimenti ){
						lastProcedureType = vm.typeProcedimenti;
					}
				}
				
				
				$scope.resetOrderBy=function(){
					$cookies.remove( 'sortingKeyProcedimenti' );
					$cookies.remove( 'sortingValueProcedimenti' );
					
					vm.statisticheTable.sorting({id:'desc'});
					vm.statisticheTable.reload();
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

				
              	/** 
                 * get Protocolled procedureInstance file 
                 * @param idProcedureInstance 
                 */
                vm.showProtocolledFile = function(idProcedureInstance) {
                	sphaProcedureInstanceServices.getProtocolledProcedureFile(idProcedureInstance, function (data, error) {
                		if(data) {
                			$scope.type = 'application/pdf';
                    	    var blob = new Blob([data], { type: $scope.type });
                    	    var fileURL = URL.createObjectURL(blob);
                    	    $scope.pdfContent = $sce.trustAsResourceUrl(fileURL);
                    	    var newWin = window.open(fileURL);
                    	    
                    	    if(!newWin || newWin.closed || typeof newWin.closed === 'undefined') 
                            {
                                //POPUP BLOCKED
                                alert('Impossibile aprire il pop up per visualizzare il documento');
                            }
                		} else {
                			vm.message = error.message;
                            vm.alertClass = error.alertClass;
                		}
                		
                    });
                }

				
                /**
                 * Funzione associata al pulsante esporta per l'export in excel.
                 * Chiama il servizio rest export
                 */
                vm.exportReport = function (form) {
                    vm.filtersForm = form;
                    var obj = {
                    		unpaged: true,
							filters: {
								procedureId: vm.procedure ? vm.procedure : null,
								procedureType: vm.typeProcedimenti,
								codiceSis:  vm.companies && vm.companies.length > 0 ? vm.companies : null,
								dal: vm.operationFrom ? vm.operationFrom : null,
								al: vm.operationTo ? vm.operationTo : null,
							},
						};

                    exportData(obj).then(function (result) {
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

                };
                
				
		        
		        /**
		         * Funzione per esportare i dati
		         */
		        function exportData(obj) {
		            var deferred = $q.defer();

		                httpServices.post(exportReportUrl + vm.typeProcedimenti + '/' + vm.operation, obj, function (data, success, error) {
		                    if (success) {
		                        deferred.resolve({
		                            data: data
		                        });
		                    } else {
		                        vm.message = error;
		                        vm.alertClass = 'alert alert-danger';
		                    }
		                });
		                return deferred.promise;
		        }
		        
				
                /**
                 * Funzione associata al pulsante esporta per l'export in excel.
                 * Chiama il servizio rest export
                 */
                vm.exportAll = function (form) {
                    vm.filtersForm = form;
                    var obj = {
                    		unpaged: true,
							filters: {
								procedureId: vm.procedure ? vm.procedure : null,
								procedureType: vm.typeProcedimenti,
								codiceSis:  vm.companies && vm.companies.length > 0 ? vm.companies : null,
								dal: vm.operationFrom ? vm.operationFrom : null,
								al: vm.operationTo ? vm.operationTo : null,
							},
						};

                    exportAllData(obj).then(function (result) {
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

                };
		        
		        
		        /**
		         * Funzione per esportare i dati
		         */
		        function exportAllData(obj) {
		            var deferred = $q.defer();

		                httpServices.post(exportReportUrl + vm.typeProcedimenti + '/ALL_STATISTICHE', obj, function (data, success, error) {
		                    if (success) {
		                        deferred.resolve({
		                            data: data
		                        });
		                    } else {
		                        vm.message = error;
		                        vm.alertClass = 'alert alert-danger';
		                    }
		                });
		                return deferred.promise;
		        }
		        
			    
				/**
				 * Reset search
				 */
				vm.reset = function(){
					vm.procedure=null;
					vm.companies=null;
					vm.operationFrom = null;
					vm.operationTo = null;
					vm.operation=null;
					updateCookie('statisticheCompanies', vm.companies ? JSON.stringify(vm.companies) : null);
					updateCookie('statisticheProcedure', vm.procedure ? JSON.stringify(vm.procedure) : null);
					updateCookie('statisticheFrom', vm.operationFrom ? new Date(vm.operationFrom) : null );
					updateCookie('statisticheTo', vm.operationTo ? new Date(vm.operationTo) : null );
					updateCookie('statisticheOperation', vm.operation ? vm.operation : null );
					
					vm.statisticheTable.reload();
				};
				

				/**
				 * Inizializzazione NGTable
				 */
				vm.statisticheTable = new NgTableParams({
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
									procedureId: vm.procedure ? vm.procedure : null,
									procedureType: vm.typeProcedimenti,
									codiceSis:  vm.companies && vm.companies.length > 0 ? vm.companies : null,
									dal: vm.operationFrom ? vm.operationFrom : null,
									al: vm.operationTo ? 
											new Date(vm.operationTo.setDate(vm.operationTo.getDate() + 1))
											 : null,
								},
							};
							if ( sortingKey ) {
								obj.order = order;
								$cookies.put( 'sortingKeyProcedimenti', order[0].property );
								$cookies.put( 'sortingValueProcedimenti', order[0].direction );
							}
							
							if (vm.operation && vm.procedure && vm.typeProcedimenti) {								
								return getData( obj ).then( function ( result ) {
								 	
							 		params.total( result.data.total );
							 		return result.data.items;
							 	});
							}
							
						}
					});
				
				

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

					httpServices.post( operationReportUrl + vm.typeProcedimenti + '/' + vm.operation, obj, function ( data, success, error ) {
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
				
				function updateCookie(cookieName, cookieValue) {
                    if (cookieValue) {
                        $cookies.put(cookieName, cookieValue);
                    } else {
                        $cookies.remove(cookieName);
                    }
                }
				

				
			}
		]);
})();