
/**
 * @ngdoc function
 * @name sphaProcedureInstanceSignConnectorCtrl
 * @description controller for sign Connector - RECTIFICATION Entities
 * # sphaProcedureInstanceSignConnectorCtrl
 */
(function () { 
 'use strict';
	angular.module('sphaApp')
	.controller('sphaProcedureInstanceSignConnectorCtrl',
		['$location','PropertiesServiceSpha', '$state', '$window', 'httpServices', 'sphaProcedureInstanceServices', 'shareDataServices', 'SweetAlert', '$translate', 'sphaUtilsServices',
			function ( $location, PropertiesServiceSpha, $state, $window, httpServices, sphaProcedureInstanceServices, shareDataServices, SweetAlert, $translate, sphaUtilsServices ) {
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
				var instancePage = null;
				
				vm.isLoading = false;
				
				function redirect(url) {
					vm.isLoading = false;
					if (url !== "") {
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
				
				signConnectorUrl = urlProcedure + "api/procedure-instances/" + sessionId + "/sign-fet-post"
						
				if(shareDataServices.get('PDF_REQUEST_PARAMS')){
            		pdfRequest = shareDataServices.get('PDF_REQUEST_PARAMS');  
            	}
				
				if(shareDataServices.get('ORIGIN_PAGE')) {
					instancePage = shareDataServices.get('ORIGIN_PAGE');
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
                         }
                        requestProtocolFile.anagraphicType = param;
                        if(success && versionId) {
                        	sphaProcedureInstanceServices.protocollProcedureFile(requestProtocolFile, function (protocol_success, protocol_error) {
                                if (JSON.stringify(protocol_success) != "{}"  && protocol_success != null){
                                    // documento firmato
                              	  SweetAlert.swal({
                              		  	title: $translate.instant('PROTOCOL_FILE_SUCCESS') + protocol_success.split("|")[1],
                                        text: null,
                                        type: 'success',
                                        confirmButtonColor: '#337ab7',
                                        confirmButtonText: $translate.instant('OK'),
                                        closeOnConfirm: true,
                                    });
                              	shareDataServices.set(true, 'PROCEDURE_PROTOCOL_PAGE');
                            	vm.isLoading = false;
                            	redirect(instancePage);
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
                                	redirect(instancePage);
                                	
                                }
                            });
                            
                        } else {
                        	// qualcosa è andato storto nella firma, torniamo alla pagina di sottomissione
                        	redirect(instancePage);
                        	vm.isLoading = false;
                        	SweetAlert.swal({
                                title: $translate.instant('PROTOCOL_FILE_ERROR_FET'),
                                text: null,
                                type: 'error',
                                confirmButtonColor: '#337ab7',
                                confirmButtonText: $translate.instant('OK'),
                                closeOnConfirm: true,
                            
                            });
                        }
                        
                    });
                }
			}
		]);
})();