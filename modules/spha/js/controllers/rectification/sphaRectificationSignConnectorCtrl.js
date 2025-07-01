
/**
 * @ngdoc function
 * @name sphaRectificationSignConnectorCtrl
 * @description controller for sign Connector - RECTIFICATION Entities
 * # sphaRectificationSignConnectorCtrl
 */
(function () { 
 'use strict';
	angular.module('sphaApp')
	.controller('sphaRectificationSignConnectorCtrl',
		['$location','PropertiesServiceSpha', '$state', '$window', 'httpServices', 'sphaRectificationServices', 'shareDataServices', 'SweetAlert', '$translate',
			function ( $location, PropertiesServiceSpha, $state, $window, httpServices, sphaRectificationServices, shareDataServices, SweetAlert, $translate ) {
				var vm = this;
				vm.message = "";
				vm.alertClass = "";
				vm.data = {};
				
				var searchObject = $location.search();
				var sessionId = searchObject.sessionId;
				
				var signConnectorUrl = '';
				
				var urlProcedure = PropertiesServiceSpha.get("baseUrlProcedure");
						
				var param = searchObject.entityType;

				var pdfRequest = null;
				var originPage = null;
				
				vm.isLoading = false;
				
				function redirect(url, replaceState) {
					vm.isLoading = false;
					if (url !== "") {
                        if (replaceState) {
                            
                        }
                        if (versionId) {
                            $state.go(url, {result: resultValue, message: messageValue, id: versionId});
                        } else {
                            $state.go(url, {result: resultValue, message: messageValue});
                        }
                    } else {
                        vm.message = "SIGN_FAIL";
                        vm.alertClass = "alert alert-danger";
                    }
				}
				
				signConnectorUrl = urlProcedure + "api/rectifications/" + sessionId + "/sign-fet-post"
						
				if(shareDataServices.get('PDF_REQUEST_PARAMS')){
            		pdfRequest = shareDataServices.get('PDF_REQUEST_PARAMS');  
            	}
				if(shareDataServices.get('ORIGIN_PAGE')) {
					originPage = shareDataServices.get('ORIGIN_PAGE');
				}
				
				/** SIGN FET COMMON VARIABLE**/
				var resultValue  = "";
				var messageValue = "";
				var entityId;
				var versionId;
				
				/** POST SIGN FET **/
				if(signConnectorUrl && signConnectorUrl !== '') {
					vm.isLoading = true;
                    httpServices.post(signConnectorUrl, null, function (data, success, error) {
                        /*console.log("## data.entityType: " + data.entityType);*/
                        if (data && data.entities) {
                            if (success) {
                                resultValue = "success";
                                messageValue = "SIGN_SUCCESS";
                            } else {
                                resultValue = "failed";
                                messageValue = "SIGN_FAIL";
                                console.log("## Sign failed : " + error);
                                vm.isLoading = false;
                            }

                            entityId = data.entities[0].entityId;
                            versionId = data.entities[0].versionableFileId;
                        } else {
                            vm.message = "SIGN_FAIL";
                            vm.alertClass = "alert alert-danger";
                            resultValue = "failed";
                            messageValue = "SIGN_FAIL";
                            vm.isLoading = false;
                        }

                        // new redirect logic
                        var requestProtocolFile = {
                         		idProcedureInstance: pdfRequest.idProcedureInstance,
                         		idDocument: versionId,
                         		idRectification: pdfRequest.idRectification
                         }
                        requestProtocolFile.anagraphicType = param;
                        if(success && versionId) {
                        	sphaRectificationServices.protocollRectificationFile(requestProtocolFile, function (protocol_success, protocol_error) {
                                if (JSON.stringify(protocol_success) != "{}" && protocol_success != null){
                                    // documento firmato
                              	  	SweetAlert.swal({
                              	  	title: $translate.instant('PROTOCOL_FILE_SUCCESS_RECTIFICATION') + protocol_success.split("|")[1],
                                        text: null,
                                        type: 'success',
                                        confirmButtonColor: '#337ab7',
                                        confirmButtonText: $translate.instant('OK'),
                                        closeOnConfirm: true,
	                                });
	                              	vm.isLoading = false;
	                              	shareDataServices.set(true, 'RECTIFICATION_PROTOCOL_PAGE');
	                            	redirect(originPage, true);
                                } else {
                                	var errorProtocol = "";
									if(protocol_success) {
										errorProtocol = protocol_success;
									} else {
										errorProtocol = protocol_error.message
									}
                                	SweetAlert.swal({
										title: $translate.instant('PROTOCOL_FILE_ERROR_LABEL') + $translate.instant(errorProtocol) + $translate.instant('PROTOCOL_FILE_ERROR'),
                                        text: null,
                                        type: 'error',
                                        confirmButtonColor: '#337ab7',
                                        confirmButtonText: $translate.instant('OK'),
                                        closeOnConfirm: true,
                                    });
                              	  vm.isLoading = false;
                              	  redirect(originPage);
                                }
                            });
                            
                        } else {
                        	// qualcosa è andato storto nella firma, torniamo alla pagina di sottomissione
                        	SweetAlert.swal({
                                title: $translate.instant('PROTOCOL_FILE_ERROR_FET'),
                                text: null,
                                type: 'error',
                                confirmButtonColor: '#337ab7',
                                confirmButtonText: $translate.instant('OK'),
                                closeOnConfirm: true,
                            
                            });
                        	shareDataServices.set(true, 'RECTIFICATION_PROTOCOL_PAGE');
                        	redirect('spha.submitRectification');                      
                        }
                        
                    });
                }
			}
		]);
})();