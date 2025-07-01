/**
 * @ngdoc function
 * @name sphaSearchRectificationCtrl
 * @description controller for search rectification #
 *              sphaSearchRectificationCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaSearchRectificationCtrl',
            ['PropertiesServiceSpha', 'sphaCompanyServices', 
                '$rootScope', '$stateParams', '$state', '$scope', '$window', '$cookies', '$q', '$translate', 'httpServices',
                'NgTableParams', '$uibModal', 'shareDataServices', '$filter', 'SweetAlert', 'sphaRectificationServices', 'sphaGsdbdfServices', 'sphaUtilsServices',
                'sphaProcedureInstanceServices', '$sce',
                function (PropertiesServiceSpha, sphaCompanyServices,
                          $rootScope, $stateParams, $state, $scope, $window, $cookies, $q, $translate, httpServices,
                          NgTableParams, $uibModal, shareDataServices, $filter, SweetAlert, sphaRectificationServices, sphaGsdbdfServices, sphaUtilsServices,
                          sphaProcedureInstanceServices, $sce) {

                    // DECLARE GLOBAL non $scope VARIABLES/CONSTANTS
                    var vm = this;

                    // declare sorting keys
                    var initialSortingKey = null;
                    var initialSortingDirection = null;

                    // DECLARE this VARIABLES

                    vm.message = "";
                    vm.result = $stateParams.result;
                    vm.isLoading = false;
                    vm.isProtocolling = false;
                    vm.filtersForm = null;
                    vm.companies = null;
                    vm.status = null;
                    vm.type = null;
                    vm.gsdbdf = null;
                    vm.pratica = null;
                    vm.showData = true;
                    vm.rectificationTable = null;
                    vm.operations = null;
                    
                    $scope.statutes = [];

                    // Init Filters' domains
                    $scope.filters = {
                        companies: {elements: [], page: 0},
                        type: null,
                        gsdbdf: {elements: [], page: 0}
                    };
                    
                    $scope.filtersRequest = {
                        companies: { companies: [] },
                        gsdbdf: { gsdbdf: [] }
                    }
                    

                    // DECLARE $scope FUNCTIONS

                    /**
					 * Date Pickers
					 */
                    $scope.datesOptions = {
                        'TIME_FROM': {opened: false,datepickerOptions: {}},
                        'TIME_TO': {opened: false,datepickerOptions: {}}
                    };

					$scope.getColorForClosingDate = function (rectificationStatus) {
					    switch(rectificationStatus) {
                            case 'RELOADED_NOT_APPROVED':
					    	case 'NOT_APPROVED':
					    		return '#ff0015';
                            case 'RELOADED_APPROVED':
					    	case 'APPROVED':
					    		return '#4ee44e';
                            case 'RELOADED_PARTIALLY_APPROVED':
					    	case 'PARTIALLY_APPROVED':
					    		return 'yellow';
					    	default:
					    		return '';
					    }
					};

                    // DECLARE FUNCTIONS
                    function handleCookiesAndSharedData() {
                        initialSortingKey = $cookies.get('sortingKeyRectification') ? $cookies.get('sortingKeyRectification') : 'rectificationCompanies';
                        initialSortingDirection = $cookies.get('sortingValueRectification') ? $cookies.get('sortingValueRectification') : 'desc';

                        vm.status = $cookies.get('rectificationStatus') ? JSON.parse($cookies.get('rectificationStatus')) : null;
                        vm.gsdbdf = $cookies.get('rectificationGsdbdf') ? $cookies.get('rectificationGsdbdf') : null;
                        vm.gsdbdfName = $cookies.get('rectificationGsdbdfName') ? $cookies.get('rectificationGsdbdfName') : null;
                        if (vm.gsdbdf) {
                            $scope.filters.gsdbdf.elements.push({value: vm.gsdbdf, label: vm.gsdbdfName});
                        } 
                        vm.companies = $cookies.get('rectificationCompanies') ? $cookies.get('rectificationCompanies') : null;
                        vm.companyName = $cookies.get('rectificationCompaniesName') ? $cookies.get('rectificationCompaniesName') : null;
                        if (vm.companies) {
                            $scope.filters.companies.elements.push({value: vm.companies, label: vm.companyName});
                        }
                        vm.description = $cookies.get('description') ? $cookies.get('description') : null;
                        vm.rectificationId = $cookies.get('rectificationId') ? $cookies.get('rectificationId') : null;
                        vm.timeFrom = $cookies.get('timeTo') ? new Date($cookies.get('timeTo')) : null;
                        vm.timeTo = $cookies.get('timeTo') ? new Date($cookies.get('timeTo')) : null;
                        
                       
                    }
                    
                    function handleState() {
                        if($state.params['rectificationId']) {
                            vm.rectificationId = $state.params['rectificationId'];
                        }
                        if($state.params['rectificationType']) {
                            vm.type = $state.params['rectificationType'];
                        }
                        if ($state.params['docOnly']) {
                            if ($state.params['idRectification']) {
                                vm.showProtocolledFile($state.params['idRectification']);
                            }
                        }
                    }

                    function updateFiltersCookies() {
                    	
                    	updateCookie('rectificationStatus', vm.status ? JSON.stringify(vm.status) : null);                    	
                        updateCookie('rectificationCompanies', vm.companies ? vm.companies : null);
                        updateCookie('rectificationGsdbdf', vm.gsdbdf ? vm.gsdbdf : null);
                        updateCookie('rectificationCompaniesName', vm.companyName ? vm.companyName : null);
                        updateCookie('rectificationGsdbdfName', vm.gsdbdfName ? vm.gsdbdfName : null);
                        updateCookie('description', vm.description ? vm.description : null);
                        updateCookie('rectificationId', vm.rectificationId ? vm.rectificationId : null);
                        updateCookie('timeFrom', vm.timeFrom ? vm.timeFrom.toISOString() : null);
                        updateCookie('timeTo', vm.timeTo ? vm.timeTo.toISOString() : null);
                    }

                    function updateCookie(cookieName, cookieValue) {
                        if (cookieValue) {
                            $cookies.put(cookieName, cookieValue);
                        } else {
                            $cookies.remove(cookieName);
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
                    
                    function goToCorrespondentRectificationType(row) {
                    	var url = '';
                    	switch(row.type) {
                    		
                    		case 'MEDICINE':
                    			url = 'spha.searchMedicine';
                    			break;
                    		case 'INNOVATIVE':
                    			url = 'spha.searchInnovative';
                    			break;
                    		case 'ORPHAN':
                    			url = 'spha.searchOrphan';                    			
                    			break;
                    		case 'TRANSPARENCY':
                    			url = 'spha.searchTransparency';
                    			break;
                    		case 'COMPANY':
                    			url = 'spha.detailCompany';
                    			break;
                    		case 'GSDBDF':
                    			url = 'spha.searchGsdbdf';
                    			break;
                    		
                    			
                    	}
                    	sphaProcedureInstanceServices.getProcedureInstance(row.procedureInstanceId, function (data, error) {
                			if (error && error.message) {
                                vm.message = error.message;
                                vm.alertClass = error.alertClass;
                            } else {
                            	shareDataServices.set(data, 'SELECTED_PROCEDURE_INSTANCE_DTO');
                                $state.go(url, {
                                    'procedureInstanceId': row.procedureInstanceId ? row.procedureInstanceId : undefined,
                                    'idRectification': row.id ? row.id : undefined
                                });
                            }
                        });
                    	
                    }


                    /**
					 * Enhances data object array building Operation object
					 * containing Operation name callback and parameter object
					 * and adding it to each row
					 * 
					 * @param {*}
					 *            data data object array
					 */
                    function rowOperationsObject(data) {
                        if (data) {
                            data.forEach(function (row) {
                            	row.operations = [];
                            	if (row && row.actions && row.actions.length>0){
	                            	var operations = [];
	                            	switch(row.status) {
	                                	case 'DRAFT':
	                                	case 'SIGNED':
	                                		if(row.actions.indexOf('RECTIFICATION_SUBMIT') != -1) {
	                                			operations.push('DRAFT');
	                                		}
	                                		if(row.actions.indexOf('RECTIFICATION_DELETE') != -1) {
	                                			operations.push('DELETE');
	                                		}
	                                		break;
	                                	case 'SUBMITTED':
	                                		if(row.actions.indexOf('RECTIFICATION_STAMP') != -1) {
	                                			operations.push('SUBMITTED');
	                                		}
	                                		break;
	                                	case 'CHECKED_OUT':
	                                	case 'STAMPED':
	                                		if(row.actions.indexOf('RECTIFICATION_DELETE') != -1) {
	                                			operations.push('DELETE');
	                                		}
	                                		operations.push('CHECKED_OUT');
	                                		break;
                                        case 'RELOADED_NOT_APPROVED':
	                                	case 'RELOADED_PARTIALLY_APPROVED':
	                                	case 'NOT_APPROVED':
	                                	case 'PARTIALLY_APPROVED':
	                            			operations = ['CHECKED_IN', 'VIEW'];
	                            			if (row.actions.indexOf('RECTIFICATION_CLOSE') != -1) {
	                            				operations.push('CHECK');
	                                		}
	                        				break;
	                                	case 'CHECKED_IN':
                                        case 'RELOADED_APPROVED':
	                                	case 'APPROVED':
	                        				operations = ['CHECKED_IN'];
	                        				if (row.actions.indexOf('RECTIFICATION_CLOSE') != -1) {
	                        					operations.push('CHECK');
	                                		}
	                        				break;
	                            		}
	                            	
	                            	row.operations = operations.map(function(status){
											var noCircularRefRow = angular.copy(row, {}); // do
																							// note
																							// remove
																							// needed
																							// to
																							// avoid
																							// circular
																							// references
                                            return {
                                                callback: $scope.onActionCallback,
                                                action: status,
                                                object: noCircularRefRow
                                            };
										});
                            	}
                            });
                        }
                    }

                    /**
					 * Funzione per recuperare i dati per popolare la NGTable
					 */
                    function getData(obj) {
                        var deferred = $q.defer();
                        if (vm.showData && obj.filters.status) {
                        	sphaRectificationServices.getAllRectificationsByCriteria(
                        			obj.filters,
                        			obj.start,
                                    obj.length,
                                    null,
                                    obj.order,
                                    function (data, error) {
                                        if (error && error.message) {
                                            vm.message = error.message;
                                            vm.alertClass = error.alertClass;
                                        } else {
                                        	deferred.resolve({
                                                data: data.items,
                                                total: data.total,
                                            });
                                        }
                                    });
                                
                            
                        }
                        return deferred.promise;
                    }

                    
                    function initTable() {
                        /**
						 * Inizializzazione NGTable
						 */
                        vm.rectificationTable = new NgTableParams({
                            page: 1,
                            count: 10,
                            sorting: {
                                [initialSortingKey]: initialSortingDirection.toLowerCase(),
                            }
                        }, {
                            enableRowSelection: true,
                            // number of element option to visualize for page
                            counts: [5, 10, 25, 50],
                            // get data : server side processing
                            getData: function (params) {
                                // for filtering data
                                var filter = params.filter();
                                // count of element
                                var count = params.count();
                                // page
                                var page = params.page();
                                // sorting
                                var sorting = params.sorting();
                                var sortingKey = Object.keys(sorting)[0];
                                var sortingValue = sortingKey ? sorting[sortingKey] : null;
                                var order = [{
                                    "property": sortingKey ? sortingKey : '',
                                    "direction": sortingValue ? sortingValue.toUpperCase() : null,
                                }
                                ];
                                // enable loading spinner
                                vm.isLoading = true;
                                // object for api rest
                                var obj = {
                                    start: (page - 1) * count,
                                    length: count,
                                    search: "",
                                    filters: createRectificationFilter()
                                };
                                if (sortingKey) {
                                    obj.order = order;
                                    $cookies.put('sortingKeyMedicine', order[0].property);
                                    $cookies.put('sortingValueMedicine', order[0].direction);
                                }

                                return getData(obj).then(function (result) {
                                        params.total(result.total);
                                        rowOperationsObject(result.data);
                                        vm.isLoading = false;
                                        return result.data;
                                    });
                            }
                        });
                        
                    }
                    
                    function createRectificationFilter() {
                    	var statutesToLoad = ['DRAFT', 'SUBMITTED', 'CHECKED_IN', 'CHECKED_OUT', 
                            'APPROVED', 'NOT_APPROVED', 'PARTIALLY_APPROVED',  
                            'RELOADED_APPROVED', 'RELOADED_NOT_APPROVED', 'RELOADED_PARTIALLY_APPROVED',
                            'SIGNED', 'DELETED_PARENT', 'STAMPED'];
                    	var statusToManage = ['SUBMITTED', 'CHECKED_IN', 'CHECKED_OUT'];
                    	
                    	var filters =  {
                        	type: vm.type ? {equals: vm.type } : null,
                        	companyCode: vm.companies ? {equals: vm.companies} : null,
                        	description: vm.description ? {contains: vm.description}  : null,
                        	rectificationId: vm.rectificationId ? {contains: vm.rectificationId } : null,
                            timeFrom: vm.timeFrom ? {greaterThan: new Date(vm.timeFrom.getFullYear(),vm.timeFrom.getMonth(), vm.timeFrom.getUTCDate() ) } : null,
                        	timeTo: vm.timeTo ? {lessThan: new Date(vm.timeTo.getFullYear(),vm.timeTo.getMonth(), vm.timeTo.getUTCDate() +1 ) } : null,  
                        };
                    	
                    	if(vm.status && vm.status.length > 0) {
                    		var intersectionStatus = vm.checkedIn ? statusToManage.filter(value => vm.status.includes(value)) : statutesToLoad.filter(value => vm.status.includes(value));
                    		filters.status =  intersectionStatus.length > 0 ? {in: intersectionStatus } : null ;
                    	} else {
                    		filters.status = vm.checkedIn ? {in: statusToManage } : {in: statutesToLoad };
                    	}
                    	
                    	if(vm.type == 'GSDBDF' && vm.gsdbdf) {
                    		filters.companyCode = {equals: vm.gsdbdf};
                    	}
                    	return filters;
                    }
                    
                    function getAllRectificationType() {
                    	sphaRectificationServices.getAllRectificationsType(function (data, error) {
                            if (error && error.message) {
                                vm.message = error.message;
                                vm.alertClass = error.alertClass;
                            } else {
                            	$scope.filters.type = data;
                            	verifyIsGsdbdf(data);
                            }
                        });
                    }        
                    
                    
                    
                    function getAllRectificationStatus() {
                    	sphaRectificationServices.getAllRectificationsStatus(function (data, error) {
                            if (error && error.message) {
                                vm.message = error.message;
                                vm.alertClass = error.alertClass;
                            } else {
                            	for( var i in data ){
        							var label = $translate.instant( data[i] + '_FILTER' );
        							$scope.statutes.push( {
        								label:label,
        								object:data[i]
        							});
        						}
                            }
                        });
                    }    
                    
                    function handleResponse(data, error) {
                    	if (error && error.message) {
                            vm.message = error.message;
                            vm.alertClass = error.alertClass;
                        } else {
                        	vm.rectificationTable.reload();
                        }
                    }

                    /**
					 * Set shared data between controllers
					 */
                    function setOperationParams(rectification, viewMode, aifaNote) {
                    	
                        var detailInputParams = {
                        	rectification: rectification,
                        	viewMode: viewMode,
                        	aifaNote: aifaNote
                        };
                        shareDataServices.set(detailInputParams, 'OPERATION_RECTIFICATION_PARAMS');
                    }
                    
                    /**
					 * create rectification request pdf for submission page
					 */
                    function sendPdfRequestRectification (rectification) {
                    	sphaProcedureInstanceServices.getProcedureInstance(rectification.procedureInstanceId, function (data, error) {
                			if (error && error.message) {
                                vm.message = error.message;
                                vm.alertClass = error.alertClass;
                            } else {
                            	sphaCompanyServices.getPossibleValues(0, { companies: [rectification.companyCode] }, '', function (company, error) {
                                    if (error && error.message) {
                                        vm.message = error.message;
                                        vm.alertClass = error.alertClass;
                                    } else {

                                        gatherSubscriberData(company.options[0]).then(function(vm) {

                                            var pdfRequest =  {
                                                empowered: vm.potereSoggetto,
                                                subjectName: vm.soggetto,
                                                subjectQualification: vm.qualificaSoggetto,
                                                companyHeadquarters: vm.sedeAzienda,
                                                companyName: company.options[0].label,
	    	    		                	    companyCode: rectification.companyCode,
	    	    		                	    procedure: $translate.instant(data.procedure.type + "_LABEL"),
	    	    		                	    idRectification: rectification.id ,
	    	    		                	    rectificationType: rectification.type,
	    	    		                	    idProcedureInstance: rectification.procedureInstanceId,
	    	    		                	    rectificationStatus: rectification.status
                                            }
                                            
                                            shareDataServices.set(pdfRequest, 'PDF_REQUEST_PARAMS');
                                            shareDataServices.set(rectification.description, 'OBJECT_REQUEST_PARAMS');
                                            shareDataServices.set('spha.searchRectification', 'ORIGIN_PAGE');
                                            $state.go('spha.submitRectification');
                                        })
                                    }
                                });
                            	
                        		
                            }
                        });
                    }

                    function gatherSubscriberData(company) {
                        var scope = $scope;
                        scope.modalInstance = $uibModal.open({
							animation: true,
							ariaLabelledBy: 'modal-title',
							ariaDescribedBy: 'modal-body',
							templateUrl: 'modules/spha/js/directives/modal/modalGatherSubscriberData.html',
							size: '900px',
							controllerAs: '$ctrl',
                            controller: function( $scope, shareDataServices ) {
            
                                var vm = this;
            
                                vm.subscriber = shareDataServices.get('PDF_SUBSCRIBER_PARAMS') || {};
            
                                vm.soggetto = vm.subscriber.soggetto || null;
                                vm.qualificaSoggetto = vm.subscriber.qualificaSoggetto || null;
                                vm.companyName = company?.label ?? scope.filters.companies.elements[0].label;
                                vm.sedeAzienda = vm.subscriber.sedeAzienda || null;
                                vm.potereSoggetto = vm.subscriber.potereSoggetto || null;
            
                                $scope.submit= function(){
                                    var data = {
                                        potereSoggetto: vm.potereSoggetto,
                                        soggetto: vm.soggetto,
                                        qualificaSoggetto: vm.qualificaSoggetto,
                                        sedeAzienda: vm.sedeAzienda,
                                    }
                                    shareDataServices.set(data, 'PDF_SUBSCRIBER_PARAMS');
                                    scope.modalInstance.close(data);
                                }

								$scope.cancel = function () {
									scope.modalInstance.dismiss( 'cancel' );
								};
                    
                                $scope.addClass = function (idField, form) {
                                    if (!$scope.readOnly && form && form[idField] && form[idField].$invalid) {
                                        return 'has-errors';
                                    }
                                    return '';
                                };
            
                                vm.getWidth = function(field) {
                                    var size = field && field.length || 0
                                    return {width: (!size || size < 20 ? 20 : size) + 5 + 'ch'};
                                };
							}
						});
                        return scope.modalInstance.result;
                    }

                    // DECLARE this FUNCTIONS
                    
                    vm.goToTop = function () {
                        document.documentElement.scrollTop = 0;
                    }

                    /**
					 * Funzione per il submit della ricerca tramite input
					 */
                    vm.submitSearch = function (form) {
                    	vm.filtersForm = form;
                        updateFiltersCookies();
                        if(form.$valid) {
                            vm.rectificationTable.page(1);
                            vm.rectificationTable.reload();
                        }
                    };

                    vm.onCompanyChange = function (companyName) {
                        vm.companyName = companyName;
                    };
                    
                    vm.onGroupChange = function (gsdbdfName) {
                        vm.gsdbdfName = gsdbdfName;
                    };
                    
                    vm.showAttachment = function(rectification) {
             
                    	return (rectification.rectificationId && ["STAMPED", "APPROVED", "PARTIALLY_APPROVED", "NOT_APPROVED", "CHECKED_OUT", "CHECKED_IN", "DELETED", "DELETED_PARENT",
                    		'RELOADED_APPROVED', 'RELOADED_NOT_APPROVED', 'RELOADED_PARTIALLY_APPROVED'].includes(rectification.status)) ;
                    }

                    /**
					 * Reset search
					 */
                    vm.reset = function () {
                       vm.companies = null;
                       vm.type = null;
                       vm.status = null;
                       vm.timeFrom = null;
                       vm.timeTo = null;
                       vm.description = null;
                       vm.rectificationId = null;
                       vm.checkedIn = null;
                       vm.rectificationId = null;
                       vm.gsdbdf = null;
	                   updateFiltersCookies();
	                   $scope.resetOrderBy();
                    };



                    vm.goBack = function () {
                    	if(shareDataServices.get('PAYMENT_PROTOCOL_PAGE')) {
                    		$state.go('spha.searchRectification');
                    	} else {
                    		 if ($rootScope.goBack) {
                                 $state.go($rootScope.goBack);
                             } else {
                                 $window.history.back();
                             }
                    	}
                       
                    };

                    
                    
                  	/**
					 * get Protocolled rectification file
					 * 
					 * @param idRectification
					 *            for rectification report generation
					 */
                    vm.showProtocolledFile = function(idRectification) {
                    	sphaRectificationServices.getProtocolledRectificationFile(idRectification, function (data, error) {
                    		if(data) {
                    			$scope.type = 'application/pdf';
                        	    var blob = new Blob([data], { type: $scope.type });
                        	    var fileURL = URL.createObjectURL(blob);
                        	    $scope.pdfContent = $sce.trustAsResourceUrl(fileURL);
                        	    var newWin = window.open(fileURL);
                        	    
                        	    if(!newWin || newWin.closed || typeof newWin.closed === 'undefined') 
                                {
                                    // POPUP BLOCKED
                                    alert('Impossibile aprire il pop up per visualizzare il documento');
                                }
                    		} else {
                    			vm.message = error.message;
                                vm.alertClass = error.alertClass;
                    		}
                    		
                        });
                    };

                    // DECLARE SCOPE FUNCTIONS

                    /**
					 * 
					 * @param page
					 *            page
					 * @param search
					 *            search
					 */
                    $scope.getCompaniesPossibleValues = function (page, search) {
                        if (!page) {
                            $scope.filters.companies.elements = [];
                        }
                        $scope.filters.companies.page = page;
                        sphaCompanyServices.getPossibleValues(page,
                            ($scope.filtersRequest.companies.companies != null &&
                                $scope.filtersRequest.companies.companies.length > 0)
                                ? $scope.filtersRequest.companies
                                : null, search,
                            function (data, error) {
                                if (error && error.message) {
                                    vm.message = error.message;
                                    vm.alertClass = error.alertClass;
                                } else {
                                    mapSearchFilterResponse([data]);
                                }

                            });

                    };

                    $scope.getGsdbdfPossibleValues = function (page, search) {
                        if (!page) {
                            $scope.filters.gsdbdf.elements = [];
                        }
                        $scope.filters.gsdbdf.page = page;
                        sphaGsdbdfServices.getPossibleValuesDistinct(page,
                        		 ($scope.filtersRequest.gsdbdf.gsdbdf != null &&
                                         $scope.filtersRequest.gsdbdf.gsdbdf.length > 0)
                                         ? $scope.filtersRequest.gsdbdf
                                         : null, search,
                            function (data, error) {
                                if (error && error.message) {
                                    vm.message = error.message;
                                    vm.alertClass = error.alertClass
                                } else {
                                    sphaUtilsServices.mapSearchFilterResponse([data], $scope.filters);
                                    if(!vm.gsdbdf) {
                                       vm.gsdbdf = sphaUtilsServices.prefillFilterWithFirstValue($scope.filters, 'gsdbdf', false);
                                    }
                                    vm.showData = true;
                                }
                            });
                    }
                    /**
					 * 
					 * @param dateField
					 *            dateField
					 */
                    $scope.openDatePopup = function (dateField) {
                        $scope.datesOptions[dateField].opened = !$scope.datesOptions[dateField].opened;
                    };

                    /**
					 * se l'elemento del form è invalido -> bordo rosso
					 * 
					 * @param idField
					 *            idField
					 * @param form
					 *            form
					 * @returns {string}
					 */
                    $scope.addClass = function (idField, form) {
                        if (!$scope.readOnly && form && form[idField] && form[idField].$invalid) {
                            return 'has-errors';
                        }
                        return '';
                    }
                    
                    $scope.resetOrderBy = function () {
                        $cookies.remove('sortingKeyRectification');
                        $cookies.remove('sortingValueRectification');
                        vm.rectificationTable.sorting({id: 'desc'});
                        vm.rectificationTable.reload();
                    };
                    

                    /**
					 * Actions callback
					 * 
					 * @param {*}
					 *            action Action name
					 * @param {*}
					 *            row Action object
					 */
                    $scope.onActionCallback = function (action, objectRow ) {
                        switch (action) {
                          	case 'VIEW':
                          		sphaRectificationServices.getRectificationEvent(objectRow.id, function (data, error) {
	                        		if (error && error.message) {
	                                    vm.message = error.message;
	                                    vm.alertClass = error.alertClass;
	                                } else {
	                                	setOperationParams(objectRow, true, data);
			                            $state.go('spha.closeRectification');
	                                }
	                            });
	                            break;
	                        case 'CHECKED_IN':
	                        	sphaRectificationServices.checkOutRectification(objectRow.id, function (data, error) {
	                        		handleResponse(data, error);
	                            });
	                            break;
	                        case 'CHECKED_OUT':
	                        	sphaRectificationServices.checkInRectification(objectRow.id, function (data, error) {
	                        		handleResponse(data, error);
	                            });
	                            break;
	                        case 'CHECK':
	                        	if(!['APPROVED','NOT_APPROVED','PARTIALLY_APPROVED','RELOADED_APPROVED', 'RELOADED_NOT_APPROVED', 'RELOADED_PARTIALLY_APPROVED'].includes(objectRow.status)) {
	                        		setOperationParams(objectRow, false, null);
		                            $state.go('spha.closeRectification');
	                        	}
	                            break;
	                        case 'DRAFT':
	                        case 'SIGNED':
	                        	// se non ha allegati e descrizione, va alla
								// pagina dell'anagrafica corrispondente
	                        	// chiedo gli allegati
	                        	if(objectRow.description == "DEFAULT_DESCRIPTION"  ) {
	                        		goToCorrespondentRectificationType(objectRow);
	                        	} else {
	                        		// se ha l'oggetto, va alla pagina di
									// sottomissione
	                        		// prelevo il tipo di procedimento associato
									// alla rettifica
	                        		// utilizzando l'id dell'istanza di
									// procedimento
	                        		sendPdfRequestRectification(objectRow);
	                        	}
                                
	                            break;
	                        case 'SUBMITTED':
	                        	submitRectificationSubmitted(objectRow.id);
	                        	break;
	                        case 'DELETE':
	                        	sphaRectificationServices.deleteRectification(objectRow.id, function (data, error) {
	                        		handleResponse(data, error);
	                            });
	                            break;
	                        default:
	                            console.log('Unknown Action: ' + action);
                        }
                    };
                    
                    
                    function submitRectificationSubmitted(rectificationId) {
            			// invio id procotollo per riprovare a fare timbro e
						// update
                    	vm.isProtocolling = true;
                    	sphaRectificationServices.retryProtocolSignatureAndUpdate(rectificationId, function (protocol_success, protocol_error) {
                    		 
	                          if (JSON.stringify(protocol_success) != "{}" && protocol_success != null && protocol_success != 'PROTOCOL_NOT_CREATED'){
	                              // documento firmato
	                        	  SweetAlert.swal({
	                        		  title: $translate.instant('PROTOCOL_FILE_SUCCESS_RECTIFICATION') + protocol_success.split("|")[1],
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
                    	
                    	vm.rectificationTable.reload();
                    
            		}
                    
                    /**
					 * Funzione associata al pulsante esporta per l'export in
					 * excel. Chiama il servizio rest export
					 */
                    vm.exportReport = function (form) {
                        vm.filtersForm = form;
                        var obj = {
                    		start: 0,
                            unpaged: true,
                            search: "",
                            filters: createRectificationFilter(),
                        };

                        sphaRectificationServices.exportRectificationList(obj, function (data, success, error) {
                    		if (success) {
                    			SweetAlert.swal({
                                    title: $translate.instant("EXPORT_DATA"),
                                    text: null,
                                    type: "success",
                                    confirmButtonColor: "#337ab7",
                                    confirmButtonText: $translate.instant('OK'),
                                    closeOnConfirm: true,
                                });
                    		}
                            	
                                
                        });

                    };
                    
                    function verifyIsGsdbdf(types) {
                    	if(types[0] == 'GSDBDF') {
                    		vm.type = types[0];
                    	}
                    }
                    
                    
                  
                    // DECLARE FUNCTIONS FOR INIT CONTROLLER
                    
                    function init() {
                        // Recupero i filtri salvati nei cookies dalla pagina
						// delle istanze o dalla stessa pagina
                        handleCookiesAndSharedData();
                        
                        handleState();
                        // inizializzo la tabella
                        initTable();
                        // chiedo al BE i tipi di rettifica consentiti
                        getAllRectificationType();
                        // chiedo al BE tutti gli stati di rettifica
                        getAllRectificationStatus()
                    }

                    // EXECUTIONS
                    init();
                }
            ]);
})();
