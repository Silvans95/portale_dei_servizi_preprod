(function () {
    'use strict';
    angular.module('sphaApp')
        .factory('sphaProcedureInstanceServices', ['$log', '$http', 'httpServices', 'PropertiesServiceSpha',
            function ($log, $http, httpServices, PropertiesServiceSpha) {
                var vm = this;

                var services = {};
                const procedimentiMsBaseUrl = PropertiesServiceSpha.get('baseUrlProcedure');
                const getProcedureInstancessUrl = procedimentiMsBaseUrl + 'api/procedure-instances/list/';
                const procedureInstanceUrl = procedimentiMsBaseUrl + 'api/procedure-instances/';
                const procedureLinksUrl = procedimentiMsBaseUrl +'api/procedure-instances/links/';
                const procedureGetAllowedActionsUrl = procedimentiMsBaseUrl +'api/procedure-instances/actions';
                const procedurePdfBuildUrl = procedureInstanceUrl +'build-pdf';
                const procedureReactivateAcceptanceSubmissionUrl = procedimentiMsBaseUrl +'api/procedure-instances/acceptance/reactivate';
                const procedureSuspendAcceptanceSubmissionUrl = procedimentiMsBaseUrl +'api/procedure-instances/acceptance/suspend';
                const submitProcedureUrl = procedureInstanceUrl + 'submit';
            	const protocolFileUrl = procedureInstanceUrl +  'protocol';
            	const apiProcedureInstanceFileUrl = procedimentiMsBaseUrl + 'api/procedure-instance-files';
            	const apiProcedureAcceptanceUrl = procedimentiMsBaseUrl + 'api/procedure-instances/modulo-accettaziones/';
            	const apiProcedureAcceptancFileeUrl = procedimentiMsBaseUrl + 'api/procedure-instances/modulo-accettazione-files/';
            	const protocolledProcedureFileUrl = apiProcedureInstanceFileUrl +  '/protocolled-file/';
            	const procedureInstanceFileAllUrl = apiProcedureInstanceFileUrl + '/all';
            	
            	const retryProtocolSignatureAndUpdateUrl = apiProcedureInstanceFileUrl + '/retry-signature-update/';
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
                 * @param criteria
                 * @param page
                 * @param pageSize
                 * @param unpaged
                 * @param order
                 * @returns {{start: number, length: (*|number), filters, order: (*|[{id: string}])}}
                 */
                function parseRequestCriteria(criteria, page, pageSize, unpaged, order) {
                    var pageSizeToUse = null;
                    var pageToUse = null;
                    var unpagedToUse = null;
                    if(unpaged === true) {
                        unpagedToUse = true;
                    } else {
                        pageSizeToUse = pageSize ? pageSize : defaultPageSize;
                        pageToUse = page ? page : 0;
                    }
                    var orderToUse = order ? order : [{id: 'asc'}];
                    return {
                        filters: criteria,
                        start: pageToUse * pageSizeToUse,
                        length: pageSizeToUse,
                        unpaged: unpagedToUse,
                        order: orderToUse
                    };
                }

                services.getDataImportIds = function (procedureInstanceDTO, tableType) {
                    var dataImportIds;
                    if (procedureInstanceDTO.procedure && procedureInstanceDTO.procedure.dataSnapshots) {
                        procedureInstanceDTO.procedure.dataSnapshots.forEach(dataSnapshot => {
                            if (tableType === dataSnapshot.tableType) {
                                if (!dataImportIds) {
                                    dataImportIds = [];
                                }
                                dataImportIds.push(dataSnapshot.dataImportId);
                            }
                        });
                    }
                    return dataImportIds;
                };
                
                services.getAllowedActionsProcedureInstance = function (requestData ,callback) {
                	httpServices.post(procedureGetAllowedActionsUrl, requestData,function (data, success, error) {
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

                /** Get procedure links by profile */
                services.getProcedureLinks = function(procedureType, callback) {
                    httpServices.get(procedureLinksUrl + procedureType, function (data, success, error) {
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
                 * Gets Procedures of passed Procedure Instances
                 * and sets the relative procedure field of each of them
                 *
                 * @param {*} instances
                 */
                services.loadProcedures = function (instances) {
                    if (instances && instances.length > 0) {
                        instances.map(pi => pi.procedureId);
                    }
                };

                /**
                 * Searches procedure instances by procedureType and companyCode
                 * @param {*} procedureType
                 * @param {*} companyCode
                 * @param {*} callback
                 */
                services.findByTypeAndCompany = function (procedureType, companyCode, callback) {
                    var dataObj = {};
                    var request = {
                        start: 0,
                        length: 2147483647,
                        order: [{
                            property: 'procedure.endDate',
                            direction: 'DESC'
                        }],
                        filters: {
                            procedureType: procedureType,
                            company: companyCode
                        }
                    };
                    httpServices.post(getProcedureInstancessUrl + procedureType, request, function (data, success, error) {
                        var errors = {};
                        if (success && data) {
                            if (error) {
                                errors.message = error;
                                errors.alertClass = 'alert alert-warning';
                            }
                            dataObj = data;
                        } else {
                            errors.message = error;
                            errors.alertClass = 'alert alert-danger';
                        }
                        callback(dataObj, errors);
                    });
                };
                
                 /**
                 * Reactivate module acceptance Submission by AIFA
                 * @param {*} procedureInstanceDTO
                 * @param {*} callback
                 */
                 services.reactivateAcceptanceSubmission = function (procedureInstance,  callback) {
                    var dataObj = {};
                    var request = {
						id: procedureInstance.id,
                        company: procedureInstance.company,
                        status: procedureInstance.status
                    };
                    httpServices.post(procedureReactivateAcceptanceSubmissionUrl , request, function (data, success, error) {
                    	var errors = null;
                        if (success && data) {
                            if (error) {
                            	errors = {};
                                errors.message = error;
                                errors.alertClass = 'alert alert-warning';
                            }
                            dataObj = data;
                        } else {
                            errors = {};
                            errors.message = error;
                            errors.alertClass = 'alert alert-danger';
                        }
                        callback(dataObj, errors);
                    });
                };

                 /**
                 * Suspend module acceptance Submission by AIFA
                 * @param {*} procedureInstanceDTO
                 * @param {*} callback
                 */
                 services.suspendAcceptanceSubmission = function (procedureInstance,  callback) {
                    var dataObj = {};
                    var request = {
						id: procedureInstance.id,
                        company: procedureInstance.company,
                        status: procedureInstance.status
                  
                    };
                    httpServices.post(procedureSuspendAcceptanceSubmissionUrl , request, function (data, success, error) {
                    	var errors = null;
                        if (success && data) {
                            if (error) {
                            	errors = {};
                                errors.message = error;
                                errors.alertClass = 'alert alert-warning';
                            }
                            dataObj = data;
                        } else {
                            errors = {};
                            errors.message = error;
                            errors.alertClass = 'alert alert-danger';
                        }
                        callback(dataObj, errors);
                    });
                };


                /**
                 * Create procedure instances by procedureType and companyCode
                 * @param {*} procedureType
                 * @param {*} companyCode
                 * @param {*} callback
                 */
                services.createNewProcedureInstance = function (procedureType, companyCode, callback) {
                    var dataObj = {};
                    var request = {
                        company: companyCode,
                        status: 'NEW'
                    };
                    httpServices.post(procedureInstanceUrl + procedureType, request, function (data, success, error) {
                    	var errors = null;
                        if (success && data) {
                            if (error) {
                            	errors = {};
                                errors.message = error;
                                errors.alertClass = 'alert alert-warning';
                            }
                            dataObj = data;
                        } else {
                            errors = {};
                            errors.message = error;
                            errors.alertClass = 'alert alert-danger';
                        }
                        callback(dataObj, errors);
                    });
                };

                /**
                 * Function for cloning object
                 * Used for object with multeplicity
                 *
                 * @param object
                 * @return cloned object
                 */
                services.cloneObject = function (object) {
                    var obj = {};
                    obj = angular.merge(obj, object);
                    return obj;
                };

                /**
                 * Converts Date received from Backend
                 * to a Date object suitable to be displayed
                 * in frontend Date component
                 * @param beDate Date in String format received from BE
                 */
                services.serverToClientDate = function (beDate) {
                    if (beDate) {
                        return new Date(beDate);
                    }
                    return null;
                };

                /**
                 * Converts Date from Frontend
                 * to a String object suitable for the Beckend
                 * @param feDate Date in Date format received from FE
                 */
                services.clientToServerDate = function (feDate) {
                    return feDate.toISOString();
                };

                /**
                 * Function for add class to fields in section
                 *
                 * @param idField
                 * @param data
                 * @param form
                 */
                services.addFieldClass = function (idField, data, form) {
                    if (data && data[idField] && form && form[idField] && form[idField].$invalid) {
                        return 'has-errors';
                    }
                    return fieldHasBeenModified(idField, data);
                };

                /**
                 * Function for fields that has been previously modified inside a section
                 *
                 * @param idField
                 * @param data
                 */
                function fieldHasBeenModified(idField, data) {
                    if (data && data[idField] && data[idField].edited == true) {
                        $('#' + idField).closest('.col-xs-12').addClass('hasBeenModified');
                    } else {
                        $('#' + idField).closest('.col-xs-12').removeClass('hasBeenModified');
                    }
                    return null;
                }

                /** Get procedure instance by id */
                services.getProcedureInstance = function(id, callback) {
                    httpServices.get(procedureInstanceUrl + id, function (data, success, error) {
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
                 * get Procedure pdf preview
                 * @param pdfParams
                 * @param callback
                 */
                services.getProcedureInstancePdfPreview = function (pdfParams, callback) {
                    httpServices.arrayBufferResponsePost(procedurePdfBuildUrl, pdfParams, function (data, success, error) {
                        handleResponse(data, success, error, callback);
                    });
                };
                
                
                /** 
                 * Submit Procedure 
                 * @param pdfParams for Procedure report generation
                 * @param callback
                 */
                services.submitProcedureInstance = function(pdfParams, callback) {
                	httpServices.post( submitProcedureUrl, pdfParams, function(data, success, error) {
                		handleResponse(data, success, error, callback);
                	});
                };


                /**
                 * 
                 * @param signRequest
                 * @param idProcedureFile
                 * @param callback
                 */
                services.signProcedureGet = function(signRequest, idProcedureFile, callback) {
                	httpServices.post(  procedureInstanceUrl  + idProcedureFile + '/sign-fet-get', signRequest, function(data, success, error) {
                		handleResponse(data, success, error, callback);
                	});
                };
                
                
              	/** 
                 * Protocol procedure file 
                 * @param requestProtocolFile for protocol procedure signed file
                 * @param callback
                 */
                services.protocollProcedureFile = function(requestProtocolFile, callback) {
                	httpServices.post( protocolFileUrl, requestProtocolFile, function(data, success, error) {
                		handleResponse(data, success, error, callback);
                	});
                };
                
                /**
                 * get Procedure pdf preview
                 * @param idProcedure
                 * @param callback
                 */
                services.getProtocolledProcedureFile = function(idProcedureInstance, callback) {
                	var errors = {};
                	$http.get(protocolledProcedureFileUrl + idProcedureInstance ,{responseType: 'arraybuffer'}  ).then(function(response){
                		
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

                }

                services.getAcceptanceFilePDF = function(idProcedureInstance, callback) {
                	var errors = {};
                	$http.get(apiProcedureAcceptancFileeUrl + idProcedureInstance ,{responseType: 'arraybuffer'}  ).then(function(response){
                		
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
                
                services.getProtocolledAcceptanceFile = function(idProcedureInstance, callback) {
                	var errors = {};
                	$http.get(apiProcedureAcceptanceUrl + idProcedureInstance).then(function(response){
                		
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
                 * get ProcedureInstanceFiles
                 * @param criteria filters
                 * @param callback
                 */
                services.getProcedureInstanceFiles = function(criteria, callback) {
                	var requestBody = parseRequestCriteria(criteria, null, null, true, null);
                	httpServices.post(procedureInstanceFileAllUrl, requestBody, function (data, success, error) {
                        handleResponse(data, success, error, callback);
                    });
                };
               
                
                /** 
                 * Delete procedure instance file
                 * @param idFile
                 * @param callback
                 */
                services.deleteProcedureInstanceFile = function(idFile, callback) {
                	httpServices.delete(apiProcedureInstanceFileUrl + '/' + idFile, function (data, success, error) {
                        handleResponse(data, success, error, callback);
                    });
                };

                services.setMassiveActionByProcedureInstance = function (procedureInstanceDTO, scopeActions) {
                    if (procedureInstanceDTO && procedureInstanceDTO.procedure) {
                        var today = new Date().setHours(0, 0, 0, 0);
                        var endDateFormatted = new Date(procedureInstanceDTO.procedure.endDate).setHours(0, 0, 0, 0);
                        var startDateFormatted = new Date(procedureInstanceDTO.procedure.startDate).setHours(0, 0, 0, 0);
                        if (procedureInstanceDTO.procedure && !(procedureInstanceDTO.procedure.status === 'STARTED' ||
                            ( startDateFormatted > today && endDateFormatted <= today))) {
                            scopeActions.EDIT = false;
                            scopeActions.CLEAR = false;
                            scopeActions.SAVE = false;
                            scopeActions.SAVE_RECTIFICATION_AIC6 = false;
                            scopeActions.SUBMIT = false;
                            scopeActions.IMPORT = false;
                        }
                    }
                };
                
                
                /**
                 * Delete procedure instance
                 * @param procedureInstanceId
                 * @param callback
                 */
                services.deleteProcedureInstance = function (procedureInstanceId, callback) {
                    httpServices.delete(procedureInstanceUrl + procedureInstanceId, function (data, success, error) {
                        handleResponse(data, success, error, callback);
                    });

                };
                
              	/** 
                 * Retry to protocol signature and update
                 * @param protocolId for protocol signature and update
                 * @param callback
                 */
                services.retryProtocolSignatureAndUpdate = function(instanceId, callback) {
                	httpServices.get( retryProtocolSignatureAndUpdateUrl + instanceId, function(data, success, error) {
                		handleResponse(data, success, error, callback);
                	});
                };
                
                return services;
            }]);
})();
