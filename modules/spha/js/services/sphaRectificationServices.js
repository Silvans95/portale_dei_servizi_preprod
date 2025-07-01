
(function () { 
'use strict';
angular.module('sphaApp')
.factory( 'sphaRectificationServices', sphaRectificationServices);

sphaRectificationServices.$inject = ['$log', '$http', '$q', 'httpServices', 'PropertiesServiceSpha', 'sphaUtilsServices'];

function sphaRectificationServices ( $log, $http, $q, httpServices, PropertiesServiceSpha, sphaUtilsServices ) {
    var services = {};
    const procedimentiMsBaseUrl = PropertiesServiceSpha.get('baseUrlProcedure');
    const apiRectificationUrl = procedimentiMsBaseUrl + 'api/rectifications';
    const apiRectificationDetailInfoUrl = procedimentiMsBaseUrl + 'api/rectification-detail-infos';
    const apiRectificationEventUrl = procedimentiMsBaseUrl + 'api/rectification-events';
	const apiRectificationFileUrl = procedimentiMsBaseUrl + 'api/rectification-files';
    const createNewRectificationWithDetailsUrl = apiRectificationUrl + '/create';
    const findRectificationsByCriteriaUrl = apiRectificationUrl + '/list';
    const findRectificationDetailInfoByCriteriaUrl = apiRectificationDetailInfoUrl + '/list';
    const checkInRectificationUrl = apiRectificationUrl + '/checkin/';
    const checkOutRectificationUrl = apiRectificationUrl + '/checkout/';
    const deleteRectificationUrl = apiRectificationUrl + '/';
    const rectificationEventUrl = apiRectificationEventUrl+ '/rectification-note';
    const rectificationFileAllUrl = apiRectificationFileUrl + '/all';
    const checkRectificationUrl = apiRectificationUrl + '/';
    const rectificationPdfBuildUrl = apiRectificationUrl + '/build-pdf';
    const submitRectificationUrl = apiRectificationUrl + '/submit-rectification';
    const exportRectificationListUrl = apiRectificationUrl + '/export';
	const protocolFileUrl = apiRectificationUrl +  '/protocol';
	const protocolledRectificationFileUrl = apiRectificationUrl +  '/protocolled-file/';
	const protocolledFileUrl = apiRectificationUrl +  '/protocolled-file-closing/';
	const retryProtocolSignatureAndUpdateUrl = apiRectificationUrl + '/retry-signature-update/';
    
    const defaultPageSize = 10;
    const SLASH_ARG = '/{0}';
    
    services.createRectificationByImportUrl = apiRectificationUrl + '/create/import';
    
    services.rectificationDetailInfoTypeImageUrl = {
        ADD: 'edit-solid.svg', // TODO change with fa fa-plus-solid???
        DEL: 'edit-solid.svg', // TODO change with fa fa-minus-solid???
        MOD: 'edit-solid.svg', // TODO change with fa fa-edit-solid???
        ADD_AIC6: 'folder-plus-solid.svg', // TODO change with fa fa-folder-plus-solid???
        DEL_AIC6: 'folder-minus-solid.svg' // TODO change with fa fa-folder-minus-solid???
    };
    
    services.rectificationTypeEnum = {
        MEDICINE: 'MEDICINE',
        ORPHAN: 'ORPHAN',
        INNOVATIVE: 'INNOVATIVE',
        TRANSPARENCY: 'TRANSPARENCY',
        COMPANY: 'COMPANY',
        GSDBDF: 'GSDBDF'
    };
    
    
    services.rectificationDetailInfoTypeEnum = {
        ADD: 'ADD',
        DEL: 'DEL',
        MOD: 'MOD',
        ADD_AIC6: 'ADD_AIC6',
        DEL_AIC6: 'DEL_AIC6'
    };
    
    services.rectificationDetailInfoStatusEnum = {
        APPROVED: 'APPROVED',
        NOT_APPROVED: 'NOT_APPROVED'
    };

    function stringFormat(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined' ? args[number]
                : match
                ;
        });
    }
    
    /**
     * Converts Date from Frontend
     * to a String object suitable for the Beckend
     * @param feDate Date in Date format received from FE
     */
    function clientToServerDate (feDate) {
        if(feDate) {
            const isoStringDate = feDate.toISOString();
            return isoStringDate ? isoStringDate.substr(0, 10) : isoStringDate;
        }
        return feDate;
    }

    /**
     * 
     * @param form
     * @returns {boolean}
     */
    function formHasEditedElements(form) {
        var hasBeenEdited = false;
        if (form) {
            angular.forEach(form, function (value, key) {
                if (!key.startsWith('$') && value.$dirty) {
                        hasBeenEdited = true;
                        return true;
                }
            });
        }
        return hasBeenEdited === true;
    }

    /**
     * 
     * @param form
     * @param selectedObject
     * @returns {null|{
     *                      id: null|number,
     *                      fieldName: string,
     *                      fieldType: string,
     *                      oldFieldValue: null|string,
     *                      newFieldValue: null|string
     *                 }[]
     *           }
     */
    function getEditedElementsFromForm(form, selectedObject) {
        if (selectedObject && form && formHasEditedElements(form)) {
            var detailInfo = [];
            angular.forEach(form, function (value, key) {
                if (!key.startsWith('$') && value.$dirty) {
                    var detailInfoElement;
                    var valueToSet = value.$modelValue === '' ? null : value.$modelValue;
                    if(selectedObject[key]) {
                        if(selectedObject[key].rectificationDetailItem) {
                            detailInfoElement = selectedObject[key].rectificationDetailItem;
                        } else {
                            detailInfoElement = {
                                fieldName: key,
                                fieldType: selectedObject[key].fieldType,
                            };
                        }
                        detailInfoElement.oldFieldValue = selectedObject[key].oldValue;
                        detailInfoElement.newFieldValue = valueToSet;
                        detailInfo.push(detailInfoElement);
                    }
                }
            });
            return detailInfo;
        }
        return null;
    }
    
    function buildGsdbdfDetailItems(rectificationDetailInfos, objectKey, objectInfo) {
            switch (rectificationDetailInfos.rectificationDetailType) {
                case services.rectificationDetailInfoTypeEnum.ADD:
                    var items = [{
                        fieldName: 'companySis',
                        fieldType: 'STRING',
                        oldFieldValue: null,
                        newFieldValue: objectKey.companySis
                    }, {
                        fieldName: 'companyDescription',
                        fieldType: 'STRING',
                        oldFieldValue: null,
                        newFieldValue: objectInfo.companyDescription
                    }];
                    if (objectKey.gsdbdfSis) {
                        items.push({
                            fieldName: 'gsdbdfSis',
                            fieldType: 'STRING',
                            oldFieldValue: objectKey.gsdbdfSis,
                            newFieldValue: rectificationDetailInfos.gsdbdfSis
                        });
                        items.push({
                            fieldName: 'groupDescription',
                            fieldType: 'STRING',
                            oldFieldValue: objectInfo.groupDescription,
                            newFieldValue: rectificationDetailInfos.groupDescription
                        });
                    }
                    return items;
                case services.rectificationDetailInfoTypeEnum.DEL:
                    return [/*{ TODO remove
                        fieldName: 'gsdbdfSis',
                        fieldType: 'STRING',
                        oldFieldValue: objectKey.gsdbdfSis,
                        newFieldValue: null
                    }, {
                        fieldName: 'groupDescription',
                        fieldType: 'STRING',
                        oldFieldValue: objectInfo.groupDescription,
                        newFieldValue: null
                    },*/ {
                        fieldName: 'companySis',
                        fieldType: 'STRING',
                        oldFieldValue: objectKey.companySis,
                        newFieldValue: null
                    }, {
                        fieldName: 'companyDescription',
                        fieldType: 'STRING',
                        oldFieldValue: objectInfo.companyDescription,
                        newFieldValue: null
                    }];
            }
    }

    /**
     * 
     * @param criteria
     * @param page
     * @param pageSize
     * @param unpaged
     * @param order
     * @returns {{start: number, length: (*|number), filters, order: (*|[{id: string}])}}
     */
    function parseRequestCriteria(criteria, start, pageSize, unpaged, order) {
        var pageSizeToUse = null;
        var startToUse = null;
        var unpagedToUse = null;
        if(unpaged === true) {
            unpagedToUse = true;
        } else {
            pageSizeToUse = pageSize ? pageSize : defaultPageSize;
            startToUse = start ? start : 0;
        }
        var orderToUse = order ? order : [{id: 'asc'}];
        return {
            filters: criteria,
            start: startToUse,
            length: pageSizeToUse,
            unpaged: unpagedToUse,
            order: orderToUse
        };
    }

    /**
     * 
     * @param data
     * @param success
     * @param error
     * @param callback
     */
    function handleResponse(data, success, error, callback) {
        var errors = {};
        if (success) {
            if (error) {
                errors.message = error.message ? error.message : error;
                errors.alertClass = 'alert alert-warning';
            }
            if(success === 'DELETED') {
                errors.alertClass = 'alert alert-warning';
            }
        } else {
            errors.message = error && error.message ? error.message : error;
            errors.alertClass = 'alert alert-danger';
        }
        callback(data,errors);
    }

    /**
     * 
     * @param form
     * @param rectificationInfo
     * @returns {{rectification: {companyCode, procedureInstanceId: *, description: (*|string), type},
     *              detailInfo: {type: *, objectId: string, status: null},
     *              detailInfoItem: ({id: (number|null), fieldName: string, fieldType: string, oldFieldValue: (string|null), newFieldValue: (string|null)}[]|null)}}
     */
    function createNewRectificationWithDetailsRequest(form, rectificationInfo) {
        var infoItems = getEditedElementsFromForm(form, rectificationInfo.selectedObject);
        return {
            rectification: {
                type: rectificationInfo.type,
                companyCode: rectificationInfo.companyCode,
                description: rectificationInfo.description != null ? rectificationInfo.description : 'DEFAULT_DESCRIPTION',
                procedureInstanceId: rectificationInfo.procedureInstanceId
            },
            detailInfo: {
                objectId: JSON.stringify(rectificationInfo.detailInfo.objectId),
                type: rectificationInfo.detailInfo.type,
                status: null
            },
            detailInfoItem: infoItems
        };
    }

    services.setMassiveActionByRectification = function (rectificationDTO, scopeActions) {
        if(rectificationDTO) {
            scopeActions.EDIT = rectificationDTO && rectificationDTO.actions && rectificationDTO.actions.indexOf('RECTIFICATION_EDIT') >= 0;
            scopeActions.SUBMIT = rectificationDTO && rectificationDTO.actions && rectificationDTO.actions.indexOf('RECTIFICATION_SUBMIT') >= 0;
            scopeActions.CLEAR = scopeActions.EDIT;
        } else {
            scopeActions.SUBMIT = false;
            scopeActions.CLEAR = false;
        }
    };
    
    /**
     * get rectification by id
     * @param rectificationId
     * @param callback
     */
    services.getRectificationById = function (rectificationId, callback) {
    	httpServices.get(apiRectificationUrl + '/' + rectificationId, function (data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };
    
    /**
     * update rectification 
     * @param rectificationDTO
     */
    
    services.updateRectification = function (rectificationDTO, callback) {
    	httpServices.put(apiRectificationUrl, rectificationDTO, function (data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };
    
    /**
     * 
     * @param rectificationDetailInfoDTO
     * @param selectedObject
     */
    services.parseRectificationDetailItems = function (rectificationDetailInfoDTO, selectedObject) {
        if (selectedObject && rectificationDetailInfoDTO && rectificationDetailInfoDTO.rectificationDetailItems) {
            for (var itemKey in rectificationDetailInfoDTO.rectificationDetailItems) {
                if(rectificationDetailInfoDTO.rectificationDetailItems.hasOwnProperty(itemKey)) {
                    var rectificationDetailItemDTO = rectificationDetailInfoDTO.rectificationDetailItems[itemKey];
                    if (rectificationDetailItemDTO.fieldName && selectedObject && selectedObject[rectificationDetailItemDTO.fieldName]) {
                        // highlight rectified element in html
                        selectedObject[rectificationDetailItemDTO.fieldName].rectified = true;
                        // replace anagraphic value with rectified value in html
                        selectedObject[rectificationDetailItemDTO.fieldName].value = 
                                sphaUtilsServices.castToClientValue(rectificationDetailItemDTO.newFieldValue, 
                                    rectificationDetailItemDTO.fieldType);
                        // for edit rectification details
                        selectedObject[rectificationDetailItemDTO.fieldName].rectificationDetailItem = rectificationDetailItemDTO;
                    }
                }
            }
        }
    };
    
    /**
     * 
     * @param rectificationDTO
     * @param callback
     */
    services.createNewRectification = function(rectificationDTO, callback) {
        if(rectificationDTO) {
            httpServices.post(apiRectificationUrl, rectificationDTO, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        }
    };

    /**
     * 
     * @param form
     * @param rectificationInfo {{  companyCode, 
     *                              procedureInstanceId, 
     *                              detailInfo: {type: *, objectId: {aic9, validMarketing, companyCode}}, 
     *                              selectedObject: (null|*), 
     *                              type: string
     *                           }}
     * @param callback
     */
    services.createNewRectificationWithDetails = function(form, rectificationInfo, callback) {
        var rectificationCreateDTO = createNewRectificationWithDetailsRequest(form, rectificationInfo);
        httpServices.post(createNewRectificationWithDetailsUrl, rectificationCreateDTO, function(data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };

    /**
     * 
     * @param criteria
     * @param page
     * @param pageSize
     * @param unpaged
     * @param order
     * @param callback
     */
    services.getAllRectificationsByCriteria = function(criteria, page, pageSize, unpaged, order, callback) {
        var requestBody = parseRequestCriteria(criteria, page, pageSize, unpaged, order);
        httpServices.post(findRectificationsByCriteriaUrl, requestBody, function(data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };
    
    /**
     * 
     * @param criteria
     * @param page
     * @param pageSize
     * @param unpaged
     * @param order
     * @param callback
     */
    services.getAllRectificationsByCriteriaAndRequiredType = function(criteria, type, page, pageSize, unpaged, order, callback) {
        var requestBody = parseRequestCriteria(criteria, page, pageSize, unpaged, order);
        httpServices.post(findRectificationsByCriteriaUrl + '/' + type, requestBody, function(data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };

    /**
     * 
     * @param criteria
     * @param page
     * @param pageSize
     * @param unpaged
     * @param order
     * @param callback
     */
    services.getRectificationDetailInfoByCriteria = function(criteria, page, pageSize, unpaged, order, callback) {
        var requestBody = parseRequestCriteria(criteria, page, pageSize, unpaged, order);
        httpServices.post(findRectificationDetailInfoByCriteriaUrl, requestBody, function(data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };
    
    /**
     * 
     * @param form
     * @param selectedObject
     * @param rectificationDetailInfoDto {{
     *                                      rectificationId, 
     *                                      type: *, 
     *                                      objectId: string, 
     *                                      status: null
     *                                   }}
     * @param callback
     */
    services.createRectificationDetailInfo = function (form, selectedObject, rectificationDetailInfoDto, callback) {
        var rectificationDetailItemDTOS = getEditedElementsFromForm(form, selectedObject);
        var rectificationDetailInfoDtoToSave = Object.assign({}, rectificationDetailInfoDto);
        rectificationDetailInfoDtoToSave.rectificationDetailItems = rectificationDetailItemDTOS;
        
        httpServices.post(apiRectificationDetailInfoUrl, rectificationDetailInfoDtoToSave, function (data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };
    
    /**
     * 
     * @param rectificationDetailInfos {{rectificationDetailType, 
     *                                   objectKeyInfoStringList: JSON.stringify({
     *                                                              objectKey: {aic9: string, validMarketing: string, companyCode: string},
     *                                                              objectInfo: {aic6: string, companyName: string, medicineDescription: string}})
     *                                                              []
     *                                   idRectification, 
     *                                   aic6: (null|*),
     *                                   newCompanyName
     *                                   rectificationType,
     *                                   newCompanyCode,
     *                                   validMarketing}}
     * @param callback
     */
    services.createRectificationDetailInfosByKeys = function (rectificationDetailInfos, callback) {
        var rectificationDetailInfosDtoToSave = [];
        if(rectificationDetailInfos.rectificationDetailType) {
            rectificationDetailInfos.objectKeyInfoStringList.forEach(objectKeyInfoString => {
                var objectKeyInfo = JSON.parse(objectKeyInfoString);
                var objectInfo = objectKeyInfo.objectInfo;
                var objectKey = objectKeyInfo.objectKey;
                var objectKeyToSave = angular.copy(objectKeyInfo.objectKey);
                if(rectificationDetailInfos.rectificationDetailType === services.rectificationDetailInfoTypeEnum.ADD_AIC6) {
                    /// set new validMarketing to object setted from user in form
                    objectKeyToSave.validMarketing = sphaUtilsServices.castToServerValue(rectificationDetailInfos.validMarketing, 'DATE');
                    objectKeyToSave.companyCode = rectificationDetailInfos.newCompanyCode;
                }
                var rectificationDetailInfoDTO = {
                    rectificationId: rectificationDetailInfos.idRectification,
                    type: rectificationDetailInfos.rectificationDetailType,
                    objectId: JSON.stringify(objectKeyToSave),
                    aic6: objectInfo.aic6,
                    rectificationDetailItems: [{
                        fieldName: 'companyName',
                        fieldType: 'STRING',
                        oldFieldValue: objectInfo.companyName,
                        newFieldValue: rectificationDetailInfos.newCompanyName
                    },{
                        fieldName: 'companyCode',
                        fieldType: 'STRING',
                        oldFieldValue: objectKey.companyCode,
                        newFieldValue: rectificationDetailInfos.newCompanyCode
                    },{
                       fieldName: 'validMarketing',
                       fieldType: 'DATE',
                       oldFieldValue: objectKey.validMarketing,
                       newFieldValue: sphaUtilsServices.castToServerValue(rectificationDetailInfos.validMarketing, 'DATE')
                    }]
                };
                rectificationDetailInfosDtoToSave.push(rectificationDetailInfoDTO);
            });

            httpServices.post(apiRectificationDetailInfoUrl + '/' + 
                                rectificationDetailInfos.idRectification + '-' + 
                                rectificationDetailInfos.rectificationDetailType + '-' + 
                                rectificationDetailInfos.aic6,
                rectificationDetailInfosDtoToSave,
                function (data, success, error) {
                    handleResponse(data, success, error, callback);
                });
        }
    };
    
    /**
     * 
     * @param rectificationDetailInfos {{rectificationDetailType, 
     *                                   objectKeyInfoStringList: JSON.stringify({
     *                                                              {objectKey: {gsdbdfSis: string, companySis: string},
     *                                                              objectInfo: {groupDescription: string, companyDescription: string}})
     *                                                              []
     *                                   idRectification,
     *                                   rectificationType,
     *                                   gsdbdfSis,
     *                                   groupDescription
     *                                   }}
     * @param callback
     */
    services.createGsdbbdfRectificationDetailInfosByKeys = function (rectificationDetailInfos, callback) {
        var rectificationDetailInfosDtoToSave = [];
        if(rectificationDetailInfos.rectificationDetailType) {
            rectificationDetailInfos.objectKeyInfoStringList.forEach(objectKeyInfoString => {
                var objectKeyInfo = JSON.parse(objectKeyInfoString);
                var objectInfo = objectKeyInfo.objectInfo;
                var objectKey = objectKeyInfo.objectKey;
                var objectKeyToSave = angular.copy(objectKeyInfo.objectKey);
                objectKeyToSave.gsdbdfSis = rectificationDetailInfos.gsdbdfSis;
                var rectificationDetailInfoDTO = {
                    rectificationId: rectificationDetailInfos.idRectification,
                    type: rectificationDetailInfos.rectificationDetailType,
                    objectId: JSON.stringify(objectKeyToSave),
                    rectificationDetailItems: buildGsdbdfDetailItems(rectificationDetailInfos, objectKey, objectInfo)
                };
                rectificationDetailInfosDtoToSave.push(rectificationDetailInfoDTO);
            });

            httpServices.post(apiRectificationDetailInfoUrl + '/' +
                                rectificationDetailInfos.idRectification + '-' +
                                rectificationDetailInfos.rectificationDetailType + '-' + 
                                rectificationDetailInfos.gsdbdfSis, 
                rectificationDetailInfosDtoToSave,
                function (data, success, error) {
                    handleResponse(data, success, error, callback);
                });
        }
    };

    /**
     * 
     * @param form
     * @param selectedObject
     * @param rectificationDetailInfoDto {{
     *                                      objectId: string,
     *                                      type: string
     *                                   }}
     * @param callback
     */
    services.updateRectificationDetailInfo = function (form, selectedObject, rectificationDetailInfoDto, callback) {
        var rectificationDetailItemDTOS = getEditedElementsFromForm(form, selectedObject);
        var rectificationDetailInfoDtoToSave = angular.copy(rectificationDetailInfoDto);
        rectificationDetailInfoDtoToSave.rectificationDetailItems = rectificationDetailItemDTOS;
        var rectifiedDTO = rectificationDetailItemDTOS.filter(rectificationDetailItemDTO => 
            rectificationDetailItemDTO.fieldName === 'validMarketing');
        if((rectificationDetailInfoDto.type === services.rectificationDetailInfoTypeEnum.ADD_AIC6 || 
                rectificationDetailInfoDto.type === services.rectificationDetailInfoTypeEnum.ADD) && 
                rectifiedDTO && rectifiedDTO[0]) {
            var newValidMarketing = sphaUtilsServices.castToServerValue(rectifiedDTO[0].newFieldValue, rectifiedDTO[0].fieldType);
                if(!rectificationDetailInfoDto.objectId.includes(newValidMarketing) ) {
                    var objectId = JSON.parse(rectificationDetailInfoDto.objectId);
                    if(objectId.validMarketing) {
                        objectId.validMarketing = newValidMarketing;
                        rectificationDetailInfoDtoToSave.objectId = JSON.stringify(objectId);
                    }
                }
        }
        httpServices.put(apiRectificationDetailInfoUrl, rectificationDetailInfoDtoToSave, function (data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };
    
    /**
     * 
     * @param rectificationDetailInfoDto
     * @param callback
     */
    services.deleteRectificationDetail = function (rectificationDetailInfoDto, callback) {
        if(rectificationDetailInfoDto && rectificationDetailInfoDto.id) {
            var deleteUrl = apiRectificationDetailInfoUrl +  stringFormat(SLASH_ARG, rectificationDetailInfoDto.id);
            httpServices.delete(deleteUrl, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        }
    };

    /**
     * get all rectification type
     * @param callback
     */
    services.getAllRectificationsType = function(callback) {
        httpServices.get(apiRectificationUrl + '-type',  function(data, success, error) {
            var errors = {};
            if (success && data) {
                if (error) {
                    errors.message = error;
                    errors.alertClass = 'alert alert-warning';
                }
            } else {
                errors.message = error;
                errors.alertClass = 'alert alert-danger';
            }
            callback(data, errors);
        });
    };
    
    /**
     * get all rectification type
     * @param callback
     */
    services.getAllRectificationsStatus = function(callback) {
        httpServices.get(apiRectificationUrl + '-status',  function(data, success, error) {
            var errors = {};
            if (success && data) {
                if (error) {
                    errors.message = error;
                    errors.alertClass = 'alert alert-warning';
                }
            } else {
                errors.message = error;
                errors.alertClass = 'alert alert-danger';
            }
            callback(data, errors);
        });
    };
    
    
    /**
     * check-in rectification
     * @param idRectification
     * @param callback
     */
    services.checkInRectification = function(idRectification, callback) {
    	httpServices.put(checkInRectificationUrl + idRectification, null, function (data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };
    
    /**
     * check-out rectification
     * @param idRectification
     * @param callback
     */
    services.checkOutRectification = function(idRectification, callback) {
    	httpServices.put(checkOutRectificationUrl + idRectification, null, function (data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };
    

    /**
     * Delete rectification
     * @param idRectification
     * @param callback
     */
    services.deleteRectification = function (idRectification, callback) {
        httpServices.delete(deleteRectificationUrl + idRectification, function (data, success, error) {
            handleResponse(data, success, error, callback);
        });

    };
    
     /**
     * get rectificationFiles
     * @param criteria filters
     * @param callback
     */
    services.getRectificationFiles = function(criteria, callback) {
    	var requestBody = parseRequestCriteria(criteria, null, null, true, null);
    	httpServices.post(rectificationFileAllUrl, requestBody, function (data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };

    
    /**
     * download rectification file
     * @param files
     */
    services.downloadRectificationFiles = function(files) {
    	var urlFiles = [];
    	files.forEach(file => {
    		urlFiles.push(apiRectificationFileUrl + '/' + file.id + '/download');
    	});
    	return urlFiles;
    };
    
    /**
     * get rectificationEvent
     * @param idRectification
     * @param callback
     */
    services.getRectificationEvent = function(idRectification, callback) {
    	var criteria = {
    			rectificationId: {equals: idRectification},
    			status: {in: ['NOT_APPROVED', 'PARTIALLY_APPROVED']}
    	};
    	httpServices.post(rectificationEventUrl, criteria,  function (data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };

    
    /**
     * get rectification pdf preview
     * @param pdfParams
     * @param callback
     */
    services.getRectificationPdfPreview = function (pdfParams, callback) {
        
        httpServices.arrayBufferResponsePost(rectificationPdfBuildUrl, pdfParams, function (data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };
    
    /** 
     * Delete rectification file
     * @param idFile
     * @param callback
     */
    services.deleteRectificationFile = function(idFile, callback) {
    	httpServices.delete(apiRectificationFileUrl + '/' + idFile, function (data, success, error) {
            handleResponse(data, success, error, callback);
        });
    };
    
    /** 
     * Submit rectification 
     * @param pdfParams for rectification report generation
     * @param callback
     */
    services.submitRectification = function(pdfParams, callback) {
    	httpServices.post( submitRectificationUrl, pdfParams, function(data, success, error) {
    		handleResponse(data, success, error, callback);
    	});
    };


    /**
     * 
     * @param signRequest
     * @param idRectificationFile
     * @param callback
     */
    services.signRectificationGet = function(signRequest, idRectificationFile, callback) {
    	httpServices.post(  apiRectificationUrl  + '/' + idRectificationFile + '/sign-fet-get', signRequest, function(data, success, error) {
    		handleResponse(data, success, error, callback);
    	});
    };
    
  	/** 
     * Protocol rectification file 
     * @param requestProtocolFile for protocol rectification signed file
     * @param callback
     */
    services.protocollRectificationFile = function(requestProtocolFile, callback) {
    	httpServices.post( protocolFileUrl, requestProtocolFile, function(data, success, error) {
    		handleResponse(data, success, error, callback);
    	});
    };
    
    /**
     * get rectification pdf preview
     * @param idRectification
     * @param callback
     */
    services.getProtocolledRectificationFile = function(idRectification, callback) {
    	var errors = {};
    	$http.get(protocolledRectificationFileUrl + idRectification ,{responseType: 'arraybuffer'}  ).then(function(response){
    		
    		if(response.data) {
    			callback(response.data, errors);
    		}	
    	}, function(error) {
    		if (error.status == 403) {
    			errors.message = 'error.http.403';
        		errors.alertClass = 'alert alert-danger';
    		}
    		callback(null, errors);
    	});

    };

    /**
     * get rectification closing protocolled file 
     * @param idProtocol
     * @param callback
     */
    services.getProtocolledFile = function(idProtocol, callback) {
    	var errors = {};
    	$http.get(protocolledFileUrl + idProtocol ,{responseType: 'arraybuffer'}  ).then(function(response){
    		
    		if(response.data) {
    			callback(response.data, errors);
    		}	
    	}, function(error) {
    		if (error.status == 403) {
    			errors.message = 'error.http.403';
        		errors.alertClass = 'alert alert-danger';
    		}
    		callback(null, errors);
    	});

    };
    
    
  	/** 
     * Retry to protocol signature and update
     * @param protocolId for protocol signature and update
     * @param callback
     */
    services.retryProtocolSignatureAndUpdate = function(rectificationId, callback) {
    	httpServices.get( retryProtocolSignatureAndUpdateUrl + rectificationId, function(data, success, error) {
    		handleResponse(data, success, error, callback);
    	});
    };
	    
	/**
	 * Export rectifiation list
	 * @param filters
	 * @@param callback
	 */
    services.exportRectificationList = function(filters, callback) {
    	httpServices.post(exportRectificationListUrl, filters, function (data, success, error) {
    		handleResponse(data, success, error, callback);
        });
    }


    return services;
}
})();