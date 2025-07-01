
/**
 * @ngdoc function
 * @name sphaSearchFFICtrl
 * @description controller for search procedimenti
 * # sphaSearchFFICtrl Controller of the sphaApp
 */
(function () { 
	'use strict';
	   angular.module('sphaApp')
	   .controller('sphaSearchFFICtrl',
		   ['PropertiesServiceSpha', 'cityServicesSpha', '$rootScope', '$stateParams','$scope', '$state', '$window', '$cookies', '$q', '$translate', 
               'httpServices', 'NgTableParams','$uibModal','shareDataServices', '$filter', 'SweetAlert', 
               'sphaFfiServices', 'sphaProcedureInstanceServices',
		   function (PropertiesServiceSpha, cityServicesSpha, $rootScope, $stateParams,$scope, $state, $window, $cookies, $q, $translate, 
                     httpServices, NgTableParams, $uibModal, shareDataServices, $filter, SweetAlert,
                     sphaFfiServices, sphaProcedureInstanceServices ) {
			   var vm = this;
			   var procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
			   const tableType = 'FLUSSO_FFI';
			   
               $scope.actions = {
               		'EXPORT': false,
               		'VIEW': false,
               }
			   //URLS
			   var apiAnagraphicUrl = PropertiesServiceSpha.get("baseUrlAnagraphic");
			   var searchUrl = apiAnagraphicUrl + "api/ffi/list";
			   var medicinesUrl = apiAnagraphicUrl + "api/medicines/list";
			   var exportUrl = apiAnagraphicUrl + "api/ffi/export";


			   vm.message = "";
			   vm.result = $stateParams.result;
			   vm.isLoading = false;
			   vm.filtersForm = null;
			   vm.year = [];
			   vm.yearSelected = [];
			   vm.fieldsToNotShow = null;
               vm.showData = true
               
               sphaFfiServices.getDataVisibilityRule(function (data, errors) {
                   if (errors && errors.message) {
                       vm.message = errors.message
                       vm.alertClass = errors.alertClass;
                       vm.showData = false;
                   } else if (data && data.fieldsToNotShow) {
                       vm.fieldsToNotShow = data.fieldsToNotShow;
                   }
               });
			   
			   var sharedValueFrom = shareDataServices.get('instanceValidMarketingFrom');
			   var sharedValueTo = shareDataServices.get('instanceValidMarketingTo');
			   if (sharedValueFrom && sharedValueTo) {
				   
                  var dateFrom = new Date(sharedValueFrom);
                  var yearFrom = dateFrom.getFullYear();
                  var dateTo = new Date(sharedValueTo);
                  var yearTo = dateTo.getFullYear();
                  if(yearFrom != yearTo) {
               	   vm.year.push(yearFrom);
               	   vm.year.push(yearTo);

                  } else {
               	   vm.year.push(yearFrom);
               	   vm.yearSelected.push(yearFrom);
                  }
			   } else {
				   vm.year = $cookies.get('ffiYear') ? new Date($cookies.get('ffiYear')) : null;
               }
			   //Recupero i filtri salvati nei cookies
			   vm.region = $cookies.get( 'ffiRegion' ) ? JSON.parse( $cookies.get( 'ffiRegion' ) ) : null;

			   var initialSortingKey = $cookies.get( 'sortingKeyFFI' ) ? $cookies.get( 'sortingKeyFFI' ) : 'region';
			   var initialSortingDirection = $cookies.get( 'sortingValueFFI' ) ? $cookies.get( 'sortingValueFFI' ) : 'desc';
			   
			   /** Get massive action by user 
                * 
                */
               $scope.getMassiveActionByUser = function() {
               	sphaFfiServices.getMassiveActionByUser( function(data,error) {
               		if (error && error.message) {
                           vm.message = error.message;
                           vm.alertClass = error.alertClass
                       } else {
                       	if(data) {
                       		data.forEach(action => {
                       			$scope.actions[action] = true;
                           	});
                       	}
                       	
                       }
                       	
               	});
               }
              
               $scope.getMassiveActionByUser();
               
			   $scope.filters = {
				region: []
			   };

				cityServicesSpha.getRegions(function (response) {
					if (response) {
						$scope.filters['region'] = response;
					}
				});

			   /**
				* Funzione per il submit della ricerca tramite input 
				*/
				   vm.submitSearch = function(form){
					   updateFiltersCookies();
					   vm.filtersForm = form;
					   vm.FFITable.page( 1 );
					   vm.FFITable.reload();
				   };
   
				   function updateFiltersCookies(){
					   updateCookie('ffiRegion', vm.region ? JSON.stringify(vm.region): null);
				   updateCookie('ffiYear', vm.year ? JSON.stringify(vm.year): null);

				   }
   
				   function updateCookie(cookieName, cookieValue){
					   if( cookieValue ){
						   $cookies.put( cookieName, cookieValue );
					   } else {
						   $cookies.remove( cookieName );
					   }
				   }
   
				   $scope.resetOrderBy=function(){
				   	$cookies.remove( 'sortingKeyFFI' );
			   	$cookies.remove( 'sortingValueFFI' );
			   	vm.FFITable.sorting({id:'desc'});
			   	vm.FFITable.reload();
			   };

			   
			   $scope.getNumberOfDigit = function (number) {
            	   if (number) {
            		   var numberAsString = number.toString();
    				   if (numberAsString.includes('.')) {
    					   return numberAsString.split('.')[1].length;
    				   }
            	   }
				   
				   return 2;
			   }
			   /**
				 * Export
				 */
			   vm.exportReport = function(form) {
					vm.filtersForm = form;
					var obj = {
						search: "",
						filters: getFilters(),
					};

                    exportData(obj).then(function (result) {
                    	SweetAlert.swal({
                            title: $translate.instant("EXPORT_DATA"),
                            text: null,
                            type: "success",
                            confirmButtonColor: "#337ab7",
                            confirmButtonText: $translate.instant('OK'),
                            closeOnConfirm: true,
                        });
                        return result.data;
                    });
				}
				   
			   /**
			   * Go to New Procedimento
			   */
			   vm.new = function (){
			   	shareDataServices.set( vm.typeProcedimenti, 'Type-Procedimenti' );
			   	$state.go('spha.newProcedimenti');
				   };
   
				    /**
				* Go to top of page
				*/
					vm.goToTop = function () {
						document.documentElement.scrollTop = 0;
					}
   
				  
				   
				   /**
				* Reset search
				*/
				   vm.reset = function(){
					   vm.region = null;
					   updateFiltersCookies();
					   $scope.resetOrderBy();
				   };
				   
  
				   function getFilters() {
                       var filters = {
                           region: vm.region && vm.region.length ? vm.region : null,
                           year: vm.yearSelected ? vm.yearSelected : null
                       };
                       if (filters && procedureInstanceDTO) {
                           var dataImportIds = sphaProcedureInstanceServices.getDataImportIds(procedureInstanceDTO, tableType);
                           if (dataImportIds && dataImportIds.length > 0) {
                               filters.dataImportIds = dataImportIds;
                           }
                       }
                       return filters;
                   }
				   
				   
				   
				   /**
				* Inizializzazione NGTable
				*/
			    vm.FFITable = new NgTableParams({
			   		page : 1,
			   		count : 25,
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
			   			vm.isLoading = true;
			   			//object for api rest
			   			var obj = {
			   				start : ( page - 1 ) * count,
			   				length : count,
			   				search : "",
			   				filters: getFilters(),
			   			};
			   			if ( sortingKey ) {
			   				obj.order = order;
			   				$cookies.put( 'sortingKeyFFI', order[0].property );
			   				$cookies.put( 'sortingValueFFI', order[0].direction );
				   			}
   
				   			var data = null; 
                            //rendering data
                            data = getData( obj ).then( function ( result ) {
                                params.total( result.total );
                                vm.isLoading = false;
                                return result.data;
                            });
   
				   			return data;
				   		}
				   	});
				     /**
				 * Funzione per esportare i dati
				 */
				function exportData(obj) {
					var deferred = $q.defer();
					httpServices.post(exportUrl, obj, function (data, success, error) {
						if (success) {
							deferred.resolve({
								data: data.items,
								total: data.total,
							});
						} else {
							vm.message = error;
							vm.alertClass = "alert alert-danger";
							}
						});
					return deferred.promise;
					};

				   
   
                /**
                 * Funzione per recuperare i dati per popolare la NGTable 
                 */
                function getData(obj) {
                    var deferred = $q.defer();
                    if(vm.showData) {
						httpServices.post(searchUrl, obj, function (data, success, error) {
							if (success) {
								deferred.resolve({
									data: data.items,
									total: data.total,
								});
							} else {
								vm.message = error;
								vm.alertClass = "alert alert-danger";
							}
						});
                    } else {
                        deferred.resolve({data: null,total: 0});
                    }
                    return deferred.promise;
                }
                
			    /**
				* Funzione per andare indietro 
				*/
			   vm.goBack = function( ){
				   if( $rootScope.goBack ){
					   $state.go( $rootScope.goBack );
				   }else{
					   $window.history.back();
				   }
			   };
			   
			   if (shareDataServices.get('resetConfigs') &&
                   shareDataServices.get('resetConfigs')[$state.current.name] &&
                   shareDataServices.get('resetConfigs')[$state.current.name].resetFilters === true) {
                   var resetConfigs = shareDataServices.get('resetConfigs');
                   vm.reset();
                   resetConfigs[$state.current.name].resetFilters = false;
                   shareDataServices.set(resetConfigs, 'resetConfigs')
               }
		   }
	   ]);
   })();