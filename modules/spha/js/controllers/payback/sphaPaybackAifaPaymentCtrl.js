/**
 * @ngdoc function
 * @name sphaPaybackAifaPaymentCtrl
 * @description controller for search payback data
 * # sphaPaybackAifaPaymentCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaPaybackAifaPaymentCtrl', sphaPaybackAifaPaymentCtrl);
        
    sphaPaybackAifaPaymentCtrl.$inject = [ '$scope', 'NgTableParams', '$cookies', '$sce',
        '$document', '$compile', '$q', '$state', '$rootScope', '$window', 'shareDataServices', 'sphaPaymentServices', 'loadingSpinnerService',
        'sphaUtilsServices', 'sphaCompanyServices', 'cityServicesSpha', 'httpServices', 'SweetAlert', '$translate', 'PropertiesServiceSpha', 'sphaProcedureInstanceServices'];

    function sphaPaybackAifaPaymentCtrl ( $scope, NgTableParams, $cookies, $sce,
        $document, $compile, $q, $state, $rootScope, $window, shareDataServices, sphaPaymentServices, loadingSpinnerService,
        sphaUtilsServices, sphaCompanyServices, cityServicesSpha, httpServices, SweetAlert, $translate, PropertiesServiceSpha, sphaProcedureInstanceServices ) {
        
        var vm = this;
        vm.companies = null;
        vm.region = null;
        vm.queryType = $state.params['queryType'];
        vm.procedureType = $state.params['procedureType'];
        vm.procedureId = $state.params['procedureId'];
        vm.isLoading = false;
        
        var apiProcedimentiUrl = PropertiesServiceSpha.get("baseUrlProcedure");
        var exportUrl = apiProcedimentiUrl + "api/payments/procedure-payment/report/";

        var sortingKeyCookie;
        var sortingValueCookie;
        var procedureDTO = null;

        var states = {
            'ACCETTATO': 'TOTALE',
            'NON_ACCETTATO': 'DINIEGO',
            'ACCETTAZIONE_PARZIALE': 'PARZIALE',
        }
        
        // declare sorting keys
        var initialSortingKey = null; // from cookie
        var initialSortingDirection = null; // from cookie

        cityServicesSpha.getRegions(function (response) {
            if (response) {
                $scope.filters['region'] = response;
            }
        });
                    
        

        $scope.lockedMode = false;
                        // Init Filters' domains
        $scope.filters = {
            companies: {elements: [], page: 0},
            region: []
        };
        
        $scope.filtersRequest = {
            companies: {companies: []}
        };

        $scope.actions = null;
        

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
            
            sphaCompanyServices.getPossibleValues(page, {companies: companies} , search, 
                function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        sphaUtilsServices.mapSearchFilterResponse([data], $scope.filters);
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

        $scope.sumFee = function(listFee) {
            if(listFee != null && listFee != []) {
                var sum = 0.00;
                listFee.forEach(fee => {
                    sum += fee.paidAmount;
                });
                return sum;
            } else return 0.00;
        }

        $scope.getDifference = function(totalAmount, fees) {
            return totalAmount - fees;
        }

        /**
         * Actions callback
         * @param {*} action Action name
         * @param {*} row Action object
         */
        $scope.onActionCallback = function (action, objectRow ) {
            switch (action) {
                case 'PAYMENT_VIEW_REGION_DETAIL':
                    // company sis e procedimento (?)
                    setOperationParams(objectRow.codiceSis);
                    $state.go('spha.paymentManagement', {procedureType: vm.procedureType, queryType: 'VERSARE', procedureId: vm.procedureId});
                    break;                
                default:
                    console.log('Unknown Action: ' + action);
            }
        }

        /**
         * Set shared data between controllers
         */
        function setOperationParams(codiceSis) {
           
            shareDataServices.set([codiceSis], 'paymentAifaCompanies');
        }

        /**
         * Enhances data object array building Operation object
         * containing Operation name callback and parameter object
         * and adding it to each row
         * @param {*} data data object array
         */

        function rowOperationsObject(data) {
            if (data) {
                data.forEach(function (row) {
                    row.operations = [];
                    var operations = ['PAYMENT_VIEW_REGION_DETAIL'];

                    row.operations = operations.map(function(status){
                                var noCircularRefRow = angular.copy(row, {}); // do note remove needed to avoid circular references
                                return {
                                    callback: $scope.onActionCallback,
                                    action: status,
                                    object: noCircularRefRow
                                };
                            });
                    
                });
            }
            
        }

        function getAllowedActions() {
           sphaPaymentServices.getAllowedActionsPayment(function (data, error) {
                if (error && error.message) {
                    vm.message = error.message;
                    vm.alertClass = error.alertClass;
                } else {
                    if (data && Array.isArray(data) && data.length > 0) {
                        $scope.actions = data;
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
         * Funzione per esportare i dati
         */
        function exportData(obj, parametersUrl) {
            var deferred = $q.defer();
            
            if (!vm.filtersForm || vm.filtersForm.$invalid) {
                deferred.resolve({
                    data: null,
                    total: 0,
                });
            } else {
                httpServices.post(exportUrl + parametersUrl, obj, function (data, success, error) {
                    if (success) {
                        deferred.resolve({
                            data: data.items,
                            total: data.total,
                        });
                    } else {
                        vm.message = error;
                        vm.alertClass = 'alert alert-danger';
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
            sphaPaymentServices.getPaybackPaymentGrouped(
                obj, vm.procedureType, vm.queryType, function (data, success, error) {
                   handleTableDataResponse(data, error, deferred);
                });
                
            return deferred.promise;
        }

        function handleCookiesAndSharedData() {
            
             //Recupero i filtri salvati nei cookies dalla pagina delle istanze o dalla stessa pagina
            initialSortingKey = $cookies.get(sortingKeyCookie) ? $cookies.get(sortingKeyCookie) : 'id';
            initialSortingDirection = $cookies.get(sortingValueCookie) ? $cookies.get(sortingValueCookie) : 'desc';
            
            handleCompaniesCookie();
            if(shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO')) {
                vm.procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
                getProcedureDTO(vm.procedureInstanceDTO.procedure.id);
            }
            
        }

        function handleTableDataResponse(data, error, deferred) {
            if (data) {
                deferred.resolve({
                    data: data.content.map(el => {
                        el.status = states[el.status];
                        return el;
                    }),
                    total: data.totalElements,
                });
            } else {
            	if(error) {
            		vm.message = error.message;
                    vm.alertClass = error.alertClass;
            	}
                
            }
        }

        /**
         * Inizializzazione NGTable
         */

        function initTable() {
            vm.amountTable = new NgTableParams({
                page: 1,
                count: 10,
                sorting: {
                    [initialSortingKey]: initialSortingDirection.toLowerCase(),
                },
                cleanTable: false
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
                        'property': sortingKey ? sortingKey : '',
                        'direction': sortingValue ? sortingValue.toUpperCase() : null,
                    }
                    ];
                    //enable loading spinner
                    vm.isLoading = true;
                    initSpinner();
                    //object for api rest
                     var obj = {
                        start: (page - 1) * count,
                        length: count,
                        search: '',
                        filters: {
                            codiceSis: vm.companies && vm.companies.length > 0 ? {in: vm.companies} : null, 
                            regionCode: vm.region ? {in: getRegionCodes(vm.region)} : null,
                            procedureId: vm.procedureInstanceDTO ? {equals: vm.procedureInstanceDTO.procedure.id} : {equals: vm.procedureId },
                            paymentFeeJoinType: {equals: true},
                            paymentFeeStatus: {in: ['SUBMITTED', 'STAMPED']}
                        },
                    };
                    if (sortingKey) {
                        obj.order = order;
                        $cookies.put(sortingKeyCookie, order[0].property);
                        $cookies.put(sortingValueCookie, order[0].direction);
                    }
                    
                    //rendering data
                    return getData(obj).then(function (result) {
                        params.total(result.total);
                        rowOperationsObject(result.data);
                        vm.isLoading = false;
                        return result.data;
                    });
                }
            });
            
            
            // start search immediately 
            vm.amountTable.page(1);

        }

        function getRegionCodes(regions) {
            var regionCodes = [];
            regions.forEach(region => {
                regionCodes.push(region.object);
            });
            return regionCodes;
        }
        
        function handleCompaniesCookie() {
            var sharedValue = shareDataServices.get('instanceCompanies');
            if (sharedValue ) {
                vm.companies = sharedValue;
                $scope.lockedMode = true;
                //add the company to filter
            } else if ($cookies.get('paymentCompanies')) {
                vm.companies = JSON.parse($cookies.get('paymentCompanies'));
            }
            if (vm.companies != null) {
                $scope.filtersRequest.companies.companies = (vm.companies);
            }
        }
        function getProcedureDTO(procedureId) {
            sphaPaymentServices.getProcedureById(procedureId, function (data, error) {
                if (error && error.message) {
                    vm.message = error.message;
                    vm.alertClass = error.alertClass;
                } else {
                   procedureDTO = data;
                }
            });
        }
        // DECLARE FUNCTIONS FOR INIT CONTROLLER
        function init() {
            handleCookiesAndSharedData();
            
            initTable();
            getAllowedActions();
        }
        
		vm.exportReport = function(form) {
			var obj = {
				unpaged: true,
				filters: {
                    codiceSis: vm.companies && vm.companies.length > 0 ? {in: vm.companies} : null, 
                    regionCode: vm.region ? {in: getRegionCodes(vm.region)} : null,
                    procedureId: vm.procedureInstanceDTO ? {equals: vm.procedureInstanceDTO.procedure.id} : {equals: vm.procedureId },
                    procedureType: { equals: vm.procedureType }
                },
		 	};
			
			var reportType =  "PAYMENT_AIFA_" + vm.procedureType;
			var userFileType = "/PAYMENT_AIFA_" + vm.procedureType + "_REPORT";
			
			var parametersUrl = reportType + userFileType;
			
			vm.filtersForm = form;
             
            exportData(obj, parametersUrl).then(function (result) {
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
		}
		
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

        vm.submitSearch = function() {
            updateFiltersCookies();

            vm.amountTable.page(1);
            vm.amountTable.reload();
        }

         /**
         * Reset search
         */
        vm.reset = function () {
            if(!$scope.lockedMode) {
                vm.companies = null;
                $scope.filtersRequest.companies.companies = null;
                $scope.getCompaniesPossibleValues(0,"");
            }
            
            vm.region = null;
            updateFiltersCookies();
            $scope.resetOrderBy();
        };
        

        vm.showAcceptanceFile = function(idProcedureInstance) {
            sphaProcedureInstanceServices.getAcceptanceFilePDF(idProcedureInstance, function (data, error) {
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

        init();
    }
})();
