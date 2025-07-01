/**
 * @ngdoc function
 * @name sphaSearchMedicineCtrl
 * @description controller for search procedimenti
 * # sphaSearchMedicineCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaSearchScadenzeBrevettuali',
            ['PropertiesServiceSpha','sphaPossibleValueServices', '$rootScope', '$stateParams', '$state', '$scope', '$cookies', '$window', '$q', '$translate', 'httpServices', 'NgTableParams', '$uibModal', '$filter', 'SweetAlert', 'sphaPatentExpirationServices', 'shareDataServices',
                function (PropertiesServiceSpha, sphaPossibleValueServices, $rootScope, $stateParams, $state, $scope, $cookies, $window, $q, $translate, httpServices, NgTableParams, $uibModal, $filter, SweetAlert, sphaPatentExpirationServices, shareDataServices) {
                    var vm = this;

                    $scope.actions = {
                    		'EXPORT': false,
                    		'VIEW': false,
                    }
                    //URLS
                    var apiAnagraphicUrl = PropertiesServiceSpha.get("baseUrlAnagraphic");
                    
                    var searchUrl = apiAnagraphicUrl + "api/patents-expiration/list";

                    var exportCsvUrl = apiAnagraphicUrl + "api/patents-expiration/export";
                    var exportPdfUrl = apiAnagraphicUrl + "api/patents-expiration/report";
                    

                    vm.message = "";
                    vm.result = $stateParams.result;
                    vm.isLoading = false;
                    vm.filtersForm = null;
                    vm.atc = null;
                    vm.fieldsToNotShow = null;
                    vm.showData = true;
                    
                    sphaPatentExpirationServices.getDataVisibilityRule(function (data, errors) {
                        vm.showData = true;
                        if (errors && errors.message) {
                            vm.message = errors.message
                            vm.alertClass = errors.alertClass;
                            vm.showData = false;
                        } else if (data && data.fieldsToNotShow) {
                            vm.fieldsToNotShow = data.fieldsToNotShow;
                        }
                    });
                    
                    $scope.canRectify= false;
                    $scope.canImport = false;
                    
                    /** Get massive action by user 
                     * 
                     */
                    $scope.getMassiveActionByUser = function() {
                    	sphaPatentExpirationServices.getMassiveActionByUser( function(data,error) {
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
                    
                    $scope.exportTypes = [{value: 0, label: 'EXPORT_CSV'}, {value: 1, label: 'EXPORT_PDF'}];

                    vm.exportType = null;
                    
                    vm.switchExportType = function(form,type) {
                        SweetAlert.swal({
                            title: $translate.instant("CONFIRM_EXPORT_TYPE_SELECTED") + $translate.instant($scope.exportTypes[type].label) + "?",
                            text: null,
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#337ab7",
                            confirmButtonText: $translate.instant('YES'),
                            cancelButtonText: $translate.instant('NO'),
                            closeOnConfirm: true,
                            closeOnCancel: true,
                        }, function (isConfirm) {
                            if (isConfirm) {
                            	vm.exportReport(form,type);
	                           }
	                        }
	                    );
                    }
                    // Init Filters' domains
                    $scope.filters = {
                        patented: [{ value: true, label: 'YES' }, { value: false, label: 'NO' }],
                    };
                                        //Recupero i filtri salvati nei cookies
                    vm.activeIngredient = $cookies.get('patentsExpirationActiveIngredient') ? $cookies.get('patentsExpirationActiveIngredient') : null;
                    vm.atc = $cookies.get('patentsExpirationAtc') ? $cookies.get('patentsExpirationAtc') : null;
                    vm.patented = $cookies.get('patentsExpirationPatented') ? $cookies.get('patentsExpirationPatented') : null;
                    vm.patentExpireDate = $cookies.get('patentsExpirationExpirationDate') ? new Date($cookies.get('patentsExpirationExpirationDate')) : null;
                    vm.ccpExpireDate = $cookies.get('patentsExpirationExpirationDateCCP') ? new Date($cookies.get('patentsExpirationExpirationDateCCP')) : null;
                    
    				vm.goToTop = function() {
    					document.documentElement.scrollTop = 0;
    				}
    				
    				/**
    				 * Date Pickers
    				 */
    				$scope.datesOptions = {
    					'EXPIRATION_DATA' : {
    						opened: false
    					},
    					'EXPIRATION_DATA_CCP' : {
    						opened: false
    					}
    				};
    				
    				$scope.openDatePopup = function(dateField) {
    					$scope.datesOptions[dateField].opened = !$scope.datesOptions[dateField].opened;
    				};
    				
                    vm.goBack = function () {
                        if ($rootScope.goBack) {
                            $state.go($rootScope.goBack);
                        } else {
                            $window.history.back();
                        }
                    };
                    vm.exportReport = function (form,type) {
    					vm.filtersForm = form;
                        var obj = {
                            filters: {
                            	atc: vm.atc != null ? vm.atc : null,
                                patented: vm.patented,
                                activeIngredient: vm.activeIngredient ? vm.activeIngredient : null,
                                activeIngredientDescription: vm.activeIngredientDescription ? vm.activeIngredientDescription : null,
                                patentExpireDate: vm.patentExpireDate ? vm.patentExpireDate : null,
                                ccpExpireDate: vm.ccpExpireDate ? vm.patentExpireDate : null,
                            },
                        };
                        
                        exportData(obj,type).then(function (result) {
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
                    };

                    var initialSortingKey = $cookies.get('sortingKeyPatentsExpiration') ? $cookies.get('sortingKeyPatentsExpiration') : 'atc';
                    var initialSortingDirection = $cookies.get('sortingValuePatentsExpiration') ? $cookies.get('sortingValuePatentsExpiration') : 'desc';

                    


                    // se l'elemento del form è invalido -> bordo rosso
                    $scope.addClass = function (idField, form) {
                        if (!$scope.readOnly && form && form[idField] && form[idField].$invalid) {
                            return 'has-errors';
                        }
                        return '';
                    }

                    /**
                     * Funzione per il submit della ricerca tramite input
                     */
                    vm.submitSearch = function (form) {
                        updateFiltersCookies();
                        vm.filtersForm = form;
                        vm.patentsExpirationTable.page(1);
                        vm.patentsExpirationTable.reload();
                    };

                    function updateFiltersCookies() {
                    	updateCookie('patentsExpirationAtc',  vm.atc);
                        updateCookie('patentsExpirationPatented', vm.patented);
                        updateCookie('patentsExpirationActiveIngredient', vm.activeIngredient);
                        updateCookie('patentsExpirationExpirationDate', vm.patentExpireDate ? vm.patentExpireDate.toISOString() : null);
                        updateCookie('patentsExpirationExpirationDateCCP', vm.ccpExpireDate ? vm.ccpExpireDate.toISOString() : null);
                    }

                    function updateCookie(cookieName, cookieValue) {
                        if (cookieValue) {
                            $cookies.put(cookieName, cookieValue);
                        } else {
                            $cookies.remove(cookieName);
                        }
                    }

                    $scope.resetOrderBy = function () {
                        $cookies.remove('sortingKeyPatentsExpiration');
                        $cookies.remove('sortingValuePatentsExpiration');
                        vm.patentsExpirationTable.sorting({ atc: 'desc' });
                        vm.patentsExpirationTable.reload();
 				   };
   

                    /**
                     * Actions callback
                     * @param {*} action Action name
                     * @param {*} patentNumber Action object
                     */
                    $scope.onActionCallback = function (action, row) {
                        switch (action) {
                            default:
                                alert('Hai premuto ' + action + ' sulla riga ' + row.object.patentNumber);
                               
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
                     * Reset search
                     */
                    vm.reset = function () {
                    	vm.atc = null;
                        vm.patented = null;
                        vm.activeIngredient = null;
                        vm.patentExpireDate = null;
                        vm.ccpExpireDate = null;
                        updateFiltersCookies();
                        $scope.resetOrderBy();
                    };

                    /**
                     * Inizializzazione NGTable
                     */
                    vm.patentsExpirationTable = new NgTableParams({
                        page: 1,
                        count: 10,
                        sorting: {
                            [initialSortingKey]: initialSortingDirection.toLowerCase(),
                        }
                    }, {
                        enableRowSelection: true,
                        //number of element option to visualize for page
                        counts: [5, 10, 25, 50],
                        //get data : server side processing
                        getData: function (params) {
                            //for filtering data
                            var filter = params.filter();
                            //count of element
                            var count = params.count();
                            //page
                            var page = params.page();
                            //sorting
                            var sorting = params.sorting();
                            var sortingKey = Object.keys(sorting)[0];
                            var sortingValue = sortingKey ? sorting[sortingKey] : null;
                            var order = [{
                                "property": sortingKey ? sortingKey : '',
                                "direction": sortingValue ? sortingValue.toUpperCase() : null,
                            }
                            ];
                            //enable loading spinner
                            vm.isLoading = true;
                            //object for api rest
                            var obj = {
                                start: (page - 1) * count,
                                length: count,
                                search: "",
                                filters: {
                                	atc: vm.atc != null ? vm.atc : null,
                                    patented: vm.patented,
                                    activeIngredient: vm.activeIngredient ? vm.activeIngredient : null,
                                    patentExpireDate: vm.patentExpireDate ? vm.patentExpireDate : null,
                                    ccpExpireDate: vm.ccpExpireDate ? vm.ccpExpireDate : null,
                                },
                            };
                            if (sortingKey) {
                                obj.order = order;
                                $cookies.put('sortingKeyPatentsExpiration', order[0].property);
                                $cookies.put('sortingValuePatentsExpiration', order[0].direction);
                            }

                            var data = null; 
                            //rendering data
                            data = getData(obj).then(function (result) {
                                params.total(result.total);
                                rowActionsObjects(result.data);
                                vm.isLoading = false;
                                return result.data;
                            });
                            return data;
                        }
                    });
                    /**
                     * Funzione per esportare i dati
                     */
                    function exportData(obj,type) {
                        var deferred = $q.defer();

                        var exportUrl = null;
                        if(type == 0) {
                        	exportUrl = exportCsvUrl;
                        } else {
                        	exportUrl = exportPdfUrl;
                        }
                        
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
                        if(vm.showData && vm.atc) {
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
                                        deferred.resolve({data: null,total: 0});
                                        vm.message = error;
                                        vm.alertClass = "alert alert-danger";
                                    }
                                });
                            }
                        } else {
                            deferred.resolve({data: null,total: 0});
                        }
                        return deferred.promise;
                    }
                    
                    if(shareDataServices.get('resetConfigs') && 
                        shareDataServices.get('resetConfigs')[$state.current.name] && 
                        shareDataServices.get('resetConfigs')[$state.current.name].resetFilters === true) {
                        var resetConfigs = shareDataServices.get('resetConfigs');
                        vm.reset();
                        resetConfigs[$state.current.name].resetFilters= false;
                        shareDataServices.set(resetConfigs, 'resetConfigs');
                    }
                }
            ]);
})();
