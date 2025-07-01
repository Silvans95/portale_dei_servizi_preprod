/**
 * @ngdoc function
 * @name sphaAbstractRectifiableAnagraphicDetailController
 * @description controller for detail
 * # sphaAbstractRectifiableAnagraphicDetailController Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaAbstractRectifiableAnagraphicDetailController', sphaAbstractRectifiableAnagraphicDetailController);

    sphaAbstractRectifiableAnagraphicDetailController.$inject = [
        '$rootScope', '$stateParams', '$state', '$scope', '$window', '$cookies', '$translate', '$filter', '$extend', '$q',
        'SweetAlert',
        'PropertiesServiceSpha', 'shareDataServices', 'sphaProcedureInstanceServices', 'sphaRectificationServices', 'sphaUtilsServices'];

    function sphaAbstractRectifiableAnagraphicDetailController(
        $rootScope, $stateParams, $state, $scope, $window, $cookies, $translate, $filter, $extend, $q,
        SweetAlert,
        PropertiesServiceSpha, shareDataServices, sphaProcedureInstanceServices, sphaRectificationServices, sphaUtilsServices) {
        
        // DECLARE GLOBAL non $scope VARIABLES/CONSTANTS

        // enumerationImports
        const rectificationDetailInfoTypes = sphaRectificationServices.rectificationDetailInfoTypeEnum;
        const rectificationTypes = sphaRectificationServices.rectificationTypeEnum;

        // DECLARE GLOBAL non $scope VARIABLES/CONSTANTS
        var vm = $extend ? $extend : this;
        
        var sphaAnagService;
        
        var dateFields = null;
        
        var dateFormats = {'it': 'dd/MM/yyyy','en': 'MM/dd/yyyy'};

        var formWillBeClearAlert = {
            title: $translate.instant('FORM_WILL_BE_CLEAR_TITLE'),
            text: $translate.instant('FORM_WILL_BE_CLEAR_BODY'),
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#337ab7',
            confirmButtonText: $translate.instant('SI'),
            cancelButtonText: $translate.instant('NO'),
            closeOnConfirm: true,
            closeOnCancel: true,
        };
        
        var detailInputParams = null; // from cookies
        var locale = null; // from cookies
        var sharedDataCanEdit = null; // from cookies
    
        var procedureInstanceDTO = null; // from cookies
        
        // RECTIFICATION_variables
        var keyList = [];
        var rectificationDTO = null; // from cookies
        var rectificationDetailInfoDto = null;
        
        // DECLARE this VARIABLES

        vm.message = '';
        vm.isLoading = true;
        vm.accordionAmministrativeData = false;
        vm.accordionMarketingData = false;
        vm.accordionEconomicData = false;
        vm.accordionMoreInfo = false;
        vm.accordionMedicineData = true;

        // DECLARE $rootScope $scope variables
        $rootScope.goBack = 'spha.searchRectification';
        $scope.actions = {EDIT: false, RECTIFICATION_VIEW_DETAIL: false};
        $scope.anagraphicHistoryData = [];
        $scope.readOnly = true;
        $scope.dateFormat = null;
        $scope.selectedObject = null;
        
        $scope.rectificationData = [];
        $scope.enableAdd = true;
        
        
        // Date Pickers models
        $scope.datesOptions = null;

        // DELCARE FUNCTIONS

        /**
         * gestione cookies
         */
        function handleCookiesAndSharedData() {
            locale = $cookies.get('lang') ? $cookies.get('lang') : 'it';
            
            sharedDataCanEdit = shareDataServices.get('MEDICINE_DETAIL_CAN_EDIT');
            detailInputParams = shareDataServices.get('ANAGRAPHIC_DETAIL_PARAMS');
            
            procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
            
            // rectification cookies
            var rectificationDTOCookie = shareDataServices.get('RECTIFICATION_DTO_' + sphaAnagService.anagraphicName);
            if(rectificationDTOCookie && rectificationDTOCookie.id) {
                rectificationDTO = rectificationDTOCookie;
            }
            
            $scope.dateFormat = dateFormats[locale] ? dateFormats[locale] : dateFormats['it'];
        }
        
        function getRectification() {
            var deferred = $q.defer();
            if (procedureInstanceDTO && procedureInstanceDTO.id && detailInputParams.companies &&
                    $scope.actions.RECTIFICATION_VIEW_DETAIL === true && 
                    $state.params['idRectification']) {
                var criteria = {
                    procedureInstanceId: {equals: procedureInstanceDTO.id},
                    type: {equals: rectificationTypes[sphaAnagService.anagraphicName]},
                    companyCode: {in: detailInputParams.companies},
                    id: {equals: $state.params['idRectification']}
                };
                sphaRectificationServices.getAllRectificationsByCriteria(
                    criteria,
                    null,
                    null,
                    true,
                    null,
                    function (data, error) {
                        parseServiceResponse(data, error, null, handleRectificationResponse);
                        deferred.resolve();
                    });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }
        
        function handleState() {
            var deferred = $q.defer();
            /// recupero l'istanza di procedimento se l'istanza salvata nei cookie non corrisponde a quella presente nell'URL
            if($state.params['procedureInstanceId'] && (!(procedureInstanceDTO && procedureInstanceDTO.id &&
                    $state.params['procedureInstanceId'] === procedureInstanceDTO.id) || 
                    !detailInputParams.companies || detailInputParams.companies.includes(procedureInstanceDTO.company))) {
                sphaProcedureInstanceServices.getProcedureInstance($state.params['procedureInstanceId'], function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        procedureInstanceDTO = data;
                        var validMarketingFrom = new Date(moment(procedureInstanceDTO.procedure.startPeriodDate)
                            .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z');
                        var validMarketingTo = new Date(moment(procedureInstanceDTO.procedure.endPeriodDate)
                            .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z');
                        detailInputParams = {
                            validMarketingFrom: validMarketingFrom,
                            validMarketingTo: validMarketingTo,
                            companies: [procedureInstanceDTO.company],
                            aic9: $state.params['aic9']
                        };
                        var dataImportIds = sphaProcedureInstanceServices.getDataImportIds(procedureInstanceDTO, sphaAnagService.tableType);
                        if (dataImportIds && dataImportIds.length > 0) {
                            detailInputParams.dataImportIds = dataImportIds;
                        }
                        deferred.resolve();
                    }
                });
            } else {
                angular.forEach(detailInputParams, function (value, key) {
                    if(!value && key !== 'aic9' && key !== 'dataImportIds') {
                        detailInputParams[key] = procedureInstanceDTO[key];
                    }
                });
                var dataImportIds = sphaProcedureInstanceServices.getDataImportIds(procedureInstanceDTO, sphaAnagService.tableType);
                if (dataImportIds && dataImportIds.length > 0) {
                    detailInputParams.dataImportIds = dataImportIds;
                }
                deferred.resolve();
            }
            
            return deferred.promise;
        }
        
        function handleRectificationResponse(responseData) {
            var rectificationIsOk = responseData && responseData.items && responseData.items.length === 1 &&  responseData.items[0].id;
            if (rectificationIsOk) {
                rectificationDTO = responseData.items[0];
            }
        }
        
        /**
         * Get massive action by user
         */
        function getMassiveActionByUser() {
            var deferred = $q.defer();
            sphaAnagService.getMassiveActionByUser(function (data, error) {
                parseServiceResponse(data, error, null, handleActions);
                deferred.resolve();
            });
            return deferred.promise;
        }

        /**
         * gestione azioni disponibili
         * @param data
         */
        function handleActions(data) {
            if (data) {
                data.forEach(action => $scope.actions[action] = true);
                sphaProcedureInstanceServices.setMassiveActionByProcedureInstance(procedureInstanceDTO, $scope.actions);
                if ($scope.actions.EDIT && sharedDataCanEdit) {
                    $scope.readOnly = false;
                }
            }
        }

        /**
         * recupera lo storico del farmaco
         */
        function getHistory(index) {
            var deferred = $q.defer();
            sphaAnagService.getDetail(detailInputParams, function (data, error) {
                parseServiceResponse(data, error, null, parseHistoryResponse, [index]);
                deferred.resolve();
            });
            return deferred.promise;
        }

        /**
         * utilizza la response data dallo storico del farmaco
         * @param anagraphicHistoryDTOs
         * @param index index
         */
        function parseHistoryResponse(anagraphicHistoryDTOs, index) {
            vm.isLoading = false;
            if (anagraphicHistoryDTOs && anagraphicHistoryDTOs.length) {
                // cast map anagraphicHistoryDTOs and get keyList 
                
                $scope.anagraphicHistoryData = anagraphicHistoryDTOs;
                if(detailInputParams && detailInputParams.rectificationDetailInfoType === rectificationDetailInfoTypes.ADD_AIC6) {
                    keyList = sphaUtilsServices.mapAnagraphicHistoryDTOs(anagraphicHistoryDTOs, 'hidden');
                } else {
                    keyList = sphaUtilsServices.mapAnagraphicHistoryDTOs(anagraphicHistoryDTOs, null);
                    switchChangeSection(index, true);
                }
            } else {
                $scope.anagraphicHistoryData = [];
                $scope.selectedIndex = -1;
                $scope.selectedObject = null;
            }
        }
        
        // RECTIFICATION_functions

        /**
         * recupera l'identificativo del farmaco per la rettifica
         * @returns {{aic9, validMarketing, companyCode}}
         */
        function getSelectedObjectIdentifier() {
            var validMarketingValue = sphaUtilsServices.castToServerValue(
                $scope.selectedObject['validMarketing'].value, $scope.selectedObject['validMarketing'].fieldType);
            return {
                aic9: $scope.selectedObject['aic9'].value,
                validMarketing: validMarketingValue,
                companyCode: $scope.selectedObject['companyCode'].oldValue
            };
        }

        /**
         * copia la storia sul farmaco selezionato
         * @param index
         */
        function copyAnagraphicHistoryDataToSelectedObjectByIndex(index) {
            if(index >= 0) {
                $scope.selectedObject = $scope.anagraphicHistoryData && $scope.anagraphicHistoryData[index] &&
                $scope.anagraphicHistoryData[index].object ?
                    angular.copy($scope.anagraphicHistoryData[index].object) : null;
            }
        }

        /**
         * cambia farmaco selezionato
         * @param index
         * @param loadRectificationDetail
         */
        function switchChangeSection(index, loadRectificationDetail) {
            $scope.selectedIndex = index;
            if (index >= 0) {
                copyAnagraphicHistoryDataToSelectedObjectByIndex(index);
                if (loadRectificationDetail) {
                    getSelectedObjectRectificationDetailInfo();
                }
            } else {
                $scope.selectedObject = null;
            }
        }
        
        function removeAddedRectifiedHistory(index, checkIsSaved) {
            var indexToReturn = index;
            if ($scope.anagraphicHistoryData && $scope.anagraphicHistoryData[index]) {
                var historyDataIndex = $scope.anagraphicHistoryData[index];
                var oldLength = $scope.anagraphicHistoryData.length;
                if (historyDataIndex.rectificationDetailInfoType === rectificationDetailInfoTypes.ADD && 
                        (!checkIsSaved || checkIsSaved && historyDataIndex.objectSaved === false)) {
                    $scope.selectedObject = null;
                    $scope.anagraphicHistoryData.splice(index, 1);
                    if (historyDataIndex.key && historyDataIndex.key.date) {
                        var keyToRemove = keyList.indexOf(historyDataIndex.key.date);
                        keyList.splice(keyToRemove, 1);
                    }
                    switch ($scope.anagraphicHistoryData.length) {
                        case oldLength:
                            indexToReturn = index;
                            break;
                        case 0:
                            indexToReturn = 0;
                            break;
                        default:
                            if ($scope.anagraphicHistoryData.length > oldLength) {
                                indexToReturn = index + 1;
                            }
                            if ($scope.anagraphicHistoryData.length < oldLength) {
                                indexToReturn = index - 1;
                            }
                            break;
                    }
                }
            }
            $scope.enableAdd = true;
            return indexToReturn;
        }

        /**
         * crea una nuova rettifica
         * @param form
         */
        function createNewRectification(form) {
            var type = $scope.anagraphicHistoryData && $scope.anagraphicHistoryData[$scope.selectedIndex] && 
                $scope.anagraphicHistoryData[$scope.selectedIndex].rectificationDetailInfoType
            var rectificationInfo = {
                type: sphaAnagService.anagraphicName,
                companyCode: $scope.selectedObject['companyCode'].value,
                procedureInstanceId: procedureInstanceDTO.id,
                detailInfo: {
                    type: type ? type : rectificationDetailInfoTypes.MOD,
                    objectId: getSelectedObjectIdentifier()
                },
                selectedObject: $scope.selectedObject
            };
            sphaRectificationServices.createNewRectificationWithDetails(form, rectificationInfo, function (data, error) {
                if(data && !(error && error.message)) {
                    rectificationDTO = data;
                }
                parseServiceResponse(data, error, {sweetAlertObject: {
                        title: $translate.instant('SUCCESS_SAVE_RECTIFICATION'),
                        type: 'success'
                    }}, getSelectedObjectRectificationDetailInfo);
            });
        }

        /**
         * crea un nuovo dettaglio (info ed items) per la rettifica di un farmaco
         * @param form
         */
        function createRectificationDetailInfo(form) {
            var rectificationDetailInfoToSave;
            if (rectificationDTO && rectificationDTO.id && $scope.anagraphicHistoryData && $scope.anagraphicHistoryData[$scope.selectedIndex]) {
                var type = $scope.anagraphicHistoryData && $scope.anagraphicHistoryData[$scope.selectedIndex] && 
                    $scope.anagraphicHistoryData[$scope.selectedIndex].rectificationDetailInfoType;
                rectificationDetailInfoToSave = {
                    rectificationId : rectificationDTO.id,
                    objectId: JSON.stringify(getSelectedObjectIdentifier()),
                    type: type ? type : rectificationDetailInfoTypes.MOD,
                    status: null
                };
                if(rectificationDetailInfoToSave.type === rectificationDetailInfoTypes.ADD_AIC6) {
                    rectificationDetailInfoToSave.aic6 = $scope.selectedObject.aic6.oldValue;
                }
            }
            sphaRectificationServices.createRectificationDetailInfo(form, $scope.selectedObject, rectificationDetailInfoToSave,
                function (data, error) {
                    // clean selected object before mapping rectification data
                    if(error && error.message === 'RECTIFICAITON_DETAIL_ITEMS_IS_EMPTY') {
                        // rectificationDetailInfo has been deleted
                        rectificationDetailInfoDto = null;
                        vm.resetForm(form);
                        copyAnagraphicHistoryDataToSelectedObjectByIndex($scope.selectedIndex);
                    }
                    parseServiceResponse(data, error, {sweetAlertObject: {
                        title: $translate.instant('SUCCESS_SAVE_RECTIFICATION_DETAILS'),
                        type: 'success'
                    }},
                        parseRectificationDetailInfoResponse, [form]);
                });
        }

        /**
         * aggiorna il dettaglio (items) di un dettaglio di una rettifica di un farmaco
         * @param form
         */
        function updateRectificationDetailInfo(form) {
            sphaRectificationServices.updateRectificationDetailInfo(form, $scope.selectedObject, rectificationDetailInfoDto,
                function (data, error) {
                    if(error && error.message === 'RECTIFICAITON_DETAIL_ITEMS_IS_EMPTY') {
                        // rectificationDetailInfo has been deleted
                        rectificationDetailInfoDto = null;
                        vm.resetForm(form);
                        copyAnagraphicHistoryDataToSelectedObjectByIndex($scope.selectedIndex);
                    }
                    parseServiceResponse(data, error, {sweetAlertObject: {
                        title: $translate.instant('SUCCESS_SAVE_RECTIFICATION_DETAILS'),
                        type: 'success'
                    }}, 
                        parseRectificationDetailInfoResponse, [form]);
                });
        }

        /**
         * recupera il dettaglio di una rettifica per un farmaco (info ed items)
         */
        function getSelectedObjectRectificationDetailInfo() {
            if($scope.selectedObject && rectificationDTO && rectificationDTO.id && $scope.actions.RECTIFICATION_VIEW_DETAIL === true) {
                var rectificationDetailCriteria= {
                    objectId: { equals: JSON.stringify(getSelectedObjectIdentifier())},
                    rectificationId: { equals: rectificationDTO.id }
                };
                sphaRectificationServices.getRectificationDetailInfoByCriteria(rectificationDetailCriteria, 
                    null, 
                    null,
                    true,
                    null,
                    function (rectificationDetailDTOs, error) {
                        parseServiceResponse(rectificationDetailDTOs, error, null, parseRectificationDetailInfoResponse);
                });
            }
        }

        /**
         * 
         */
        function getAddedAndDeletedRectificationDetailInfo() {
            var deferred = $q.defer();
            if(detailInputParams && detailInputParams.aic9 && rectificationDTO && rectificationDTO.id && $scope.actions.RECTIFICATION_VIEW_DETAIL === true) {
                var rectificationDetailCriteria= {
                    type: { in: [rectificationDetailInfoTypes.ADD, rectificationDetailInfoTypes.DEL,
                        rectificationDetailInfoTypes.ADD_AIC6, rectificationDetailInfoTypes.DEL_AIC6]},
                    rectificationId: { equals: rectificationDTO.id },
                    objectId: { contains: detailInputParams.aic9 },
                };
                sphaRectificationServices.getRectificationDetailInfoByCriteria(rectificationDetailCriteria, 
                    null, 
                    null,
                    true,
                    null,
                    function (data, error) {
                        parseServiceResponse(data, error, null, parseAddedAndDeletedRectificationDetailResponse);
                        deferred.resolve();
                });
            }
            return deferred.promise;
        }

        /**
         * 
         * @param rectificationDetailDTOs
         * @param form
         */
        function parseRectificationDetailInfoResponse(rectificationDetailDTOs, form) {
            // reset form before map details
            vm.resetForm(form);
            copyAnagraphicHistoryDataToSelectedObjectByIndex($scope.selectedIndex);
            var items = rectificationDetailDTOs ? rectificationDetailDTOs.items : null;
            if (rectificationDetailDTOs && (items && items[0] && items[0].id) || rectificationDetailDTOs.id) {
                rectificationDetailInfoDto = items && items[0] ? items[0] : rectificationDetailDTOs;
                sphaRectificationServices.parseRectificationDetailItems(rectificationDetailInfoDto, $scope.selectedObject);
                $scope.anagraphicHistoryData[$scope.selectedIndex].rectificationDetailInfoType = rectificationDetailInfoDto.type;
                if($scope.anagraphicHistoryData[$scope.selectedIndex].objectSaved === false) {
                    $scope.anagraphicHistoryData[$scope.selectedIndex].objectSaved = true;
                }
            } else {
                rectificationDetailInfoDto = null;
            }
        }

        /**
         *
         * @param rectificationDetailInfoDTOs
         */
        function parseAddedAndDeletedRectificationDetailResponse(rectificationDetailInfoDTOs) {
            if (rectificationDetailInfoDTOs && rectificationDetailInfoDTOs.items && rectificationDetailInfoDTOs.items.length > 0 &&
                    $scope.anagraphicHistoryData && $scope.anagraphicHistoryData.length > 0) {
                var previousHistoryDataLength = $scope.anagraphicHistoryData.length;
                for(var i in rectificationDetailInfoDTOs.items) {
                    if(rectificationDetailInfoDTOs.items.hasOwnProperty(i)) {
                        var rectificationDetailInfoDTO = rectificationDetailInfoDTOs.items[i];
                        mapRectificationDtoToHistory(rectificationDetailInfoDTO, $scope.anagraphicHistoryData, keyList);
                    }
                }
                
                // order history by 'key.date'
                $scope.anagraphicHistoryData = $filter('orderBy')($scope.anagraphicHistoryData, 'key.date', true, compareLocalizedDateString);
                
                switchToFirstNotHiddenAnagraphicHistoryData(previousHistoryDataLength);
            }
        }

        function compareLocalizedDateString(val1, val2) {
            return (moment(val1.value, $scope.dateFormat) <= moment(val2.value, $scope.dateFormat)) ? -1 : 1;
        }

        function switchToFirstNotHiddenAnagraphicHistoryData(previousHistoryDataLength) {
            //switch to first not hidden anagraphicHistoryData 
            if (detailInputParams && detailInputParams.rectificationDetailInfoType === rectificationDetailInfoTypes.ADD_AIC6 &&
                !$scope.selectedObject &&
                $scope.anagraphicHistoryData.length > previousHistoryDataLength) {
                for (var index in $scope.anagraphicHistoryData) {
                    if ($scope.anagraphicHistoryData.hasOwnProperty(index) &&
                        $scope.anagraphicHistoryData[index].rectificationDetailInfoType !== 'hidden') {
                        switchChangeSection(index, true);
                        break;
                    }
                }
            }
        }

        /**
         * 
         * @param rectificationDetailInfoDTO
         * @param anagraphicHistoryData
         * @param historyKeys
         */
        function mapRectificationDtoToHistory(rectificationDetailInfoDTO, anagraphicHistoryData, historyKeys) {
            var validMarketingDetailItem = rectificationDetailInfoDTO.rectificationDetailItems
                .find(detailItem => detailItem.fieldName === 'validMarketing');
            if (validMarketingDetailItem) {
                
                var objectId = JSON.parse(rectificationDetailInfoDTO.objectId);
                var objectKey = sphaUtilsServices.castToClientValue(objectId.validMarketing, 'DATE').toLocaleDateString();
                
                for (var ind in anagraphicHistoryData) {
                    if (anagraphicHistoryData.hasOwnProperty(ind)) {
                        var anagraphicHistoryDTO = anagraphicHistoryData[ind];
                        if(copyRectificationDTOToHistory(rectificationDetailInfoDTO, anagraphicHistoryData,
                                                              anagraphicHistoryDTO, validMarketingDetailItem, objectKey)) {
                            historyKeys.push(objectKey);
                            break;
                        }
                    }
                }
            }
        }

        /**
         * 
         * @param rectificationDetailInfoDTO
         * @param anagraphicHistoryData
         * @param anagraphicHistoryDTO
         * @param validMarketingDetailItem
         * @param objectKey
         * @returns {boolean}
         */
        function copyRectificationDTOToHistory(rectificationDetailInfoDTO, anagraphicHistoryData, 
                                                    anagraphicHistoryDTO, validMarketingDetailItem, objectKey) {
            var validMarketingToCheck = sphaUtilsServices.castToClientValue(validMarketingDetailItem.oldFieldValue, 
                                                                            validMarketingDetailItem.fieldType);
            var obj = {};
            if (anagraphicHistoryDTO.key.date === validMarketingToCheck.toLocaleDateString()) {
                obj = angular.copy(anagraphicHistoryDTO.object);
                sphaRectificationServices.parseRectificationDetailItems(rectificationDetailInfoDTO, obj);
                anagraphicHistoryData.push({
                    key: {date: objectKey},
                    object: obj,
                    rectificationDetailInfoType: rectificationDetailInfoDTO.type
                });
                return true;
            }
            return false;
        }

        /**
         * 
         * @param selectedHistoryData selectedHistoryData
         */
        function addRectifiedHistoryData(selectedHistoryData) {
            var objectToUse = angular.copy(selectedHistoryData.object, {});
            var rectificationType = rectificationDetailInfoTypes.ADD;
            for(var prop in objectToUse) {
                if(objectToUse.hasOwnProperty(prop) && objectToUse[prop]) {
                    if(objectToUse[prop].hasOwnProperty('rectificationDetailItem') && objectToUse[prop].rectificationDetailItem){
                        objectToUse[prop].rectified = false;
                        objectToUse[prop].value = objectToUse[prop].rectificationDetailItem.oldFieldValue;
                        objectToUse[prop]['rectificationDetailItem'] = undefined;
                    }
                }
            }
            if(selectedHistoryData.rectificationDetailInfoType === rectificationDetailInfoTypes.ADD_AIC6) {
                rectificationType = rectificationDetailInfoTypes.ADD_AIC6;
                objectToUse.companyCode = {
                    value: $scope.selectedObject.companyCode.value,
                    oldValue: $scope.selectedObject.companyCode.oldValue,
                    required: true,
                    fieldType: 'STRING',
                    fieldName: 'companyCode',
                    toShow: $scope.selectedObject.companyCode.toShow
                };
                objectToUse.companyName = {
                    value: $scope.selectedObject.companyName.value,
                    oldValue: $scope.selectedObject.companyName.oldValue,
                    required: true,
                    fieldType: 'STRING',
                    fieldName: 'companyName',
                    toShow: $scope.selectedObject.companyName.toShow
                };
            }
            objectToUse.validMarketing = {
                value: null,
                oldValue: sphaUtilsServices.castToServerValue(selectedHistoryData.object.validMarketing.oldValue),
                required: true,
                fieldType: 'DATE',
                fieldName: 'validMarketing'
            };
            $scope.anagraphicHistoryData.push({
                key: {date: null},
                object: objectToUse,
                rectificationDetailInfoType: rectificationType,
                objectSaved: false
            });
            
            // clean rectificationDetailInfoDto
            rectificationDetailInfoDto = null;
        }

        /**
         * rimuovo l'elemento attuale dal DOM se non risulta salvato a DB
         * (solo nei casi in cui l'elemento attuale sia di tipo ADD o ADD_AIC6)
         */
        function removeUnsavedRectificationFromDOM(selectedHistoryData) {
            if((selectedHistoryData.rectificationDetailInfoType === 'ADD' ||
                    selectedHistoryData.rectificationDetailInfoType === 'ADD_AIC6') && 
                    selectedHistoryData.objectSaved === false) {
                $scope.anagraphicHistoryData.splice($scope.selectedIndex, 1);
                keyList.splice(selectedHistoryData.key);
            }
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
                        if (successMessage.sweetAlertObject) {
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

        /**
         * 
         * @param data
         * @param form
         */
        function cleanAfterDeleteDetailInfo(data, form) {
            if(data) {
                //vm.resetForm(form);
                var index = removeAddedRectifiedHistory($scope.selectedIndex, false);
                rectificationDetailInfoDto = null;
                switchChangeSection(index, true);
            }
        }

        // DECLARE $scope FUNCTIONS

        //gestione click per cambio sezione
        /**
         * 
         * @param index
         * @param loadRectificationDetail
         * @param showAlert
         */
        $scope.changeSelectedEntry = function (index, loadRectificationDetail, showAlert) {
            vm.message = null;
            vm.alertClass = null;
            if($scope.readOnly || !showAlert) {
                switchChangeSection(index, loadRectificationDetail);
            } else {
                SweetAlert.swal(formWillBeClearAlert, function (isConfirm) {
                    if (isConfirm) {
                        switchChangeSection(index, loadRectificationDetail);
                    }
                });
            }
        };

        
        /**
         * Date Pickers callbacks
         */
        $scope.openDatePopup = function (dateField) {
            $scope.datesOptions[dateField].opened = !$scope.datesOptions[dateField].opened;
        };

        /**
         * se l'elemento del form � invalido -> aggiunge la classe has-errors
         * se l'elemento del form � rettificato -> aggiunge la classe hasBeenRectified
         * se l'elemento del form � modificato -> aggiunge la classe hasBeenModified
         * @param {*} idField
         * @param {*} form
         */
        $scope.addClass = function (idField, form) {
            return sphaUtilsServices.addFieldClass(idField, $scope.selectedObject, form);
        };

        // DECLARE this FUNCTIONS
        
        vm.goBack = function () {
            if (!$scope.readOnly) {
                SweetAlert.swal(formWillBeClearAlert, function (isConfirm) {
                    if (isConfirm) {
                        if ($rootScope.goBack) {
                            $state.go($rootScope.goBack);
                        } else {
                            $window.history.back();
                        }
                    }
                });
            } else {
                if ($rootScope.goBack) {
                    $state.go($rootScope.goBack);
                } else {
                    $window.history.back();
                }
            }
        };

        vm.goToTop = function () {
            document.documentElement.scrollTop = 0;
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
        vm.setObject = function (object, id) {
            shareDataServices.set(object, id + 'Procedimenti');
        };

        /**
         * Function to init permitted action for every Medicine. It returns an
         * array of objects used to populate buttons and dropdowns of action column
         */
        vm.initActions = function (allowedActions, id) {
            return sphaAnagService.getActions(allowedActions, id);
        };
        
        // RECTIFICATION_functions

        /**
         * 
         * @param key
         * @param value
         * @param form
         */
        vm.onValidMarketingChange = function (key, value, form) {
            var canEnableAdd = false;
            if(value && $scope.selectedIndex > 0 && $scope.anagraphicHistoryData && $scope.anagraphicHistoryData[$scope.selectedIndex]) {
                var castedDate = sphaUtilsServices.castToClientValue(value, 'DATE');
                if(castedDate != null && keyList.indexOf(castedDate.toLocaleDateString()) === -1) {
                    $scope.anagraphicHistoryData[$scope.selectedIndex].key = {date: castedDate.toLocaleDateString()};
                    form[key].$setValidity('dateispresent', true);
                    form[key].value = castedDate.toLocaleDateString();
                    canEnableAdd = true;
                } else {
                    canEnableAdd = false;
                    form[key].$setValidity('dateispresent', false);
                    $scope.anagraphicHistoryData[$scope.selectedIndex].key = null;
                }
            }
            $scope.enableAdd = canEnableAdd;
        };
        
        /**
         * Add new Anagraphic History entry for rectification
         */
        vm.addRectifiedObject = function () {
            // switch to newElement index
            SweetAlert.swal(formWillBeClearAlert, function (isConfirm) {
                if (isConfirm) {
                    $scope.enableAdd = false;
                    var selectedHistoryData = angular.copy($scope.anagraphicHistoryData[$scope.selectedIndex], {});
                    addRectifiedHistoryData(selectedHistoryData);
                    removeUnsavedRectificationFromDOM(selectedHistoryData);
                    switchChangeSection($scope.anagraphicHistoryData.length - 1, false);
                    vm.accordionMarketingData = true;
                }
            });
        };
        
         /**
         * 
         * @param form
         * @param removeUnsavedAddedHistory
         * @param reloadData
         */
        vm.resetForm = function (form, removeUnsavedAddedHistory, reloadData) {
            var index = $scope.selectedIndex;
            
            var selectedAnagraphicHistory = $scope.anagraphicHistoryData[index];
            if(selectedAnagraphicHistory && 
                (selectedAnagraphicHistory.rectificationDetailInfoType === rectificationDetailInfoTypes.ADD ||
                    selectedAnagraphicHistory.rectificationDetailInfoType === rectificationDetailInfoTypes.ADD_AIC6)) {
                if (removeUnsavedAddedHistory === true) {
                    index = removeAddedRectifiedHistory(index, true);
                }
            }
            if (reloadData) {
                switchChangeSection(index, true);
            }
            if(form) {
                form.$setPristine();
            }
        };
        
        
        /**
         * Funzione per il submit della ricerca tramite input
         */
        vm.saveForm = function (form) {
            if (form && form.$valid && $scope.selectedObject) {
                if(rectificationDTO && rectificationDTO.id) {
                    if(rectificationDetailInfoDto && rectificationDetailInfoDto.id) {
                        updateRectificationDetailInfo(form);
                    } else {
                        createRectificationDetailInfo(form);
                    }
                } else {
                    createNewRectification(form);
                }
            }
        };
        
        /**
         * delete rectification detail info
         */
        vm.deleteRectificationDetail = function (form) {
            if(rectificationDetailInfoDto && rectificationDetailInfoDto.id) {
                sphaRectificationServices.deleteRectificationDetail(rectificationDetailInfoDto, function (data, error) {
                    parseServiceResponse(data, error, {message: 'RECTIFICATION_DETAIL_DELETED', alertClass: 'alert alert-danger'}, 
                        cleanAfterDeleteDetailInfo, [form]);
                });
            }
        };
        
        
        // DECLARE FUNCTION FOR INIT CONTROLLER
        function init() {
            //Recupero i filtri salvati nei cookies dalla pagina delle istanze o dalla stessa pagina
            handleCookiesAndSharedData();
            //Recupero le azioni per l'utente
            getMassiveActionByUser().then(function (result) {
                handleState().then(function (result) {
                    // recupero la rettifica
                    getRectification().then(function (result) {
                        // recupero history per AIC9
                        getHistory(0).then(function (result) {
                            // get rectificationDetailInfo ADD and DELETE
                            getAddedAndDeletedRectificationDetailInfo();
                        });
                    });
                });
            });
        }

        /**
         * 
         * @param sphaService
         */
        vm.initController = function(sphaService) {
            sphaAnagService = sphaService;
            dateFields = sphaService.getDateFields();
            $scope.datesOptions = dateFields.reduce(function (map, obj) {map[obj] = {opened: false};return map;}, {});
            init();
        };

    }
})();