(function () {
    'use strict';
    angular.module('sphaApp')
        .factory('sphaGSDPServices', ['$log', '$http', 'httpServices', 'uploadServicesSpha', 'PropertiesServiceSpha', '$q',
            function ($log, $http, httpServices, uploadServicesSpha, PropertiesServiceSpha, $q) {
                var services = {};
                var procedureMsBaseUrl = PropertiesServiceSpha.get("baseUrlProcedure");
                var companyBelongsProcedureApi = procedureMsBaseUrl + "api/gsdp-companies/check-company-belongs";

                var findOrCreateInstance = procedureMsBaseUrl + "api/gsdp-instances/find-or-create";
                var findByCriteria = procedureMsBaseUrl + "api/gsdp-instances";

                var writeInstance = procedureMsBaseUrl + "api/gsdp-instances";

                const apiGSDPFilesUrl = procedureMsBaseUrl + "api/gsdp-files";
                const apiGSDPFilesUpdateUrl = procedureMsBaseUrl + "api/gsdp-files-upload";

                const SLASH_ARG = "/{0}"

                /**
                 * Service for check if a company (By Code) belongs to a specified Procedure Instance (By instanceId)
                 * data.
                 * Call rest services at specified url.
                 *
                 * @callback function callback
                 */
                services.checkCompanyBelongToInstance = function (companySis, instanceId, codSisCorporation) {
                    var deferred = $q.defer();

                    $http.get(companyBelongsProcedureApi +
                        "?companySis=" + companySis +
                        "&instanceId=" + instanceId +
                        "&codSisCorporation=" + codSisCorporation
                    )
                        .success(function (response, status, headers, config) {
                            deferred.resolve(response);
                        })
                        .error(function (errResp) {
                            deferred.reject(errResp);
                        });
                    return deferred.promise;
                };

                services.findOrCreateGSDPInstance = function (queryMap) {
                    const query = new URLSearchParams(queryMap).toString();

                    var deferred = $q.defer();
                    $http.get(findOrCreateInstance + "?" + query)
                        .success(function (response, status, headers, config) {
                            deferred.resolve(response);
                        })
                        .error(function (errResp) {
                            deferred.reject(errResp);
                        });
                    return deferred.promise;
                };
                
                services.findByCriteriaGSDPInstance = function (queryMap) {
                    const query = new URLSearchParams(queryMap).toString();

                    var deferred = $q.defer();
                    $http.get(findByCriteria + "?" + query)
                        .success(function (response, status, headers, config) {
                            deferred.resolve(response);
                        })
                        .error(function (errResp) {
                            deferred.reject(errResp);
                        });
                    return deferred.promise;
                };
                services.writeGSDP = function(data, callback){
                    $http({
                        method: data.id ? 'PUT' : 'POST',
                        headers : {'Content-Type': 'application/json' },
                        url: writeInstance,
                        data: data
                    }).then(function( response ){
                        return callback( response.data, response.statusText );
                    }, function( response ){
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        return callback( {}, false, errors = {
                            message : httpServices.mapErrorMessage(response),
                            alertClass: "alert alert-danger",
                        } );
                    });
                };

                /**
                 * Service for getting GSDP Instance data.
                 * Call rest services at specified url.
                 *
                 * @param url rest api url
                 * @callback function callback
                 */
                services.readGSDPInstance = function ( url, callback ) {
                    $http({
                        method: "GET",
                        url: url
                    }).then(function(response){
                        return callback (response.data);
                    }, function (response){
                        var errors = {
                            message : response.statusText,
                            alertClass: "alert alert-danger",
                        };
                        return callback( {}, errors);
                    });
                };


                /**
                 * Loads all gsdp instance Files
                 */
                services.readGsdpInstanceFiles = function ( idGSDPInstance, callback ) {
                    var gsdpFilesUrls = procedureMsBaseUrl +"api/gsdp-files/"+idGSDPInstance+"/files";

                    var dataObj = {};
                    var errors = null;
                    httpServices.get(gsdpFilesUrls, function(data, success, error){
                        if (success) {
                            if( error ){
                                errors.message = error;
                                errors.alertClass = "alert alert-warning";
                            }
                            dataObj = data;
                        } else {
                            errors.message = error;
                            errors.alertClass = "alert alert-danger";
                        }
                        callback ( dataObj, errors );
                    });
                };

                /**
                 * Delete File API call
                 * @param file file DTO represeting file to delete
                 * @param callback to call on success/error
                 */
                services.deleteFile = function ( id, callback ) {
                    var deleteUrl = apiGSDPFilesUrl +"/"+ id;
                    httpServices.delete(deleteUrl, callback);
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
                            url = apiGSDPFilesUpdateUrl;
                        } else {
                            url = apiGSDPFilesUrl;
                        }
                        uploadServicesSpha.uploadOneMultipartFileWithData(file, metadata, 'meta', url, callback );
                    } else {
                        httpServices.put(apiGSDPFilesUrl, metadata, callback);
                    }
                };

                services.submitGSDPInstance = function (id, status, callback){
                    var updateStateInstance = writeInstance+"/"+id+"?status="+status;
                    var dataObj = {};
                    var errors = null;
                    httpServices.put(updateStateInstance, function(data, success, error){
                        if (success) {
                            if( error ){
                                errors.message = error;
                                errors.alertClass = "alert alert-warning";
                            }
                            dataObj = data;
                        } else {
                            errors.message = error;
                            errors.alertClass = "alert alert-danger";
                        }
                        callback ( dataObj, errors );
                    });
                };

                services.downloadGSDPFile =  function(id, callback){
                    $http({
                        method: "GET",
                        url: apiGSDPFilesUrl+stringFormat(SLASH_ARG, id) +"/download"
                    }).then(function(response){
                        return callback (response.data);
                    }, function (response){
                        var errors = {
                            message : response.statusText,
                            alertClass: "alert alert-danger",
                        };
                        return callback( {}, errors);
                    });
                };

                var stringFormat = function(format) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    return format.replace(/{(\d+)}/g, function(match, number) {
                        return typeof args[number] != 'undefined'
                            ? args[number]
                            : match
                            ;
                    });
                };
                return services;
            }]);
})();
