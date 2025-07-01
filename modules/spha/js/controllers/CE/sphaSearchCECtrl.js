
/**
 * @ngdoc function
 * @name sphaSearchCECtrl
 * @description controller for search procedimenti
 * # sphaSearchCECtrl Controller of the sphaApp
 */
(function () { 
 'use strict';
	angular.module('sphaApp')
	.controller('sphaSearchCECtrl',
		[ 'PropertiesServiceSpha','cityServicesSpha','$rootScope', '$stateParams', '$state','$scope', '$window', '$cookies', '$q', '$translate', 
            'httpServices', 'NgTableParams','$uibModal','shareDataServices', '$filter', 'SweetAlert', 
            'sphaCeServices', 'sphaProcedureInstanceServices',
		function (PropertiesServiceSpha,cityServicesSpha, $rootScope, $stateParams, $state,$scope, $window, $cookies, $q, 
                  $translate, httpServices, NgTableParams, $uibModal, shareDataServices, $filter, SweetAlert, 
                  sphaCeServices, sphaProcedureInstanceServices ) {
				var vm = this;
				
				const tableType = 'FLUSSO_C_ECON';
				var procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
				
	               $scope.actions = {
                  		'EXPORT': false,
                  		'VIEW': false,	
                  }
				//URLS
				var apiAnagraphicUrl = PropertiesServiceSpha.get("baseUrlAnagraphic");
				var searchUrl = apiAnagraphicUrl + "api/ce/list";
				var medicinesUrl = apiAnagraphicUrl + "api/medicines/list";
				var exportUrl =  apiAnagraphicUrl + "api/ce/export";
				
				vm.message = "";
				vm.result = $stateParams.result;
				vm.isLoading = false;
				vm.filtersForm = null;
				vm.fieldsToNotShow = null;
                vm.showData = true
                
                sphaCeServices.getDataVisibilityRule(function (data, errors) {
                    if (errors && errors.message) {
                        vm.message = errors.message
                        vm.alertClass = errors.alertClass;
                        vm.showData = false;
                    } else if (data && data.fieldsToNotShow) {
                        vm.fieldsToNotShow = data.fieldsToNotShow;
                    }
                });
				
				/**
                 * Controllo su periodo dati da-a
                 */
                $scope.validateDate =function(form, dateToValidate, dateName) {
            	   	vm.filtersForm = form;
            	   	var date = new Date(dateToValidate).setHours(0, 0, 0, 0);
                	var valid = date >= $scope.datesOptions[dateName].datepickerOptions.minDate.setHours(0, 0, 0, 0) && date <= $scope.datesOptions[dateName].datepickerOptions.maxDate.setHours(0, 0, 0, 0);	                	
                	vm.filtersForm[dateName].$setValidity("daterange",valid);
                }
				/**
				 * Date Pickers
				 */
				$scope.datesOptions = {
					'TIME_FROM': {
						opened: false,
						datepickerOptions: {}
					},
					'TIME_TO': {
						opened: false,
						datepickerOptions: {}
					}
				};
				/** Get massive action by user 
                * 
                */
               $scope.getMassiveActionByUser = function() {
               	sphaCeServices.getMassiveActionByUser( function(data,error) {
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
	               
               $scope.getNumberOfDigit = function (number) {
            	   if (number) {
            		   var numberAsString = number.toString();
    				   if (numberAsString.includes('.')) {
    					   return numberAsString.split('.')[1].length;
    				   }
            	   }
				   
				   return 2;
			   }
               
				var sharedValue = shareDataServices.get('instanceValidMarketingFrom');
                if (sharedValue) {
                    vm.timeFrom = new Date(sharedValue);
                    $scope.datesOptions.TIME_FROM.datepickerOptions.minDate = vm.timeFrom;
                    $scope.datesOptions.TIME_TO.datepickerOptions.minDate = vm.timeFrom;
                    $scope.lockedMode = true;
                } else {
                    vm.timeFrom = $cookies.get('ceTimeFrom') ? new Date($cookies.get('ceTimeFrom')) : null;
                }
                sharedValue = shareDataServices.get('instanceValidMarketingTo');
                if (sharedValue) {
                    vm.timeTo = new Date(sharedValue);
                    $scope.datesOptions.TIME_FROM.datepickerOptions.maxDate = vm.timeTo;
                    $scope.datesOptions.TIME_TO.datepickerOptions.maxDate = vm.timeTo;
                    $scope.lockedMode = true;
                } else {
                    vm.timeTo = $cookies.get('ceTimeTo') ? new Date($cookies.get('ceTimeTo')) : null;
                }
                
				//Recupero i filtri salvati nei cookies
				vm.region = $cookies.get( 'ceRegion' ) ? JSON.parse( $cookies.get( 'ceRegion' ) ) : null;
				

				var initialSortingKey = $cookies.get( 'sortingKeyCE' ) ? $cookies.get( 'sortingKeyCE' ) : 'id';
				var initialSortingDirection = $cookies.get( 'sortingValueCE' ) ? $cookies.get( 'sortingValueCE' ) : 'desc';
					// Init Filters' domains
				$scope.filters = {
					region: []
				};
				
				

				$scope.openDatePopup = function (dateField) {
					$scope.datesOptions[dateField].opened = !$scope.datesOptions[dateField].opened;
				};

				cityServicesSpha.getRegions( function ( response ){
					if( response ){
						$scope.filters['region'] = response;
					}
				});	

				vm.getRegionCode = function(regionName) {
					if($scope.filters['region'].length > 0){
						var region = $scope.filters['region'].find(item => item.label.toLowerCase() === regionName.toLowerCase())
						return region.object;
					}
				}
				/**
				 * Funzione per il submit della ricerca tramite input 
				 */
				vm.submitSearch = function(form){
					updateFiltersCookies();
					
					vm.filtersForm = form;
					
			     	vm.CETable.page( 1 );
			        vm.CETable.reload();
				};

				function updateFiltersCookies(){
					updateCookie('ceRegion', vm.region ? JSON.stringify(vm.region): null);
					updateCookie('ceTimeFrom', vm.timeFrom ? vm.timeFrom.toISOString() : null);
					updateCookie('ceTimeTo', vm.timeTo ? vm.timeTo.toISOString() : null);
				}

				function updateCookie(cookieName, cookieValue){
					if( cookieValue ){
						$cookies.put( cookieName, cookieValue );
					} else {
						$cookies.remove( cookieName );
					}
				}

				$scope.resetOrderBy=function(){
					$cookies.remove( 'sortingKeyCE' );
					$cookies.remove( 'sortingValueCE' );
					vm.CETable.sorting({id:'desc'});
					vm.CETable.reload();
				   };
				/**
				 * Export
				 */
				vm.exportReport = function(form) {
					vm.filtersForm = form;
                    var obj = {
                            filters: getFilters()
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
				vm.goToTop = function() {
					document.documentElement.scrollTop = 0;
				}
				

				
				
				/**
				 * Reset search
				 */
				vm.reset = function(){
					vm.id = null;
					vm.region = null;
					vm.timeFrom = null;
					vm.timeTo = null;
					updateFiltersCookies();
					$scope.resetOrderBy();
				};


                function getFilters() {
                    var filters = {
                        region: vm.region != null && vm.region.length !== 0 ? vm.region : null,
                        timeFrom: vm.timeFrom ? vm.timeFrom : null,
                        timeTo: vm.timeTo ? vm.timeTo : null
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
				vm.CETable = new NgTableParams({
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
							vm.isLoading = true;
							//object for api rest
							var obj = {
								start : ( page - 1 ) * count,
								length : count,
								search : "",
								filters: getFilters()
							};
							if ( sortingKey ) {
								obj.order = order;
								$cookies.put( 'sortingKeyCE', order[0].property );
								$cookies.put( 'sortingValueCE', order[0].direction );
							}
							//rendering data
							var data = null;
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

                        if (!vm.filtersForm || vm.filtersForm.$invalid) {
                            deferred.resolve({
                                data: null,
                                total: 0,
                            });
                        } else {
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
                        }
                        return deferred.promise;
                    };

				/**
				 * Funzione per recuperare i dati per popolare la NGTable 
				 */
				function getData(obj) {
				    var deferred = $q.defer();
				    if(vm.region && vm.showData) {
                        if (!vm.filtersForm || vm.filtersForm.$invalid) {
                            deferred.resolve({data: null,total: 0});
                        } else {
                            httpServices.post(searchUrl, obj, function (data, success, error) {
                                if (success) {
                                    deferred.resolve({
                                        data: data.items,
                                        total: data.total,
                                    });
                                } else {
                                    vm.message = error;
                                    vm.alertClass = "alert alert-danger";
                                    deferred.resolve({data: null,total: 0});
                                }
                            });
                        }
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

			}
		]);
})();