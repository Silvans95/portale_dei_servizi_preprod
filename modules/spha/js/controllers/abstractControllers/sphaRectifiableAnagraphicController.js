/**
 * @ngdoc function
 * @name sphaSearchMedicineCtrl
 * @description controller for search procedimenti
 * # sphaSearchMedicineCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaRectifiableAnagraphicController', sphaRectifiableAnagraphicController);
        
    sphaRectifiableAnagraphicController.$inject = [
        '$rootScope', '$stateParams', '$state', '$scope', '$window', '$cookies', '$translate', '$uibModal', '$filter', '$q', '$extend',
        '$compile', '$document',
        'NgTableParams', 'SweetAlert', 'loadingSpinnerService',
        'PropertiesServiceSpha', 'httpServices', 'shareDataServices',
        'sphaCompanyServices', 'sphaPossibleValueServices', 'sphaProcedureInstanceServices', 'sphaRectificationServices', 'sphaUtilsServices',
        'uploadServicesSpha'];
        
    function sphaRectifiableAnagraphicController (
        $rootScope, $stateParams, $state, $scope, $window, $cookies,  $translate,  $uibModal, $filter, $q, $extend,
        $compile, $document,
        NgTableParams, SweetAlert, loadingSpinnerService,
        PropertiesServiceSpha, httpServices, shareDataServices,
        sphaCompanyServices, sphaPossibleValueServices, sphaProcedureInstanceServices, sphaRectificationServices, sphaUtilsServices,
        uploadServicesSpha) {
        
        // enumerationImports
        const rectificationTypes = sphaRectificationServices.rectificationTypeEnum;
        const rectificationDetailInfoTypes = sphaRectificationServices.rectificationDetailInfoTypeEnum;
        

        // DECLARE GLOBAL non $scope VARIABLES/CONSTANTS
        var vm = $extend ? $extend : this;
        
        var sphaAnagService;
        var sortingKeyCookie;
        var sortingValueCookie;
        
        //URLS
        var searchUrl = null;
        var searchWithRectificationsUrl = null;
        var exportCsvUrl = null;
        var exportPdfUrl = null;
        var exportXlsxMassiveUrl = null;
        var createRectificationByImportUrl = null;

        // declare sorting keys
        var initialSortingKey = null; // from cookie
        var initialSortingDirection = null; // from cookie
        
        var procedureInstanceDTO = null; // from cookie
        
        var rectificationDTO = null;

        // DECLARE this VARIABLES
        
        vm.accordionRefPeriod = true;
        vm.accordionMedicineData = false;
        vm.accordionMarketingAndMore = false;
        vm.accordionMoreInfo = false;
        
        vm.accordionRectificationFilters = false;
        vm.accordionAic6RectificationSave = false;

        vm.message = '';
        vm.result = $stateParams.result;
        vm.isLoading = true;
        vm.filtersForm = null;
        vm.companies = null;
        vm.reimbursementClass = null;
        vm.atc = null;
        vm.fieldsToNotShow = null;
        vm.showData = true;
        vm.anagraphicTable = null;
        vm.isRectificationAic6ADD = false;
        vm.isRectificationAic6DEL = false;
        vm.companyForRectification = null;
        vm.companyNameForRectification = null;
        
        vm.rectificationDetailInfoTypeIconsUrl = sphaRectificationServices.rectificationDetailInfoTypeImageUrl;

        // DECLARE $scope variables
        $scope.actions = null;
        
        $scope.lockedMode = true; // locks search filters
        
        $scope.exportTypes = [{value: 0, label: 'EXPORT_CSV'}, {value: 1, label: 'EXPORT_PDF'},{value: 2, label: 'EXPORT_XLSX_MASSIVE'} ];
        
        /**
         * Date Pickers
         */
        $scope.datesOptions = {
            FIRST_MARKETING_FROM: {opened: false},
            FIRST_MARKETING_TO: {opened: false},
            VALID_MARKETING_FROM: {opened: false,datepickerOptions: {}},
            VALID_MARKETING_TO: {opened: false,datepickerOptions: {}},
            validMarketingForRectification: {opened: false,datepickerOptions: {}}
        };

        // DECLARE $scope FUNCTIONS
        
        /**
         * Controllo su periodo dati da-a
         */
        $scope.validateDate = function (form, dateToValidate, dateName) {
            vm.filtersForm = form;
            var date = new Date(dateToValidate).setHours(0, 0, 0, 0);
            var valid = date >= $scope.datesOptions[dateName].datepickerOptions.minDate.setHours(0, 0, 0, 0) &&
                date <= $scope.datesOptions[dateName].datepickerOptions.maxDate.setHours(0, 0, 0, 0);
            vm.filtersForm[dateName].$setValidity('daterange', valid);
        };
        

        // DECLARE FUNCTIONS
        function initSpinner() {
            var elSpin = $document.find('#loading-bar-spinner');
            if (elSpin.length === 0) {
                var loading = $compile(angular.element(loadingSpinnerService.loadingSpinner()))($scope);
                var el = $document.find('#loadingSpinnerRow');
                el.append(loading);
            }
        }

        function getDefaultActions() {
            return { EXPORT: false, IMPORT: false, VIEW: false, EDIT: false, SUBMIT: false, CLEAR: false, SAVE: false, RECTIFICATION_VIEW_DETAIL: false};
        }
        
        function handleCompaniesCookie(getFromSharedDataFirst) {
            var sharedValue = shareDataServices.get('instanceCompanies');
            if (sharedValue && getFromSharedDataFirst) {
                vm.companies = sharedValue;
                //add the company to filter
            } else if ($cookies.get(sphaAnagService.anagraphicName.toLowerCase() + 'Companies')) {
                vm.companies = JSON.parse($cookies.get(sphaAnagService.anagraphicName.toLowerCase() + 'Companies'));
            }
            if (vm.companies != null) {
                $scope.filtersRequest.companies.companies = (vm.companies);
            }
        }
        
        function handleValidMarketingCookie(getFromSharedDataFirst) {
            var sharedValue = shareDataServices.get('instanceValidMarketingFrom');
            if (sharedValue && getFromSharedDataFirst) {
                vm.validMarketingFrom = new Date(sharedValue);
            } else {
                vm.validMarketingFrom = $cookies.get(sphaAnagService.anagraphicName.toLowerCase() + 'ValidMarketingFrom') ? 
                    new Date($cookies.get(sphaAnagService.anagraphicName.toLowerCase() + 'ValidMarketingFrom')) : null;
            }
            sharedValue = shareDataServices.get('instanceValidMarketingTo');
            if (sharedValue && getFromSharedDataFirst) {
                vm.validMarketingTo = new Date(sharedValue);
            } else {
                vm.validMarketingTo = $cookies.get(sphaAnagService.anagraphicName.toLowerCase() + 'ValidMarketingTo') ?
                    new Date($cookies.get(sphaAnagService.anagraphicName.toLowerCase() + 'ValidMarketingTo')) : null;
            }
            setValidMarketing();
        }
        
        function setValidMarketing() {
            $scope.datesOptions.VALID_MARKETING_FROM.datepickerOptions.maxDate = vm.validMarketingTo;
            $scope.datesOptions.VALID_MARKETING_TO.datepickerOptions.maxDate = vm.validMarketingTo;
            $scope.datesOptions.validMarketingForRectification.datepickerOptions.maxDate = vm.validMarketingTo;
            
            $scope.datesOptions.VALID_MARKETING_FROM.datepickerOptions.minDate = vm.validMarketingFrom;
            $scope.datesOptions.VALID_MARKETING_TO.datepickerOptions.minDate = vm.validMarketingFrom;
            $scope.datesOptions.validMarketingForRectification.datepickerOptions.minDate = vm.validMarketingFrom;
        }
        
        function handleCookiesAndSharedData(getFromSharedDataFirst) {
            shareDataServices.delete('RECTIFICATION_DTO_' + sphaAnagService.anagraphicName);
            
            initialSortingKey = $cookies.get(sortingKeyCookie) ? $cookies.get(sortingKeyCookie) : 'id';
            initialSortingDirection = $cookies.get(sortingValueCookie) ? $cookies.get(sortingValueCookie) : 'desc';
            procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
            
            handleCompaniesCookie(getFromSharedDataFirst);
            handleValidMarketingCookie(getFromSharedDataFirst);
            
            if(shareDataServices.get('resetConfigs') && 
                shareDataServices.get('resetConfigs')[$state.current.name] && 
                shareDataServices.get('resetConfigs')[$state.current.name].resetFilters === true) {
                var resetConfigs = shareDataServices.get('resetConfigs');
                vm.reset();
                resetConfigs[$state.current.name].resetFilters= false;
                shareDataServices.set(resetConfigs, 'resetConfigs');
            }
            
            if ($cookies.get(sphaAnagService.anagraphicName.toLowerCase() + 'ReimbursementClass')) {
                vm.reimbursementClass = JSON.parse($cookies.get(sphaAnagService.anagraphicName.toLowerCase() + 'ReimbursementClass'));
            }
            if ($cookies.get(sphaAnagService.anagraphicName.toLowerCase() + 'Atc')) {
                vm.atc = JSON.parse($cookies.get(sphaAnagService.anagraphicName.toLowerCase() + 'Atc'));
            }
            if (vm.atc != null) {
                $scope.filtersRequest.atc.atc = (vm.atc);
            }
            if (vm.reimbursementClass != null) {
                $scope.filtersRequest.reimbursementClass.reimbursementClass = (vm.reimbursementClass);
            }
            
            sphaAnagService.getFiltersFromCookies(vm);
            
        }
        
        function handleState() {
            var deferred = $q.defer();
            /// recupero l'istanza di procedimento se l'istanza salvata nei cookie non corrisponde a quella presente nell'URL
           if($state.params['procedureInstanceId'] && (!(procedureInstanceDTO && procedureInstanceDTO.id && $state.params['procedureInstanceId'] &&
                    $state.params['procedureInstanceId'] === procedureInstanceDTO.id) || 
                    !vm.companies || !vm.companies.includes(procedureInstanceDTO.company))) {
                sphaProcedureInstanceServices.getProcedureInstance($state.params['procedureInstanceId'], function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        procedureInstanceDTO = data;
                        vm.validMarketingFrom = new Date(moment(procedureInstanceDTO.procedure.startPeriodDate)
                            .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z');
                        vm.validMarketingTo = new Date(moment(procedureInstanceDTO.procedure.endPeriodDate)
                            .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z');
                        vm.companies = [procedureInstanceDTO.company];
                        $scope.filtersRequest.companies.companies = vm.companies;
                        setValidMarketing();
                        deferred.resolve();
                    }
                });
           } else {
                if(!vm.validMarketingFrom) {
                    vm.validMarketingFrom = new Date(moment(procedureInstanceDTO.procedure.startPeriodDate)
                            .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z');
                }
                if (!vm.validMarketingTo) {
                    vm.validMarketingTo = new Date(moment(procedureInstanceDTO.procedure.endPeriodDate)
                        .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z');
                }
                if(!vm.companies) {
                    vm.companies = [procedureInstanceDTO.company];
                    $scope.filtersRequest.companies.companies = vm.companies;
                }
                setValidMarketing();
                deferred.resolve();
            }
            
            return deferred.promise;
        }

        function updateFiltersCookies() {
            sphaAnagService.updateFiltersCookies(vm);
        }
        
        /**
         * Enhances data object array building Action object
         * containing Action name callback and parameter object
         * and adding it to each row
         * @param {*} data data object array
         */
        function rowActionsObjects(data) {
            if (data) {
                var filtersUpdated = false;
                data.forEach(function (row) {
                    if(!filtersUpdated && vm.isRectificationAic6ADD && row && row.aic6 && row.medicineDescription) {
                        vm.aic6ForRectification = row.aic6;
                        vm.medicineDescriptionForRectification = row.medicineDescription;
                        filtersUpdated = true;
                    }
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

        function canGetData() {
            //TODO migliorare cercando di recuperare il form dal DOM
            return vm.showData && $scope.actions &&
                ((!(vm.isRectificationAic6ADD || vm.isRectificationAic6DEL) &&
                        vm.companies && vm.validMarketingFrom && vm.validMarketingTo) ||
                    ((vm.isRectificationAic6ADD || vm.isRectificationAic6DEL) && 
                        vm.aic6ForRectification && vm.validMarketingFrom && vm.validMarketingTo));
        }
        
        function handleTableDataResponse(data, success, error, deferred) {
            if (success) {
                if(vm.isRectificationAic6ADD || vm.isRectificationAic6DEL) {
                    if (!data.items || !(data.items && data.items.length > 0)) {
                        vm.message = 'NO_DATA_TO_RECTIFY_FOUND';
                        vm.alertClass = 'alert alert-danger';
                        if($scope.actions && $scope.actions.SAVE) {
                            $scope.actions.SAVE_RECTIFICATION_AIC6 = false;
                        }
                    } else {
                        if($scope.actions && $scope.actions.SAVE) {
                            $scope.actions.SAVE_RECTIFICATION_AIC6 = true;
                        }
                        vm.message = null;
                        vm.alertClass = null;
                    }
                } else {
                    if ($scope.actions) {
                        $scope.actions.SAVE_RECTIFICATION_AIC6 = false;
                    }
                }
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

        /**
         * Funzione per recuperare i dati per popolare la NGTable
         */
        function getData(obj) {
            var deferred = $q.defer();
            if (canGetData()) {
                if (!$scope.lockedMode && (!vm.filtersForm || vm.filtersForm.$invalid)) {
                    deferred.resolve({data: null,total: 0});
                } else {
                    if( $scope.actions.RECTIFICATION_VIEW_DETAIL === true && rectificationDTO && rectificationDTO.id ) {
                        httpServices.post(searchWithRectificationsUrl + rectificationDTO.id, obj, function (data, success, error) {
                            handleTableDataResponse(data, success, error, deferred);
                        });
                    } else {
                        httpServices.post(searchUrl, obj, function (data, success, error) {
                            handleTableDataResponse(data, success, error, deferred);
                        });
                    }
                }
            } else {
                deferred.resolve({data: null,total: 0});
            }
            return deferred.promise;
        }

        /**
         * Funzione per esportare i dati
         */
        function exportData(obj, type) {
            var deferred = $q.defer();
            var exportUrl = null;
            if (type === 0) {
                exportUrl = exportCsvUrl;
            } else if (type === 1) {
                exportUrl = exportPdfUrl;
            } else {
            	exportUrl = exportXlsxMassiveUrl;
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
        
        /**
         * Get massive action by user
         */
        function getMassiveActionByUser() {
            var deferred = $q.defer();
            sphaAnagService.getMassiveActionByUser(function (data, error) {
                if (error && error.message) {
                    vm.message = error.message;
                    vm.alertClass = error.alertClass;
                } else {
                    if (data) {
                        $scope.actions = getDefaultActions();
                        if($scope.actions) {
                            data.forEach(action => {
                                $scope.actions[action] = true;
                            });
                            sphaProcedureInstanceServices.setMassiveActionByProcedureInstance(procedureInstanceDTO, $scope.actions);
                        }
                    }
                }
                deferred.resolve();
            });
            return deferred.promise;
        }

        /**
         * handle data visibility rule
         */
        function handleDataVisibilityRule() {
            var deferred = $q.defer();
            sphaAnagService.getDataVisibilityRule(function (data, errors) {
                vm.showData = true;
                if (errors && errors.message) {
                    vm.message = errors.message;
                    vm.alertClass = errors.alertClass;
                    vm.showData = false;
                } else if (data && data.fieldsToNotShow) {
                    vm.fieldsToNotShow = data.fieldsToNotShow;
                }
                deferred.resolve();
            });
            return deferred.promise;
        }
        
        function getFilters() {
            var filters = sphaAnagService.getFilters(vm);
            if(filters && procedureInstanceDTO && sphaAnagService.tableType) {
                var dataImportIds = sphaProcedureInstanceServices.getDataImportIds(procedureInstanceDTO, sphaAnagService.tableType);
                if(dataImportIds && dataImportIds.length > 0) {
                    filters.dataImportIds = dataImportIds;
                }
            }
            return filters;
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
                        filters: getFilters(),
                    };
                    if (sortingKey) {
                        obj.order = order;
                        $cookies.put(sortingKeyCookie, order[0].property);
                        $cookies.put(sortingValueCookie, order[0].direction);
                    }
                    
                    //rendering data
                    return getData(obj).then(function (result) {
                        params.total(result.total);
                        rowActionsObjects(result.data);
                        vm.isLoading = false;
                        return result.data;
                    });
                }
            });
            
            
            // start search immediately if filters are locked
            if ($scope.lockedMode) {
                vm.anagraphicTable.page(1);
            }
        }
        
        
        ////////// rectification_functions
        
        function handleRectificationResponse(responseData) {
            var rectificationIsOk = responseData && responseData.items && responseData.items.length === 1 &&  responseData.items[0].id;
            if (rectificationIsOk) {
                rectificationDTO = responseData.items[0];
            }
            
            if (rectificationIsOk) {
                shareDataServices.set(rectificationDTO, 'RECTIFICATION_DTO_' + sphaAnagService.anagraphicName);
            } else {
                shareDataServices.delete('RECTIFICATION_DTO_' + sphaAnagService.anagraphicName);
            }
            
            sphaRectificationServices.setMassiveActionByRectification(rectificationDTO, $scope.actions);
        }

        function getRectification() {
            var deferred = $q.defer();
            if (procedureInstanceDTO && procedureInstanceDTO.id && vm.companies && vm.companies.length > 0 &&
                $scope.actions && $scope.actions.RECTIFICATION_VIEW_DETAIL === true) {
                var criteria = {
                    procedureInstanceId: {equals: procedureInstanceDTO.id},
                    type: {equals: rectificationTypes[sphaAnagService.anagraphicName]},
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
                            deferred.resolve();
                        }
                    });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }
        
        /**
         * Set shared data between controllers
         * @param rowObject {{
         *     aic9,
         *     rectificationDetailInfo: {
         *     objectId,
         *     type,
         *     aic6,
         *     rectificationDetailItems: {}[]}
         * }}
         */
        function setAnagraphicDetailParams(rowObject) {
            var detailInputParams;
            if (rowObject.rectificationDetailInfo && rowObject.rectificationDetailInfo.type === rectificationDetailInfoTypes.ADD_AIC6) {
                var searchKeys = {
                    companies: null,
                    validMarketingTo: null,
                    validMarketingFrom: null
                };
                for(var i in rowObject.rectificationDetailInfo.rectificationDetailItems) {
                    if(rowObject.rectificationDetailInfo.rectificationDetailItems.hasOwnProperty(i)) {
                        var rectificationDetailItem = rowObject.rectificationDetailInfo.rectificationDetailItems[i];
                        if (!searchKeys.companies && rectificationDetailItem.fieldName === 'companyCode') {
                            searchKeys.companies = [rectificationDetailItem.oldFieldValue];
                        }
                        if (!searchKeys.validMarketingTo && rectificationDetailItem.fieldName === 'validMarketing') {
                            searchKeys.validMarketingTo = new Date(rectificationDetailItem.oldFieldValue);
                            searchKeys.validMarketingFrom = new Date(rectificationDetailItem.oldFieldValue);
                        }
                        if (searchKeys.companies && searchKeys.validMarketingFrom && searchKeys.validMarketingTo) {
                            break;
                        }
                    }
                }
                detailInputParams = {
                    aic9: rowObject.aic9,
                    validMarketingFrom: searchKeys.validMarketingFrom,
                    validMarketingTo: searchKeys.validMarketingTo,
                    companies: searchKeys.companies,
                    rectificationDetailInfoType: rowObject.rectificationDetailInfo.type,
                    aic6: rowObject.rectificationDetailInfo.aic6
                };
            } else {
                detailInputParams = {
                    aic9: rowObject.aic9,
                    validMarketingFrom: vm.validMarketingFrom,
                    validMarketingTo: vm.validMarketingTo,
                    companies: vm.companies
                };
            }
            var dataImportIds = sphaProcedureInstanceServices.getDataImportIds(procedureInstanceDTO, sphaAnagService.tableType);
            if (dataImportIds && dataImportIds.length > 0) {
                detailInputParams.dataImportIds = dataImportIds;
            }
            
            shareDataServices.set(detailInputParams, 'ANAGRAPHIC_DETAIL_PARAMS');
        }

        /**
         * create new Rectification
         * @returns Promise
         */
        function createNewRectification() {
            var deferred = $q.defer();
            var rectificationDtoToSend = {
                type: rectificationTypes[sphaAnagService.anagraphicName],
                companyCode: vm.companies[0],
                description: 'DEFAULT_DESCRIPTION',
                procedureInstanceId: procedureInstanceDTO.id
            };
            sphaRectificationServices.createNewRectification(rectificationDtoToSend, function (data, error) {
                if(data && !(error && error.message)) {
                    rectificationDTO = data;
                }
                parseServiceResponse(data, error, {sweetAlertObject: {
                        title: $translate.instant('SUCCESS_SAVE_RECTIFICATION'),
                        type: 'success'
                    }});
                deferred.resolve();
            });
            return deferred.promise;
        }

        /**
         * 
         * @param rectificationDetailType
         * @param objectKeyInfoStringList {JSON.stringify({objectKey: {aic9: string, validMarketing: string, companyCode: string},
         *                                   objectInfo: {aic6: string, medicineDescription: string}})[]}
         *                                array contente stringe JSON di oggetti con questa rappresentazione � necessario 
         *                                fare un parsing di ogni singolo elemento dell'array
         */
        function createRectificationInfoByKeyList(rectificationDetailType, objectKeyInfoStringList) {
            if(rectificationDTO && rectificationDTO.id) {
                var newCompany = vm.isRectificationAic6DEL ? vm.companyForRectification : vm.companies[0];
                var newCompanyName = vm.isRectificationAic6DEL ? vm.companyNameForRectification : $scope.filters.companies.elements[0].label;
                var requestBody = {
                    idRectification: rectificationDTO.id,
                    rectificationDetailType: rectificationDetailType,
                    aic6: vm.aic6ForRectification,
                    rectificationType: rectificationDTO.type,
                    newCompanyCode: newCompany,
                    newCompanyName: newCompanyName,
                    objectKeyInfoStringList: objectKeyInfoStringList,
                    validMarketing: vm.validMarketingForRectification
                };
                sphaRectificationServices.createRectificationDetailInfosByKeys(requestBody, function (data, error) {
                    parseServiceResponse(data, error, {
                        sweetAlertObject: {
                            title: $translate.instant('SUCCESS_SAVE_RECTIFICATION'),
                            type: 'success'
                        }
                    });
                    if (!(error && error.message)) {
                        vm.anagraphicTable.reload().then(function (res) {
                            $scope.actions.SAVE_RECTIFICATION_AIC6 = false;
                        });
                    }
                });
            } else {
                SweetAlert.swal({
                    title: $translate.instant('ERROR_RECTIFICATION_NOT_FOUND'),
                    type: 'error'
                });
            }
        }
        
        function createRectificationByImport(fileInput) {
            if(rectificationDTO && rectificationDTO.id) {
                vm.isLoading = true;
                uploadServicesSpha.uploadOneOptionalMultipartFileWithData(fileInput,
                    rectificationDTO, 'rectification', createRectificationByImportUrl, function (data, success, error) {
                        if (error) {
                            vm.message = error.message ? error.message : error;
                            vm.alertClass = 'alert alert-warning';
                        }
                        vm.anagraphicTable.reload();
                    });
            } else {
                SweetAlert.swal({
                    title: $translate.instant('ERROR_RECTIFICATION_NOT_FOUND'),
                    type: 'error'
                });
            }
        }

        /**
         * 
         * @param objectKeyInfoStringList {JSON.stringify({objectKey: {aic9: string, validMarketing: string, companyCode: string},
         *                                   objectInfo: {aic6: string, medicineDescription: string}})[]}
         *                                array contente stringe JSON di oggetti con questa rappresentazione � necessario 
         *                                fare un parsing di ogni singolo elemento dell'array
         */
        function sendAic6Rectification(objectKeyInfoStringList) {
            if($scope.actions.EDIT && (vm.isRectificationAic6ADD === true || vm.isRectificationAic6DEL === true)) {
                var rectificationInfoType = vm.isRectificationAic6ADD ? 
                    rectificationDetailInfoTypes.ADD_AIC6 : rectificationDetailInfoTypes.DEL_AIC6;
                if (rectificationDTO && rectificationDTO.id) {
                    createRectificationInfoByKeyList(rectificationInfoType, objectKeyInfoStringList);
                } else {
                    createNewRectification(rectificationInfoType, objectKeyInfoStringList).then(function (result) {
                        createRectificationInfoByKeyList(rectificationInfoType, objectKeyInfoStringList);
                    });
                }
            }
        }
        
        /**
         * 
         * @param data
         * @param error
         * @param successMessage: {{message:string, alertClass:string, sweetAlertObject:{} }}
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
                        if(successMessage.sweetAlertObject) {
                            SweetAlert.swal(successMessage.sweetAlertObject);
                        } else {
                            vm.message = successMessage.message ? successMessage.message : 'SUCCESS';
                            vm.alertClass = successMessage.alertClass ? successMessage.alertClass : 'alert alert-success';
                        }
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
        
        function resetRectificationForm() {
            vm.aic6ForRectification = null;
            vm.medicineDescriptionForRectification = null;
            vm.companyForRectification = null;
            vm.validMarketingForRectification = null;
        }

        // DECLARE this FUNCTIONS

        /** varibili e metodi utili per switchare il tipo di export (pdf/excel) per dar il via all'export vero e proprio */
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

        vm.goToTop = function () {
            document.documentElement.scrollTop = 0;
        };

        /**
         * Funzione per il submit della ricerca tramite input
         */
        vm.submitSearch = function (form) {
            if(!(vm.isRectificationAic6ADD === true || vm.isRectificationAic6DEL === true)) {
                updateFiltersCookies();
            }
            vm.filtersForm = form;
            vm.anagraphicTable.page(1);
            vm.anagraphicTable.reload();
        };

        /**
         * add Aic6 rectification
         */
        vm.aic6Rectification = function (rectificationDetailInfoType) {
            updateFiltersCookies();
            if (rectificationDetailInfoType === rectificationDetailInfoTypes.ADD_AIC6) {
                vm.isRectificationAic6ADD = true;
            }
            if (rectificationDetailInfoType === rectificationDetailInfoTypes.DEL_AIC6) {
                vm.isRectificationAic6DEL = true;
            }
            handleValidMarketingCookie(true);
            vm.reset();
            vm.anagraphicTable.cleanTable = true;
            vm.anagraphicTable.reload();
            // apertura accordion
            vm.accordionRectificationFilters = true;
            vm.accordionAic6RectificationSave = true;
        };
        
        /**
         * save Aic6 rectification
         */
        vm.saveAic6Rectification = function (form) {
            if(form.$valid && $scope.actions && $scope.actions.EDIT === true && 
                (vm.isRectificationAic6ADD === true || vm.isRectificationAic6DEL === true)) {
                sphaAnagService.getRectificationAddKeys(getFilters(), function(data, error) {
                    // rectification cookies
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        if (data.items && data.items.length > 0) {
                            sendAic6Rectification(data.items);
                        }
                    }
                });
            }
        };

        /**
         * Reset search
         */
        vm.reset = function () {
            if (!$scope.lockedMode) {
                vm.companies = null;
                vm.validMarketingFrom = null;
                vm.validMarketingTo = null;
            }
            if (vm.isRectificationAic6ADD === true || vm.isRectificationAic6DEL === true ) {
                resetRectificationForm();
            } else {
                sphaAnagService.resetFilters(vm);
                updateFiltersCookies();
            }
            $scope.resetOrderBy();
        };

        /**
         * Funzione associata al pulsante esporta per l'export in excel.
         * Chiama il servizio rest export
         */
        vm.exportReport = function (form, type) {
            vm.filtersForm = form;
            var obj;
            if(type !== 2) {
            	obj	= {filters : getFilters()};
            } else {
            	obj = {filters :getFilters()};
            }
             
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

        vm.goBack = function () {
            if (vm.isRectificationAic6ADD === true || vm.isRectificationAic6DEL === true) {
                handleValidMarketingCookie(false);
                handleCompaniesCookie(false);
                vm.reset();
                vm.isRectificationAic6ADD = false;
                vm.isRectificationAic6DEL = false;
                vm.anagraphicTable.reload();
            } else if (shareDataServices.get('RECTIFICATION_PROTOCOL_PAGE')) {
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
         * submit della rettifica
         */
        vm.submitRectification = function () {
        	if(rectificationDTO && rectificationDTO.status  === 'DRAFT' ||  rectificationDTO.status  === 'SIGNED') {
                
                gatherSubscriberData().then(function(vm) {

                    var pdfRequest =  {
                        empowered: vm.potereSoggetto,
                        subjectName: vm.soggetto,
                        subjectQualification: vm.qualificaSoggetto,
                        companyHeadquarters: vm.sedeAzienda,
                	    companyName: $scope.filters.companies.elements[0].label,
                	    companyCode: $scope.filters.companies.elements[0].value,
                	    procedure: $translate.instant(procedureInstanceDTO.procedure.type + "_LABEL"),
                	    idRectification: rectificationDTO.id ,
                	    rectificationType: rectificationDTO.type,
                	    idProcedureInstance: rectificationDTO.procedureInstanceId,
                	    rectificationStatus: rectificationDTO.status
                	};
                	// invio questa request alla pagina di sottomissione rettifiche
                    shareDataServices.set(pdfRequest, 'PDF_REQUEST_PARAMS');
        			shareDataServices.set(sphaAnagService.states.search, 'ORIGIN_PAGE');
                	$state.go(sphaAnagService.states.submitRectification);
                });
        	} else {
        		// non � presente nessuna rettifica da sottomettere
        		
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

        function gatherSubscriberData() {
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
                    vm.companyName = scope.filters.companies.elements[0].label;
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
        
        /**
         * import rectification
         */
        vm.importRectification = function (xls) {
            if($scope.actions.EDIT) {
                if(rectificationDTO && rectificationDTO.id) {
                    createRectificationByImport(xls);
                } else {
                    createNewRectification().then(function (result) {
                        createRectificationByImport(xls);
                    });
                }
            }
        };
        
        vm.upload = function() {
            document.getElementById('file_content').click();
        };

        // DECLARE SCOPE FUNCTIONS
        
        $scope.fileChanged = function() {
              // get <input> element and the selected file 
              var csvFileInput = document.getElementById('file_content');
              vm.importRectification(csvFileInput.files[0]);
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
            var companyFilters;
            var companies = ($scope.filtersRequest.companies.companies != null && $scope.filtersRequest.companies.companies.length > 0) ?
                             $scope.filtersRequest.companies.companies : null;
            if(vm.isRectificationAic6DEL === true) {
                companyFilters = {
                    allCompanies: true
                };
            } else {
                companyFilters = {
                    companies: companies
                };
            }
            sphaCompanyServices.getPossibleValues(page, companyFilters, search, function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        sphaUtilsServices.mapSearchFilterResponse([data], $scope.filters);
                    }
                });
        };

        /**
         * get di tutti gli atc e classi
         * @param page page
         * @param valueType valueType
         * @param search search
         */
        $scope.getPossibleValues = function (page, valueType, search) {
            if (!page) {
                $scope.filters[valueType].elements = [];
            }
            $scope.filters[valueType].page = page;
            sphaPossibleValueServices.getPossibleValues(page,
                ($scope.filtersRequest[valueType][valueType] != null &&
                    $scope.filtersRequest[valueType][valueType].length > 0) ?
                    $scope.filtersRequest[valueType] : null, valueType, search,
                function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        sphaUtilsServices.mapSearchFilterResponse([data], $scope.filters);
                    }
                });

        };

        /**
         * 
         * @param dateField dateField
         */
        $scope.openDatePopup = function (dateField) {
            $scope.datesOptions[dateField].opened = !$scope.datesOptions[dateField].opened;
        };

        /**
         * se l'elemento del form � invalido -> bordo rosso
         * @param idField idField
         * @param form form
         * @returns {string}
         */
        $scope.addClass = function (idField, form) {
            if (!$scope.readOnly && form && form[idField] && form[idField].$invalid) {
                return 'has-errors';
            }
            return '';
        };
        
        $scope.resetOrderBy = function () {
            if(!(vm.isRectificationAic6ADD === true || vm.isRectificationAic6DEL === true)) {
                $cookies.remove(sortingKeyCookie);
                $cookies.remove(sortingValueCookie);
            }
            if(vm.anagraphicTable) {
                vm.anagraphicTable.sorting({id: 'desc'});
                vm.anagraphicTable.reload();
            }
        };

        /**
         * Actions callback
         * @param {*} action Action name
         * @param {*} row Action object
         */
        $scope.onActionCallback = function (action, row) {
            shareDataServices.delete('MEDICINE_DETAIL_CAN_EDIT');
            switch (action) {
                case 'VIEW':
                    setAnagraphicDetailParams(row.object);
                    $state.go(sphaAnagService.states.view, {
                        'aic9': row.object.aic9, 
                        'procedureInstanceId': procedureInstanceDTO ? procedureInstanceDTO.id : undefined,
                        'idRectification': rectificationDTO ? rectificationDTO.id : undefined
                    });
                    break;
                case 'EDIT':
                    setAnagraphicDetailParams(row.object);
                    shareDataServices.set(true, 'MEDICINE_DETAIL_CAN_EDIT');
                    $state.go(sphaAnagService.states.view, {
                        'aic9': row.object.aic9, 
                        'procedureInstanceId': procedureInstanceDTO ? procedureInstanceDTO.id : undefined,
                        'idRectification': rectificationDTO ? rectificationDTO.id : undefined
                    });
                    break;
                case 'DELETE':
                    updateFiltersCookies();
                    vm.aic6Rectification(rectificationDetailInfoTypes.DEL_AIC6);
                    vm.aic6ForRectification = row.object.aic6;
                    vm.medicineDescriptionForRectification = row.object.medicineDescription;
                    break;
                default:
                    alert('Hai premuto ' + action + ' sulla riga ' + row.object.aic9);
                    console.log('Unknown Action: ' + action);
            }
        };

        // DECLARE FUNCTIONS FOR INIT CONTROLLER
        function init() {
            //Recupero i filtri salvati nei cookies dalla pagina delle istanze o dalla stessa pagina
            handleCookiesAndSharedData(true);

            handleState().then(function (result) {
                //Recupero le regole di visualizzazione dei dati
                getMassiveActionByUser().then(function (result) {
                    //Recupero le azioni per l'utente
                    handleDataVisibilityRule().then(function (result) {
                        // recupero la rettifica
                        getRectification().then(function(result) {
                            // inizializzo la tabella
                            initTable();  
                        });
                    });
                });
            });
        }
        
        vm.initController = function(sphaService) {
            sphaAnagService = sphaService;
            
            searchUrl = sphaService.searchUrl;
            searchWithRectificationsUrl = sphaService.searchWithRectificationsUrl;
            exportCsvUrl = sphaService.exportCsvUrl;
            exportPdfUrl = sphaService.exportPdfUrl;
            exportXlsxMassiveUrl = sphaService.exportXlsxMassiveUrl;
            createRectificationByImportUrl = sphaRectificationServices.createRectificationByImportUrl;
            
            sortingKeyCookie = 'sortingKey' + sphaService.anagraphicName;
            sortingValueCookie = 'sortingValue' + sphaService.anagraphicName;
            
            init();
        };
    }
})();
