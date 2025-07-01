/**
 * @ngdoc function
 * @name sphaPaybackPaymentCtrl
 * @description controller for search payback data
 * # sphaPaybackPaymentCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaViewPaymentFeeCtrl', sphaViewPaymentFeeCtrl);
        
    sphaViewPaymentFeeCtrl.$inject = [ '$scope', 'NgTableParams', '$cookies',
        '$q', '$state', '$rootScope', '$window', '$stateParams', '$sce', 'sphaPaymentServices', 
         'cityServicesSpha' ];

    function sphaViewPaymentFeeCtrl ( $scope, NgTableParams, $cookies, 
         $q, $state, $rootScope, $window, $stateParams, $sce, sphaPaymentServices,
        cityServicesSpha ) {
        
        var vm = this;
        var sortingKeyCookie;
        var sortingValueCookie;
        var procedureDTO = null;
        vm.paymentId = $stateParams.paymentId;
        vm.queryType = $stateParams.queryType;
        vm.procedureType = $stateParams.procedureType;
        
        // declare sorting keys
        var initialSortingKey = null; // from cookie
        var initialSortingDirection = null; // from cookie

        $scope.actions = null;


        $scope.resetOrderBy = function () {
            $cookies.remove('sortingKeyPayment');
            $cookies.remove('sortingValuePayment');
            vm.paymentFeeTable.sorting({ id: 'desc' });
            vm.paymentFeeTable.reload();
        };

        /**
         * Actions callback
         * @param {*} action Action name
         * @param {*} row Action object
         */
        $scope.onActionCallback = function (action, objectRow ) {
            switch (action) {
                case 'PAYMENT_FEE_SHOW':
                   //visualizza documento protocollato
                   vm.showProtocolledFile(objectRow.id);
                    break;
                case 'PAYMENT_FEE_DELETE':
                    // cancella documento protocollato
                    sphaPaymentServices.deletePaymentFeeProtocol(objectRow.id, function (data, error) {
                        if (error && error.message) {
                            vm.message = error.message;
                            vm.alertClass = error.alertClass
                        } else {
                            vm.paymentFeeTable.page(1);
                            vm.paymentFeeTable.reload();
                        }
                    });
                    break;
                
                default:
                    console.log('Unknown Action: ' + action);
            }
        }


        

        /**
         * Enhances data object array building Operation object
         * containing Operation name callback and parameter object
         * and adding it to each row
         * @param {*} data data object array
         */

        function rowOperationsObject(data) {

            if (data && data.length>0) {
				
                data.forEach(function (row) {
                    row.operations = [];
                    var operations = [];
                    //prendo lo stato del procedimento
					var status = row.payment.procedure.status;
                    sphaPaymentServices.getAllowedActionsPayment(function (data, error) {
                        if (error && error.message) {
                            vm.message = error.message;
                            vm.alertClass = error.alertClass;
                        } else {
                            if (data && Array.isArray(data) && data.length > 0) {
                                $scope.actions = data;
                                
                                if(row.status == 'STAMPED') {
                                    // significa che c'è il numero di protocollo e si può visualizzare
                                    operations.push('PAYMENT_FEE_SHOW');

                                    if($scope.actions && $scope.actions.indexOf('PAYMENT_CREATE') != -1 && status=='STARTED') {
                                        operations.push('PAYMENT_FEE_DELETE');
                                    }
                                    
                                }
                                    
                                row.operations = operations.map(function(status){
                                            var noCircularRefRow = angular.copy(row, {}); // do note remove needed to avoid circular references
                                            return {
                                                callback: $scope.onActionCallback,
                                                action: status,
                                                object: noCircularRefRow
                                            };
                                });
                            }
                        }
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

        
        /**
         * Funzione per recuperare i dati per popolare la NGTable
         */
        function getData(obj) {
            var deferred = $q.defer();
            sphaPaymentServices.getPaybackPaymentFee(
                obj, function (data, success, error) {
                   handleTableDataResponse(data, error, deferred);
                });
              
            return deferred.promise;
        }

        function handleCookiesAndSharedData() {
            
             //Recupero i filtri salvati nei cookies dalla pagina delle istanze o dalla stessa pagina
            initialSortingKey = $cookies.get(sortingKeyCookie) ? $cookies.get(sortingKeyCookie) : 'id';
            initialSortingDirection = $cookies.get(sortingValueCookie) ? $cookies.get(sortingValueCookie) : 'desc';
        
            
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
            vm.paymentFeeTable = new NgTableParams({
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
                    //object for api rest
                     var obj = {
                        start: (page - 1) * count,
                        length: count,
                        search: '',
                        filters: {
                            paymentId: {equals: vm.paymentId},
                            status: {equals: 'STAMPED'}
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
            
            
            // start search immediately if filters are locked
            if ($scope.lockedMode) {
                vm.paymentFeeTable.page(1);
            }
        }

        // DECLARE FUNCTIONS FOR INIT CONTROLLER
        function init() {
            handleCookiesAndSharedData();
            
            initTable();
            
        }

        vm.goBack = function () {
            
            if ($rootScope.goBack) {
                $state.go($rootScope.goBack, {paymentId: vm.paymentId, queryType: vm.queryType,
                	procedureType: vm.procedureType});
            } else {
                $window.history.back();
            }
        };

        vm.goToTop = function () {
            document.documentElement.scrollTop = 0;
        };

        vm.submitSearch = function() {
            updateFiltersCookies();

            vm.paymentFeeTable.page(1);
            vm.paymentFeeTable.reload();
        }


        /** 
         * get Protocolled procedureInstance file 
         * @param idPaymentFee 
         */
        vm.showProtocolledFile = function(idPaymentFee) {
            sphaPaymentServices.getProtocolledPaymentFeeFile(idPaymentFee, function (data, error) {
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
