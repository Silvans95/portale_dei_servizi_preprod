
/**
 * @ngdoc function
 * @name sphaSearchProcedimentiCtrl
 * @description controller for search procedimenti
 * # sphaSearchProcedimentiCtrl Controller of the sphaApp
 */
(function () { 
 'use strict';
	angular.module('sphaApp')
	.controller('sphaSearchProcedimentiCtrl',
		['PropertiesServiceSpha', '$rootScope', '$stateParams', '$state', '$window', '$scope', '$cookies', '$q', '$translate', 
            'httpServices', 'NgTableParams','$uibModal','shareDataServices', 'sphaProcedureServices', 'SweetAlert',
		function ( PropertiesServiceSpha, $rootScope, $stateParams, $state, $window, $scope, $cookies, $q, $translate,
                   httpServices, NgTableParams, $uibModal, shareDataServices, sphaProcedureServices, SweetAlert ) {
				var vm = this;
				
				var apiProcedimentiUrl = PropertiesServiceSpha.get("baseUrlProcedure");
				//Creare eventualmente variabili per contattare endpoint del back-end
				var searchUrl = apiProcedimentiUrl + "api/procedures/list";
				var deleteUrl = apiProcedimentiUrl + "api/procedures/";
				var downloadXMLUrl = apiProcedimentiUrl + "downloadxmlema/";
				var ownerTypesProcedimentiUrl =  apiProcedimentiUrl + "api/procedures/types";
				
				$rootScope.goBack=null;				

				vm.description = null;
				vm.year = null;
				vm.message = "";
				
		
				//Recupero i filtri salvati nei cookies
				vm.description = $cookies.get( 'descrizioneProcedimento' ) ? $cookies.get( 'descrizioneProcedimento' ) : null;
				vm.year = $cookies.get( 'yearProcedimento' ) ? parseInt ( $cookies.get( 'yearProcedimento' ) ): null;
				
				if(shareDataServices.get('instanceCompanies')) {
					shareDataServices.set(null, 'instanceCompanies');
					shareDataServices.set(null, 'instanceCompany');
					shareDataServices.set(null, 'instanceCompanyName');
					shareDataServices.set(null, 'paymentCompanies');
					shareDataServices.set(null, 'paymentAifaCompanies');
					$cookies.remove( 'instanceCompanies');
					$cookies.remove( 'instanceCompany');
					$cookies.remove( 'instanceCompanyName');
					$cookies.remove('paymentCompanies');
					$cookies.remove( 'paymentAifaCompanies');
					
				}

				//Contiene i vari tipi di procedimenti disponibili in base all'utente autenticato
				vm.typeProcedimenti = $cookies.get( 'ownerTypeProcedimenti' ) ? $cookies.get( 'ownerTypeProcedimenti' ) : null;
				
				var initialSortingKey = $cookies.get( 'sortingKeyProcedimenti' ) ? $cookies.get( 'sortingKeyProcedimenti' ) : 'endDate';
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
					if( vm.description ){
						$cookies.put( 'descrizioneProcedimento', vm.description );
					}
					if( vm.year ){
						$cookies.put( 'yearProcedimento', vm.year );
					}
					if( vm.typeProcedimenti ){
						$cookies.put( 'procedimentiTypes', vm.typeProcedimenti );
					}

					vm.procedimentiTable.page( 1 );
					vm.procedimentiTable.reload();
				};

				vm.onTypeChange = function(){
					if( vm.typeProcedimenti && lastProcedureType != vm.typeProcedimenti ){
						lastProcedureType = vm.typeProcedimenti;
						vm.year = null;
						vm.description = null;
					}
				}
				
				
				$scope.resetOrderBy=function(){
					$cookies.remove( 'sortingKeyProcedimenti' );
					$cookies.remove( 'sortingValueProcedimenti' );
					vm.procedimentiTable.sorting({id:'desc'});
					vm.procedimentiTable.reload();
				};
				
				/**
				* Go to New Procedimento
				*/
				vm.new = function (){
					shareDataServices.set( vm.typeProcedimenti, 'Type-Procedimenti' );
					$state.go('spha.newProcedimenti');
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
				
//				/**
//				 * Function to init permitted action for every Procedure. It returns an
//				 * array of obects used to populate buttons and dropdowns of action column
//				 */
//				vm.initActions = function ( allowedActions, id ){
//					return sphaProcedureServices.getProcedureActions( allowedActions, id );
//				}
				
				/**
				 * Enhances data object array building Action object
				 * containing Action name callback and parameter object
				 * and adding it to each row
				 * @param {*} data data object array
				 */
				var rowActionsObjects = function( data ){
					if (data) {
						data.forEach(function( row ){
							if (row && row.actions && row.actions.length>0){
                                var rowActions = [];
                                var actionsToNotShow = ['EXPORT_SAS', 'IMPORT_SAS'];
                                var actionsToHide = ['PROCEDURE_FILE_IMPORT'];
                                row.actions.forEach(rowAction => {
                                    if(actionsToNotShow.indexOf(rowAction) < 0) {
                                        rowActions.push({
                                            callback: $scope.onActionCallback,
                                            object: row,
                                            action: rowAction,
											hide: actionsToHide.indexOf(rowAction) !== -1
                                        });
                                    }
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
                    shareDataServices.delete('PROCEDURE_START_NEW_PHASE');
					switch( action ) {
						case 'PROCEDURE_VIEW':
							$state.go('spha.procedureDetail', { id: row.object.id });
							break;
						case 'PROCEDURE_EDIT':
							$state.go('spha.procedureEdit',{ id: row.object.id } );
							break;
						case 'PROCEDURE_DELETE':
							vm.deleteRow(row.object);
							break;
						case 'PROCEDURE_FILE_VIEW':
							$state.go('spha.procedureFilesList',{ id: row.object.id, showImportButton: 0});
							break;
						case 'PROCEDURE_FILE_EDIT':
							$state.go('spha.procedureFilesEdit',{ id: row.object.id, showImportButton: row.object.actions.some((action) => action.action === 'PROCEDURE_FILE_IMPORT') ? 1 : 0 });
							break;
                        case 'PROCEDURE_START_PHASE_2':
                            shareDataServices.set({ parentId: row.object.id, newPhase: 2 }, 'PROCEDURE_START_NEW_PHASE');
							$state.go('spha.procedureEdit',{ id: row.object.id });
							break;
						default:
							alert('Hai premuto ' + action + ' sulla riga ' + row);
							console.log('Unknown Action: ' + action);
					}
				};
				
				/**
				 * Reset search
				 */
				vm.reset = function(){
					$cookies.remove( 'descrizioneProcedimento' );
					$cookies.remove( 'yearProcedimento' );
					vm.description = null;
					vm.year = null;
					vm.procedimentiTable.reload();
				};
				

				
				/**
				 * Funzione associata al bottone per la cancellazione di una riga.
				 * Chiama il servizio rest delete cta 
				 */
				vm.deleteRow = function( row ){
					SweetAlert.swal({
						   title: $translate.instant("CONFIRM_DELETE_PROCEDIMENTO") + " " + row.description + "?",
						   text: null,
						   type: "warning",
						   showCancelButton: true,
						   confirmButtonColor: "#337ab7",
						   confirmButtonText: $translate.instant('YES'),
				   		   cancelButtonText: $translate.instant('NO'),
					   	   closeOnConfirm: true,
					   	   closeOnCancel: true, 
						   },function( isConfirm ){
							   if( isConfirm ){
								   httpServices.deleteWithResult( deleteUrl + row.id, function ( success, error ) {
									   if( success ){
										   vm.alertClass = "alert alert-success";
										   vm.message = "SUCCESS_DELETE_CTA";
										   vm.procedimentiTable.reload();
									   }else{
										   vm.message = "ERROR_DELETE_PROCEDURE";
										   vm.alertClass = "alert alert-danger";
									   }
								   });
							   }
						   }
					);
				};
				
				vm.getDownloadXMLUrl = function( id ){
					if( id ){
						return downloadXMLUrl + id;
					}
				}
				
				
				$scope.getColorFromEndDate = function(endDate,startDate, row) {
					
					var today = new Date().setHours( 0,0,0,0 );
					var endDateFormatted = new Date(endDate).setHours( 0,0,0,0 );
					var startDateFormatted = new Date(startDate).setHours( 0,0,0,0 );
					if(endDateFormatted >= today && startDateFormatted <= today && row.status == 'STARTED' ) {
						return '#4ee44e';
					} else if (endDateFormatted < today && startDateFormatted <= today && row.status == 'CLOSED') {
						return '#ff0015';
					} else {
						return 'yellow';
					} 
				}
				
				
				$scope.getColorFromState = function(row) {
					if(row.status == 'STARTED' ) {
						return '#4ee44e';
					} else if (row.status == 'CLOSED') {
						return '#ff0015';
					} else if (row.status == 'TO_CLOSE') {
						return '#D98129';
					} else if (row.status == 'SUSPENDED') {
						return '#5C8D9C';						
					} else {
						return 'yellow';
					} 
				}
				

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
							if(vm.typeProcedimenti == null){
								vm.year = null;
								vm.description = null;
							}
							var obj = {
								start : ( page - 1 ) * count,
								length : count,
								search : "",
								filters: {
								    description : vm.description ? vm.description : null,
								    year : vm.year ? vm.year : null,
								    type: vm.typeProcedimenti ? vm.typeProcedimenti : null,
								},
							};
							if ( sortingKey ) {
								obj.order = order;
								$cookies.put( 'sortingKeyProcedimenti', order[0].property );
								$cookies.put( 'sortingValueProcedimenti', order[0].direction );
							}
							
							return getData( obj ).then( function ( result ) {
							 	rowActionsObjects(result.data);
						 		params.total( result.total );
						 		return result.data;
						 	});
						}
					});
				
				

				/**
				 * Funzione per recuperare i dati per popolare la NGTable 
				 */
				function getData(obj) {
					var deferred = $q.defer();

					httpServices.post( searchUrl, obj, function ( data, success, error ) {
						if( success ){ 
							deferred.resolve({
								data: data ? data.items : null,
                                total: data ? data.total : 0,
							});
						}else{
							vm.message = error;
							vm.alertClass = "alert alert-danger";
						}
					});
					return deferred.promise;
				};
				
				
				/********************************** OPENING MODAL  *****************************************/
				
				/**
				 * Funzione per aprire modale storico richieste
				 */
				/*vm.openHistory = function ( id, size, parentSelector ){
					 var parentElem = parentSelector ? 
					    	angular.element($document[0].querySelector( '.modal-demo ' + parentSelector ) ) : undefined;
					    	    vm.modalInstance = $uibModal.open({
					    	      animation: vm.animationsEnabled,
					    	      ariaLabelledBy: 'modal-title',
					    	      ariaDescribedBy: 'modal-body',
					    	      templateUrl: 'modules/spha/js/directives/modal/modal_history.html',
					    	      appendTo: parentElem,
					    	      size: 'lg',
					    	      controllerAs: '$ctrl',
					    	      controller: function( $scope, $sce ) {
					    	    	  $scope.title= 'HISTORY_CTA';
					    	    	  $scope.id = id;
									  $scope.url = apiProcedimentiUrl;
					    	    	  $scope.cancel = function () {
					    	    		  vm.modalInstance.dismiss( 'cancel' );
					    	    	  };
					    	      }
						    });					
				};*/


				/**
				 * Funzione per aprire modale informazioni sulla cta
				 */
				/*vm.openInformationModal = function ( id, actions, status, size, parentSelector ){
					var parentElem = parentSelector ? 
							angular.element($document[0].querySelector( '.modal-demo ' + parentSelector ) ) : undefined;
							vm.modalInstance = $uibModal.open({
								animation: vm.animationsEnabled,
								ariaLabelledBy: 'modal-title',
								ariaDescribedBy: 'modal-body',
								templateUrl: 'modules/spha/js/directives/modal/modal_information_cta.html',
								appendTo: parentElem,
								size: 'lg',
								controllerAs: '$ctrl',
								controller: function( $scope, $sce ) {
									$scope.idCta = id;
									$scope.actions = vm.initActions( actions, id );
									httpServices.get( apiProcedimentiUrl + id + "/detailCta", function( response, success, message ){
										if( response && success){
											$scope.data = response;
										}else{
											$scope.message = message;
											$scope.alertClass = "alert alert-danger";
										}
									});
									
									$scope.clickAction = function( object , id){
										vm.setObject(object , id);
										$scope.cancel();
									};
									
									$scope.cancel = function () {
										vm.modalInstance.dismiss( 'cancel' );
									};
								}
							
							});					
							
				};*/
				
				
				/**
				 * Funzione per aprire modale storico obiezioni
				 */
				/*vm.openObjections = function ( id, size, parentSelector ){
					var parentElem = parentSelector ? 
							angular.element($document[0].querySelector( '.modal-demo ' + parentSelector ) ) : undefined;
							vm.modalInstance = $uibModal.open({
								animation: vm.animationsEnabled,
								ariaLabelledBy: 'modal-title',
								ariaDescribedBy: 'modal-body',
								templateUrl: 'modules/spha/js/directives/modal/modal_objections_history.html',
								appendTo: parentElem,
								size: 'lg',
								controllerAs: '$ctrl',
								controller: function( $scope, $sce ) {
									$scope.id = id;
									$scope.url = apiProcedimentiUrl;
									$scope.cancel = function () {
										vm.modalInstance.dismiss( 'cancel' );
									};
								}
							
							});					
							
				};*/

				
			}
		]);
})();