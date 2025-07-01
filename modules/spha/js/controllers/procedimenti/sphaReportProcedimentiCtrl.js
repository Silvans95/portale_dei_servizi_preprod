
/**
 * @ngdoc function
 * @name sphaReportProcedimentiCtrl
 * @description controller for report procedimenti
 * # sphaReportProcedimentiCtrl Controller of the sphaApp
 */
(function () { 
 'use strict';
	angular.module('sphaApp')
	.controller('sphaReportProcedimentiCtrl',
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
				var instanceReportUrl = apiProcedimentiUrl + "api/procedures/list-instance-report";
				var ownerTypesProcedimentiUrl =  apiProcedimentiUrl + "api/procedures/types";
				var exportReportUrl = apiProcedimentiUrl + "api/procedures/export-instance-report";
				
				$rootScope.goBack=null;				

				// variabili this
				vm.message = "";				
				vm.procedure=null;
				vm.companies=null;
		
				
				// variabili di scope
				
				$scope.actions =  [
					"PROCEDURE_DETAIL"
				];
				
				$scope.filtersRequest = {
                        companies: {companies: []},
                        procedures: {procedures: []}
                }
				
				 $scope.filters = {
                        companies: {elements: [], page: 0},
                        procedures: {elements: [], page: 0},
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
				
				if($cookies.get('reportCompanies') ){
                    vm.companies = JSON.parse($cookies.get('reportCompanies'));
                }
				if($cookies.get('reportProcedure') ){
                    vm.procedure = JSON.parse($cookies.get('reportProcedure'));
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
					updateCookie('reportCompanies', vm.companies ? JSON.stringify(vm.companies) : null);
					updateCookie('reportProcedure', vm.procedure ? JSON.stringify(vm.procedure) : null );
					if( vm.typeProcedimenti ){
						$cookies.put( 'procedimentiTypes', vm.typeProcedimenti );
					}

					vm.procedimentiTable.page( 1 );
					vm.procedimentiTable.reload();
				};

				vm.onTypeChange = function(){
					if( vm.typeProcedimenti && lastProcedureType != vm.typeProcedimenti ){
						lastProcedureType = vm.typeProcedimenti;
					}
				}
				
				
				$scope.resetOrderBy=function(){
					$cookies.remove( 'sortingKeyProcedimenti' );
					$cookies.remove( 'sortingValueProcedimenti' );
					
					vm.procedimentiTable.sorting({id:'desc'});
					vm.procedimentiTable.reload();
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
				 * Enhances data object array building Action object
				 * containing Action name callback and parameter object
				 * and adding it to each row
				 * @param {*} data data object array
				 */
				var rowActionsObjects = function( data ){
					if (data) {
						data.forEach(function( row ){
							if (row ){
								var rowActions = $scope.actions.map(function(a){
										return {
										callback: $scope.onActionCallback,
										object: row,
										action: a
									};
								});
								row.actions = rowActions;
							}
						});
					}
				}; 
				
				
				/**
				 * Actions callback
				 * @param {*} action Action name
				 * @param {*} orphanCode Action object
				 */
				$scope.onActionCallback = function (action, row) {
					switch( action ) {
						case 'PROCEDURE_DETAIL':
							$state.go(getUrlInstance(row.object.procedure, row.object.companyCode, row.object.companyName));
							break;
						case 'PROCEDURE_REPORT':
							if (row.object.statusInstance == 'STAMPED') {
								vm.showProtocolledFile(row.object.procedureInstanceId);
							} 
							
							break;
						default:
							alert('Hai premuto ' + action + ' sulla riga ' + row.object.id);
							console.log('Unknown Action: ' + action);
					}
				};
				
				
				
				$scope.statusColor = function (instanceStatus, phase) {
                    switch (instanceStatus) {
                        case 'NEW':
                        case 'SIGNED':
                        case 'DELETED':
                        case 'SIGNED_DELETED':
                        case 'CREATION_ATTACHMENTS':
                            return 'yellow';
                        case 'STAMPED':
                            return 'green';
                        case 'SUBMITTED':
                        	if(phase == 1) {
                        		return 'yellow';
                        	} else {
                        		return 'green';
                        	}
                        default:
                            break;
                    }
                }
				$scope.statusLabel = function (instanceStatus, phase) {
					if(phase == 1) {
                		return '-';
					} else {
	                    switch (instanceStatus) {
	                    	
	                        case 'NEW':
	                        case 'SIGNED':
	                        case 'DELETED':
	                        case 'SIGNED_DELETED':
	                        case 'STAMPED':
	                        case 'CREATION_ATTACHMENTS':
	                            return instanceStatus + '_LABEL';
	                        case 'SUBMITTED':
	                        	return instanceStatus + '_PHASE2_LABEL';
	                        	
	                        default:
	                            break;
	                    }
					}
                }
				
				vm.export = function() {
					var obj = {
							filters: {
								listCompanyCode: vm.companies ? vm.companies : null,
								procedureId: vm.procedure ? vm.procedure : null,
								procedureType: vm.typeProcedimenti
							},
						};
					
					httpServices.arrayBufferResponsePost(exportReportUrl, obj, function (data, success, error) {
						if( success ){ 
							var contentType = "application/octet-stream";
						    var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
						    if (urlCreator) {
						        var blob = new Blob([data.data], { type: contentType });
						        var url = urlCreator.createObjectURL(blob);
						        var a = document.createElement("a");
						        document.body.appendChild(a);
						        a.style = "display: none";
						        a.href = url;
						        a.download = "PROCEDURE_REPORT.zip";
						        a.click();
						        window.URL.revokeObjectURL(url);
						    }
						}else{
							vm.message = error;
							vm.alertClass = "alert alert-danger";
						}
                    });
					
				}
			    
				/**
				 * Reset search
				 */
				vm.reset = function(){
					vm.procedure=null;
					vm.companies=null;
					updateCookie('reportCompanies', vm.companies ? JSON.stringify(vm.companies) : null);
					updateCookie('reportProcedure', vm.procedure ? JSON.stringify(vm.procedure) : null);
					vm.procedimentiTable.reload();
				};
				

				/**
				 * Inizializzazione NGTable
				 */
				vm.procedimentiTable = new NgTableParams({
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
									listCompanyCode: vm.companies ? vm.companies : null,
									procedureId: vm.procedure ? vm.procedure : null,
									procedureType: vm.typeProcedimenti
								},
							};
							if ( sortingKey ) {
								obj.order = order;
								$cookies.put( 'sortingKeyProcedimenti', order[0].property );
								$cookies.put( 'sortingValueProcedimenti', order[0].direction );
							}
							
							if (vm.companies || vm.procedure ) {								
								return getData( obj ).then( function ( result ) {
								 	rowActionsObjects(result.data);
							 		params.total( result.total );
							 		return result.data;
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
                
                function getUrlInstance(procedure, companyCode, companyName) {
                	shareDataServices.set(procedure, 'PROCEDURE_DTO');
                	shareDataServices.set([companyCode], 'instanceCompanies');
                    shareDataServices.set(companyCode, 'instanceCompany');
                    shareDataServices.set(companyName, 'instanceCompanyName');
                    
                	switch (vm.typeProcedimenti) {                	
	                	case 'SHELF':
	                		return 'spha.shelfProcedureInstanceView';
	                	case 'PB5':
	                		return 'spha.pb5ProcedureInstanceView';
	                	case 'PB183':
	                		return 'spha.pb183ProcedureInstanceView';
	                	case 'BUDGET':
	                		return 'spha.budgetProcedureInstanceView';
	                	default:
	                        break;
                	}
                }
                
				/**
				 * Funzione per recuperare i dati per popolare la NGTable 
				 */
				function getData(obj) {
					var deferred = $q.defer();

					httpServices.post( instanceReportUrl, obj, function ( data, success, error ) {
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