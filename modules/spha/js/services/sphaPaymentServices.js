
(function () { 
    'use strict';
	angular.module('sphaApp')
	    .factory( 'sphaPaymentServices', sphaPaymentServices)
        .$inject = ['$log', '$http', '$cookies', 'httpServices','PropertiesServiceSpha'];
	
    function sphaPaymentServices( $log, $http, $cookies, httpServices, PropertiesServiceSpha) {
        const procedimentiMsBaseUrl = PropertiesServiceSpha.get("baseUrlProcedure");

        const services = {
			paybackPaymentFieldsToShowUrl: procedimentiMsBaseUrl + 'api/payments/list/fields-to-show',
            paybackPaymentAllUrl: procedimentiMsBaseUrl + 'api/payments/list',
            paymentFeeUrl: procedimentiMsBaseUrl + 'api/payment-fees',
            paymentFeeFileFileUrl: procedimentiMsBaseUrl + 'api/payment-fee-files',
            submitPaymentFeeUrl: procedimentiMsBaseUrl + 'api/payment-fees/submit-payment-fee',
            protocolFileUrl:  procedimentiMsBaseUrl + 'api/payment-fees/protocol',
            protocolledFileUrl: procedimentiMsBaseUrl + 'api/protocolled-file-closing/',
            apiPaymentFeeUrl: procedimentiMsBaseUrl + 'api/payment-fees',
            protocolledPaymentFeeFileUrl: procedimentiMsBaseUrl + 'api/payment-fees/protocolled-file/',
            paymentGetAllowedActionsUrl: procedimentiMsBaseUrl + 'api/payments/actions',
            paymentGetAllowedColumnsUrl: procedimentiMsBaseUrl + 'api/payments/columns-report',
            procedureUrl: procedimentiMsBaseUrl + 'api/procedures/',
            paybackPaymentFeeAllUrl: procedimentiMsBaseUrl + 'api/payment-fees/list',
            paybackPaymentAllGroupedUrl: procedimentiMsBaseUrl + 'api/payments/list-grouped',
            paymentFeeDateUrl: procedimentiMsBaseUrl + 'api/procedure-fee-dates/list-create',
            paymentFeeDateListAllUrl: procedimentiMsBaseUrl + 'api/procedure-fee-dates/list-all',
            retryProtocolSignatureAndUpdateUrl: procedimentiMsBaseUrl + 'api/payment-fees/retry-signature-update/',
            dataFileImportURL: procedimentiMsBaseUrl + 'api/data-file-imports/list'
        };


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
         * handle response from server
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
            } else {
                errors.message = error && error.message ? error.message : error;
                errors.alertClass = 'alert alert-danger';
            }
            callback(data,errors);
        }

     	services.getPaybackPaymentFieldsToShow = function(request,  callback) {
            
            httpServices.get(services.paybackPaymentFieldsToShowUrl , request, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });

        }

        services.getPaybackPayment = function(request, callback) {
            
            httpServices.post(services.paybackPaymentAllUrl , request, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });

        }


         services.getPaybackPaymentGrouped = function(request, procedureType, queryType, callback) {
            
            httpServices.post(services.paybackPaymentAllGroupedUrl + "/" +  procedureType + "/" + queryType, request, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });

        }
        

        services.getPaybackPaymentFee = function(request, callback) {
            
            httpServices.post(services.paybackPaymentFeeAllUrl , request, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });

        }


        services.insertPaymentFee = function(paymentFeeDTO, callback) {
            if(paymentFeeDTO.id) {
                httpServices.put(services.paymentFeeUrl , paymentFeeDTO, function (data, success, error) {
                handleResponse(data, success, error, callback);
                });
            } else {
                httpServices.post(services.paymentFeeUrl , paymentFeeDTO, function (data, success, error) {
                handleResponse(data, success, error, callback);
                });
            }
            

        }

        services.getPaymentFeeFiles = function(criteria, callback) {
            var requestBody = parseRequestCriteria(criteria, null, null, true, null);
            httpServices.post(services.paymentFeeFileFileUrl + '/all', requestBody, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };

        
        services.deletePaymentFeeFile = function(idFile, callback) {
            httpServices.delete(services.paymentFeeFileFileUrl + '/' + idFile, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };

        /** 
         * Submit payment fee 
         * @param pdfParams for payment fee report generation
         * @param callback
         */
        services.submitPaymentFee = function(pdfParams, callback) {
            httpServices.post( services.submitPaymentFeeUrl, pdfParams, function(data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };

        /** 
         * Protocol payment fee file 
         * @param requestProtocolFile for protocol payment fee signed file
         * @param callback
         */
        services.protocollPaymentFeeFile = function(requestProtocolFile, callback) {
            httpServices.post( services.protocolFileUrl, requestProtocolFile, function(data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };

         /**
         * 
         * @param signRequest
         * @param idPaymentFeeFile
         * @param callback
         */
        services.signPaymentFeeGet = function(signRequest, idPaymentFeeFile, callback) {
            httpServices.post(  services.apiPaymentFeeUrl  + '/' + idPaymentFeeFile + '/sign-fet-get', signRequest, function(data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };
        
        /** 
         * Protocol rectification file 
         * @param requestProtocolFile for protocol rectification signed file
         * @param callback
         */
        services.protocollPaymentFeeFile = function(requestProtocolFile, callback) {
            httpServices.post( services.protocolFileUrl, requestProtocolFile, function(data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };
        
        /**
         * get rectification pdf preview
         * @param idPaymentFee
         * @param callback
         */
        services.getProtocolledPaymentFeeFile = function(idPaymentFee, callback) {
            var errors = {};
            $http.get(services.protocolledPaymentFeeFileUrl + idPaymentFee ,{responseType: 'arraybuffer'}  ).then(function(response){
                
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
            $http.get(services.protocolledFileUrl + idProtocol ,{responseType: 'arraybuffer'}  ).then(function(response){
                
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

        services.getAllowedActionsPayment = function (callback) {
            httpServices.get(services.paymentGetAllowedActionsUrl,function (data, success, error) {
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


        services.getAllowedColumnsPayment = function (procedureType, callback) {
            httpServices.get(services.paymentGetAllowedColumnsUrl + "/" + procedureType,function (data, success, error) {
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

        services.getProcedureById = function (idProcedure, callback) {
            httpServices.get(services.procedureUrl + idProcedure,function (data, success, error) {
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
         * @param idProcedure
         * @param callback
         */
        services.getProtocolledPaymentFeeFile = function(idPaymentFee, callback) {
            var errors = {};
            $http.get(services.protocolledPaymentFeeFileUrl + idPaymentFee ,{responseType: 'arraybuffer'}  ).then(function(response){
                
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
         * Delete payment fee file protocolled
         * @param procedureInstanceId
         * @param callback
         */
        services.deletePaymentFeeProtocol = function (idPaymentFee, callback) {
            httpServices.delete(services.paymentFeeUrl + '/' + idPaymentFee, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });

        };
        
        
        services.insertPaymentFeeDates = function(paymentFeeDateListDTO, callback) {
            httpServices.post(services.paymentFeeDateUrl , paymentFeeDateListDTO, function (data, success, error) {
            handleResponse(data, success, error, callback);
            });

        }
        
        services.getPaybackPaymentFeeDates = function(request, callback) {
            
            httpServices.post(services.paymentFeeDateListAllUrl , request, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });

        }
        
        services.getDataImportLog = function(request, callback) {
            
            httpServices.post(services.dataFileImportURL , request, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });

        }
        
        /** 
         * Retry to protocol signature and update
         * @param protocolId for protocol signature and update
         * @param callback
         */
        services.retryProtocolSignatureAndUpdate = function(paymentFeeId, callback) {
        	httpServices.get( services.retryProtocolSignatureAndUpdateUrl + paymentFeeId, function(data, success, error) {
        		handleResponse(data, success, error, callback);
        	});
        };

        return services;
	}
})();