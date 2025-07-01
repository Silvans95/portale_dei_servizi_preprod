
/**
 * @ngdoc function
 * @name sphaPaymentFeeSignConnectorCtrl
 * @description controller for sign Connector - RECTIFICATION Entities
 * # sphaPaymentFeeSignConnectorCtrl
 */
(function () { 
 'use strict';
	angular.module('sphaApp')
	.controller('sphaPaymentFeeSignConnectorCtrl',
		['$location','PropertiesServiceSpha', '$state', '$window', 'httpServices', 'sphaPaymentServices', 'shareDataServices', 'SweetAlert', '$translate', 'sphaUtilsServices',
			function ( $location, PropertiesServiceSpha, $state, $window, httpServices, sphaPaymentServices, shareDataServices, SweetAlert, $translate, sphaUtilsServices ) {
				var vm = this;
				vm.message = "";
				vm.alertClass = "";
                vm.data = {};
                vm.paymentFeeDTO = null;
				
				var searchObject = $location.search();
				var sessionId = searchObject.sessionId;
				
				var signConnectorUrl = '';
				
				var urlProcedure = PropertiesServiceSpha.get("baseUrlProcedure");
						
				var param = searchObject.entityType;

                var paymentDTO = null;
                
				var originPage = 'spha.paymentManagement';
				
				vm.isLoading = false;
                
                function sumFee(listFee) {
						if(listFee != null && listFee != []) {
							var sum = 0.00;
							listFee.forEach(fee => {
								sum += fee.paidAmount;
							});
							return sum;
						} else return 0.00;
                    }
                    
				function redirect(url) {
					vm.isLoading = false;
					if (url !== "") {
												
                        $state.go(url, {procedureType: shareDataServices.get('ORIGIN_PAGE_PROCEDURE_TYPE'), queryType: 'VERSARE', procedureId: paymentDTO.procedureId});

                    } else {
                        vm.message = "SIGN_FAIL";
                        vm.alertClass = "alert alert-danger";
                    }
				}
				
				signConnectorUrl = urlProcedure + "api/payment-fees/" + sessionId + "/sign-fet-post"


				function initCookie(){
                    if(shareDataServices.getLS('OPERATION_PAYMENT_PARAMS')) {
                        paymentDTO = shareDataServices.getLS('OPERATION_PAYMENT_PARAMS');
                        initPayment(paymentDTO);
                    }
                }

                function initPayment(paymentDTO) {
                        vm.regionDescription = paymentDTO.regionDescription;
                        vm.difference = paymentDTO.totalAmount - sumFee(paymentDTO.paymentFees);
                        vm.difference_=vm.difference;

                        if(paymentDTO.paymentFees.length != 0) {
                            paymentDTO.paymentFees.forEach(fee => {                                
                                if(fee.status == 'DRAFT' || fee.status == 'SIGNED' || fee.status == 'DELETED' || 
                            fee.status == 'SIGNED_DELETED' || fee.status == 'DELETED_PARENT') {
                                    vm.paymentFeeDTO = fee;
                                    return;
                                } 
                            });
                        }
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
                        initCookie();

                        // new redirect logic
                        var requestProtocolFile = {
                            idProcedure: paymentDTO.procedureId,
                            idDocument: versionId,
                            paymentFeeId: vm.paymentFeeDTO.id,
                            companyCode: paymentDTO.codiceSis,
                        }
                        requestProtocolFile.anagraphicType = param;
                        if(success && versionId) {
                        	sphaPaymentServices.protocollPaymentFeeFile(requestProtocolFile, function (protocol_success, protocol_error) {
                                if (JSON.stringify(protocol_success) != "{}" && protocol_success != null){
									// documento firmato
									SweetAlert.swal({
										title: $translate.instant('PROTOCOL_PAYMENT_FILE_SUCCESS') + protocol_success.split("|")[1],
										text: null,
										type: 'success',
										confirmButtonColor: '#337ab7',
										confirmButtonText: $translate.instant('OK'),
										closeOnConfirm: true,
									});
									vm.isLoading = false;
									shareDataServices.set(true, 'PAYMENT_PROTOCOL_PAGE');
									redirect(originPage);
								} else {
                                	var errorProtocol = "";
									if(protocol_success) {
										errorProtocol = protocol_success;
									} else {
										errorProtocol = protocol_error.message
									}
                                	vm.isLoading = false;
                                	SweetAlert.swal({
										title: $translate.instant('PROTOCOL_FILE_ERROR_LABEL') + $translate.instant(errorProtocol) + $translate.instant('PROTOCOL_FILE_ERROR'),
										text: null,
										type: 'error',
										confirmButtonColor: '#337ab7',
										confirmButtonText: $translate.instant('OK'),
										closeOnConfirm: true,
									});                                	
                                	redirect(originPage);
                                	
                                }
                            });
                            
                        } else {
                        	// qualcosa è andato storto nella firma, torniamo alla pagina di sottomissione
                        	redirect(originPage);
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