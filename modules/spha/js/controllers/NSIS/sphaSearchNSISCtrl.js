/**
 * @ngdoc function
 * @name sphaSearchNSISCtrl
 * @description controller for search procedimenti
 * # sphaSearchNSISCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaSearchNSISCtrl',
            ['PropertiesServiceSpha', 'sphaPossibleValueServices', 'cityServicesSpha', 'sphaCompanyServices', 
                '$rootScope', '$stateParams', '$state', '$scope', '$window', '$cookies', '$q', '$translate', 'httpServices', 'NgTableParams',
                '$uibModal', 'shareDataServices', '$filter', 'SweetAlert', 'sphaNsisServices', 'sphaProcedureInstanceServices',
                function (PropertiesServiceSpha, sphaPossibleValueServices, cityServicesSpha, sphaCompanyServices, 
                          $rootScope, $stateParams, $state, $scope, $window, $cookies, $q, $translate, httpServices, NgTableParams, 
                          $uibModal, shareDataServices, $filter, SweetAlert, sphaNsisServices, sphaProcedureInstanceServices) {
                    var vm = this;
                    var procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
			        const tableType = 'FLUSSO_NSIS';

                    $scope.actions = {
                    		'EXPORT': false,
                    		'VIEW': false,	
                    }
                    //URLS
                    var apiAnagraphicUrl = PropertiesServiceSpha.get("baseUrlAnagraphic");
                    var searchUrl = apiAnagraphicUrl + "api/nsis/list";
                    var medicinesUrl = apiAnagraphicUrl + "api/medicines/list";
                    var exportUrl = apiAnagraphicUrl + "api/nsis/export";
                    var hyperlink = "https://testnew.coll.aifa.gov.it/jam/saml2/jsp/idpSSOInit.jsp?metaAlias=/idp&spEntityID=https://nsis.sanita.it/saml-federation-service/SAML2";
//				var userInfoUrl = "url_produzione/abilitazioni";

                    vm.message = "";
                    vm.result = $stateParams.result;
                    vm.isLoading = false;
                    vm.filtersForm = null;

                    vm.name = "nome";
                    vm.lastName = "cognome";
                    vm.codFisc = "codicefiscale";
                    vm.mail = "mail@test.it";
                    vm.birthPlace = "citta";
                    vm.birthDate = "";
                    vm.companies = null;
                    vm.reimbursementClass = null;
                    vm.atc = null;
                    vm.fieldsToNotShow = null;
                    vm.showData = true
                    
                    sphaNsisServices.getDataVisibilityRule(function (data, errors) {
                        if (errors && errors.message) {
                            vm.message = errors.message
                            vm.alertClass = errors.alertClass;
                            vm.showData = false;
                        } else if (data && data.fieldsToNotShow) {
                            vm.fieldsToNotShow = data.fieldsToNotShow;
                        }
                    });
                    
                    
                    /**
                     * Date Pickers
                     */
                    $scope.datesOptions = {
                        'FIRST_MARKETING_FROM': {
                            opened: false
                        },
                        'FIRST_MARKETING_TO': {
                            opened: false
                        },
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
                    
                    /** Get massive action by user 
                     * 
                     */
                    $scope.getMassiveActionByUser = function() {
                    	sphaNsisServices.getMassiveActionByUser( function(data,error) {
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
                    // Init Filters' domains
                    $scope.filters = {
                        companies: {elements: [], page: 0},
                        reimbursementClass: {elements: [], page: 0, valueType: "reimbursementClass"},
                        atc: {elements: [], page: 0, valueType: "atc"},
                        transparency: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
                        orphan: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
                        patented: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
                        erogationChannel: {elements: [], page: 0, valueType: "erogationChannel"},
                        region: []
                    };
                    //TODO da rimuovere validProcedureTo in futuro
                    $scope.filtersRequest = {
                        companies: {companies: [], validProcedureTo: "2300-01-21T00:00:00.000Z"},
                        reimbursementClass: {reimbursementClass: [], valueType: "reimbursementClass"},
                        atc: {atc: [], valueType:"atc"},
                        erogationChannel: {erogationChannel: [],valueType: "erogationChannel"}
                    }
                    
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
                    
                    $scope.getColorForInvoice = function (totInvoice, salesValueTrack, toInvoiceIsVisible) {
                		if (toInvoiceIsVisible && (totInvoice != salesValueTrack) ) {
                    		return '#ff0015';
                		}  else return '';
                    }

                    
                    //Recupero i filtri salvati nei cookies dalla pagina delle istanze o dalla stessa pagina
                    var sharedValue = shareDataServices.get('instanceCompanies');
                    if (sharedValue) {
                        vm.companies = Array.isArray(sharedValue) ? sharedValue[0] : sharedValue;
                        $scope.lockedMode = true;
                    } else if($cookies.get('nsisCompanies') ){
                        vm.companies = JSON.parse($cookies.get('nsisCompanies'));
                    }
                    
                    sharedValue = shareDataServices.get('instanceValidMarketingFrom');
                    if (sharedValue) {
                        vm.timeFrom = new Date(sharedValue);
                        $scope.datesOptions.TIME_FROM.datepickerOptions.minDate = vm.timeFrom;
                        $scope.datesOptions.TIME_TO.datepickerOptions.minDate = vm.timeFrom;
                        $scope.lockedMode = true;
                    } else {
                        vm.timeFrom = $cookies.get('nsisTimeFrom') ? new Date($cookies.get('nsisTimeFrom')) : null;
                    }
                    sharedValue = shareDataServices.get('instanceValidMarketingTo');
                    if (sharedValue) {
                        vm.timeTo = new Date(sharedValue);
                        $scope.datesOptions.TIME_FROM.datepickerOptions.maxDate = vm.timeTo;
                        $scope.datesOptions.TIME_TO.datepickerOptions.maxDate = vm.timeTo;
                        $scope.lockedMode = true;
                    } else {
                        vm.timeTo = $cookies.get('nsisTimeTo') ? new Date($cookies.get('nsisTimeTo')) : null;
                    }

                    if($cookies.get('nsisReimbursementClass')) {
                        vm.reimbursementClass =  JSON.parse($cookies.get('nsisReimbursementClass'));
                    }
                    if($cookies.get('nsisAtc')) {
                        vm.atc =  JSON.parse($cookies.get('nsisAtc'));
                    }
                    if($cookies.get('nsisErogationChannel')) {
                        vm.erogationChannel =  JSON.parse($cookies.get('nsisErogationChannel'));
                    }
                    if(vm.companies != null){
                        $scope.filtersRequest.companies.companies = Array.isArray(vm.companies) ? vm.companies : [vm.companies];
                    }
                    if(vm.atc != null){
                        $scope.filtersRequest.atc.atc = (vm.atc);
                    }
                    if(vm.reimbursementClass != null){
                        $scope.filtersRequest.reimbursementClass.reimbursementClass = (vm.reimbursementClass);
                    }
                    if(vm.erogationChannel != null) {
                    	$scope.filtersRequest.erogationChannel.erogationChannel = (vm.erogationChannel);
                    }

                    //Recupero i filtri salvati nei cookies
                    vm.id = $cookies.get('nsisId') ? $cookies.get('nsisId') : null;
                    vm.medicineDescription = $cookies.get('nsisDescription') ? $cookies.get('nsisDescription') : null;
                    vm.aic9 = $cookies.get('nsisAic') ? $cookies.get('nsisAic') : null;
                    vm.boxDescription = $cookies.get('nsisBoxDescription') ? $cookies.get('nsisBoxDescription') : null;
                    vm.firstMarketingFrom = $cookies.get('nsisFirstMarketingFrom') ? new Date($cookies.get('nsisFirstMarketingFrom')) : null;
                    vm.firstMarketingTo = $cookies.get('nsisFirstMarketingTo') ? new Date($cookies.get('nsisFirstMarketingTo')) : null;
                    vm.transparency = $cookies.get('nsisTransparency') ? $cookies.get('nsisTransparency') == 'true' : null;
                    vm.orphan = $cookies.get('nsisOrphan') ? $cookies.get('nsisOrphan') == 'true' : null;
                    vm.patented = $cookies.get('nsisPatented') ? $cookies.get('nsisPatented') == 'true' : null;
                    vm.region = $cookies.get('nsisRegion') ? JSON.parse($cookies.get('nsisRegion')) : null;
                    

                    var initialSortingKey = $cookies.get('sortingKeyNSIS') ? $cookies.get('sortingKeyNSIS') : 'id';
                    var initialSortingDirection = $cookies.get('sortingValueNSIS') ? $cookies.get('sortingValueNSIS') : 'desc';


                    cityServicesSpha.getRegions(function (response) {
                        if (response) {
                            $scope.filters['region'] = response;
                        }
                    });

                    vm.getRegionName = function(regionCode) {
    					if($scope.filters['region'].length > 0){
    						var region = $scope.filters['region'].find(item => item.object === regionCode)
    						return region.label;
    					}
    				}
                    // Mapping Search Filters Response to Filter Domain
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
                     * Funzione associata al pulsante esporta per l'export in excel.
                     * Chiama il servizio rest export
                     */
                    vm.exportReport = function (form) {
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

                    };
                    vm.goToTop = function () {
                        document.documentElement.scrollTop = 0;
                    }
                    
                    $scope.openDatePopup = function (dateField) {
                        $scope.datesOptions[dateField].opened = !$scope.datesOptions[dateField].opened;
                    };

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
                        vm.NSISTable.page(1);
                        vm.NSISTable.reload();
                    };

                    vm.body = '\n' + $translate.instant("NAME") + vm.name +
                        $translate.instant("LAST_NAME") + vm.lastName +
                        $translate.instant("COD_FISC") + vm.codFisc +
                        $translate.instant("MAIL") + vm.mail +
                        $translate.instant("BIRTH_PLACE") + vm.birthPlace +
                        $translate.instant("BIRTH_DATE") + vm.birthDate + '\n\n';

                    var alert = {
                        title: $translate.instant("REDIRECT_TITLE"),
                        text: $translate.instant("BODY_TITLE") + vm.body + $translate.instant("REDIRECT_BODY_FOOTER"),
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#337ab7",
                        confirmButtonText: $translate.instant('CONFIRM_REDIRECT'),
                        cancelButtonText: $translate.instant('BACK_DASHBOARD'),
                        closeOnConfirm: true,
                        closeOnCancel: true,
                    };

                    vm.openHyperlink = function () {
                        SweetAlert.swal(alert, function (isConfirm) {
                            if (isConfirm) {
                                $window.open(hyperlink);
                            }
                        });
                    };

                    function updateFiltersCookies() {
                        updateCookie('medicineId', vm.id);
                        updateCookie('nsisCompanies', vm.companies ? JSON.stringify(vm.companies) : null);
                        updateCookie('medicineDescription', vm.medicineDescription);
                        updateCookie('nsisAic', vm.aic9);
                        updateCookie('nsisBoxDescription', vm.boxDescription);
                        updateCookie('nsisFirstMarketingFrom', vm.firstMarketingFrom ? vm.firstMarketingFrom.toISOString() : null);
                        updateCookie('nsisFirstMarketingTo', vm.firstMarketingTo ? vm.firstMarketingTo.toISOString() : null);
                        updateCookie('nsisReimbursementClass', vm.reimbursementClass ? JSON.stringify(vm.reimbursementClass) : null);
                        updateCookie('nsisAtc', vm.atc ? JSON.stringify(vm.atc) : null);
                        updateCookie('nsisTransparency', vm.transparency);
                        updateCookie('nsisOrphan', vm.orphan);
                        updateCookie('nsisPatented', vm.patented);
                        updateCookie('nsisErogationChannel', vm.erogationChannel ?  JSON.stringify(vm.erogationChannel) : null);
                        updateCookie('nsisRegion', vm.region ? JSON.stringify(vm.region) : null );
                        updateCookie('nsisTimeFrom', vm.timeFrom ? vm.timeFrom.toISOString() : null);
                        updateCookie('nsisTimeTo', vm.timeTo ? vm.timeTo.toISOString() : null);
                    }

                    function updateCookie(cookieName, cookieValue) {
                        if (cookieValue) {
                            $cookies.put(cookieName, cookieValue);
                        } else {
                            $cookies.remove(cookieName);
                        }
                    }

                    $scope.resetOrderBy = function () {
                        $cookies.remove('sortingKeyNSIS');
                        $cookies.remove('sortingValueNSIS');
                        vm.NSISTable.sorting({id: 'desc'});
                        vm.NSISTable.reload();
   				   };
   

                    /**
                     * Go to New Procedimento
                     */
                    vm.new = function () {
                        shareDataServices.set(vm.typeProcedimenti, 'Type-Procedimenti');
                        $state.go('spha.newProcedimenti');
                    };


                    /**
                     * Set shared data between controllers
                     */
                    vm.setObject = function (aic9) {
                        var detailInputParams = {
                            aic9: aic9,
                            validMarketingFrom: vm.timeFrom ? vm.timeFrom : new Date(1800,1), 
                            validMarketingTo: vm.timeTo ? vm.timeTo : new Date(),
                            companies: [vm.companies] 
                        };
                        shareDataServices.set(detailInputParams, 'ANAGRAPHIC_DETAIL_PARAMS');
                    };

                    /**
                     * Reset search
                     */
                    vm.reset = function () {
                    	vm.id = null;
                    	if(!$scope.lockedMode) {
                        	vm.companies = null;
                        	vm.timeFrom = null;
                            vm.timeTo = null;
                        }
                        vm.medicineDescription = null;
                        vm.aic9 = null;
                        vm.boxDescription = null;
                        vm.firstMarketingFrom = null;
                        vm.firstMarketingTo = null;
                        vm.reimbursementClass = null;
                        vm.atc = null;
                        vm.transparency = null;
                        vm.orphan = null;
                        vm.patented = null;
                        vm.erogationChannel = null;
                        vm.region = null;
                        updateFiltersCookies();
                        $scope.resetOrderBy();
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
                    
                    
                    function getFilters() {
                        var filters = {
                            companies: vm.companies ? [vm.companies] : null,
                            medicineDescription: vm.medicineDescription ? vm.medicineDescription : null,
                            aic9: vm.aic9 ? vm.aic9 : null,
                            boxDescription: vm.boxDescription ? vm.boxDescription : null,
                            firstMarketingFrom: vm.firstMarketingFrom ? vm.firstMarketingFrom : null,
                            firstMarketingTo: vm.firstMarketingTo ? vm.firstMarketingTo : null,
                            reimbursementClass: vm.reimbursementClass != null && vm.reimbursementClass.length !== 0 ? vm.reimbursementClass : null,
                            atc: vm.atc != null && vm.atc.length !== 0 ? vm.atc : null,
                            transparency: vm.transparency != null ? vm.transparency : null,
                            orphan: vm.orphan != null ? vm.orphan : null,
                            innovative: vm.innovative != null ? vm.innovative : null,
                            patented: vm.patented != null ? vm.patented : null,
                            erogationChannel: vm.erogationChannel != null && vm.erogationChannel.length !== 0 ? vm.erogationChannel : null,
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
                    vm.NSISTable = new NgTableParams({
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
                                $cookies.put('sortingKeyNSIS', order[0].property);
                                $cookies.put('sortingValueNSIS', order[0].direction);
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
                    }

                    /**
                     * Funzione per recuperare i dati per popolare la NGTable
                     */
                    function getData(obj) {
                        var deferred = $q.defer();

                        if(vm.companies) {
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
                    
                    /**
                     * Funzione per andare indietro
                     */
                    vm.goBack = function () {
                        if ($rootScope.goBack) {
                            $state.go($rootScope.goBack);
                        } else {
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
