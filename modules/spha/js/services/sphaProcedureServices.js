
(function () { 
 'use strict';
	angular.module('sphaApp')
	.factory( 'sphaProcedureServices', ['$log', '$http', '$translate','SweetAlert', 'httpServices', 'uploadServicesSpha', 'PropertiesServiceSpha', '$q',
	function ( $log, $http,  $translate, SweetAlert, httpServices, uploadServicesSpha, PropertiesServiceSpha, $q ) {
        var services = {};
        const procedimentiMsBaseUrl = PropertiesServiceSpha.get('baseUrlProcedure');
        const apiProceduresUrl = procedimentiMsBaseUrl + 'api/procedures';
        const apiProceduresActivateUrl = procedimentiMsBaseUrl + 'api/procedures/activate';
        const apiProceduresCloseUrl = procedimentiMsBaseUrl + 'api/procedures/close';

 		const apiProceduresSuspendUrl = procedimentiMsBaseUrl + 'api/procedures/suspend';
		const apiProceduresReactivateUrl = procedimentiMsBaseUrl + 'api/procedures/reactivate';

        const apiProcedureFilesUrl = procedimentiMsBaseUrl + 'api/procedure-files';
        const apiProcedureImportFilesUrl = procedimentiMsBaseUrl + 'api/procedure-files-import';
        const apiProcedureFilesUpdateUrl = procedimentiMsBaseUrl + 'api/procedure-files-upload';
        const SLASH_ARG = '/{0}';

        /**
         * Function for cloning object 
         * Used for object with multeplicity
         * 
         * @param object
         * @return cloned object
         */
        services.cloneObject = function( object ){
            var obj = {};
            obj = angular.merge(obj, object);
            return obj;
        };

        function stringFormat(format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] !== 'undefined' ? args[number] : match;
            });
        };

        /**
         * Service for getting Procedure 
         * data.
         * Call rest services at specified url.
         * 
         * @param id:number rest api url
         * @param callback:function callback
         */
        services.readProcedure = function ( id, callback ) { 
            var dataObj = {};
            httpServices.get( apiProceduresUrl + '/' + id, function ( data, success, error ) {
                var errors = {};
                if( success && data ){
                    if( error ){
                        errors.message = error;
                        errors.alertClass = 'alert alert-warning';
                    }
                    dataObj = data;
                } else {
                    errors.message = error;
                    errors.alertClass = 'alert alert-danger'; 				 
                }				 					 
                callback ( dataObj, errors );
             });
        };
        
        services.writeProcedure = function(data, callback){
            $http({
                method: data.id ? 'PUT' : 'POST',
                headers : {'Content-Type': 'application/json' },
                url: apiProceduresUrl,
                data: data
            }).then(function( response ){
                callback( response.data.data, response.data.success, response.data.message );
            }, function( response ){
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                callback( {}, false, errors = {
                    message : httpServices.mapErrorMessage(response),
                    alertClass: 'alert alert-danger',
                } );
            });
        };
        
        services.activateProcedure = function(data, callback){
            $http({
                method: 'POST',
                headers : {'Content-Type': 'application/json' },
                url: apiProceduresActivateUrl,
                data: data
            }).then(function( response ){
                callback( response.data.data, response.data.success, response.data.message );
            }, function( response ){
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                callback( {}, false, errors = {
                    message : httpServices.mapErrorMessage(response),
                    alertClass: 'alert alert-danger',
                } );
            });
        };
        
        services.closeProcedure = function(data, callback){
            $http({
                method: 'POST',
                headers : {'Content-Type': 'application/json' },
                url: apiProceduresCloseUrl,
                data: data,
                block: true
            }).then(function( response ){
             	SweetAlert.swal({
                         title: $translate.instant("CLOSE_PROCEDURE"),
                         text: null,
                         type: "success",
                         confirmButtonColor: "#337ab7",
                         confirmButtonText: $translate.instant('OK'),
                         closeOnConfirm: true,
                    });
                callback( response.data.data, response.data.success, response.data.message );
            }, function( response ){
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                callback( {}, false, errors = {
                    message : httpServices.mapErrorMessage(response),
                    alertClass: 'alert alert-danger',
                } );
            });
        };


        services.suspendProcedure = function(data, callback){
            $http({
                method: 'POST',
                headers : {'Content-Type': 'application/json' },
                url: apiProceduresSuspendUrl,
                data: data,
                block: true
            }).then(function( response ){
             	SweetAlert.swal({
                         title: $translate.instant("SUSPEND_PROCEDURE"),
                         text: null,
                         type: "success",
                         confirmButtonColor: "#337ab7",
                         confirmButtonText: $translate.instant('OK'),
                         closeOnConfirm: true,
                    });
                callback( response.data.data, response.data.success, response.data.message );
            }, function( response ){
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                callback( {}, false, errors = {
                    message : httpServices.mapErrorMessage(response),
                    alertClass: 'alert alert-danger',
                } );
            });
        };

        services.reactivateProcedure = function(data, callback){
            $http({
                method: 'POST',
                headers : {'Content-Type': 'application/json' },
                url: apiProceduresReactivateUrl,
                data: data,
                block: true
            }).then(function( response ){
             	SweetAlert.swal({
                         title: $translate.instant("REACTIVATE_PROCEDURE"),
                         text: null,
                         type: "success",
                         confirmButtonColor: "#337ab7",
                         confirmButtonText: $translate.instant('OK'),
                         closeOnConfirm: true,
                    });
                callback( response.data.data, response.data.success, response.data.message );
            }, function( response ){
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                callback( {}, false, errors = {
                    message : httpServices.mapErrorMessage(response),
                    alertClass: 'alert alert-danger',
                } );
            });
        };
        
        services.writeProcedure = function(data, callback){
            $http({
                method: data.id ? 'PUT' : 'POST',
                headers : {'Content-Type': 'application/json' },
                url: apiProceduresUrl,
                data: data
            }).then(function( response ){
                callback( response.data.data, response.data.success, response.data.message );
            }, function( response ){
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                callback( {}, false, errors = {
                    message : httpServices.mapErrorMessage(response),
                    alertClass: 'alert alert-danger',
                } );
            });
        };

        /**
         * Loads all procedure Files
         */
        services.readProcedureFiles = function ( idProcedure, callback ) {
            var getAllProcedureFilesUrl = apiProceduresUrl + stringFormat(SLASH_ARG, idProcedure) + stringFormat(SLASH_ARG, 'files');
            var dataObj = {};
            var errors = {};
            httpServices.get(getAllProcedureFilesUrl, function(data, success, error){
                if (success) {
                    if( error ){
                        errors.message = error;
                        errors.alertClass = 'alert alert-warning';
                    }
                    dataObj = data;
                } else {
                    errors.message = error;
                    errors.alertClass = 'alert alert-danger';
                }
                callback ( dataObj, errors );
            });
        };

        /**
         * Update File API call
         * @param metadata file DTO represeting file metadata to update
         * @param file optional file content
         * @param callback to call on success/error
         */
        services.uploadFile = function ( metadata, file, callback ) {
            if (file) {
                var url;
                if (metadata.id) {
                    url = apiProcedureFilesUpdateUrl;
                } else {
                    url = apiProcedureFilesUrl;
                }
                uploadServicesSpha.uploadOneMultipartFileWithData(file, metadata, 'meta', url, callback );
            } else {
                httpServices.put(apiProcedureFilesUrl, metadata, callback);
            }
        };

        /**
         * Import Files API call
         * @param id procedure ID to update
         * @param callback to call on success/error
         */
        services.importFiles = function ( id, callback ) {
            httpServices.post(apiProcedureImportFilesUrl, {id: id}, callback);
        };

        /**
         * Delete File API call
         * @param file file DTO represeting file to delete
         * @param callback to call on success/error
         */
        services.deleteFile = function ( file, callback ) {
            var deleteUrl = apiProcedureFilesUrl +  stringFormat(SLASH_ARG, file.id);
            httpServices.delete(deleteUrl, callback);
        };
        
        /**
         * Converts Date received from Backend
         * to a Date object suitable to be displayed
         * in frontend Date component
         * @param beDate Date in String format received from BE
         */
        services.serverToClientDate = function ( beDate ){
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
        services.clientToServerDate = function ( feDate ){
            return feDate.toISOString();
        };

        /**
         * Obtain Procedure Type values from Backend
         * @returns Promise that will resolve with data or error message
         */
        services.getProcedureTypesPromise = function (){
            var sphaProcedimentiBaseUrl = PropertiesServiceSpha.get('baseUrlProcedure');
            var procedureTypesUrl =  sphaProcedimentiBaseUrl + 'api/procedures/types';
            var deferred = $q.defer();
            httpServices.get( procedureTypesUrl, function( data, success, error ){
                if( success ){
                    deferred.resolve( data );
                } else {
                    deferred.reject( error );
                }
            });
            return deferred.promise;
        };
        
        /**
         * @param procedureType ProcedureType value
         * @param callback callback ( dataObj, errors );
         */
        services.getMetadataByType = function( procedureType, callback ){
            var url = apiProceduresUrl + '/metadata' + stringFormat(SLASH_ARG, procedureType);
            httpServices.get(url, function(data, success, error){
                var errors = {};
                if (success) {
                    if( error ){
                        errors.message = error;
                        errors.alertClass = 'alert alert-warning';
                    }
                } else {
                    errors.message = error;
                    errors.alertClass = 'alert alert-danger';
                }
                callback ( data, errors );
            });
        };

        /**
         * Return list of allowed action for a specific Procedure
         * 
         * @param allowedActions allowed Action on Procedure from BE
         * @param id of Procedure
         * @return actions list of allowed action
         * 
         */
        services.getProcedureActions = function( allowedActions, id ){
            var actions= [];
            var action={};
            if( allowedActions && allowedActions.length > 0 ){
                for( var i in allowedActions ) {
                    if (allowedActions.hasOwnProperty(i)) {
                        action = {
                            label: 'actions.' + allowedActions[i],
                            object: allowedActions[i],
                            uiSref: 'spha.searchProcedimenti'
                        };
                        switch (allowedActions[i]) {
                            case 'PROCEDURE_VIEW':
                                action.uiSref = 'spha.procedureDetail({ id: ' + id + ' })';
                                action.class = 'fa fa-file';
                                break;
                            case 'PROCEDURE_EDIT':
                                action.uiSref = 'spha.procedureEdit({ id: ' + id + ' })';
                                action.class = 'fa fa-edit';
                                break;
                            case 'PROCEDURE_DELETE':
                                action.uiSref = null;
                                action.class = 'fa fa-trash';
                                break;
                            case 'PROCEDURE_FILE_VIEW':
                                action.uiSref = 'spha.procedureFilesList({ id: ' + id + ' })';
                                action.class = 'fa fa-file-pdf-o';
                                break;
                            case 'PROCEDURE_FILE_EDIT':
                                action.uiSref = 'spha.procedureFilesEdit({ id: ' + id + ' })';
                                action.class = 'fa fa-file-pdf-o';
                                break;
                            default:
                                $log.warn('Procedimento: da censire action nuova:' + allowedActions[i]);
                                break;
                        }
                        actions.push(action);
                    }
                }
            }
            return actions;
        };
        
        return services;
	}]);
})();