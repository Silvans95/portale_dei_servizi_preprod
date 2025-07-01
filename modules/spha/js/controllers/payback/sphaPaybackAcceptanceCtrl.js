/**
 * @ngdoc function
 * @name sphaPaybackAcceptanceCtrl
 * @description controller for search payback data
 * # sphaPaybackAcceptanceCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaPaybackAcceptanceCtrl', sphaPaybackAcceptanceCtrl);

    sphaPaybackAcceptanceCtrl.$inject = ['$scope', 'NgTableParams', '$cookies',
        '$document', '$compile', '$q', '$state', '$rootScope', '$window', 'shareDataServices', 'sphaPaymentServices', 'sphaPaybackServices', 'loadingSpinnerService',
        'sphaUtilsServices', 'sphaCompanyServices', 'cityServicesSpha', 'httpServices', 'SweetAlert', '$translate', '$filter'];

    function sphaPaybackAcceptanceCtrl($scope, NgTableParams, $cookies,
        $document, $compile, $q, $state, $rootScope, $window, shareDataServices, sphaPaymentServices, sphaPaybackServices, loadingSpinnerService,
        sphaUtilsServices, sphaCompanyServices, cityServicesSpha, httpServices, SweetAlert, $translate, $filter) {

        var vm = this;
        vm.companies = null;
        vm.procedureInstanceDTO = null;
        vm.payments = null;
        vm.paymentData = null;
		vm.aic9checked = null;
        var sortingKeyCookie;
        var sortingValueCookie;


            vm.totMedicineAConv = 0.0;
            vm.totMedicineANonConv = 0.0;
            vm.totMedicineHNonConv = 0.0;
            vm.acceptanceMedicineAConv = 0.0;
            vm.acceptanceMedicineANonConv = 0.0;
            vm.acceptanceMedicineHNonConv = 0.0;
            vm.notAcceptanceMedicineAConv = 0.0;
            vm.notAcceptanceMedicineANonConv = 0.0;
            vm.notAcceptanceMedicineHNonConv = 0.0;
            vm.totalImport = 0.0;
            vm.acceptanceTotalImport = 0.0;
            vm.notAcceptanceTotalImport = 0.0;


        const states = {
            ACCEPTANCE: 'ACCETTATO',
            NOT_ACCEPTANCE: 'NON_ACCETTATO',
            PARTIALLY_ACCEPTANCE: 'ACCETTAZIONE_PARZIALE',
        };

        const revertedStates = {
            'ACCETTATO': 'ACCEPTANCE',
            'NON_ACCETTATO': 'NOT_ACCEPTANCE',
            'ACCETTAZIONE_PARZIALE': 'PARTIALLY_ACCEPTANCE',
        };

        vm.totals = {
            acceptance: {
                totalAmount: 0
            },
            notAcceptance: {
                totalAmount: 0
            },
            partialNotAcceptance: {
                totalAmount: 0
            },
            partialAcceptance: {
                totalAmount: 0
            }
        };

        // declare sorting keys
        var initialSortingKey = null; // from cookie
        var initialSortingDirection = null; // from cookie

        $scope.lockedMode = false;
        // Init Filters' domains
        $scope.filters = {
            companies: { elements: [], page: 0 },
        };

        $scope.filtersRequest = {
            companies: { companies: [] }
        };

        $scope.datiRiepilogativi = {};

        $scope.moduleOption = null;

        $scope.checkboxes = { 'checked': false, items: {} };

        $scope.changefield = function(val) {
            if (val === 'PARTIALLY_ACCEPTANCE') {
                vm.populateSubTables();
            }
        };
        /**
         * 
         * @param page page
         * @param search search
         */
        $scope.getCompaniesPossibleValues = function (page, search) {
            if (!page) {
                $scope.filters.companies.elements = [];
            }
            $scope.filters.companies.page = page;

            var companies = ($scope.filtersRequest.companies.companies != null &&
                $scope.filtersRequest.companies.companies.length > 0) ?
                $scope.filtersRequest.companies.companies : null;

            sphaCompanyServices.getPossibleValues(page, { companies: companies }, search,
                function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        sphaUtilsServices.mapSearchFilterResponse([data], $scope.filters);
                        // vm.companyName = data.options[0].label;
                    }
                });
        };

        $scope.resetOrderBy = function () {
            $cookies.remove('sortingKeyPayment');
            $cookies.remove('sortingValuePayment');
            vm.amountTable.sorting({ id: 'desc' });
            vm.amountTable.reload();
        };

        // se l'elemento del form è invalido -> bordo rosso
        $scope.addClass = function (idField, form) {
            if (!$scope.readOnly && form && form[idField] && form[idField].$invalid) {
                return 'has-errors';
            }
            return '';
        };



        vm.goBack = function () {

            if ($rootScope.goBack) {
                $state.go($rootScope.goBack);
            } else {
                $window.history.back();
            }
        };

        vm.goToTop = function () {
            document.documentElement.scrollTop = 0;
        };

        vm.submitSearch = function () {
            updateFiltersCookies();

            vm.amountTable.page(1);
            vm.amountTable.reload();
        }

        /**
        * Reset search
        */
        vm.reset = function () {
            if (!$scope.lockedMode) {
                vm.companies = null;
            }

            vm.region = null;
            updateFiltersCookies();
            $scope.resetOrderBy();
        };
        
        function initDataPartialAcceptance(payments) {
            vm.feeNumber = vm.procedureInstanceDTO.procedure.feeNumber;

            vm.totals.partialAcceptance.totalAmount = 0.0;
            payments.forEach(payment => {
                vm.totals.partialAcceptance.totalAmount += payment.totaleImportAccettazione;
            });

            vm.acceptanceMedicineAConv = 0.0;
            vm.acceptanceMedicineANonConv = 0.0;
            vm.aceptanceMedicineHNonConv = 0.0;
            vm.acceptanceTotalImport = 0.0;
          
            payments.forEach(importPB => {
                vm.acceptanceMedicineAConv += importPB.convClasseAAccettazione;
                vm.acceptanceMedicineANonConv += importPB.nonConvClasseAAccettazione;
                vm.acceptanceMedicineHNonConv += importPB.nonConvClasseHAccettazione;
                vm.acceptanceTotalImport += importPB.totaleImportAccettazione;
            })
            
            vm.totals.partialAcceptance.datiRiepilogativi = {
                "TOT_MEDICINE_A_CONV": vm.acceptanceMedicineAConv,
                "TOT_MEDICINE_A_NON_CONV": vm.acceptanceMedicineANonConv,
                "TOT_MEDICINE_H_NON_CONV": vm.acceptanceMedicineHNonConv,
                "TOT": vm.acceptanceTotalImport,
                "FIRST_FEE_IMPORT": vm.acceptanceTotalImport / vm.feeNumber
            };
        }
        
        function initDataPartialNotAcceptance(payments) {
            vm.feeNumber = vm.procedureInstanceDTO.procedure.feeNumber;

            vm.totals.partialNotAcceptance.totalAmount = 0.0;
            payments.forEach(payment => {
                vm.totals.partialNotAcceptance.totalAmount += payment.totaleImportoDiniego;
            });

            vm.notAcceptanceMedicineAConv = 0.0;
            vm.notAcceptanceMedicineANonConv = 0.0;
            vm.notAcceptanceMedicineHNonConv = 0.0;
            vm.notAcceptanceTotalImport = 0.0;
          
            payments.forEach(importPB => {
                vm.notAcceptanceMedicineAConv += importPB.convClasseADiniego;
                vm.notAcceptanceMedicineANonConv += importPB.nonConClasseADiniego;
                vm.notAcceptanceMedicineHNonConv += importPB.nonConvClasseHDiniego;
                vm.notAcceptanceTotalImport += importPB.totaleImportoDiniego;
            })

            vm.totals.partialNotAcceptance.datiRiepilogativi = {
                "TOT_MEDICINE_A_CONV": vm.notAcceptanceMedicineAConv,
                "TOT_MEDICINE_A_NON_CONV": vm.notAcceptanceMedicineANonConv,
                "TOT_MEDICINE_H_NON_CONV": vm.notAcceptanceMedicineHNonConv,
                "TOT": vm.notAcceptanceTotalImport,
                "FIRST_FEE_IMPORT": vm.notAcceptanceTotalImport / vm.feeNumber
            };
        }

        vm.populateSubTables = function () {
            vm.amountTable = new NgTableParams({

                sorting: {
                    [initialSortingKey]: initialSortingDirection.toLowerCase(),
                },
                cleanTable: false
            }, {
                enableRowSelection: true,
                counts: [],
                //number of element option to visualize for page

                //get data : server side processing
                getData: function (params) {
                    //for filtering data
                    var filter = params.filter();
                    //count of element

                    //page
                    var page = params.page();
                    //sorting
                    var sorting = params.sorting();
                    var sortingKey = Object.keys(sorting)[0];
                    var sortingValue = sortingKey ? sorting[sortingKey] : null;
                    var order = [{
                        'property': sortingKey ? sortingKey : '',
                        'direction': sortingValue ? sortingValue.toUpperCase() : null,
                    }
                    ];
                    //enable loading spinner
                    vm.isLoading = true;
                    initSpinner();
                    //object for api rest
                    var aic9list = Object.keys($scope.checkboxes.items);
                    vm.aic9checked = aic9list.filter(function (item) {
                        return $scope.checkboxes.items[item];
                    });

                    var obj = {
                        unpaged: true,
                        filters: {
                            codiceSis: { in: vm.companies },
                            procedureId: { equals: vm.procedureInstanceDTO.procedure.id },
                            statusAccettazione: { equals: states[$scope.moduleOption] },
                            aic9: { in: vm.aic9checked },
                        },
                    };
                    if (sortingKey) {
                        obj.order = order;
                        $cookies.put(sortingKeyCookie, order[0].property);
                        $cookies.put(sortingValueCookie, order[0].direction);
                    }

                    //rendering data
                    if (vm.companies && vm.companies.length > 0 && vm.procedureInstanceDTO.procedure.id) {
                        return getData(obj, 'REGIONE_MODULO').then(function (result) {
                            vm.isLoading = false;
                            parseTotalAmount(result.data, true);
                            return result.data;
                        });
                    }

                }
            });

            vm.partialAcceptanceTable = new NgTableParams({

                sorting: {
                    [initialSortingKey]: initialSortingDirection.toLowerCase(),
                },
                cleanTable: false
            }, {
                enableRowSelection: true,
                counts: [],
                //number of element option to visualize for page

                //get data : server side processing
                getData: function (params) {
                    //for filtering data
                    var filter = params.filter();
                    //count of element

                    //page
                    var page = params.page();
                    //sorting
                    var sorting = params.sorting();
                    var sortingKey = Object.keys(sorting)[0];
                    var sortingValue = sortingKey ? sorting[sortingKey] : null;
                    var order = [{
                        'property': sortingKey ? sortingKey : '',
                        'direction': sortingValue ? sortingValue.toUpperCase() : null,
                    }
                    ];
                    //enable loading spinner
                    //object for api rest
                    var obj = {
                        unpaged: true,
                        filters: {
                            codiceSis: { in: vm.companies },
                            procedureId: { equals: vm.procedureInstanceDTO.procedure.id }
                        },
                    };
                    if (sortingKey) {
                        obj.order = order;
                        $cookies.put(sortingKeyCookie, order[0].property);
                        $cookies.put(sortingValueCookie, order[0].direction);
                    }

                    var aic9list = Object.keys($scope.checkboxes.items);
                    var aic9checked = aic9list.filter(function (item) {
                        return $scope.checkboxes.items[item];
                    });

                    if (vm.companies && vm.companies.length > 0 && vm.procedureInstanceDTO.procedure.id && vm.acceptanceData) {
                        const payments = vm.acceptanceData.filter(function (item) {
                            return aic9checked.includes(item.aic9);
                        });
                        initDataPartialAcceptance(payments);
                        return Promise.resolve(payments);
                    } else {
                        return Promise.resolve([]);
                    }

                }
            });

            vm.partialNotAcceptanceTable = new NgTableParams({

                sorting: {
                    [initialSortingKey]: initialSortingDirection.toLowerCase(),
                },
                cleanTable: false
            }, {
                enableRowSelection: true,
                counts: [],
                //number of element option to visualize for page

                //get data : server side processing
                getData: function (params) {
                    //for filtering data
                    var filter = params.filter();
                    //count of element

                    //page
                    var page = params.page();
                    //sorting
                    var sorting = params.sorting();
                    var sortingKey = Object.keys(sorting)[0];
                    var sortingValue = sortingKey ? sorting[sortingKey] : null;
                    var order = [{
                        'property': sortingKey ? sortingKey : '',
                        'direction': sortingValue ? sortingValue.toUpperCase() : null,
                    }
                    ];
                    //enable loading spinner
                    vm.isLoading = true;
                    initSpinner();
                    //object for api rest
                    var obj = {
                        unpaged: true,
                        filters: {
                            uscitaSpontaneaSoloDiniego: { equals: true },
                            codiceSis: { in: vm.companies },
                            procedureId: { equals: vm.procedureInstanceDTO.procedure.id }
                        },
                    };
                    if (sortingKey) {
                        obj.order = order;
                        $cookies.put(sortingKeyCookie, order[0].property);
                        $cookies.put(sortingValueCookie, order[0].direction);
                    }


                    var aic9list = Object.keys($scope.checkboxes.items);
                    var aic9unchecked = aic9list.filter(function (item) {
                        return !$scope.checkboxes.items[item];
                    });

                    if (vm.companies && vm.companies.length > 0 && vm.procedureInstanceDTO.procedure.id) {
                        return getData(obj, 'SINGOLO_PRODOTTO').then(function (result) {
                            vm.isLoading = false;
                            let payments = result.data;
                            if (vm.acceptanceData) {
                                payments = payments.concat(vm.acceptanceData.filter(function (item) {
                                    return aic9unchecked.includes(item.aic9);
                                }));
                            }
                            initDataPartialNotAcceptance(payments);
                            return payments;
                        });
                    }

                }
            });
        }


        function updateFiltersCookies() {
            updateCookie('paymentRegion', vm.region ? JSON.stringify(vm.region) : null);
            updateCookie('paymentCompanies', vm.companies ? JSON.stringify(vm.companies) : null);
        }

        function updateCookie(cookieName, cookieValue) {
            if (cookieValue) {
                $cookies.put(cookieName, cookieValue);
            } else {
                $cookies.remove(cookieName);
            }
        }

        function initSpinner() {
            var elSpin = $document.find('#loading-bar-spinner');
            if (elSpin.length === 0) {
                var loading = $compile(angular.element(loadingSpinnerService.loadingSpinner()))($scope);
                var el = $document.find('#loadingSpinnerRow');
                el.append(loading);
            }
        }


        /**
         * Funzione per recuperare i dati per popolare la NGTable
         */
        function getData(obj, queryType) {

            var deferred = $q.defer();
            sphaPaybackServices.getQueryTypeData(
                obj, queryType, vm.procedureInstanceDTO.procedure, undefined, function (data, success, error) {
                    handleTableDataResponse(data, error, deferred);
                });

            return deferred.promise;
        }


        function handleCookiesAndSharedData() {

            //Recupero i filtri salvati nei cookies dalla pagina delle istanze o dalla stessa pagina
            initialSortingKey = $cookies.get(sortingKeyCookie) ? $cookies.get(sortingKeyCookie) : 'id';
            initialSortingDirection = $cookies.get(sortingValueCookie) ? $cookies.get(sortingValueCookie) : 'desc';

            handleCompaniesCookie();
            if (shareDataServices.get('ACCEPTANCE_REQUEST')) {
                const data = shareDataServices.get('ACCEPTANCE_REQUEST');
                vm.soggetto = data.soggetto;
                vm.qualificaSoggetto = data.qualificaSoggetto;
                vm.sedeAzienda = data.sedeAzienda;
                vm.potereSoggetto = data.potereSoggetto;
                $scope.moduleOption = revertedStates[data.statusAccettazione];
                $scope.checkboxes.items = {};
                data.moduloAccettazioneItems.forEach(item => {
                    $scope.checkboxes.items[item.aic9] = true
                });
                shareDataServices.set(undefined, 'ACCEPTANCE_REQUEST')
            }
            if (shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO')) {
                vm.procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
                vm.startDate = moment(sphaUtilsServices.serverToClientDate(vm.procedureInstanceDTO.procedure.startDate)).startOf('year').toDate();
                vm.endDate = moment(sphaUtilsServices.serverToClientDate(vm.procedureInstanceDTO.procedure.endDate)).endOf('year').toDate();
                vm.year = vm.procedureInstanceDTO.procedure.year;
                vm.prevYear = vm.year - 1;
                vm.acceptancePrevDate = moment(sphaUtilsServices.serverToClientDate(vm.procedureInstanceDTO.procedure.startDate)).startOf('month').subtract(1, 'day').toDate();
                vm.notAcceptanceDate = moment(sphaUtilsServices.serverToClientDate(vm.procedureInstanceDTO.procedure.startDate)).endOf('month').toDate();
            }

        }

        function handleTableDataResponse(data, error, deferred) {
            if (data) {
                deferred.resolve({
                    data: data.items,
                    total: data.total,
                });
            } else {
                vm.message = error.message;
                vm.alertClass = error.alertClass;
            }
        }

        /**
         * Inizializzazione NGTable
         */

        function initTable() {
            vm.amountTable = new NgTableParams({

                sorting: {
                    [initialSortingKey]: initialSortingDirection.toLowerCase(),
                },
                cleanTable: false
            }, {
                enableRowSelection: true,
                counts: [],
                //number of element option to visualize for page

                //get data : server side processing
                getData: function (params) {
                    //for filtering data
                    var filter = params.filter();
                    //count of element

                    //page
                    var page = params.page();
                    //sorting
                    var sorting = params.sorting();
                    var sortingKey = Object.keys(sorting)[0];
                    var sortingValue = sortingKey ? sorting[sortingKey] : null;
                    var order = [{
                        'property': sortingKey ? sortingKey : '',
                        'direction': sortingValue ? sortingValue.toUpperCase() : null,
                    }
                    ];
                    //enable loading spinner
                    vm.isLoading = true;
                    initSpinner();
                    //object for api rest
                    var obj = {
                        unpaged: true,
                        filters: {
                            codiceSis: { in: vm.companies },
                            procedureId: { equals: vm.procedureInstanceDTO.procedure.id },
                            statusAccettazione: {equals: states[$scope.moduleOption]}
                        },
                    };
                    if (sortingKey) {
                        obj.order = order;
                        $cookies.put(sortingKeyCookie, order[0].property);
                        $cookies.put(sortingValueCookie, order[0].direction);
                    }

                    //rendering data
                    if (vm.companies && vm.companies.length > 0 && vm.procedureInstanceDTO.procedure.id) {
                        return getData(obj, 'REGIONE_MODULO').then(function (result) {
                            vm.isLoading = false;
                            parseTotalAmount(result.data);
                            return result.data;
                        });
                    }

                }
            });
            vm.amountTableProroga = new NgTableParams({

                sorting: {
                    [initialSortingKey]: initialSortingDirection.toLowerCase(),
                },
                cleanTable: false
            }, {
                enableRowSelection: true,
                counts: [],
                //number of element option to visualize for page

                //get data : server side processing
                getData: function (params) {
                    //for filtering data
                    var filter = params.filter();
                    //count of element

                    //page
                    var page = params.page();
                    //sorting
                    var sorting = params.sorting();
                    var sortingKey = Object.keys(sorting)[0];
                    var sortingValue = sortingKey ? sorting[sortingKey] : null;
                    var order = [{
                        'property': sortingKey ? sortingKey : '',
                        'direction': sortingValue ? sortingValue.toUpperCase() : null,
                    }
                    ];
                    //enable loading spinner
                    vm.isLoading = true;
                    initSpinner();
                    //object for api rest
                    var obj = {
                        unpaged: true,
                        filters: {
                            aicConProroga: { equals: false },
                            codiceSis: { in: vm.companies },
                            procedureId: { equals: vm.procedureInstanceDTO.procedure.id }
                        },
                    };
                    if (sortingKey) {
                        obj.order = order;
                        $cookies.put(sortingKeyCookie, order[0].property);
                        $cookies.put(sortingValueCookie, order[0].direction);
                    }

                    //rendering data
                    if (vm.companies && vm.companies.length > 0 && vm.procedureInstanceDTO.procedure.id) {
                        return getData(obj, 'REGIONE_MODULO').then(function (result) {
                            vm.isLoading = false;
                            parseTotalAmount(result.data);
                            return result.data;
                        });
                    }

                }
            });

            vm.acceptanceTable = new NgTableParams({

                sorting: {
                    [initialSortingKey]: initialSortingDirection.toLowerCase(),
                },
                cleanTable: false
            }, {
                enableRowSelection: true,
                counts: [],
                //number of element option to visualize for page

                //get data : server side processing
                getData: function (params) {
                    //for filtering data
                    var filter = params.filter();
                    //count of element

                    //page
                    var page = params.page();
                    //sorting
                    var sorting = params.sorting();
                    var sortingKey = Object.keys(sorting)[0];
                    var sortingValue = sortingKey ? sorting[sortingKey] : null;
                    var order = [{
                        'property': sortingKey ? sortingKey : '',
                        'direction': sortingValue ? sortingValue.toUpperCase() : null,
                    }
                    ];
                    //enable loading spinner
                    vm.isLoading = true;
                    initSpinner();
                    //object for api rest
                    var obj = {
                        unpaged: true,
                        filters: {
                            uscitaSpontaneaSoloDiniego: { equals: false },
                            codiceSis: { in: vm.companies },
                            procedureId: { equals: vm.procedureInstanceDTO.procedure.id }
                        },
                    };
                    if (sortingKey) {
                        obj.order = order;
                        $cookies.put(sortingKeyCookie, order[0].property);
                        $cookies.put(sortingValueCookie, order[0].direction);
                    }

                    //rendering data
                    if (vm.companies && vm.companies.length > 0 && vm.procedureInstanceDTO.procedure.id) {
                        return getData(obj, 'SINGOLO_PRODOTTO').then(function (result) {
                            popolateCheckbox(result.data)
                            initDataAcceptance(result.data);
                            vm.isLoading = false;
                            vm.acceptanceData = result.data;
                            return result.data;
                        });
                    }

                }
            });

            vm.notAcceptanceTable = new NgTableParams({

                sorting: {
                    [initialSortingKey]: initialSortingDirection.toLowerCase(),
                },
                cleanTable: false
            }, {
                enableRowSelection: true,
                counts: [],
                //number of element option to visualize for page

                //get data : server side processing
                getData: function (params) {
                    //for filtering data
                    var filter = params.filter();
                    //count of element

                    //page
                    var page = params.page();
                    //sorting
                    var sorting = params.sorting();
                    var sortingKey = Object.keys(sorting)[0];
                    var sortingValue = sortingKey ? sorting[sortingKey] : null;
                    var order = [{
                        'property': sortingKey ? sortingKey : '',
                        'direction': sortingValue ? sortingValue.toUpperCase() : null,
                    }
                    ];
                    //enable loading spinner
                    vm.isLoading = true;
                    initSpinner();
                    //object for api rest
                    var obj = {
                        unpaged: true,
                        filters: {
                            aicConProroga: { equals: true },
                            uscitaSpontaneaSoloDiniego: { equals: true },
                            codiceSis: { in: vm.companies },
                            procedureId: { equals: vm.procedureInstanceDTO.procedure.id }
                        },
                    };
                    if (sortingKey) {
                        obj.order = order;
                        $cookies.put(sortingKeyCookie, order[0].property);
                        $cookies.put(sortingValueCookie, order[0].direction);
                    }

                    //rendering data
                    if (vm.companies && vm.companies.length > 0 && vm.procedureInstanceDTO.procedure.id) {
                        return getData(obj, 'SINGOLO_PRODOTTO').then(function (result) {
                            popolateCheckbox(result.data)
                            initDataNotAcceptance(result.data);
                            vm.isLoading = false;
                            return result.data;
                        });
                    }

                }
            });

            vm.notAcceptanceFullTable = new NgTableParams({

                sorting: {
                    [initialSortingKey]: initialSortingDirection.toLowerCase(),
                },
                cleanTable: false
            }, {
                enableRowSelection: true,
                counts: [],
                //number of element option to visualize for page

                //get data : server side processing
                getData: function (params) {
                    //for filtering data
                    var filter = params.filter();
                    //count of element

                    //page
                    var page = params.page();
                    //sorting
                    var sorting = params.sorting();
                    var sortingKey = Object.keys(sorting)[0];
                    var sortingValue = sortingKey ? sorting[sortingKey] : null;
                    var order = [{
                        'property': sortingKey ? sortingKey : '',
                        'direction': sortingValue ? sortingValue.toUpperCase() : null,
                    }
                    ];
                    //enable loading spinner
                    vm.isLoading = true;
                    initSpinner();
                    //object for api rest
                    var obj = {
                        unpaged: true,
                        filters: {
                            codiceSis: { in: vm.companies },
                            procedureId: { equals: vm.procedureInstanceDTO.procedure.id }
                        },
                    };
                    if (sortingKey) {
                        obj.order = order;
                        $cookies.put(sortingKeyCookie, order[0].property);
                        $cookies.put(sortingValueCookie, order[0].direction);
                    }

                    //rendering data
                    if (vm.companies && vm.companies.length > 0 && vm.procedureInstanceDTO.procedure.id) {
                        return getData(obj, 'SINGOLO_PRODOTTO').then(function (result) {
                            popolateCheckbox(result.data)
                            initDataNotAcceptance(result.data);
                            vm.isLoading = false;
                            return result.data;
                        });
                    }

                }
            });
            // start search immediately
            vm.amountTable.page(1);
            vm.acceptanceTable.page(1);
            vm.notAcceptanceTable.page(1);

        }

        function handleCompaniesCookie() {
            var sharedValue = shareDataServices.get('instanceCompanies');
            if (sharedValue) {
                vm.companies = sharedValue;
                $scope.lockedMode = true;
                //add the company to filter
            } else if ($cookies.get('paymentCompanies')) {
                vm.companies = JSON.parse($cookies.get('paymentCompanies'));
            }
            if (shareDataServices.get('paymentAifaCompanies')) {
                vm.companies = shareDataServices.get('paymentAifaCompanies');
            }
            if (vm.companies != null) {
                $scope.filtersRequest.companies.companies = (vm.companies);
            }
        }

        function initData(payments) {
            vm.payments = payments;
            vm.feeNumber = vm.procedureInstanceDTO.procedure.feeNumber;

            vm.totalImport = 0.0;
            vm.payments.forEach(payment => {
                vm.totalImport += payment.totalAmount;
            });

            vm.feeImport = vm.totalImport / vm.feeNumber;
            //        	vm.periodNotAcceptance

            vm.paymentFeeDates = parseExpireDate(vm.procedureInstanceDTO.procedure.feeExpireDates);

            $scope.datiRiepilogativi = {
                "TOT_MEDICINE_A_CONV": 0.0,
                "TOT_MEDICINE_A_NON_CONV": 0.0,
                "TOT_MEDICINE_H_NON_CONV": 0.0,
                "TOT": vm.totalImport,
                "FIRST_FEE_IMPORT": vm.feeImport
            };
        }


        function initDataAcceptance(payments) {
            vm.feeNumber = vm.procedureInstanceDTO.procedure.feeNumber;

            vm.totals.acceptance.totalAmount = 0.0;
            payments.forEach(payment => {
                vm.totals.acceptance.totalAmount += payment.totaleImportAccettazione;
            });

            vm.acceptanceMedicineAConv = 0.0;
            vm.acceptanceMedicineANonConv = 0.0;
            vm.aceptanceMedicineHNonConv = 0.0;
            vm.acceptanceTotalImport = 0.0;
          
            payments.forEach(importPB => {
                vm.acceptanceMedicineAConv += importPB.convClasseAAccettazione;
                vm.acceptanceMedicineANonConv += importPB.nonConvClasseAAccettazione;
                vm.acceptanceMedicineHNonConv += importPB.nonConvClasseHAccettazione;
                vm.acceptanceTotalImport += importPB.totaleImportAccettazione;
            })
            
            vm.totals.acceptance.datiRiepilogativi = {
                "TOT_MEDICINE_A_CONV": vm.acceptanceMedicineAConv,
                "TOT_MEDICINE_A_NON_CONV": vm.acceptanceMedicineANonConv,
                "TOT_MEDICINE_H_NON_CONV": vm.acceptanceMedicineHNonConv,
                "TOT": vm.acceptanceTotalImport,
                "FIRST_FEE_IMPORT": vm.acceptanceTotalImport / vm.feeNumber
            };
        }

        function initDataNotAcceptance(payments) {
            vm.feeNumber = vm.procedureInstanceDTO.procedure.feeNumber;

            vm.totals.notAcceptance.totalAmount = 0.0;
            payments.forEach(payment => {
                vm.totals.notAcceptance.totalAmount += payment.totaleImportoDiniego;
            });

            vm.notAcceptanceMedicineAConv = 0.0;
            vm.notAcceptanceMedicineANonConv = 0.0;
            vm.notAcceptanceMedicineHNonConv = 0.0;
            vm.notAcceptanceTotalImport = 0.0;
          
            payments.forEach(importPB => {
                vm.notAcceptanceMedicineAConv += importPB.convClasseADiniego;
                vm.notAcceptanceMedicineANonConv += importPB.nonConClasseADiniego;
                vm.notAcceptanceMedicineHNonConv += importPB.nonConvClasseHDiniego;
                vm.notAcceptanceTotalImport += importPB.totaleImportoDiniego;
            })

            vm.totals.notAcceptance.datiRiepilogativi = {
                "TOT_MEDICINE_A_CONV": vm.notAcceptanceMedicineAConv,
                "TOT_MEDICINE_A_NON_CONV": vm.notAcceptanceMedicineANonConv,
                "TOT_MEDICINE_H_NON_CONV": vm.notAcceptanceMedicineHNonConv,
                "TOT": vm.notAcceptanceTotalImport,
                "FIRST_FEE_IMPORT": vm.notAcceptanceTotalImport / vm.feeNumber
            };
        }

        function popolateCheckbox(rows) {
            rows.forEach(row => {
                if ($scope.checkboxes.items[row.aic9] === undefined) {
                    $scope.checkboxes.items[row.aic9] = false;
                }
            })
        }


        function parseExpireDate(feeExpireDates) {
            var feeExpireDatesTemp = feeExpireDates.sort(
                function (a, b) {
                    if (a.feeNumber === b.feeNumber) {
                        // id is only important when feeNumber are the same
                        return b.id - a.id;
                    }
                    return a.feeNumber > b.feeNumber ? 1 : -1;
                });
            feeExpireDatesTemp = feeExpireDatesTemp.slice(0, vm.feeNumber);

            var paymentFeeDates = "";
            feeExpireDatesTemp.forEach(date => {
                paymentFeeDates += $filter('date')(date.feeExpireDate, 'shortDate') + ", ";
            });
            return paymentFeeDates.substring(0, paymentFeeDates.length - 2);
        }

        function parseTotalAmount(paybackSpesa, subtable) {

            vm.totMedicineAConv = 0.0;
            vm.totMedicineANonConv = 0.0;
            vm.totMedicineHNonConv = 0.0;
            if (!subtable) {
                vm.acceptanceMedicineAConv = 0.0;
                vm.acceptanceMedicineANonConv = 0.0;
                vm.aceptanceMedicineHNonConv = 0.0;
                vm.notAcceptanceMedicineAConv = 0.0;
                vm.notAcceptanceMedicineANonConv = 0.0;
                vm.notAcceptanceMedicineHNonConv = 0.0;
                vm.acceptanceTotalImport = 0.0;
                vm.notAcceptanceTotalImport = 0.0;
            }
            vm.totalImport = 0.0;
          
            paybackSpesa.forEach(importPB => {
                vm.totMedicineAConv += importPB.convClasseAAccettazione + importPB.convClasseADiniego;
                vm.totMedicineANonConv += importPB.nonConClasseADiniego + importPB.nonConvClasseAAccettazione;
                vm.totMedicineHNonConv += importPB.nonConvClasseHAccettazione + importPB.nonConvClasseHDiniego;
                if (!subtable) {
                    vm.acceptanceMedicineAConv += importPB.convClasseAAccettazione;
                    vm.acceptanceMedicineANonConv += importPB.nonConvClasseAAccettazione;
                    vm.acceptanceMedicineHNonConv += importPB.nonConvClasseHAccettazione;
                    vm.notAcceptanceMedicineAConv += importPB.convClasseADiniego;
                    vm.notAcceptanceMedicineANonConv += importPB.nonConClasseADiniego;
                    vm.notAcceptanceMedicineHNonConv += importPB.nonConvClasseHDiniego;
                    vm.acceptanceTotalImport += importPB.totaleImportAccettazione;
                    vm.notAcceptanceTotalImport += importPB.totaleImportoDiniego;
                }
                vm.totalImport += importPB.totaleImportAccettazione + importPB.totaleImportoDiniego;
            })

            $scope.datiRiepilogativi = {
                "TOT_MEDICINE_A_CONV": vm.totMedicineAConv,
                "TOT_MEDICINE_A_NON_CONV": vm.totMedicineANonConv,
                "TOT_MEDICINE_H_NON_CONV": vm.totMedicineHNonConv,
                "TOT": vm.totalImport,
                "FIRST_FEE_IMPORT": vm.totalImport / vm.feeNumber
            };

            vm.totals.acceptance.datiRiepilogativi = {
                "TOT_MEDICINE_A_CONV": vm.acceptanceMedicineAConv,
                "TOT_MEDICINE_A_NON_CONV": vm.acceptanceMedicineANonConv,
                "TOT_MEDICINE_H_NON_CONV": vm.acceptanceMedicineHNonConv,
                "TOT": vm.acceptanceTotalImport,
                "FIRST_FEE_IMPORT": vm.acceptanceTotalImport / vm.feeNumber
            };

            vm.totals.notAcceptance.datiRiepilogativi = {
                "TOT_MEDICINE_A_CONV": vm.notAcceptanceMedicineAConv,
                "TOT_MEDICINE_A_NON_CONV": vm.notAcceptanceMedicineANonConv,
                "TOT_MEDICINE_H_NON_CONV": vm.notAcceptanceMedicineHNonConv,
                "TOT": vm.notAcceptanceTotalImport,
                "FIRST_FEE_IMPORT": vm.notAcceptanceTotalImport / vm.feeNumber
            };
        }

        function getPaymentData() {
            var obj = {
                start: 0,
                length: 20,
                filters: {
                    codiceSis: vm.companies ? { in: vm.companies } : null,
                    procedureId: { equals: vm.procedureInstanceDTO.procedure.id }
                }
            };
            sphaPaymentServices.getPaybackPayment(
                obj, function (data, success, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {

                        initData(data.items);
                    }
                });




        }
        // DECLARE FUNCTIONS FOR INIT CONTROLLER
        function init() {
            handleCookiesAndSharedData();

            initTable();

            getPaymentData();
        }

        init();

        vm.submit = function () {
            const aic9list = Object.keys($scope.checkboxes.items);

            const body = {
                procedureInstanceId: vm.procedureInstanceDTO.id,
                status: 'DRAFT',
                company: vm.companies[0],
                procedureId: vm.procedureInstanceDTO.procedure.id,
                soggetto: vm.soggetto,
                qualificaSoggetto: vm.qualificaSoggetto,
                sedeAzienda: vm.sedeAzienda,
                potereSoggetto: vm.potereSoggetto, 
                statusAccettazione: states[$scope.moduleOption],
                moduloAccettazioneItems: aic9list.filter(function (item) {
                    return $scope.checkboxes.items[item];
                }).map(function(item) {
                    return {
                        aic9: item
                    }
                })
            }
            shareDataServices.set(body, 'ACCEPTANCE_REQUEST');
            sphaPaybackServices.createModuloAccettazione(body, function(data, success, error) {
                const pdfRequest = Object.assign({}, data);
                pdfRequest.empowered = data.potereSoggetto;
                pdfRequest.subjectName = data.soggetto;
                pdfRequest.subjectQualification = data.qualificaSoggetto;
                pdfRequest.companyHeadquarters = data.sedeAzienda;
                shareDataServices.set(pdfRequest, 'PDF_REQUEST_PARAMS');
                shareDataServices.set('spha.sphaPaybackAcceptance', 'ORIGIN_PAGE');
                $state.go('spha.submitAcceptance');
            });
        };

        vm.onChangeAic9 = function(aic9) {
            Object.keys($scope.checkboxes.items).forEach(function(key){
                const subKey = key.substring(0, 6);
                const aic6 = aic9.substring(0, 6);
                if (subKey === aic6) {
                    $scope.checkboxes.items[key] = $scope.checkboxes.items[aic9];
                }
            });
        }
    }
})();
