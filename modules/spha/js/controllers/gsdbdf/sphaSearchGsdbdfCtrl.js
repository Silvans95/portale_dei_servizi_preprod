/**
 * @ngdoc function
 * @name sphaSearchGsdbdfCtrl
 * @description controller for search gsdbdf # sphaSearchGsdbdfCtrl Controller
 *              of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaSearchGsdbdfCtrl', sphaSearchGsdbdfCtrl);
    
    sphaSearchGsdbdfCtrl.$inject = [
        'PropertiesServiceSpha', '$rootScope', '$stateParams', '$state', '$scope', '$window', '$cookies', '$q', '$translate',
        'httpServices', 'NgTableParams', '$uibModal', '$filter', 'SweetAlert', 'sphaGsdbdfServices', 'shareDataServices',
        'sphaUtilsServices', 'sphaCompanyServices', 'sphaProcedureInstanceServices', 'sphaRectificationServices'];

    function sphaSearchGsdbdfCtrl(
        PropertiesServiceSpha, $rootScope, $stateParams, $state, $scope, $window, $cookies, $q, $translate,
        httpServices, NgTableParams, $uibModal, $filter, SweetAlert, sphaGsdbdfServices, shareDataServices,
        sphaUtilsServices, sphaCompanyServices, sphaProcedureInstanceServices, sphaRectificationServices) {
        
        // enumerationImports
        const rectificationTypes = sphaRectificationServices.rectificationTypeEnum;
        const rectificationDetailInfoTypes = sphaRectificationServices.rectificationDetailInfoTypeEnum;
        
        var vm = this;

        // URLS
        var apiAnagraphicUrl = PropertiesServiceSpha.get('baseUrlAnagraphic');
        var searchUrl = apiAnagraphicUrl + 'api/gsdbdf/list';
        var exportCsvUrl = apiAnagraphicUrl + 'api/gsdbdf/export';
        var exportPdfUrl = apiAnagraphicUrl + 'api/gsdbdf/report';
        var initialSortingKey = null;
        var initialSortingDirection = null;
        var procedureInstanceDTO = null;
        var rectificationDTO = null;
        var pdfRequest = null;
		var originPage = null;
		var sisNotIn = [];
        
        vm.message = '';
        vm.result = $stateParams.result;
        vm.isLoading = false;
        vm.filtersForm = null;
        vm.showData = false;
        vm.exportType = null;
        vm.companies = null;
        
        vm.rowForRectification = null;

        vm.rectificationDetailInfoTypeIconsUrl = {
            ADD: 'folder-plus-solid.svg', // TODO change with fa
											// fa-plus-solid???
            DEL: 'folder-minus-solid.svg', // TODO change with fa
											// fa-minus-solid???
        };
        
        // Init Filters' domains
        $scope.filters = null;
        
        $scope.filtersForRectification = null;

        $scope.filtersRequest = {
            gsdbdf: null,
            companies: null
        };

        $scope.exportTypes = [{value: 0, label: 'EXPORT_CSV'}, {value: 1, label: 'EXPORT_PDF'}];
        
        function getDefaultActions() {
            return { EXPORT: false, IMPORT: false, VIEW: false, EDIT: false, SUBMIT: false, CLEAR: false, SAVE: false, RECTIFICATION_VIEW_DETAIL: false};
        }
        
        function initSearchFilters() {
            $scope.filters = sphaGsdbdfServices.defaultSearchFilters();
            $scope.filtersForRectification = sphaGsdbdfServices.defaultSearchFiltersForRectification();
        }
        
        
        function handleCookiesAndSharedData() {
            initialSortingKey = $cookies.get('sortingKeyGsdbdf') ? $cookies.get('sortingKeyGsdbdf') : 'id';
            initialSortingDirection = $cookies.get('sortingValueGsdbdf') ? $cookies.get('sortingValueGsdbdf') : 'desc';

            var sharedValue = shareDataServices.get('instanceCompanies');
            if (sharedValue) {
                vm.companies = sharedValue;
                // add the company to filter
            }
            if (vm.companies != null) {
                $scope.filtersRequest.companies = (vm.companies);
            }
            if(shareDataServices.get('RECTIFICATION_DTO')) {
                shareDataServices.delete('RECTIFICATION_DTO');
            }
            
            // pdfRequest cookies
        	if(shareDataServices.get('PDF_REQUEST_PARAMS')){
        		pdfRequest = shareDataServices.get('PDF_REQUEST_PARAMS');  
        	}
        	
        	if(shareDataServices.get('ORIGIN_PAGE')) {
				originPage = shareDataServices.get('ORIGIN_PAGE');
			}
            
            procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
            
            // Recupero i filtri salvati nei cookies
            vm.id = $cookies.get('gsdbdfId') ? $cookies.get('gsdbdfId') : null;
            vm.gsdbdf = $cookies.get('gsdbdfGsdbdf') ? JSON.parse($cookies.get('gsdbdfGsdbdf')) : null;
        }
        
        function handleState() {
            var deferred = $q.defer();
            // / recupero l'istanza di procedimento se l'istanza salvata nei
			// cookie non corrisponde a quella presente nell'URL
            if($state.params['procedureInstanceId'] && (!(procedureInstanceDTO && procedureInstanceDTO.id && 
                    $state.params['procedureInstanceId'] === procedureInstanceDTO.id))) {
                sphaProcedureInstanceServices.getProcedureInstance($state.params['procedureInstanceId'], function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        procedureInstanceDTO = data;
                        
                        vm.companies = [procedureInstanceDTO.company];
                        $scope.filtersRequest.companies = vm.companies;
                        deferred.resolve();
                    }
                });
            } else {
                if(!vm.companies) {
                    vm.companies = [procedureInstanceDTO.company];
                    $scope.filtersRequest.companies = vm.companies;
                }
                deferred.resolve();
            }
            
            return deferred.promise;
        }
        
        /**
		 * Get massive action by user
		 */
        
        function handleRectificationResponse(responseData) {
            var rectificationIsOk = responseData && responseData.items && responseData.items.length === 1 &&  responseData.items[0].id;
            if (rectificationIsOk) {
                rectificationDTO = responseData.items[0];
            }
            
            if (rectificationIsOk) {
                shareDataServices.set(rectificationDTO, 'RECTIFICATION_DTO_' + sphaGsdbdfServices.anagraphicName);
            } else {
                shareDataServices.delete('RECTIFICATION_DTO_' + sphaGsdbdfServices.anagraphicName);
            }
            sphaRectificationServices.setMassiveActionByRectification(rectificationDTO, $scope.actions);
        }

        function getMassiveActionByUser() {
            var deferred = $q.defer();
            sphaGsdbdfServices.getMassiveActionByUser(function (data, error) {
                if (error && error.message) {
                    vm.message = error.message;
                    vm.alertClass = error.alertClass;
                } else {
                    if (data) {
                        $scope.actions = getDefaultActions();
                        if ($scope.actions) {
                            data.forEach(action => {
                                $scope.actions[action] = true;
                            });
                            sphaProcedureInstanceServices.setMassiveActionByProcedureInstance(procedureInstanceDTO, $scope.actions);
                            if ($scope.actions.EDIT === 'EDIT') {
                                $scope.canRectify = true;
                            }
                            if ($scope.actions.IMPORT === 'IMPORT') {
                                $scope.canImport = true;
                            }
                        }
                    }
                }
                deferred.resolve();
            });
            return deferred.promise;
        }
        
        
        
        /**
		 * Enhances data object array building Action object containing Action
		 * name callback and parameter object and adding it to each row
		 * 
		 * @param {*}
		 *            data data object array
		 */
         function rowActionsObjects(data) {
            if (data) {
                data.forEach(function (row) {
                    if (row && row.actions && row.actions.length > 0) {
                        row.actions = row.actions.map(function (a) {
                            return {
                                callback: $scope.onActionCallback,
                                object: row,
                                action: a
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

            if (!vm.gsdbdf || !vm.filtersForm || vm.filtersForm.$invalid) {
                deferred.resolve({
                    data: null,
                    total: 0,
                });
            } else {
                if( $scope.actions.RECTIFICATION_VIEW_DETAIL === true && rectificationDTO && rectificationDTO.id ) {
                    httpServices.post(sphaGsdbdfServices.searchWithRectificationsUrl + rectificationDTO.id, obj, function (data, success, error) {
                        handleTableDataResponse(data, success, error, deferred);

                        setSisNotInGroup(data.items);
                    });
                } else {
                    httpServices.post(sphaGsdbdfServices.searchUrl, obj, function (data, success, error) {
                        handleTableDataResponse(data, success, error, deferred);
                        setSisNotInGroup(data.items);
                    });
                }
            }
            return deferred.promise;
        }
        
        
        function setSisNotInGroup(gsdbdf) {
        	gsdbdf.forEach(sisInGroup => {
                if(sisInGroup != null && sisInGroup.companySis && sisNotIn.indexOf(sisInGroup.companySis) === -1) {
                    sisNotIn.push(sisInGroup.companySis);
                }
            });
        }
        
        /**
		 * Inizializzazione NGTable
		 */
        function initTable() {
            vm.anagraphicTable = new NgTableParams({
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
                        'property': sortingKey ? sortingKey : '',
                        'direction': sortingValue ? sortingValue.toUpperCase() : null,
                    }];
                    // enable loading spinner
                    vm.isLoading = true;
                    // object for api rest
                    var obj = {
                        start: (page - 1) * count,
                        length: count,
                        search: '',
                        filters: sphaGsdbdfServices.getFilters(vm),
                    };
                    if (sortingKey) {
                        obj.order = order;
                        $cookies.put('sortingKeyGsdbdf', order[0].property);
                        $cookies.put('sortingValueGsdbdf', order[0].direction);
                    }

                    // rendering data
                    var data = null;

                    data = getData(obj).then(function (result) {
                        params.total(result.total);
                        rowActionsObjects(result.data);
                        vm.isLoading = false;
                        return result.data;
                    });

                    return data;
                }
            });
        }

        /**
		 * Funzione per esportare i dati
		 */
        function exportData(obj, type) {
            var deferred = $q.defer();
            var exportUrl = null;
            if (type === 0) {
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
                        vm.alertClass = 'alert alert-danger';
                    }
                });
            }
            return deferred.promise;
        }
        
        function getRectification() {
            var deferred = $q.defer();
            if (procedureInstanceDTO && procedureInstanceDTO.id && vm.companies && vm.companies.length > 0 &&
                $scope.actions.RECTIFICATION_VIEW_DETAIL === true) {
                var criteria = {
                    procedureInstanceId: {equals: procedureInstanceDTO.id},
                    type: {equals: rectificationTypes[sphaGsdbdfServices.anagraphicName]},
                    companyCode: {in: vm.companies},
                    status: {equals: 'DRAFT'}
                };
                if($state.params['idRectification']) {
                    criteria['id'] = {equals: $state.params['idRectification']};
                    criteria.status = null;
                }
                sphaRectificationServices.getAllRectificationsByCriteria(
                    criteria,
                    null,
                    null,
                    true,
                    null,
                    function (data, error) {
                        if (error && error.message) {
                            vm.message = error.message;
                            vm.alertClass = error.alertClass;
                            $scope.actions = getDefaultActions();
                        } else {
                            handleRectificationResponse(data);
                        }
                        deferred.resolve();
                    });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }
        
        /**
		 * @param rectificationDetailType
		 * @param objectKeyInfoStringList
		 *            {JSON.stringify({objectKey: {aic9: string, validMarketing:
		 *            string, companyCode: string}, objectInfo: {aic6: string,
		 *            medicineDescription: string}})[]} array contente stringe
		 *            JSON di oggetti con questa rappresentazione è necessario
		 *            fare un parsing di ogni singolo elemento dell'array
		 */
        function createNewRectification(rectificationDetailType, objectKeyInfoStringList) {
            var deferred = $q.defer();
            var rectificationDtoToSend = {
                type: rectificationTypes[sphaGsdbdfServices.anagraphicName],
                companyCode: vm.rowForRectification.gsdbdfSis,
                description: 'DEFAULT_DESCRIPTION',
                procedureInstanceId: procedureInstanceDTO.id
            };
            sphaRectificationServices.createNewRectification(rectificationDtoToSend, function (data, error) {
                if(data && !(error && error.message)) {
                    rectificationDTO = data;
                    createRectificationInfoByKeyList(rectificationDetailType, objectKeyInfoStringList).then(function () {
                        deferred.resolve();
                    });
                }
                parseServiceResponse(data, error, {message: 'SUCCESS_SAVE_RECTIFICATION'});
            });
            return deferred.promise;
        }
        
        /**
		 * 
		 * @param objectKeyInfoStringList
		 *            {JSON.stringify({objectKey: {aic9: string, validMarketing:
		 *            string, companyCode: string}, objectInfo: {aic6: string,
		 *            medicineDescription: string}})[]} array contente stringe
		 *            JSON di oggetti con questa rappresentazione è necessario
		 *            fare un parsing di ogni singolo elemento dell'array
		 */
        function sendRectification(objectKeyInfoStringList) {
            var deferred = $q.defer();
            if($scope.actions.EDIT && vm.rowForRectification && rectificationDetailInfoTypes[vm.rowForRectification.rectificationDetailInfoType]) {
                var rectificationInfoType = rectificationDetailInfoTypes[vm.rowForRectification.rectificationDetailInfoType];
                if (rectificationDTO && rectificationDTO.id) {
                    createRectificationInfoByKeyList(rectificationInfoType, objectKeyInfoStringList).then(function () {
                        deferred.resolve();
                    });
                } else {
                    createNewRectification(rectificationInfoType, objectKeyInfoStringList).then(function () {
                        deferred.resolve();
                    });
                }
            }
            return deferred.promise;
        }
        
        /**
		 * 
		 * @param rectificationDetailType
		 * @param objectKeyInfoStringList
		 *            {JSON.stringify({objectKey: {gsdbdfSis: string,
		 *            companySis: string}, objectInfo: {groupDescription:
		 *            string, companyDescription: string}})[]} array contente
		 *            stringe JSON di oggetti con questa rappresentazione è
		 *            necessario fare un parsing di ogni singolo elemento
		 *            dell'array
		 */
        function createRectificationInfoByKeyList(rectificationDetailType, objectKeyInfoStringList) {
            var deferred = $q.defer();
            var requestBody = {
                idRectification: rectificationDTO.id,
                rectificationType: rectificationDTO.type,
                rectificationDetailType: rectificationDetailType,
                gsdbdfSis: vm.rowForRectification.gsdbdfSis,
                groupDescription:  vm.rowForRectification.groupDescription,
                objectKeyInfoStringList: objectKeyInfoStringList,
            };
            sphaRectificationServices.createGsdbbdfRectificationDetailInfosByKeys(requestBody, function (data, error) {
                parseServiceResponse(data, error, {message: 'SUCCESS_SAVE_RECTIFICATION'});
                if(!(error && error.message)) {
                    getRectification().then(function () {
                        vm.anagraphicTable.reload();
                        deferred.resolve();
                    });
                }
            });
            return deferred.promise;
        }
        
        /**
		 * 
		 * @param data
		 * @param error
		 * @param successMessage
		 * @param callback
		 * @param callbackArgs
		 */
        function parseServiceResponse(data, error, successMessage, callback, callbackArgs) {
            if (error && error.message) {
                vm.message = error.message;
                vm.alertClass = error.alertClass;
            } else {
                if (data) {
                    if (successMessage) {
                        vm.message = successMessage.message ? successMessage.message : 'SUCCESS';
                        vm.alertClass = successMessage.alertClass ? successMessage.alertClass : 'alert alert-success';
                    }
                    if(typeof callback === 'function') {
                        if (callbackArgs) {
                            callback(data, ...callbackArgs);
                        } else {
                            callback(data);
                        }
                    }
                }
            }
        }
        
        function handleTableDataResponse(data, success, error, deferred) {
            if (success) {
                deferred.resolve({
                    data: data.items,
                    total: data.total,
                });
            } else {
                vm.message = error;
                vm.alertClass = 'alert alert-danger';
            }
            sphaRectificationServices.setMassiveActionByRectification(rectificationDTO, $scope.actions);
        }
        

        vm.goToTop = function () {
            document.documentElement.scrollTop = 0;
        };

        vm.switchExportType = function (form, type) {
            SweetAlert.swal({
                    title: $translate.instant('CONFIRM_EXPORT_TYPE_SELECTED') + $translate.instant($scope.exportTypes[type].label) + '?',
                    text: null,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#337ab7',
                    confirmButtonText: $translate.instant('YES'),
                    cancelButtonText: $translate.instant('NO'),
                    closeOnConfirm: true,
                    closeOnCancel: true,
                }, function (isConfirm) {
                    if (isConfirm) {
                        vm.exportReport(form, type);
                    }
                }
            );
        };

        vm.exportReport = function (form, type) {
            vm.filtersForm = form;
            var obj = {
                filters: {
                    gsdbdf: vm.gsdbdf ? vm.gsdbdf : null,
                    gsdbdfDescription: $scope.filters.gsdbdf.elements[0].label
                },
            };

            exportData(obj, type).then(function (result) {
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

        /**
		 * 
		 * @param rectificationDetailInfoDto
		 */
        vm.alertDeleteRectification = function (row) {
            SweetAlert.swal({
            		title: "Sicuro di voler cancellare?",
                    text: null,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#337ab7',
                    confirmButtonText: $translate.instant('YES'),
                    cancelButtonText: $translate.instant('NO'),
                    closeOnConfirm: true,
                    closeOnCancel: true,
                }, function (isConfirm) {
                    if (isConfirm) {
                        vm.deleteRectificationDetail(row.object.rectificationDetailInfo);
                    } else {
                        vm.rowForRectification = buildRowForRectification(row, rectificationDetailInfoTypes.DEL);
                    }
                }
            );
        };
        
        /**
		 * Funzione per il submit della ricerca tramite input
		 */
        vm.submitSearch = function () {
            vm.anagraphicTable.reload();
        };
        
        /**
		 * save rectification
		 */
        vm.saveRectification = function (form) {
            if(form.$valid && $scope.actions.EDIT === true) {
                sphaGsdbdfServices.getRectificationAddKeys(
                    sphaGsdbdfServices.getFiltersForRectification(vm), 
                    vm.rowForRectification.rectificationDetailInfoType, 
                    function(data, error) {
                        // rectification cookies
                        if (error && error.message) {
                            vm.message = error.message;
                            vm.alertClass = error.alertClass;
                        } else {
                            if (data.items && data.items.length > 0) {
                                sendRectification(data.items).then(function () {
                                    vm.discard(form);
                                });
                            } else {
                                vm.message = 'Nessuna delle aziende selezione può essere rettificata in questo gruppo';
                                vm.alertClass = 'alert alert-warning';
                            }
                        }
                });
            }
        };
        
        vm.goBack = function () {
        
        	if(shareDataServices.get('RECTIFICATION_PROTOCOL_PAGE')) {
                shareDataServices.delete('RECTIFICATION_PROTOCOL_PAGE');
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
		 * delete rectification detail info
		 */
        vm.deleteRectificationDetail = function (rectificationDetailInfoDto) {
            if(rectificationDetailInfoDto && rectificationDetailInfoDto.id) {
                sphaRectificationServices.deleteRectificationDetail(rectificationDetailInfoDto, function (data, error) {
                    parseServiceResponse(data, error, {message: 'RECTIFICATION_DETAIL_DELETED', alertClass: 'alert alert-success'});
                    if(!(error && error.message)) {
                        getRectification().then(function(result) {
                            vm.anagraphicTable.reload();
                        });
                    }
                });
            }
        };
        
        vm.discard = function (form) {
            form.$setPristine();
            angular.forEach(form, function (value, key) {
                if (!key.startsWith('$')) {
                    vm[key] = null;
                }
            });
            vm.rowForRectification = null;
            $scope.filtersForRectification = sphaGsdbdfServices.defaultSearchFiltersForRectification();
        };
        
        
        /**
		 * Submit della rettifica
		 */
        vm.submit = function () {
        	if(rectificationDTO.status  === 'DRAFT' ||  rectificationDTO.status  === 'SIGNED') {
        		var pdfRequest =  {
                	    companyName: $scope.filters.gsdbdf.elements[0].label,
                	    companyCode: $scope.filters.gsdbdf.elements[0].value,
                	    procedure: $translate.instant(procedureInstanceDTO.procedure.type + '_LABEL'),
                	    idRectification: rectificationDTO.id ,
                	    rectificationType: rectificationDTO.type,
                	    idProcedureInstance: rectificationDTO.procedureInstanceId,
                	    rectificationStatus: rectificationDTO.status
                	};
                	// invio questa request alla pagina di sottomissione
					// rettifiche
                    shareDataServices.set(pdfRequest, 'PDF_REQUEST_PARAMS');
        			shareDataServices.set('spha.searchGsdbdf', 'ORIGIN_PAGE');
                	$state.go('spha.submitRectification');
        	} else {
        		// non è presente nessuna rettifica da sottomettere
        		SweetAlert.swal({
                    title: $translate.instant('NO_RECTIFICATION_TO_SUBMIT'),
                    text: null,
                    type: 'warning',
                    confirmButtonColor: '#337ab7',
                    confirmButtonText: $translate.instant('YES'),
                    closeOnConfirm: true,
                });
        	}
        };
        
        /**
		 * 
		 * @param page
		 *            page
		 * @param search
		 *            search
		 */
        $scope.getCompaniesPossibleValues = function (page, search) {
            if (!page) {
                $scope.filtersForRectification.companies.elements = [];
            }
            $scope.filtersForRectification.companies.page = page;
            var companyFilters = {
                allCompanies: true,
                sisNotInGroup: sisNotIn && sisNotIn.length > 0 ? sisNotIn : undefined
            };
            sphaCompanyServices.getPossibleValues(page, companyFilters, search, function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        sphaUtilsServices.mapSearchFilterResponse([data], $scope.filtersForRectification);
                    }
                });
        };

        $scope.getGsdbdfPossibleValues = function (page, search, form) {
            vm.filtersForm = form;
            if (!page) {
                $scope.filters.gsdbdf.elements = [];
            }
            $scope.filters.gsdbdf.page = page;
            sphaGsdbdfServices.getPossibleValues(page,
                $scope.filtersRequest, search,
                function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        sphaUtilsServices.mapSearchFilterResponse([data], $scope.filters);
                        vm.gsdbdf = sphaUtilsServices.prefillFilterWithFirstValue($scope.filters, 'gsdbdf', true);
                        vm.showData = true;
                    }
                });
        };
        
         $scope.getGsdbdfPossibleValuesRectification = function (page, search) {
            if (!page) {
                $scope.filtersForRectification.gsdbdf.elements = [];
            }
            $scope.filtersForRectification.gsdbdf.page = page;
            var filtersToUse = {
                gsdbdf: [vm.rowForRectification.gsdbdfSis]
            };
            sphaGsdbdfServices.getPossibleValues(page,
                filtersToUse, search,
                function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        sphaUtilsServices.mapSearchFilterResponse([data], $scope.filtersForRectification);
                    }
                });
        };


        // se l'elemento del form è invalido -> bordo rosso
        $scope.addClass = function (idField, form) {
            if (!$scope.readOnly && form && form[idField] && form[idField].$invalid) {
                return 'has-errors';
            }
            return '';
        };

        

        $scope.resetOrderBy = function () {
            $cookies.remove('sortingKeyGsdbdf');
            $cookies.remove('sortingValueGsdbdf');
            vm.anagraphicTable.sorting({id: 'desc'});
            vm.anagraphicTable.reload();
            vm.message = null;
            vm.alertClass = null;
        };


        /**
		 * Actions callback
		 * 
		 * @param {*}
		 *            action Action name
		 * @param {*}
		 *            row row
		 */
        $scope.onActionCallback = function (action, row) {
            switch (action) {
                case 'DELETE':
                    if(row.object.rectificationDetailInfo && row.object.rectificationDetailInfo.id) {
                        vm.alertDeleteRectification(row);
                    } else {
                        vm.rowForRectification = buildRowForRectification(row, rectificationDetailInfoTypes.DEL);
                    }
                    break;
                case 'NEW':
                    vm.rowForRectification = buildRowForRectification(row, rectificationDetailInfoTypes.ADD);
                    break;
                default:
                    alert('Hai premuto ' + action + ' sull\'azienda ' + row.object.companySis);
                    console.log('Unknown Action: ' + action);
            }
        };

        function buildRowForRectification(row, rectificationDetailInfoType) {
            return {
                gsdbdfSis: row.object.gsdbdfSis,
                groupDescription: row.object.groupDescription,
                companySis: row.object.companySis,
                companyDescription: row.object.companyDescription,
                actions: ['SAVE', 'DISCARD'],
                rectificationDetailInfoType: rectificationDetailInfoType
            };
        }
        
        function submitRectification() {
        	if(pdfRequest.rectificationStatus === 'DRAFT') {
        		submitRectificationDraft();
        	} else if (pdfRequest.rectificationStatus === 'SIGNED') {
        		submitRectificationSigned();
				// significa che è già stato firmato ma qualcosa è andato storto
				// sulla protocollazione
				// manda solamente richiesta di protocollazione
			}
        }

		function submitRectificationDraft() {
			sphaRectificationServices.submitRectification(pdfRequest, function (idFile,  errorSubmit) {
    			var errors = {};
    			if(!idFile){
    			    errors.message = errorSubmit && errorSubmit.message ? errorSubmit.message : errorSubmit;
    	            errors.alertClass = 'alert alert-danger';
    	        } 
    			else {
    				var signRequest = {
    					    successUrl: "/rectification/signConnector?entityType=" + pdfRequest.rectificationType,
    					    fileParams: [{
    					        "entityId": pdfRequest.idRectification, // id
																		// rettifica
    					        "entityCategory":"RECTIFICATION",
    					        "entityType": pdfRequest.rectificationType,
    					        "eventId": 0 // evento SPH_RECT_EVENT
    					    }]
    					}
    				// data -> id file appena generato
    				sphaRectificationServices.signRectificationGet(signRequest, idFile, function (data,  error) {
            			
            			if(!data){
            			    errors.message = error && error.message ? error.message : error;
            	            errors.alertClass = 'alert alert-danger';
            	            
            	            SweetAlert.swal({
                                title: $translate.instant('ERROR_FET'),
                                text: null,
                                type: 'error',
                                confirmButtonColor: '#337ab7',
                                confirmButtonText: $translate.instant('YES'),
                                closeOnConfirm: true,
                            
                            });
            	        } else {
            	        	$window.location.href = data;
            	        }
            			
            		});
    			} 
				
	        });
		}
		
		function submitRectificationSigned() {
			
			if(pdfRequest) {
        		var criteria = {
        				rectificationId: {equals: pdfRequest.idRectification },
        				category: {equals: 'DOC_SUBMIT'},
        				deleted: {equals: false},
        				type: {equals: 'RECTIFICATION_PDF_SIGNED'}
        		};
        
        		sphaRectificationServices.getRectificationFiles(criteria, function (files, error) {
            		if(files) {
            			
            			var maxId = files.reduce(
            					  (max, file) => (file.id > max ? file.id : max),
            					  files[0].id
            					);
        				var requestProtocolFile = {
                     		idProcedureInstance: pdfRequest.idProcedureInstance,
                     		idDocument: maxId, // capire come recuperarlo
                     		idRectification: pdfRequest.idRectification,
    						anagraphicType: 'GSDBDF'
                         }
                    	sphaRectificationServices.protocollRectificationFile(requestProtocolFile, function (protocol_success, protocol_error) {
                              if (protocol_error.message) {
                                  vm.message = protocol_error.message;
                                  vm.alertClass = protocol_error.alertClass;
                              } else {
                                  // documento firmato
                            	  SweetAlert.swal({
                                      title: $translate.instant('PROTOCOL_FILE_SUCCESS_RECTIFICATION'),
                                      text: null,
                                      type: 'success',
                                      confirmButtonColor: '#337ab7',
                                      confirmButtonText: $translate.instant('YES'),
                                      closeOnConfirm: true,
                                  });
                              	  // redirect(originPage); TODO la funzione
									// non è dichiarata nel controller
                              }
                     });
        				
            		} else {
            			vm.message = error.message;
                        vm.alertClass = error.alertClass;
            		}
            		
                });
        	}
		}
        
        function init() {
            // init filters
            initSearchFilters();
            // Recupero i filtri salvati nei cookies dalla pagina delle istanze
			// o dalla stessa pagina
            handleCookiesAndSharedData(true);

            handleState().then(function (result) {
                // Recupero le azioni per l'utente
                getMassiveActionByUser().then(function (result) {
                    getRectification().then(function (result) {
                        // inizializzo la tabella
                        initTable();
                    });
                });
            });
        }
        // http://localhost:8080/portale-aifa/#/spha/gsdbdf/search?procedureInstanceId=1&idRectification=201
        init();
    }
})();