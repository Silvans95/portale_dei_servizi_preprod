/**
 * @ngdoc function
 * @name sphaSearchMEAsCtrl
 * @description controller for search MEAs
 * # sphaSearchMEAsCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaSearchMEAsCtrl',
            ['PropertiesServiceSpha', 'cityServicesSpha', '$rootScope', '$stateParams', '$state', '$scope', '$window',
                '$cookies', '$q', '$translate', 'httpServices', 'NgTableParams', '$uibModal', '$filter', 'SweetAlert',
                'shareDataServices', 'sphaProcedureInstanceServices', 'sphaCompanyServices', 'sphaPossibleValueServices', 'sphaMeasServices',
                function (PropertiesServiceSpha, cityServicesSpha,
                          $rootScope, $stateParams, $state, $scope, $window, $cookies, $q, $translate, httpServices,
                          NgTableParams, $uibModal, $filter, SweetAlert,
                          shareDataServices, sphaProcedureInstanceServices, sphaCompanyServices, sphaPossibleValueServices, sphaMeasServices ) {
                    var vm = this;
                    
                    var firstLoad = true;
                    var procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
                    const tableType = 'FLUSSO_MEAS';

                    $scope.actions = {
                    		'EXPORT': false,
                    		'VIEW': false,
                    }
                    //URLS
                    var apiAnagraphicUrl = PropertiesServiceSpha.get("baseUrlAnagraphic");

                    var searchUrl = apiAnagraphicUrl + "api/meas/list";
                    var exportUrl = apiAnagraphicUrl + "api/meas/export";
                    

                    var alertDataPagamentoDifference = {
                        title: $translate.instant("ERROR"),
                        text: $translate.instant("DIFFERENCE_ERROR"),
                        type: "error",
                        closeOnConfirm: true,
                        closeOnCancel: true,
                    };

                    vm.message = "";
                    vm.result = $stateParams.result;
                    vm.isLoading = false;
                    vm.filtersForm = null;
                    vm.companies = null;
                    vm.reimbursementClass = null;
                    vm.atc = null;
                    vm.fieldsToNotShow = null;
                    vm.showData = true
                    
                    sphaMeasServices.getDataVisibilityRule(function (data, errors) {
                        if (errors && errors.message) {
                            vm.message = errors.message
                            vm.alertClass = errors.alertClass;
                            vm.showData = false;
                        } else if (data && data.fieldsToNotShow) {
                            vm.fieldsToNotShow = data.fieldsToNotShow;
                        }
                    });

                    $scope.datesOptions = {
                        'FIRST_MARKETING_FROM' : {
                            opened: false
                        },
                        'FIRST_MARKETING_TO' : {
                            opened: false
                        },
                        'PAYMENT_FROM' : {
                        	opened: false,
                            datepickerOptions: {}
                        }, 
                        'PAYMENT_TO' : {
                        	opened: false,
                            datepickerOptions: {}
                        }
                    };
                    


                    // Init Filters' domains
                    $scope.filters = {
                        companies: {elements: [], page: 0},
                        reimbursementClass: {elements: [], page: 0, valueType: "reimbursementClass"},
                        atc: {elements: [], page: 0, valueType: "atc"},
                        transparency: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
                        orphan: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
                        patented: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
                        agreementType:{elements: [], page: 0, valueType: "agreementType"},
                        region: [],
                        asl: [],
                        paymentFrom: [],
                        paymentTo: [],
                        aic: [],
                    };

                    /** Get massive action by user 
                     * 
                     */
                    $scope.getMassiveActionByUser = function() {
                    	sphaMeasServices.getMassiveActionByUser( function(data,error) {
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
                        atc: {atc: [], valueType:"atc"},
                        agreementType: {agreementType: [], valueType:"agreementType"}
                    }
                    
                    
                    $scope.getCompaniesPossibleValues = function (page,search, form) {
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
                                    if (firstLoad) {
                                        vm.submitSearch(form);
                                        firstLoad = false;
                                    }
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

                    //Recupero i filtri salvati nei cookies dalla pagina delle istanze o dalla stessa pagina
                    var sharedValue =  shareDataServices.get('instanceCompanies');
                    if( sharedValue ){
                        vm.companies = sharedValue;
                        $scope.lockedMode = true;
                    } else {
                        vm.companies = $cookies.get('measCompanies') ? JSON.parse($cookies.get('measCompanies')) : null;
                    }
                    if(vm.companies != null){
                        $scope.filtersRequest.companies.companies = (vm.companies);
                    }

                    sharedValue = shareDataServices.get('instanceValidMarketingFrom');
                    if (sharedValue) {
                        vm.paymentFrom = new Date(sharedValue);
                        $scope.datesOptions.PAYMENT_FROM.datepickerOptions.minDate = vm.paymentFrom;
                        $scope.datesOptions.PAYMENT_TO.datepickerOptions.minDate = vm.paymentFrom;
                        $scope.lockedMode = true;
                    } else {
                        vm.timeFrom = $cookies.get('measPaymentFrom') ? new Date($cookies.get('measPaymentFrom')) : null;
                    }
                    sharedValue = shareDataServices.get('instanceValidMarketingTo');
                    if (sharedValue) {
                        vm.paymentTo = new Date(sharedValue);
                        $scope.datesOptions.PAYMENT_FROM.datepickerOptions.maxDate = vm.paymentTo;
                        $scope.datesOptions.PAYMENT_TO.datepickerOptions.maxDate = vm.paymentTo;
                        $scope.lockedMode = true;
                    } else {
                        vm.paymentTo = $cookies.get('measPaymentTo') ? new Date($cookies.get('measPaymentTo')) : null;
                    }
                    
                    if($cookies.get('measClass')) {
                        vm.reimbursementClass =  JSON.parse($cookies.get('measClass'));
                    }
                    if($cookies.get('measAtc')) {
                        vm.atc =  JSON.parse($cookies.get('measAtc'));
                    }
                    
                    //la differenza fra payment date from e payment date è al massimo di 1 anno
                    function checkPaymentDateDiff() {
                        var valid = false;
                        if (vm.paymentFrom && vm.paymentTo) {
                            var diff = yearDiff(vm.paymentFrom, vm.paymentTo);
                            if (diff >= 0 && diff <= 1) {
                                valid = true;
                            } else {
                                valid = false;
                                if(!vm.filtersForm) {
                                    SweetAlert.swal(alertDataPagamentoDifference);
                                }
                            }
                        }
                        if(vm.filtersForm) {
                            vm.filtersForm['PAYMENT_TO'].$setValidity("diffdaterange", valid);
                            vm.filtersForm['PAYMENT_FROM'].$setValidity("diffdaterange", valid);
                        }
                    }
                    
                    /**
                     * Controllo su periodo dati da-a
                     */
                    $scope.validateDate = function(form, dateToValidate, dateName) {
                        vm.filtersForm = form;
                        if(vm.filtersForm) {
                            var valid = false;
                            if (sharedValue) {
                                var date = new Date(dateToValidate).setHours(0, 0, 0, 0);
                                valid = date >= $scope.datesOptions[dateName].datepickerOptions.minDate.setHours(0, 0, 0, 0) && date <= $scope.datesOptions[dateName].datepickerOptions.maxDate.setHours(0, 0, 0, 0);
                                vm.filtersForm[dateName].$setValidity("required", !!dateToValidate);
                                vm.filtersForm[dateName].$setValidity("daterange", !!dateToValidate && valid);
                                if(valid) {
                                    checkPaymentDateDiff();
                                }
                            } else {
                                vm.filtersForm[dateName].$setValidity("perioddaterange", valid);
                                vm.filtersForm[dateName].$setValidity("perioddaterange", valid);
                            }
                        }
                    }


                    //Recupero i filtri salvati nei cookies
                    vm.medicineDescription = $cookies.get('measDescription') ? $cookies.get('measDescription') : null;
                    vm.aic = $cookies.get('measAic') ? $cookies.get('measAic') : null;
                    vm.boxDescription = $cookies.get('measBoxDescription') ? $cookies.get('measBoxDescription') : null;
                    vm.firstMarketingFrom = $cookies.get('measFirstMarketingFrom') ? new Date($cookies.get('measFirstMarketingFrom')) : null;
                    vm.firstMarketingTo = $cookies.get('measFirstMarketingTo') ? new Date($cookies.get('measFirstMarketingTo')) : null;
                    vm.transparency = $cookies.get('measTransparency') ? $cookies.get('measTransparency') == 'true' : null;
                    vm.orphan = $cookies.get('measOrphan') ? $cookies.get('measOrphan') == 'true' : null;
                    vm.patented = $cookies.get('measPatented') ? $cookies.get('measPatented') == 'true' : null;
                    vm.region = $cookies.get('measRegion') ? JSON.parse($cookies.get('measRegion')) : null;
                    vm.agreementType = $cookies.get('measAgreementType') ? JSON.parse($cookies.get('measAgreementType')) : null;
                    vm.asl = $cookies.get('measAsl') ? $cookies.get('measAsl') : null;

                    var initialSortingKey = $cookies.get('sortingKeyMeas') ? $cookies.get('sortingKeyMeas') : 'id';
                    var initialSortingDirection = $cookies.get('sortingValueMeas') ? $cookies.get('sortingValueMeas') : 'desc';


                    cityServicesSpha.getRegions(function (response) {
                        if (response) {
                            $scope.filters['region'] = response;
                        }
                    });
                    
                    vm.getRegionCode = function(regionName) {
    					if($scope.filters['region'].length > 0){
    						var region = $scope.filters['region'].find(item => item.label.toLowerCase() === regionName.toLowerCase())
    						return region.object;
    					}
    				}

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
                    };

                    vm.goToTop = function () {
                        document.documentElement.scrollTop = 0;
                    }

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
                        vm.measTable.page(1);
                        vm.measTable.reload();
                    };


                    function updateFiltersCookies() {
                        //updateCookie('measId', vm.id);
                        updateCookie('measCompanies', vm.companies ? JSON.stringify(vm.companies) : null);
                        updateCookie('medicineDescription', vm.medicineDescription);
                        updateCookie('measAic', vm.aic);
                        updateCookie('measBoxDescription', vm.boxDescription);
                        updateCookie('measFirstMarketingFrom', vm.firstMarketingFrom ? vm.firstMarketingFrom.toISOString() : null);
                        updateCookie('measFirstMarketingTo', vm.firstMarketingTo ? vm.firstMarketingTo.toISOString() : null);
                        updateCookie('measPaymentFrom', vm.paymentFrom ? vm.paymentFrom.toISOString() : null);
                        updateCookie('measPaymentTo', vm.paymentTo ? vm.paymentTo.toISOString() : null);
                        updateCookie('measReimbursementClass', vm.reimbursementClass ? JSON.stringify(vm.reimbursementClass) : null);
                        updateCookie('measAtc', vm.atc ? JSON.stringify(vm.atc) : null);
                        updateCookie('measTransparency', vm.transparency);
                        updateCookie('measOrphan', vm.orphan);
                        updateCookie('measPatented', vm.patented);
                        updateCookie('measAgreementType', vm.agreementType ? JSON.stringify(vm.agreementType) : null);
                        updateCookie('measRegion', vm.region ? JSON.stringify(vm.region) : null);
                        updateCookie('measAsl', vm.asl);


                    }

                    function updateCookie(cookieName, cookieValue) {
                        if (cookieValue) {
                            $cookies.put(cookieName, cookieValue);
                        } else {
                            $cookies.remove(cookieName);
                        }
                    }

                    $scope.resetOrderBy = function () {
                        $cookies.remove('sortingKeyMeas');
                        $cookies.remove('sortingValueMeas');
                        vm.measTable.sorting({id: 'desc'});
                        vm.measTable.reload();
 				   };


                    /**
                     * Reset search
                     */
                    vm.reset = function () {
                    	if(!$scope.lockedMode) {
                        	vm.companies = null;
                        	vm.paymentFrom = null;
                            vm.paymentTo = null;
                        }
                        vm.medicineDescription = null;
                        vm.aic = null;
                        vm.boxDescription = null;
                        vm.firstMarketingFrom = null;
                        vm.firstMarketingTo = null;
                        vm.reimbursementClass = null;
                        vm.atc = null;
                        vm.transparency = null;
                        vm.orphan = null;
                        vm.patented = null;
                        vm.agreementType = null;
                        vm.region = null;
                        vm.asl = null;
                        updateFiltersCookies();
                        $scope.resetOrderBy();
                    };

                    /**
                     * Funzione associata al pulsante esporta per l'export in excel.
                     * Chiama il servizio rest export
                     */
                    vm.exportReport = function (form) {
                        vm.filtersForm = form;
                        var obj = {
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

                    };

                    $scope.openDatePopup = function (dateField) {
                        $scope.datesOptions[dateField].opened = !$scope.datesOptions[dateField].opened;
                    };

                    // se l'elemento del form è invalido -> bordo rosso


                    /**
                     * Set shared data between controllers
                     */
                    vm.setObject = function (objectRow) {
                        // TODO gestire meglio max e min date
                        var medicineDetailInputParams = {
                            aic9 : objectRow.aic9,
                            companies: vm.companies,
                            dataImportIds: [objectRow.medicineDataImportId]
                        };
                        shareDataServices.set(medicineDetailInputParams, 'ANAGRAPHIC_DETAIL_PARAMS');
                    };


                    /**
                     * Export
                     */
                    vm.exportRecord = function () {
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
                     * Actions callback
                     * @param {*} action Action name
                     * @param {*} aic9 Action object
                     */
                    $scope.onActionCallback = function (action, row) {
                        shareDataServices.delete('MEDICINE_DETAIL_CAN_EDIT');
                        switch (action) {
                            case 'VIEW':
                                vm.setObject(row.object);
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

                    function getFilters() {
                        var filters = {
                            companies: vm.companies ? vm.companies : null,
                            medicineDescription: vm.medicineDescription ? vm.medicineDescription : null,
                            aic9: vm.aic ? vm.aic : null,
                            boxDescription: vm.boxDescription ? vm.boxDescription : null,
                            firstMarketingFrom: vm.firstMarketingFrom ? vm.firstMarketingFrom : null,
                            firstMarketingTo: vm.firstMarketingTo ? vm.firstMarketingTo : null,
                            paymentFrom: vm.paymentFrom ? vm.paymentFrom : null,
                            paymentTo: vm.paymentTo ? vm.paymentTo : null,
                            reimbursementClass: vm.reimbursementClass != null && vm.reimbursementClass.length !== 0 ? vm.reimbursementClass : null,
                            atc: vm.atc != null && vm.atc.length !== 0 ? vm.atc : null,
                            transparency: vm.transparency != null ? vm.transparency : null,
                            orphan: vm.orphan != null ? vm.orphan : null,
                            patented: vm.patented != null ? vm.patented : null,
                            agreementType: vm.agreementType != null && vm.agreementType.length !== 0 ? vm.agreementType : null,
                            region: vm.region != null && vm.region.length !== 0 ? vm.region : null,
                            asl: vm.asl ? vm.asl : null,
                            dataImportIds: []
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
                    vm.measTable = new NgTableParams({
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
                                filters: getFilters(),
                            };
                            if (sortingKey) {
                                obj.order = order;
                                $cookies.put('sortingKeyMeas', order[0].property);
                                $cookies.put('sortingValueMeas', order[0].direction);
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

                    /**Calcolo della differenza fra date, il risultato è in anni (intero)**/
                    function yearDiff(first, second) {
                        if (second && first) {
                            return (second - first) / (1000 * 60 * 60 * 24 * 365);
                        } else {
                            return 0;

                        }
                    }


                    // start search immediately if filters are locked
                    if ($scope.lockedMode) {
                        // updateFiltersCookies();
                        vm.measTable.page(1);
                        vm.measTable.reload();
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
                    
                    function customFormValidation() {
                        if(vm.filtersForm) {
                            $scope.validateDate(vm.filtersForm, vm.paymentFrom, "PAYMENT_FROM");
                            $scope.validateDate(vm.filtersForm, vm.paymentTo, "PAYMENT_TO");
                        } else {
                            checkPaymentDateDiff();
                        }
                    }

                    /**
                     * Funzione per recuperare i dati per popolare la NGTable 
                     */
                    function getData(obj) {
                        var deferred = $q.defer();
                        // chek filters before request
                        if(vm.companies && vm.paymentFrom && vm.paymentTo) {
                            customFormValidation();

                            if (vm.showData && vm.filtersForm && vm.filtersForm.$valid) {
                                if (!$scope.lockedMode && (!vm.filtersForm || vm.filtersForm.$invalid)) {
                                    deferred.resolve({data: null,total: 0});
                                } else {
                                    httpServices.post(searchUrl, obj, function (data, success, error) {
                                        if (success) {
                                            if (error) {
                                                vm.message = error.message ? error.message : error;
                                                vm.alertClass = error.alertClass;
                                                deferred.resolve({data: null,total: 0});
                                            } else {
                                                deferred.resolve({
                                                    data: data.items,
                                                    total: data.total,
                                                });
                                                vm.message = null;
                                                vm.alertClass = null;
                                            }
                                        } else {
                                            vm.message = error.message ? error.message : error;
                                            vm.alertClass = "alert alert-danger";
                                            deferred.resolve({data: null,total: 0});
                                        }
                                    });
                                }
                            } else {
                                deferred.resolve({data: null, total: 0});
                            }
                        } else {
                            deferred.resolve({data: null, total: 0});
                        }
                        return deferred.promise;
                    }

                    vm.goBack = function () {
                        if ($rootScope.goBack) {
                            $state.go($rootScope.goBack);
                        } else {
                            $window.history.back();
                        }
                    };
                    
                    if(shareDataServices.get('resetConfigs') && 
                        shareDataServices.get('resetConfigs')[$state.current.name] && 
                        shareDataServices.get('resetConfigs')[$state.current.name].resetFilters === true) {
                        var resetConfigs = shareDataServices.get('resetConfigs');
                        vm.reset();
                        resetConfigs[$state.current.name].resetFilters= false;
                        shareDataServices.set(resetConfigs, 'resetConfigs')
                    }
                }
            ]);
})();
