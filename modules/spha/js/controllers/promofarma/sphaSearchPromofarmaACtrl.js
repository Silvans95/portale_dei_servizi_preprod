
/**
 * @ngdoc function
 * @name sphaSearchPromofarmaCtrl
 * @description controller for search Promofarma
 * # sphaSearchPromofarmaCtrl Controller of the sphaApp
 */
(function () { 
 'use strict';
	angular.module('sphaApp')
	.controller('sphaSearchPromofarmaACtrl',
		['PropertiesServiceSpha', 'cityServicesSpha', 'sphaCompanyServices', 'sphaPossibleValueServices','shareDataServices',
            '$rootScope', '$stateParams', '$state', '$scope', '$window', '$cookies', '$q', '$translate', 'httpServices',
            'NgTableParams','$uibModal', '$filter', 'SweetAlert', 'sphaPromofarmaServices', 'sphaProcedureInstanceServices',
		function ( PropertiesServiceSpha, cityServicesSpha, sphaCompanyServices, sphaPossibleValueServices,shareDataServices,
                   $rootScope, $stateParams, $state, $scope, $window, $cookies, $q, $translate, httpServices,
                   NgTableParams, $uibModal, $filter, SweetAlert, sphaPromofarmaServices, sphaProcedureInstanceServices ) {
				var vm = this;
				
				var procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
			    const tableType = 'FLUSSO_PROMOFARMA_A';
				
				$scope.actions = {
                		'EXPORT': false,
                		'VIEW': false,
                }
				//URLS
				var apiAnagraphicUrl = PropertiesServiceSpha.get("baseUrlAnagraphic");
				var searchUrl = apiAnagraphicUrl + "api/promofarmaA/list";
				var exportUrl = apiAnagraphicUrl + "api/promofarmaA/export";
				var getMassiveActionByUserUrl = apiAnagraphicUrl + "api/promofarmaA/actions";
				var dataType = "FLOW_PROMOFARMA_A";

				vm.message = "";
				vm.result = $stateParams.result;
				vm.isLoading = false;
				vm.filtersForm = null;
				vm.region = [];
				$scope.lockedMode = false;
				
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
                
                /**
                 * Controllo su periodo dati da-a
                 */
                $scope.validateDate =function(form, dateToValidate, dateName) {
            	   	vm.filtersForm = form;
            	   	var date = new Date(dateToValidate).setHours(0, 0, 0, 0);
                	var valid = date >= $scope.datesOptions[dateName].datepickerOptions.minDate.setHours(0, 0, 0, 0) && date <= $scope.datesOptions[dateName].datepickerOptions.maxDate.setHours(0, 0, 0, 0);	                	
                	vm.filtersForm[dateName].$setValidity("daterange",valid);
                }
                
                
				$rootScope.goBack = null;
				vm.fieldsToNotShow = null;
                vm.showData = true
                
                sphaPromofarmaServices.getDataVisibilityRule(dataType,function (data, errors) {
                    if (errors && errors.message) {
                        vm.message = errors.message
                        vm.alertClass = errors.alertClass;
                        vm.showData = false;
                    } else if (data && data.fieldsToNotShow) {
                        vm.fieldsToNotShow = data.fieldsToNotShow;
                    }
                });

				var initialSortingKey = $cookies.get( 'sortingKeyPromopharma' ) ? $cookies.get( 'sortingKeyPromofarma' ) : 'year';
				var initialSortingDirection = $cookies.get( 'sortingValuPromofarma' ) ? $cookies.get( 'sortingValuePromofarma' ) : 'desc';
				
				/** Get massive action by user 
                 * 
                 */
                $scope.getMassiveActionByUser = function() {
                	sphaPromofarmaServices.getMassiveActionByUser(getMassiveActionByUserUrl, function(data,error) {
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
                
				//TODO da rimuovere validProcedureTo in futuro
				$scope.filtersRequest = {
                    companies: {companies: [], validProcedureTo: "2300-01-21T00:00:00.000Z"},
                    reimbursementClass: {reimbursementClass: [], valueType: "reimbursementClass"},
                    atc: {atc: [], valueType:"atc"}
                }
				// Init Filters' domains
				$scope.filters = {
					companies: {elements: [], page: 0},
					reimbursementClass: {elements: [], page: 0, valueType: "reimbursementClass"},
                    atc: {elements: [], page: 0, valueType: "atc"},
					transparency : [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
					orphan : [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
					patented : [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
					region: []
				};
				
				cityServicesSpha.getRegions( function ( response ){
					if( response ){
						$scope.filters['region'] = response;
					}
				});
				
				
				// Mapping Search Filters Response to Filter Domain
                function mapSearchFilterResponse(data) {
                    data.forEach(meta => {
                        if(meta.name && $scope.filters[meta.name]) {
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
    
                // get Search Filters from Service
                // TODO replace with possibleValues
                $scope.getSearchFiltersMeta = function (page) {
                	sphaMedicineServices.getSearchFiltersMeta(page, function (data, error) {
                        if (error && error.message) {
                            vm.message = error.message;
                            vm.alertClass = error.alertClass
                        } else {
                            mapSearchFilterResponse(data);
                        }
                    });
                };
                
                $scope.getCompaniesPossibleValues = function (page,search) {
            		// TODO implementare ricerca companies (per nome/codice/validProcedureTo) da FE (vedere api.yml) /companies/possible-values
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

                
                /* get di tutti gli atc e classi*/
                $scope.getPossibleValues = function (page, valueType, search) {
                	if(!page) {
            			$scope.filters[valueType].elements = [];
            		}
                	$scope.filters[valueType].page = page;
            		sphaPossibleValueServices.getPossibleValues(page,
                		($scope.filtersRequest[valueType][valueType]!= null &&
                                $scope.filtersRequest[valueType][valueType].length > 0)
                                ? $scope.filtersRequest[valueType]
                                : null, valueType, search,
                    function (data, error) {
                        if (error && error.message) {
                            vm.message = error.message;
                            vm.alertClass = error.alertClass
                        } else {
                            mapSearchFilterResponse([data]);
                        }
                    });
                }

                var sharedValue = shareDataServices.get('instanceCompanies');
                if (sharedValue) {
                    vm.companies = sharedValue;
                    $scope.lockedMode = true;
                } else if($cookies.get('promofarmaCompanies')) {
                    vm.companies =  JSON.parse($cookies.get('promofarmaCompanies'));
                }
                if($cookies.get('promofarmaReimbursementClass')) {
                    vm.reimbursementClass =  JSON.parse($cookies.get('promofarmaReimbursementClass'));
                }
                if($cookies.get('promofarmaAtc')) {
                    vm.atc =  JSON.parse($cookies.get('promofarmaAtc'));
                }
                if(vm.companies != null){
                    $scope.filtersRequest.companies.companies = (vm.companies);
                }
                if(vm.atc != null){
                    $scope.filtersRequest.atc.atc = (vm.atc);
                }
                if(vm.reimbursementClass != null){
                    $scope.filtersRequest.reimbursementClass.reimbursementClass = (vm.reimbursementClass);
                }
                sharedValue = shareDataServices.get('instanceValidMarketingFrom');
                if (sharedValue) {
                    vm.timeFrom = new Date(sharedValue);
                    $scope.datesOptions.TIME_FROM.datepickerOptions.minDate = vm.timeFrom;
                    $scope.datesOptions.TIME_TO.datepickerOptions.minDate = vm.timeFrom;
                    $scope.lockedMode = true;
                } else {
                    vm.timeFrom = $cookies.get('promofarmaTimeFrom') ? new Date($cookies.get('promofarmaTimeFrom')) : null;
                }
                sharedValue = shareDataServices.get('instanceValidMarketingTo');
                if (sharedValue) {
                    vm.timeTo = new Date(sharedValue);
                    $scope.datesOptions.TIME_FROM.datepickerOptions.maxDate = vm.timeTo;
                    $scope.datesOptions.TIME_TO.datepickerOptions.maxDate = vm.timeTo;
                    $scope.lockedMode = true;
                } else {
                    vm.timeTo = $cookies.get('promofarmaTimeTo') ? new Date($cookies.get('promofarmaTimeTo')) : null;
                }

              //Recupero i filtri salvati nei cookies
				
				vm.medicineDescription = $cookies.get( 'promofarmaDescription' ) ? $cookies.get( 'promofarmaDescription' ) : null;
				vm.aic = $cookies.get( 'promofarmaAic' ) ? $cookies.get( 'promofarmaAic' ) : null;
				vm.boxDescription = $cookies.get( 'promofarmaBoxDescription' ) ? $cookies.get( 'promofarmaBoxDescription' ) : null;
				vm.transparency = $cookies.get( 'promofarmaTransparency' ) ? $cookies.get( 'promofarmaTransparency' )=='true' : null;
				vm.orphan = $cookies.get( 'promofarmaOrphan' ) ? $cookies.get( 'promofarmaOrphan' )=='true' : null;
				vm.patented = $cookies.get( 'promofarmaPatented' ) ? $cookies.get( 'promofarmaPatented' )=='true' : null;
				vm.region = $cookies.get( 'region' ) ? JSON.parse( $cookies.get( 'region' ) ) : null;
				vm.asl = $cookies.get( 'asl' ) ? $cookies.get( 'asl' ) : null;

				vm.goToTop = function() {
					document.documentElement.scrollTop = 0;
				}
				
				$scope.openDatePopup = function (dateField) {
                    $scope.datesOptions[dateField].opened = !$scope.datesOptions[dateField].opened;
                };
			
				// se l'elemento del form è invalido -> bordo rosso
				$scope.addClass = function ( idField, form ){
					if( !$scope.readOnly && form && form[idField] && form[idField].$invalid ){
						return 'has-errors'; 
					}
					return ''; 
				}
						
				/**
                 * Set shared data between controllers
                 */
                vm.setObject = function (aic) {
                    var detailInputParams = {
                        aic9: aic,
                        validMarketingFrom: vm.timeFrom ? vm.timeFrom : new Date(1800,1), 
                        validMarketingTo: vm.timeTo ? vm.timeTo : new Date(),
                        companies: vm.companies 
                    };
                    shareDataServices.set(detailInputParams, 'ANAGRAPHIC_DETAIL_PARAMS');
                };
				 /**
                 * Actions callback
                 * @param {*} action Action name
                 * @param {*} aic9 Action object
                 */
                $scope.onActionCallback = function (action, row) {
                    shareDataServices.delete('MEDICINE_DETAIL_CAN_EDIT');
                    switch (action) {
                        case 'VIEW':
                            vm.setObject(row.object.aic9);
                            $state.go('spha.viewMedicine');
                            break;
                        default:
                            alert('Hai premuto ' + action + ' sulla riga ' + row.object.aic9);
                            console.log('Unknown Action: ' + action);
                    }
                };
                
                /**
                 * Enhances data object array building Action object
                 * containing Action name callback and parameter object
                 * and adding it to each row
                 * @param {*} data data object array
                 */
                var rowActionsObjects = function (data) {
                    if (data) {
                        data.forEach(function (row) {
                            if (row && row.actions && row.actions.length > 0) {
                                var rowActions = row.actions.map(function (a) {
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
				 * Funzione per il submit della ricerca tramite input 
				 */
				vm.submitSearch = function(form){
					updateFiltersCookies();
					vm.filtersForm = form;
					vm.promofarmaTable.page( 1 );
					vm.promofarmaTable.reload();
				};

				function updateFiltersCookies(){
					updateCookie('promofarmaCompanies', vm.companies ? JSON.stringify(vm.companies): null);
					updateCookie('promofarmaDescription', vm.medicineDescription);
					updateCookie('promofarmaAic', vm.aic);
					updateCookie('promofarmaBoxDescription', vm.boxDescription);
					updateCookie('promofarmaReimbursementClass', vm.reimbursementClass ? JSON.stringify(vm.reimbursementClass): null);
					updateCookie('promofarmaAtc',  vm.atc ? JSON.stringify(vm.atc): null);
					updateCookie('promofarmaTransparency', vm.transparency);
					updateCookie('promofarmaOrphan', vm.orphan);
					updateCookie('promofarmaPatented', vm.patented);
					updateCookie('region', vm.region ? JSON.stringify(vm.region): null);
					updateCookie('asl', vm.asl);
					updateCookie('promofarmaTimeFrom', vm.timeFrom ? vm.timeFrom.toISOString() : null);
                    updateCookie('promofarmaTimeTo', vm.timeTo ? vm.timeTo.toISOString() : null);

				}

				function updateCookie(cookieName, cookieValue){
					if( cookieValue ){
						$cookies.put( cookieName, cookieValue );
					} else {
						$cookies.remove( cookieName );
					}
				}

				$scope.resetOrderBy=function(){
					$cookies.remove( 'sortingKeyPromofarma' );
					$cookies.remove( 'sortingValuePromofarma' );
					vm.promofarmaTable.sorting({id:'desc'});
					vm.promofarmaTable.reload();
				   };


				/**
				 * Reset search
				 */
				vm.reset = function(){
					if(!$scope.lockedMode) {
                    	vm.companies = null;
                    	vm.timeFrom = null;
                        vm.timeTo = null;
                    }
					vm.medicineDescription = null;
					vm.aic = null;
					vm.boxDescription = null;				
					vm.reimbursementClass = null;
					vm.atc = null;
					vm.transparency = null;
					vm.orphan = null;
					vm.patented = null;
					vm.region = null;
					vm.asl = null;
					updateFiltersCookies();
					$scope.resetOrderBy();
				};
				
				
				vm.getRegionName = function(regionCode) {
					if($scope.filters['region'].length > 0){
						var region = $scope.filters['region'].find(item => item.object === regionCode)
						return region.label;
					}
				}
					
				/**
				 * Funzione associata al pulsante esporta per l'export in excel.
				 * Chiama il servizio rest export
				 */
				vm.exportReport = function(form) {
					vm.filtersForm = form;
                    var obj = {
                        filters: getFilters(),
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

                function getFilters() {
                    var filters = {
                        companies: vm.companies ? vm.companies : null,
                        medicineDescription: vm.medicineDescription ? vm.medicineDescription : null,
                        aic: vm.aic ? vm.aic : null,
                        boxDescription: vm.boxDescription ? vm.boxDescription : null,
                        reimbursementClass: vm.reimbursementClass != null && vm.reimbursementClass.length !== 0 ? vm.reimbursementClass : null,
                        atc: vm.atc != null && vm.atc.length !== 0 ? vm.atc : null,
                        transparency: vm.transparency != null ? vm.transparency : null,
                        orphan: vm.orphan != null ? vm.orphan : null,
                        patented: vm.patented != null ? vm.patented : null,
                        region: vm.region != null && vm.region.length !== 0 ? vm.region : null,
                        asl: vm.asl ? vm.asl : null,
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
				vm.promofarmaTable = new NgTableParams({
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
									'property' : sortingKey ? sortingKey : '',
									'direction' : sortingValue ? sortingValue.toUpperCase() : null,
								}
							];
							//enable loading spinner
							vm.isLoading = true;
							//object for api rest
							var obj = {
								start : ( page - 1 ) * count,
								length : count,
								search : '',
								filters: getFilters(),
							};
							if ( sortingKey ) {
								obj.order = order;
								$cookies.put( 'sortingKeyPromofarma', order[0].property );
								$cookies.put( 'sortingValuePromofarma', order[0].direction );
							}

							 var data = null; 
                            //rendering data
                            data = getData( obj ).then( function ( result ) {
                                params.total( result.total );
                                rowActionsObjects(result.data);
                                vm.isLoading = false;
                                return result.data;
                            });

							return data;
						}
					});

				
				/**
                 * Funzione per recuperare i dati per popolare la NGTable 
                 */
                function getData(obj) {
                    var deferred = $q.defer();
                    if(vm.showData && vm.companies) {
                        if (!$scope.lockedMode && (!vm.filtersForm || vm.filtersForm.$invalid)) {
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
				
                // start search immediately if filters are locked
                if ($scope.lockedMode) {
                    // updateFiltersCookies();
                	vm.promofarmaTable.page(1);
                	vm.promofarmaTable.reload();
                }
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