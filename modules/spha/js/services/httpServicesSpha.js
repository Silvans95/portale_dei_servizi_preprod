
(function () { 
 'use strict';
	angular.module('httpServicesSpha', ['ngCookies'])
	
	/**
	 * Http Services
	 */
	.factory( 'httpServices', ['$http', '$q', '$cookies', '$timeout', '$translate', function ( $http, $q, $cookies, $timeout,  $translate) {
				var service = {};
				
				/**
				 *  Post service. 
				 *  Make post request to api rest at specified url.
				 *  @param url api rest url 
				 *  @param obj data to send to the server
				 *  @param callback function returning:
				 *  	   data (objects) , success ( boolean ), 
				 *  	   error ( message error from server)
				 *  
				 */
				service.post = function ( url, obj, callback ) {
					var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
					var headers = {
								'Content-Type' : 'application/json',
								'locale': locale.toUpperCase(),
					};

					$http.post(url, obj, {
						'headers' : headers,
					})
					.then( function ( response ) {
						if( response ){
							callback( response.data.data, response.data.success, response.data.message );
						}
					},function( reject ){
						var errorMessage = service.mapErrorMessage(reject);
						callback( {}, false, errorMessage );
					});
				};
				
				/**
				 *  Post service. 
				 *  Make post request to api rest at specified url.
				 *  @param url api rest url 
				 *  @param obj data to send to the server
				 *  @param callback function returning:
				 *  	   data (objects) , success ( boolean ), 
				 *  	   error ( message error from server)
				 *  
				 */
				service.arrayBufferResponsePost = function ( url, obj, callback ) {
					var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
					var headers = {
								'Content-Type' : 'application/json',
								'locale': locale.toUpperCase(),
					};

					$http.post(url, obj, {
						'headers' : headers,
                        responseType: 'arraybuffer'
					})
					.then( function ( response ) {
					    if(response && response.data) {
                            // parsing error messages form arraybuffer responseType
                            var resp = new Response(response.data);
                            resp.json().then(function (jsonResponse) {
                                var errors;
                                if (jsonResponse && jsonResponse.message) {
                                    errors = {};
                                    errors.message = jsonResponse.message;
                                    errors.alertClass = 'alert alert-danger';
                                }
                                callback( response, false, errors);
                            }).catch(function (err) {
                                // l'arraybuffer restituito non � un json e non pu� essere parsato,
                                // quindi questa response contiene il file richiesto
                            });
                        }
					    callback( response, true, null );
					},function( reject ){
						var errorMessage = service.mapErrorMessage(reject);
						callback( {}, false, errorMessage );
					});
				};
				
				/**
				 *  Post service. 
				 *  Make post request to api rest at specified url.
				 *  @param url api rest url 
				 *  @param obj data to send to the server
				 *  @param callback function returning:
				 *  	   data (objects) , success ( boolean ), 
				 *  	   error ( message error from server)
				 *  
				 */
				service.put = function ( url, obj, callback ) {
					var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
					var headers = {
								'Content-Type' : 'application/json',
								'locale': locale.toUpperCase(),
					};

					$http.put(url, obj, {
						'headers' : headers,
					})
					.then( function ( response ) {
						if( response ){
							callback( response.data.data, response.data.success, response.data.message );
						}
					},function( reject ){
						var errorMessage = service.mapErrorMessage(reject);
						callback( {}, false, errorMessage );
					});
				};
				
				/**
				 *  Post service that return a promise. 
				 *  Make post request to api rest at specified url
				 *  and return a promise.
				 *  @param url api rest url 
				 *  @param obj data to send to the server
				 *  @param callback function returning:
				 *  	   data (objects) , success ( boolean ), 
				 *  	   error ( message error from server)
				 *  
				 */
				service.postAndReturnPromise = function ( url, obj ) {
					var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
					var deferred = $q.defer();
					var headers = {
							'Content-Type' : 'application/json',
							'locale': locale.toUpperCase(),
					};
					
					$http.post(url, obj, {
						'headers' : headers,
					})
					.then( function ( response ) {
						if( response.data.success ){
							deferred.resolve({
								data: response.data.data,
								success : true,
								error : null,
							} );
						}else{
							deferred.reject({
								data: response.data.data,
								success : false,
								error: response.data.message,
							});
						}
					},function( reject ){
						var errorMessage = service.mapErrorMessage(reject);
						deferred.reject({
							data: null,
							success : false,
							error: errorMessage,
						});
					});
					
					return deferred.promise;
					
				};
				
				
				/**
				 * Get service.
				 * @param url api rest url 
				 * @param callback function returning:
				 *  	   data (objects) , success ( boolean ), 
				 *  	   error ( message error from server) 
				 */
				service.get = function ( url, callback ) {
					var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
					var headers = {
								'locale': locale.toUpperCase(),
					};

					$http.get(url, {
						'headers' : headers,
					})
					.then( function ( response ) {
						if( response ){
							callback( response.data.data, response.data.success, response.data.message );
						}
					},function( reject ){
						var errorMessage = service.mapErrorMessage(reject);
						callback( null, false, errorMessage );
					});
				};

				/**
				 * Http Delete to the specified url
				 * @param url request URL
				 * @param callback callback on success/error 
				 */
				service.delete = function ( url, callback ) {
					var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
					var headers = {
						'Content-Type' : 'application/json',
						'locale': locale.toUpperCase(),
					};

					$http.delete(url, {
						'headers' : headers,
					})
					.then( function ( response ) {
						// See HeaderUtil createAlert
						// X-spha-alert
						// X-spha-params
						if( response ){
							callback( true, 'DELETED' );
						}
					},function( reject ){
						var errorMessage = service.mapErrorMessage(reject);
						callback( false, errorMessage );
					});
				};
				
				/**
				 * Http Delete to the specified url with result
				 * @param url request URL
				 * @param callback callback on success/error 
				 */
				service.deleteWithResult = function ( url, callback ) {
                    var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
                    var headers = {
                        'Content-Type' : 'application/json',
                        'locale': locale.toUpperCase(),
                    };
                    $http.delete(url, {
                        'headers' : headers,
                    })
                    .then( function ( response ) {
                        // See HeaderUtil createAlert
                        // X-spha-alert
                        // X-spha-params
                        if( response ){
                            callback( response.data.data , response.data.data ? "DELETED": 'NOT DELETED' );
                        }
                    },function( reject ){
						if (reject.status === -1) return; 
                        var errorMessage = service.mapErrorMessage(reject);
                        callback( false, errorMessage );
                    });
                }; 
				
				service.mapErrorMessage = function (error){
					var msg = '';
					if( error ){
						var resolved = false;
						var statusCode = error.status || (error.data && error.data.status);
						var payloadMessage = error.data && error.data.message;
						var problemTitle = error.data && error.data.title;
						var detail = error.data && error.data.detail;
						
						if (!payloadMessage && statusCode && statusCode>0) {
							msg = $translate.instant('error.http.' + statusCode) + ' ';
							resolved = true;
						}
						
						if (problemTitle) {
							msg = msg +  $translate.instant(problemTitle) + ' ';
							resolved = true;
						}
						
						if (payloadMessage) {
							msg = msg + $translate.instant(payloadMessage) + ' ';
							resolved = true;
						}
						
						if (detail) {
							msg = msg + $translate.instant(detail) + ' ';
							resolved = true;
						}
						
						if (!resolved && error.config && error.config.data && error.config.data.file) {
							msg = error.config.data.file.name;
							resolved = true;
						}
						if (!resolved && error.errors && error.errors.message) {
							msg = error.errors.message;
							resolved = true;
						}
                        if (!resolved && statusCode && statusCode === -1) {
							msg = 'Status Code ' + statusCode + ' Error Server Timeout or NotDefined';
							resolved = true;
						}
					}
					return msg;
				};

				return service;
			}
		]);

})();