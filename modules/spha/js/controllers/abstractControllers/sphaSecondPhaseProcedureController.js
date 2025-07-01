/**
 * @ngdoc function
 * @name sphaSecondPhaseProcedureController
 * @description controller for second phase procedure
 * # sphaSecondPhaseProcedureController Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaSecondPhaseProcedureController', sphaSecondPhaseProcedureController);
    
    sphaSecondPhaseProcedureController.$inject = [
        '$rootScope', '$stateParams', '$state', '$scope', '$window', '$cookies', '$translate', '$uibModal', '$filter', '$q', '$extend',
        '$compile', '$document',
        'NgTableParams', 'SweetAlert', 'loadingSpinnerService',
        'PropertiesServiceSpha', 'httpServices', 'shareDataServices',
        'sphaCompanyServices', 'sphaProcedureInstanceServices', 'sphaUtilsServices', 'sphaProcedureServices',
        'uploadServicesSpha'];
        
    function sphaSecondPhaseProcedureController (
        $rootScope, $stateParams, $state, $scope, $window, $cookies,  $translate,  $uibModal, $filter, $q, $extend,
        $compile, $document,
        NgTableParams, SweetAlert, loadingSpinnerService,
        PropertiesServiceSpha, httpServices, shareDataServices,
        sphaCompanyServices, sphaProcedureInstanceServices, sphaUtilsServices, sphaProcedureServices,
        uploadServicesSpha) {
        


        // DECLARE GLOBAL non $scope VARIABLES/CONSTANTS
        var vm = $extend ? $extend : this;
        vm.queryType = $state.params['queryType'] ;

        var sphaPaybackServices;
        
        // DECLARE this VARIABLES

        vm.message = '';
        vm.result = $stateParams.result;
        vm.isLoading = false;
        vm.filtersForm = null;
        vm.dynamicTable = null;

        vm.filtersDirective = {};
        vm.lockedMode = false;
        vm.procedureInstanceDTO = null;
        vm.procedureDTO = null;
        vm.shareDataPrefix = null;
        
        $scope.submitSearch = null;
        $scope.reset = null;
        vm.filtersLoaded = false;
        
        // DECLARE FUNCTIONS
        
        function handleCookiesAndSharedData() {
             //Recupero i filtri salvati nei cookies dalla pagina delle istanze o dalla stessa pagina
            vm.procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
            if(vm.procedureInstanceDTO) {
                vm.procedureDTO = vm.procedureInstanceDTO.procedure;
            }
        }
        
        function updateFiltersCookies() {
            sphaPaybackServices.updateFiltersCookies(vm.createFilterCriteria().medicineFilters, vm.shareDataPrefix);
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
        
        function handleState() {
            var deferred = $q.defer();
            if($state.params['procedureInstanceId']) {
                vm.lockedMode = true;
                handleStateInstance().then(function (result) {
                    deferred.resolve();
                });
            } else {
                if ($state.params['procedureId']) {
                    handleStateProcedure().then(function (result) {
                        deferred.resolve();
                    });
                }
            }
            return deferred.promise;
        }

        function handleStateProcedure() {
            var deferred = $q.defer();
            if ($state.params['procedureId'] && (!(vm.procedureDTO && vm.procedureDTO.id &&
                    $state.params['procedureId'] === vm.procedureDTO.id) ||
                !vm.companies || !vm.companies.includes(vm.procedureDTO.company))) {
                sphaProcedureServices.readProcedure($state.params['procedureId'], function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        vm.procedureDTO = data;
                        vm.lockedMode = false;
                        setValidMarketing();
                        deferred.resolve();
                    }
                });
            } else {
                setValidMarketing();
                deferred.resolve();
            }

            return deferred.promise;
        }

        
        
        function handleStateInstance() {
            var deferred = $q.defer();
            /// recupero l'istanza di procedimento se l'istanza salvata nei cookie non corrisponde a quella presente nell'URL
            if ($state.params['procedureInstanceId'] && (!(vm.procedureInstanceDTO && vm.procedureInstanceDTO.id &&
                    $state.params['procedureInstanceId'] === vm.procedureInstanceDTO.id) ||
                !vm.companies || !vm.companies.includes(vm.procedureInstanceDTO.company))) {
                sphaProcedureInstanceServices.getProcedureInstance($state.params['procedureInstanceId'], function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        vm.procedureInstanceDTO = data;
                        vm.procedureDTO = vm.procedureInstanceDTO.procedure;
                        vm.companies = [vm.procedureInstanceDTO.company];
                        vm.filtersDirective.companies = vm.companies;
                        setValidMarketing();
                        deferred.resolve();
                    }
                });
            } else {
                if (!vm.companies) {
                    vm.companies = [vm.procedureInstanceDTO.company];
                    vm.filtersDirective.companies = vm.companies;
                }
                setValidMarketing();
                deferred.resolve();
            }

            return deferred.promise;
        }
        
        function setValidMarketing() {
            vm.filtersDirective.validMarketingTo = formatDate(vm.procedureDTO && vm.procedureDTO.endPeriodDate);
            vm.filtersDirective.validMarketingFrom = formatDate(vm.procedureDTO && vm.procedureDTO.startPeriodDate);
        }
        
        function formatDate(date) {
            return date ?  new Date(moment(date).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z') : null;
        }
        
        /**
         * Funzione per esportare i dati
         */
        function exportData(obj) {
            var deferred = $q.defer();

            if (!vm.filtersForm || vm.filtersForm.$invalid) {
                deferred.resolve({
                    data: null
                });
            } else {
                httpServices.post(sphaPaybackServices.getExportReportUrl(vm.queryType, vm.procedureDTO), obj, function (data, success, error) {
                    if (success) {
                        deferred.resolve({
                            data: data
                        });
                    } else {
                        vm.message = error;
                        vm.alertClass = 'alert alert-danger';
                    }
                });
            }
            return deferred.promise;
        }
        
        // DECLARE FUNCTIONS FOR INIT CONTROLLER
        
        /**
         * Funzione per recuperare i dati per popolare la NGTable
         */
        vm.getData = function(obj, table) {
            var deferred = $q.defer();
            if(vm.filtersLoaded) {
                updateFiltersCookies();
                vm.findData(obj, table).then(function (result) {
                    deferred.resolve(result);
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        };
        

        /**
         * 
         * @returns {{medicineFilters: (*|{}|{}|{}), procedureId: {equals}}}
         */
        vm.createFilterCriteria = function() {
            if(vm.filtersDirective && vm.filtersDirective !== {}) {
                return {
                    procedureId: {equals: vm.procedureDTO.id},
                    medicineFilters: vm.filtersDirective
                };
            }
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

        /**
         * Funzione associata al pulsante esporta per l'export in excel.
         * Chiama il servizio rest export
         */
        vm.exportReport = function (form) {
            vm.filtersForm = form;
            var obj = {
                filters: vm.createFilterCriteria(),
                unpaged: true
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
        
        $scope.submitSearch = function() {
            for(let table in vm.tables) {
                if(vm.tables.hasOwnProperty(table)) {
                    vm.tables[table].reload();
                }
            }
        };
        
        $scope.setSubmitSearchFn = function (directiveReloadTableDataFn) {
            $scope.submitSearch = directiveReloadTableDataFn;
        };
        
        $scope.setResetFn = function (directiveResetFn) {
            $scope.reset = directiveResetFn;
            vm.filtersLoaded = true;
        };
        
        function init() {
            var deferred = $q.defer();
            handleCookiesAndSharedData();
            handleState().then(function (result) {
                vm.shareDataPrefix = vm.procedureDTO.type + vm.queryType;
                vm.tables = sphaPaybackServices.getTableConfig(vm.queryType, vm.procedureDTO);
                deferred.resolve();
            });
            return deferred.promise;
        }

        vm.initController = function(sphaService) {
            sphaPaybackServices = sphaService;
            return init();
        };
    }
})();
