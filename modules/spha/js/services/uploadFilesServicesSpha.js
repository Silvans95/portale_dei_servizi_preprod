
(function () { 
 'use strict';
	angular.module('sphaApp')
		
	.factory('uploadServicesSpha', [ 'Upload','$q', '$http', '$translate', 'httpServices',
		function( Upload, $q, $http, $translate, httpServices ){
		
		var service={};
		
		/**
		 * Service for upload one file and optionally some other data. 
		 * It's return a callback with success or/and errors.
		 * 
		 * @param file file  to upload
		 * @param dataToSend data to send inside request
		 * @param key name for sending data
		 * @param url uploadUrl at witch upload files
		 * @param callback function  
		 */
		service.uploadMultipartFilesWithData = function( files, dataToSend, dataKeyObject, url, callback ){
				var errors = {};
				var dataObj = {};
				if( dataToSend && dataKeyObject ){
					dataObj.files=files;
					dataObj[dataKeyObject] = JSON.stringify( dataToSend );
				}else{
					dataObj.files = files;
				}
				Upload.upload({
					headers: {'Content-Type': undefined },
                    url: url,
					data: dataObj,
					arrayKey: '',
                }).then( function ( response ) {
                	if( response.data.success ){
                		callback( response.data.data, true, null );
                	}else{
                		callback( {}, false, errors = {
                			message : $translate.instant('ERROR_UPLOADING_FILE' ) + " " + $translate.instant( response.data.message ),
                			alertClass: "alert alert-danger",
                		} );
                	}
                });
		} 
		
		/**
		 * Service for upload a list of files and optionally some other data. 
		 * It's return a callback with success or/and errors.
		 * 
		 * @param files files array to upload
		 * @param dataToSend data to send inside request
		 * @param key name for sending data
		 * @param url uploadUrl at witch upload files
		 * @param callback function  
		 */
		service.uploadOneMultipartFileWithDataOld = function( file, dataToSend, dataKeyObject, url, callback ){
			if( file ){
				var errors = {};
				var dataObj = {};
				if( dataToSend && dataKeyObject ){
					dataObj.file=file;
					dataObj[dataKeyObject] = JSON.stringify( dataToSend );
				}else{
					dataObj.file = file;
				}
				Upload.upload({
					headers: {'Content-Type': undefined },
					url: url,
					data: dataObj
				}).then( function ( response ) {
					if( response.data.success ){
						callback( response.data.data, true, null );
					}else{
						callback( {}, false, errors = {
								message : $translate.instant('ERROR_UPLOADING_FILE' ) + " " + $translate.instant( response.data.message ),
								alertClass: "alert alert-danger",
						} );
					}
				});
			}
		} 

		/**
		 * Service for upload a file and some other data. 
		 * It's return a callback with success or/and errors.
		 * 
		 * @param file file to upload
		 * @param dataToSend data to send inside request
		 * @param dataKeyObject name for sending data
		 * @param url uploadUrl at witch upload files
		 * @param callback function  
		 */
		service.uploadOneMultipartFileWithData = function( file, dataToSend, dataKeyObject, url, callback ){
			if( file ){
				var errors = {};

				var fd = new FormData();
				fd.append(dataKeyObject, new Blob([JSON.stringify(dataToSend)], {type: "application/json"}));
				fd.append('file', file);

				$http({
					method: dataToSend.id ? 'PUT' : 'POST',
					headers : {'Content-Type': undefined },
					url: url,
					data: fd
				}).then(function successCallback(response) {
					// this callback will be called asynchronously
					// when the response is available
					if( response.data.success ){
						callback( response.data.data, true, null );
					}else{
						callback( {}, false, errors = {
							message : $translate.instant('ERROR_UPLOADING_FILE' ) + " " + $translate.instant( response.data.message ),
							alertClass: "alert alert-danger",
						} );
					}
				}, function errorCallback(response) {
					// called asynchronously if an error occurs
					// or server returns response with an error status.
					callback( {}, false, errors = {
						message : $translate.instant('ERROR_UPLOADING_FILE' ) + " " + $translate.instant(httpServices.mapErrorMessage(response)),
						alertClass: "alert alert-danger",
					} );
				});
			}
		}

		/**
		 * Service for upload a file and some other data. 
		 * It's return a callback with success or/and errors.
		 * 
		 * @param file file to upload
		 * @param dataToSend data to send inside request
		 * @param dataKeyObject name for sending data
		 * @param url uploadUrl at witch upload files
		 * @param callback function  
		 */
		service.uploadOneOptionalMultipartFileWithData = function( file, dataToSend, dataKeyObject, url, callback ){
			
			var errors = {};

			var fd = new FormData();
			fd.append(dataKeyObject, new Blob([JSON.stringify(dataToSend)], {type: "application/json"}));
			fd.append('file', file);

			$http({
				method: dataToSend.id ? 'PUT' : 'POST',
				headers : {'Content-Type': undefined },
				url: url,
				data: fd
			}).then(function successCallback(response) {
				// this callback will be called asynchronously
				// when the response is available
				if( response.data.success ){
					callback( response.data.data, true, null );
				}else{
					callback( {}, false, errors = {
						message : $translate.instant('ERROR_UPLOADING_FILE' ) + " " + $translate.instant( response.data.message ),
						alertClass: "alert alert-danger",
					} );
				}
			}, function errorCallback(response) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
				callback( {}, false, errors = {
					message : $translate.instant('ERROR_UPLOADING_FILE' ) + " " + $translate.instant(httpServices.mapErrorMessage(response)),
					alertClass: "alert alert-danger",
				} );
			});

		}
		
		/**
		 * Service for upload a file.
		 * It's return a promise.
		 * 
		 * @param file file to upload
		 * @param uploadUrl url for upload file
		 * @return deferred.promise promise  
		 */
		service.uploadFileAndReturnPromise = function ( file, uploadUrl ){
			if( file && uploadUrl ){
				var deferred = $q.defer();
				Upload.upload({
					url: uploadUrl,
					data: {
						file: file  
					}
				}).then( function ( response ) {
					if( response.data.success ){
						deferred.resolve({
							data: response.data.data,
							success : true,
							errors : null,
						} );
					}else{
						deferred.reject({
							data: null,
							success : false,
							errors : {
	                			message : $translate.instant('ERROR_UPLOADING_FILE' ) + " " + $translate.instant( response.data.message ),
	                			alertClass: "alert alert-danger",
							}
						} );
					}
				},function ( reject ){
					deferred.reject({ 
						data: null,
						success : false,
						errors : {
                			message : $translate.instant( 'ERROR_UPLOADING_FILE' ) + " " + $translate.instant(httpServices.mapErrorMessage(reject)),
                			alertClass: "alert alert-danger",
						}
						});
                });
				return deferred.promise;
			}
		};
		
		/**
		 * Service for upload a file.
		 * It's return a promise.
		 * 
		 * @param file file to upload
		 * @param uploadUrl url for upload file
		 * @return deferred.promise promise  
		 */
		service.uploadFilesAndReturnPromise = function ( files, uploadUrl ){
			if( files.length>0 && uploadUrl ){
				var promises = [];
				var errors = [];
				var deferred = $q.defer();
				
				for( var i in files ){
					var promise = service.uploadFileAndReturnPromise( files[i], uploadUrl )
						.then( function( result ){
							
						}, function( reject ){
							errors.push( httpServices.mapErrorMessage(reject) );
						} );
					promises.push( promise );
				}
				$q.all( promises ).then( function( ){
					if( errors.length > 0 ){
						deferred.reject({
							data: null,
							success : false,
							errors : errors,
							});
					}else{
						deferred.resolve({
							data: null,
							success : true,
							errors : null,
						});
					} 
				});
				return deferred.promise;
			}
		};
		
		return service;
		
	}]);
})();