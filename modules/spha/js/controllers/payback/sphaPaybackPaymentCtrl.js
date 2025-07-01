/**
 * @ngdoc function
 * @name sphaPaybackPaymentCtrl
 * @description controller for search payback data
 * # sphaPaybackPaymentCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaPaybackPaymentCtrl', sphaPaybackPaymentCtrl);
        
    sphaPaybackPaymentCtrl.$inject = [ '$scope', 'NgTableParams', '$cookies',
        '$document', '$compile', '$q', '$state', '$rootScope', '$window', 'shareDataServices', 'sphaPaymentServices', 'loadingSpinnerService',
        'sphaUtilsServices', 'sphaCompanyServices', 'cityServicesSpha', 'httpServices', 'SweetAlert', '$translate', 'PropertiesServiceSpha' ];

    function sphaPaybackPaymentCtrl ( $scope, NgTableParams, $cookies, 
        $document, $compile, $q, $state, $rootScope, $window, shareDataServices, sphaPaymentServices, loadingSpinnerService,
        sphaUtilsServices, sphaCompanyServices, cityServicesSpha, httpServices, SweetAlert, $translate, PropertiesServiceSpha ) {
        
        var vm = this;
        vm.companies = null;
        vm.region = null;
        vm.queryType = $state.params['queryType'];
        vm.procedureType = $state.params['procedureType'];
        vm.procedureId = $state.params['procedureId'];
        vm.isLoading = false;
        vm.isProtocolling = false;
        vm.isFieldsToShow=false;

        var originProtocolPage = false;
        
        var sortingKeyCookie;
        var sortingValueCookie;
        var procedureDTO = null;
        
        
        var apiProcedimentiUrl = PropertiesServiceSpha.get("baseUrlProcedure");
        var exportUrl = apiProcedimentiUrl + "api/payments/procedure-payment/report/";
        
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

        $scope.sumFee = function (listFee) {
            if (listFee != null && listFee !== []) {
                var sum = 0.00;
                listFee.forEach(fee => {
                    if(fee.status === 'STAMPED') {
                        sum += stringToFloat(fee.paidAmount);
                    }
                });
                return currencyFormatIT(sum);
            }
            return currencyFormatIT(0.00);
        };

        $scope.getDifference = function (totalAmount, feesValue) {
            return currencyFormatIT(stringToFloat(totalAmount) - stringToFloat(feesValue));
        };
        
        function stringToFloat(str) {
            return parseFloat(str.toString().replaceAll('.', '').replaceAll(',', '.'));
        }

        function currencyFormatIT(num) {
            return (
                num
                    .toFixed(2) // always two decimal digits
                    .replace('.', ',') // replace decimal point character with ,
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
            );
        }

        /**
         * Actions callback
         * @param {*} action Action name
         * @param {*} row Action object
         */
        $scope.onActionCallback = function (action, objectRow ) {
            switch (action) {
                case 'PAYMENT_MANAGE':
                	var paymentFeeSubmitted = false;
                	objectRow.paymentFees.forEach(fee => {
                		if(fee.status == 'SUBMITTED') {
                			paymentFeeSubmitted=true;
                			submitPaymentFeeSubmitted(fee.id);
                		}
                	});
                	
                	if(!paymentFeeSubmitted) {
                		setOperationParams(objectRow);
                        $state.go('spha.submitPayment', {procedureType: vm.procedureType, queryType: vm.queryType, procedureId: vm.procedureId});
                	}
                    break;
                case 'PAYMENT_PROTOCOL':
                    $state.go('spha.viewPaymentFee', {paymentId: objectRow.id, procedureType: vm.procedureType, queryType: vm.queryType});
                    break;
                
                default:
                    console.log('Unknown Action: ' + action);
            }
        }
        
        
        vm.goBack = function () {
            console.log(vm.procedureType.toLowerCase());
            console.log(originProtocolPage);
        	if(originProtocolPage) {
        		var url = 'spha.' + vm.procedureType.toLowerCase() + 'ProcedureInstanceView';
        		$state.go(url, {procedureType: vm.procedureType, queryType: vm.queryType, procedureId: vm.procedureId});
        	} else {
        		if ($rootScope.goBack) {
                    $state.go($rootScope.goBack, {procedureType: vm.procedureType, queryType: vm.queryType, procedureId: vm.procedureId});
                } else {
                    $window.history.back();
                }
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
            }
            
            vm.region = null;
            updateFiltersCookies();
            $scope.resetOrderBy();
        };

        
		vm.exportReport = function(form) {
			var obj = {
				unpaged: true,
				filters: {
					codiceSis: vm.companies ? {in: vm.companies} : null, 
                    regionCode: vm.region ? {in: getRegionCodes(vm.region)} : null,
                    procedureId: vm.procedureInstanceDTO ? {equals: vm.procedureInstanceDTO.procedure.id} : {equals: vm.procedureId },                    
                    procedureType: { equals: vm.procedureType }
                },
		 	};
			
			var reportType =  null;
			var userFileType = null;
			
			
			if(vm.queryType == 'SHELF_SHARE_REGION') {
				reportType = 'SHELF_SHARE_REGION';
				userFileType = '/SHELF_REPORT';
			} else {
				reportType =  "PAYMENT_AZIENDA_" + vm.procedureType;
				userFileType = "/PAYMENT_AZIENDA_" + vm.procedureType + "_REPORT";
			}
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
         * Set shared data between controllers
         */
        function setOperationParams(payment) {           
            shareDataServices.setLS(payment, 'OPERATION_PAYMENT_PARAMS');
            shareDataServices.set('spha.paymentManagement', 'ORIGIN_PAGE');
        }

        /**
         * Enhances data object array building Operation object
         * containing Operation name callback and parameter object
         * and adding it to each row
         * @param {*} data data object array
         */

        function rowOperationsObject(data) {
            if (data) {
				//prendo lo stato del procedimento
				var status = procedureDTO.status;
                data.forEach(function (row) {
                    row.operations = [];
                    var operations = [];
                    if (row.paymentFees.length > 0){
                        row.paymentFees.forEach(fee => {
						if (status=='STARTED'){
                            if($scope.actions && 
                            		$scope.actions.indexOf('PAYMENT_CREATE') != -1 && procedureDTO && fee.status == 'STAMPED' 
                            && row.paymentFees.length < procedureDTO.feeNumber 
                            && operations.indexOf('PAYMENT_MANAGE') == -1 ) {
                                operations.push('PAYMENT_MANAGE');
                            }

                            if(fee.status == 'STAMPED' && operations.indexOf('PAYMENT_PROTOCOL') == -1) {
                                // se c'è almeno un pagamento in draft, allora bisogna sottomettere ancora qualche rata
                                operations.push('PAYMENT_PROTOCOL');
                                
                            }

                            if( $scope.actions &&  $scope.actions.indexOf('PAYMENT_CREATE') != -1 && 
                            (fee.status == 'DRAFT' || fee.status == 'SIGNED' || fee.status == 'DELETED' || 
                            fee.status == 'SIGNED_DELETED' || fee.status == 'DELETED_PARENT') && operations.indexOf('PAYMENT_MANAGE') == -1) {
                                // se c'è almeno un pagamento in draft, allora bisogna sottomettere ancora qualche rata
                                operations.push('PAYMENT_MANAGE');
                                
                            }
                            
                            if($scope.actions && 
                            		$scope.actions.indexOf('PAYMENT_CREATE') != -1 && procedureDTO && fee.status == 'SUBMITTED' 
                                        
                                        && operations.indexOf('PAYMENT_MANAGE') == -1) {
                            	operations.push('PAYMENT_MANAGE');
                            }
						}else{
							//procedimento non attivo mostro solo dati
						 	operations.push('PAYMENT_PROTOCOL');	
						}
                        });

                    } else {
                        if($scope.actions && $scope.actions.indexOf('PAYMENT_CREATE') != -1 && status=='STARTED') {
                            operations = ['PAYMENT_MANAGE'];
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
                    
                });
            }
            
        }

        function getAllowedActions() {
        	var deferred = $q.defer();
           
           sphaPaymentServices.getAllowedActionsPayment(function (data, error) {
                if (error && error.message) {
                    vm.message = error.message;
                    vm.alertClass = error.alertClass;
                } else {
                    if (data && Array.isArray(data) && data.length > 0) {
                        $scope.actions = data;
                        deferred.resolve();
                    }
                }
            });
           return deferred.promise;
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
        function getFieldsToShow() {
			vm.isFieldsToShow=false;
			if (vm.procedureType=='SHELF'){
         	   sphaPaymentServices.getPaybackPaymentFieldsToShow(
                 function (data, success, error) {
					 if (data) {
		                vm.isFieldsToShow=true;
		            } else {
		               vm.isFieldsToShow=false;
		            }
                  
                });
			}else{
				 vm.isFieldsToShow=true;
			}
         }

        
        /**
         * Funzione per recuperare i dati per popolare la NGTable
         */
        function getData(obj) {
            var deferred = $q.defer();
            sphaPaymentServices.getPaybackPayment(
                obj, function (data, success, error) {
                   handleTableDataResponse(data, error, deferred);
					getFieldsToShow();
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
                
            }else{
	 			getProcedureDTO(vm.procedureId);
			}
            shareDataServices.set(vm.procedureType, 'ORIGIN_PAGE_PROCEDURE_TYPE');
            
            if(shareDataServices.get('PAYMENT_PROTOCOL_PAGE')) {
        		originProtocolPage = shareDataServices.get('PAYMENT_PROTOCOL_PAGE');
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
                            codiceSis: vm.companies ? {in: vm.companies} : null, 
                            regionCode: vm.region ? {in: getRegionCodes(vm.region)} : null,
                            procedureId: vm.procedureInstanceDTO ? {equals: vm.procedureInstanceDTO.procedure.id} : {equals: vm.procedureId }
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
                vm.amountTable.page(1);
            }
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
            if (shareDataServices.get('paymentAifaCompanies')) {
                vm.companies = shareDataServices.get('paymentAifaCompanies');
                $scope.lockedMode = true;
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
            getAllowedActions().then(function () {initTable();});
            
            
        }
        
        
        function submitPaymentFeeSubmitted(paymentFeeId) {
			// invio id procotollo per riprovare a fare timbro e update      
        	vm.isProtocolling = true;
        	sphaPaymentServices.retryProtocolSignatureAndUpdate(paymentFeeId, function (protocol_success, protocol_error) {
        		 
                  if (JSON.stringify(protocol_success) != "{}" && protocol_success != null && protocol_success != 'PROTOCOL_NOT_CREATED'){
                      // documento firmato
                	  SweetAlert.swal({
                		  title: $translate.instant('PROTOCOL_PAYMENT_FILE_SUCCESS') + protocol_success.split("|")[1],
                          text: null,
                          type: 'success',
                          confirmButtonColor: '#337ab7',
                          confirmButtonText: $translate.instant('OK'),
                          closeOnConfirm: true,
                      });
                	  vm.isProtocolling = false;
                  	  
                  } else {
                  	var errorProtocol = "";
					if(protocol_success) {
						errorProtocol = protocol_success;
					} else {
						errorProtocol = protocol_error.message;
					}
                	SweetAlert.swal({
                            title: $translate.instant('PROTOCOL_FILE_ERROR_LABEL') + $translate.instant(errorProtocol) + $translate.instant('PROTOCOL_FILE_ERROR'),
                            text: null,
							type: 'error',
							confirmButtonColor: '#337ab7',
							confirmButtonText: $translate.instant('OK'),
							closeOnConfirm: true,
					});
                	vm.isProtocolling = false;
                	
              }
             });
        	vm.amountTable.reload();
        
		}

        init();
    }
})();
