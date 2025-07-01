/**
 * @ngdoc function
 * @name sphaSubmitPaymentCtrl
 * @description controller for search rectification
 * # sphaSubmitPaymentCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
	angular.module('sphaApp')
	.controller('sphaSubmitPaymentCtrl', sphaSubmitPaymentCtrl);
        
    sphaSubmitPaymentCtrl.$inject = ['PropertiesServiceSpha', '$rootScope', '$stateParams', '$state', '$scope', '$window', 
				'$q', '$translate', 'shareDataServices', 'SweetAlert', 
                '$sce', 'uploadServicesSpha', 'sphaPaymentServices'];

    function sphaSubmitPaymentCtrl (PropertiesServiceSpha, 
                          $rootScope, $stateParams, $state, $scope, $window, $q, $translate,
                          shareDataServices, SweetAlert,
						  $sce, uploadServicesSpha,
						  sphaPaymentServices) {
					// DECLARE GLOBAL non $scope VARIABLES/CONSTANTS
					var vm = this;
					var originPage = null;
					var paymentDTO = null;

					const procedimentiMsBaseUrl = PropertiesServiceSpha.get('baseUrlProcedure');
					const apiPaymentFileUrl = procedimentiMsBaseUrl + 'api/payment-fee-files';
					
					
					// DECLARE this VARIABLES
					
					vm.message = "";
					vm.result = $stateParams.result;
					vm.isLoading = false;
					vm.submitForm = null;
					vm.files = [];
					vm.paymentFiles = [];
					vm.fileToDelete = [];
					vm.feeNumber = 1;
					vm.regionDescription = null;
					vm.difference = 0.00;
					vm.paidAmount = null;
					vm.paymentDetails = null;
					vm.paymentData = null;
					vm.paymentFeeDTO = null;

					vm.soggetto = null;
					vm.qualificaSoggetto = null;
					vm.companyName = null;
					vm.sedeAzienda = null;
					vm.potereSoggetto = null;
					
					vm.draggedFile = [];
					vm.queryType = $state.params['queryType'];
					vm.procedureType = $state.params['procedureType'];
					vm.procedureId = $state.params['procedureId'];

					$scope.draggedFile = [];
					$scope.change = function(){
						
						if( vm.draggedFile ){
    					  if( vm.draggedFile.length > 0 ){
    						  var theFiles = vm.draggedFile.slice();
    						  for( var i in theFiles ){
    							if( theFiles[i] ){
    								vm.validateAndPushFile( theFiles[i] );
    							}
    						  }
    					  }
    				  	}
					}

					$scope.filters = {
								paymentType: [{value: 'POL', label: 'POL'}, {value: 'BONIFICO', label: 'Bonifico Diretto'},
											{value: 'PAGO_PA', label: 'PagoPA'}]
								
					};
					
					/**
					 * Date Pickers
					 */
					$scope.datesOptions = {
							PAYMENT_DATE: {opened: false,datepickerOptions: {}}
					};

					/**
					 * 
					 * @param dateField dateField
					 */
					$scope.openDatePopup = function (dateField) {
						$scope.datesOptions[dateField].opened = !$scope.datesOptions[dateField].opened;
					};
							
    			    $scope.$watch( 'draggedFile', function( files ){
    				  if( files ){
    					  
    					  if( files.length > 0 ){
    						  var theFiles = files.slice();
    						  for( var i in theFiles ){
    							if( theFiles[i] ){
    								vm.validateAndPushFile( theFiles[i] );
    							}
    						  }
    					  }
    				  	}
    				  
    			     });
        			  
                    // DECLARE $scope FUNCTIONS
                    
                    
                    $scope.validateFilesFn = function( file ){
    					var validFile = true;
    					if( file && file.name ){
    						const MAX_FILES_LENGTH = 200;
    						validFile = file.name.length < MAX_FILES_LENGTH;
    						if( !validFile ){
    							alert( $translate.instant('ERROR_FILENAME_TOO_LONG') );
    						}
    					}
    					return validFile;
    				}
                    
                    /**
        			 * Upload dei file
        			 */
        			 $scope.upload = function( files ){
        				  if( files && files.length > 0 ){
        					  
        						  for( var i in files ){
        							  if( files[i] ){
        								vm.validateAndPushFile( files[i] );
        							  }
        						  }
        					  
        				  }
        			  };
        			  
        			  /**
        			   * Rimuove un file dalla lista per l'upload
        			   */
        			  $scope.removeFile = function( file ){
        				  for( var i in vm.files ){
        					  if( vm.files[i] == file ){
        						  vm.files.splice( i, 1 );
        					  }
        				  }
        				  
        			  };
        			  
        			  $scope.$watch('acceptedFiles', function( acceptedFiles ){
        				  if( acceptedFiles ){
        					  $scope.acceptedFiles = "'*'";
        				  }
        				  return $scope.acceptedFiles;
					  });
					  

					  $scope.changeDifference = function(paidAmount) {
						  vm.difference = vm.difference_;
						  if(paidAmount != null) {
							vm.difference -= paidAmount;
							vm.difference = vm.difference.toFixed(2);
						  } else {
							  vm.difference = vm.difference_;
						  }
						  
					  }

					// se l'elemento del form è invalido -> bordo rosso
					$scope.addClass = function (idField, form) {
						if (!$scope.readOnly && form && form[idField] && form[idField].$invalid) {
							return 'has-errors';
						}
						return '';
					};
                    
                    // DECLARE FUNCTIONS                   
					
					function initPayment(paymentDTO) {
							vm.companyName = paymentDTO.nomeTitolare;

							vm.regionDescription = paymentDTO.regionDescription;
                            paymentDTO.paymentFees.forEach(fee => {
                                fee.paidAmount = stringToFloat(fee.paidAmount);
							});
							vm.difference = stringToFloat(paymentDTO.totalAmount) - sumFee(paymentDTO.paymentFees, true);
							vm.difference = vm.difference.toFixed(2);
							vm.difference_=vm.difference;
							

							if(paymentDTO.paymentFees.length == 0) {
								vm.feeNumber = 1;
								
								var fee = shareDataServices.getLS('PAYMENT_FEE_SUBJECT_PARAMS');

								if (fee) {
									vm.soggetto = fee.soggetto;
									vm.qualificaSoggetto = fee.qualificaSoggetto;
									vm.sedeAzienda = fee.sedeAzienda;
									vm.potereSoggetto = fee.potereSoggetto;
								}
							} else {
								
								var fee;
								for (var index = 0; index < paymentDTO.paymentFees.length; index++) {
									fee = paymentDTO.paymentFees[index];
									switch (fee.status) {
										case 'DRAFT':
										case 'SIGNED':
										case 'SIGNED_DELETED':
										case 'SUBMITTED':
										case 'DELETED_PARENT':
											setPaymentFee(fee);
											getPaymentFiles(fee);
											vm.feeNumber = index + 1;
											return;

										case 'DELETED':
											fee.paidAmount = 0.0;
											vm.paymentFeeDTO = fee;
											vm.feeNumber = index + 1;
											return;
										case 'STAMPED':
											if(index <= paymentDTO.paymentFees.length - 1) {
												vm.feeNumber = index + 2;
								
												var fee = shareDataServices.getLS('PAYMENT_FEE_SUBJECT_PARAMS');

												if (fee) {
													vm.soggetto = fee.soggetto;
													vm.qualificaSoggetto = fee.qualificaSoggetto;
													vm.sedeAzienda = fee.sedeAzienda;
													vm.potereSoggetto = fee.potereSoggetto;
												}
											} 
											break;
										default:
											break;
									}
									
									
								}
								
							}
					}

                    function handleCookiesAndSharedData() {
 
						if(shareDataServices.getLS('OPERATION_PAYMENT_PARAMS')) {
							paymentDTO = shareDataServices.getLS('OPERATION_PAYMENT_PARAMS');
							initPayment(paymentDTO);
						}
						if(shareDataServices.get('ORIGIN_PAGE')) {
        					originPage = shareDataServices.get('ORIGIN_PAGE');
        				}
                       
					}

                    function sumFee(listFee, checksubmitted) {
						if(listFee != null && listFee !== []) {
							var sum = 0.00;
							listFee.forEach(fee => {
                                if(checksubmitted && fee.status === 'STAMPED') {
                                    sum += fee.paidAmount;
                                }  else if(!checksubmitted){
                                    sum += fee.paidAmount;
                                }
							});
							return sum;
						} else {
                            return 0.00;
                        }
					}

                    function stringToFloat(str) {
                        return parseFloat(str.toString().replaceAll('.', '').replaceAll(',', '.'));
                    }
					
                    function getPaymentFiles(fee) {
                    	if(fee) {
                    		var criteria = {
                    				paymentFeeId: {equals: fee.id },
                    				category: {equals: 'DOC_SUBMIT'},
                    				deleted: {equals: false},
                    				type: {equals: 'ATTACHMENTS'}
                    		}
                    
                    		sphaPaymentServices.getPaymentFeeFiles(criteria, function (data, error) {
                        		if(data) {
                        			vm.paymentFiles = data;
                        		} else {
                        			vm.message = error.message;
                                    vm.alertClass = error.alertClass;
                        		}
                        		
                            });
                    	}
                    }
					

					function setPaymentFee(fee) {
						vm.paidAmount = fee.paidAmount;
						if(vm.paidAmount != null) {
							vm.difference -= vm.paidAmount;
							vm.difference = vm.difference.toFixed(2);
						} 
						vm.paymentDate = new Date(fee.paymentDate);
						var paymentType = $scope.filters.paymentType.filter(function(item) { return item.value === fee.paymentType; })[0];
                        vm.paymentType = {value:  paymentType.value, label: paymentType.label };
						vm.paymentDetails = fee.paymentDetails;
						vm.paymentFeeDTO = fee;
						vm.soggetto = fee.soggetto;
						vm.qualificaSoggetto = fee.qualificaSoggetto;
						vm.sedeAzienda = fee.sedeAzienda;
						vm.potereSoggetto = fee.potereSoggetto;
					}
					
					function currencyFormatIT(num) {
			            return (
			            		Number(num)
			                    .toFixed(2) // always two decimal digits
			                    .replace('.', ',') // replace decimal point character with ,
			                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
			            );
					}
					
                    function insertPaymentFee(isSubmitEvent) {
						//controllo importo inserito
						if (vm.difference!=0.0){
							var msg = $translate.instant('ATTENTION_FET_AMOUNT_BODY_P1') + vm.paidAmount;
								msg += $translate.instant('ATTENTION_FET_AMOUNT_BODY_P2') + vm.difference;
								msg += $translate.instant('ATTENTION_FET_AMOUNT_BODY_P3') ;
							
						  SweetAlert.swal({
                                            title: $translate.instant('ATTENTION_FET_AMOUNT_TITLE'),
            								text: msg,
                                            type: 'warning',
                                            showCancelButton: true,
					  						confirmButtonColor: "#337ab7",
					   						confirmButtonText: $translate.instant('YES'),
			   							    cancelButtonText: $translate.instant('NO'),
				   	   						closeOnConfirm: true,
				   	   						closeOnCancel: true, 
					                        },function( isConfirm ){
											   if( isConfirm ){
												   procediSalvataggio(true,isSubmitEvent);
											   }
										   }
										
								);
						}else{
							procediSalvataggio(true,isSubmitEvent);
						}
					}
					
					function procediSalvataggio(procedi,isSubmitEvent){
						if (procedi){
							var paymentFeeDTO = null;
	
							if(vm.paymentFeeDTO && vm.paymentFeeDTO.id) {
								paymentFeeDTO = vm.paymentFeeDTO;
								
								if(vm.paymentFeeDTO.status == 'DELETED'  ) { // pagamento cancellato che vogliamo risottomettere;
									paymentFeeDTO.status = 'DELETED_PARENT';
								} else {
									paymentFeeDTO.status = vm.paymentFeeDTO.status;
								}
								paymentFeeDTO.feeNumber = vm.feeNumber;
								if(paymentFeeDTO.feeAmount) {
									paymentFeeDTO.feeAmount = stringToFloat(paymentFeeDTO.feeAmount);
								}
								
								paymentFeeDTO.soggetto = vm.soggetto;
								paymentFeeDTO.qualificaSoggetto = vm.qualificaSoggetto;
								paymentFeeDTO.sedeAzienda = vm.sedeAzienda;
								paymentFeeDTO.potereSoggetto = vm.potereSoggetto;
								paymentFeeDTO.paidAmount = vm.paidAmount;
								paymentFeeDTO.paymentDate = vm.paymentDate;
								paymentFeeDTO.paymentType = angular.isString(vm.paymentType) ? vm.paymentType : vm.paymentType.value;
								paymentFeeDTO.paymentDetails = vm.paymentDetails;
								
							} else {
								paymentFeeDTO = {
									soggetto: vm.soggetto,
									qualificaSoggetto: vm.qualificaSoggetto,
									sedeAzienda: vm.sedeAzienda,
									potereSoggetto: vm.potereSoggetto,
									feeNumber: vm.feeNumber,
									paidAmount: vm.paidAmount,
									paymentDate: vm.paymentDate,
									paymentType: angular.isString(vm.paymentType) ? vm.paymentType : vm.paymentType.value,
									paymentId: paymentDTO.id,
									paymentDetails: vm.paymentDetails,
									status: 'DRAFT'
								}
							}
							
							
							
	            			sphaPaymentServices.insertPaymentFee(paymentFeeDTO, function (data, error) {
	                    		if (error && error.message) {
	                                vm.message = error.message;
	                                vm.alertClass = error.alertClass;
	                            } else {
									vm.paymentFeeDTO = data;

									cacheSubjectData(paymentFeeDTO);
																	
	                            	// salvataggio e cancellazione di tutti i file
	                            	if(vm.files.length >0 || vm.fileToDelete.length >0) {
	                            		saveFiles(isSubmitEvent);
	                            	} else {
	                            		// sottometti
	                            		if(isSubmitEvent) {
	                            			submitPaymentFee();
										} else {
											sweetAlertSaveSuccess();
										}
										
	                            		
	                            	}
	                            	
	                            	
	                            }
	                        });
						}
                    }
					
					
                    function saveFiles(isSubmitEvent) {
                    	// salvataggio di tutti i nuovi file                        	
                    	
            			if(vm.files.length >0 && vm.fileToDelete.length >0) {
            				addNewFiles(vm.fileToDelete,isSubmitEvent );
            			} else if (vm.files.length >0 && vm.fileToDelete.length == 0) {
            				addNewFiles(null, isSubmitEvent);
            			} else if (vm.fileToDelete.length >0 && vm.files.length == 0) {
            				deletePreviouslyCreatedFiles(isSubmitEvent);
            			}
            			
                    }
                    
                    function deletePreviouslyCreatedFiles(isSubmitEvent) {
                    	vm.fileToDelete.forEach(idFile => {
            				sphaPaymentServices.deletePaymentFeeFile(idFile, function (data, error) {
                        		if (error && error.message) {
                                    vm.message = error.message;
                                    vm.alertClass = 'alert alert-warning';
                                } else if ( isSubmitEvent) {
                                	submitPaymentFee();
                                } else {
                                	sweetAlertSaveSuccess();
                                }
            				});
            			});
                    }
                    
                    function addNewFiles(filesToDelete, isSubmitEvent) {
                    	
                    	var paymentFeeFileDTO = {
            					paymentFeeId: vm.paymentFeeDTO.id,
                    			category: 'DOC_SUBMIT',
                    			type: 'ATTACHMENTS'
                    	};
            			
            			vm.files.forEach(file => {
            				paymentFeeFileDTO.description = file.name;
                			uploadServicesSpha.uploadOneOptionalMultipartFileWithData(file,
                					paymentFeeFileDTO, 'meta', apiPaymentFileUrl, function (data, success, error) {
                				if (error) {
                                    vm.message = error.message ? error.message : error;
                                    vm.alertClass = 'alert alert-warning';
                                } else {
                                	// rimuovo il file dalla lista da salvare e lo inserisco nella lista dei file visualizzati
                                	vm.files.splice(vm.files.indexOf(file),1);
                                	vm.paymentFiles.push(data);
                                	if (filesToDelete) {
                                		deletePreviouslyCreatedFiles(isSubmitEvent);
                                	} else if(isSubmitEvent) {
                                		// sottomettiamo
                                		submitPaymentFee();
                                	} else {
                                		sweetAlertSaveSuccess();
                                	}
                                }  
                            });
            			});
                    }
                    
                    function submitPaymentFee() {
						var paymentFees = paymentDTO.paymentFees;
						paymentFees.push(vm.paymentFeeDTO);
						paymentDTO.paymentFees = paymentFees;
						shareDataServices.setLS(paymentDTO, 'OPERATION_PAYMENT_PARAMS');
                		if(vm.paymentFeeDTO.status === 'DRAFT' || vm.paymentFeeDTO.status === 'DELETED_PARENT') {
                    		submitPaymentFeeDraft();
                    	} else if (vm.paymentFeeDTO.status === 'SIGNED' || vm.paymentFeeDTO.status === 'SIGNED_DELETED') {
                    		submitPaymentFeeSigned();
            				// significa che è già stato firmato ma qualcosa è andato storto sulla protocollazione
            				// manda solamente richiesta di protocollazione
            			}          	
                    }
                    
                    function cacheSubjectData(data) {
						shareDataServices.setLS(data, 'PAYMENT_FEE_SUBJECT_PARAMS');
                    }

            		function submitPaymentFeeDraft() {
						
						var buildPdfRequest = {
							empowered: vm.potereSoggetto,
							subjectName: vm.soggetto,
							subjectQualification: vm.qualificaSoggetto,
							companyHeadquarters: vm.sedeAzienda,
							beneficiary: vm.regionDescription,
							paymentType: angular.isString(vm.paymentType) ? vm.paymentType : vm.paymentType.value,
							paidAmount: currencyFormatIT(vm.paidAmount),
							totalAmount: paymentDTO.totalAmount,
							difference: currencyFormatIT(vm.difference),
							idProcedure: paymentDTO.procedureId,
							paymentDetails: vm.paymentFeeDTO.paymentDetails,
							paymentDate: vm.paymentDate,
							feeNumber: vm.feeNumber,
							paymentFeeId: vm.paymentFeeDTO.id,
							companyCode: paymentDTO.codiceSis,
							companyName: paymentDTO.nomeTitolare,
							procedure: $translate.instant(vm.procedureType + '_LABEL'),
						}
            			sphaPaymentServices.submitPaymentFee(buildPdfRequest, function (idFile,  errorSubmit) {
                			var errors = {};
                			if(!idFile){
                			    errors.message = errorSubmit && errorSubmit.message ? errorSubmit.message : errorSubmit;
                	            errors.alertClass = 'alert alert-danger';
                	        } 
                			else {
                				var signRequest = {
                					    successUrl: "/payment-fee/signConnector?entityType=PAYMENT_FEE",
                					    fileParams: [{
                					        "entityId": vm.paymentFeeDTO.id, // id payment fee
                					        "entityCategory":"PAYMENT_FEE",
                					        "entityType": "PAYMENT_FEE",
                					        "eventId": 0
                					    }]
                					}
                				// data -> id file appena generato
                				sphaPaymentServices.signPaymentFeeGet(signRequest, idFile, function (data,  error) {
                        			
                        			if(!data){
                        			    errors.message = error && error.message ? error.message : error;
                        	            errors.alertClass = 'alert alert-danger';
                        	            
                        	            SweetAlert.swal({
                                            title: $translate.instant('ERROR_FET'),
                                            text: null,
                                            type: 'error',
                                            confirmButtonColor: '#337ab7',
                                            confirmButtonText: $translate.instant('OK'),
                                            closeOnConfirm: true,
                                        
                                        });
                        	        } else {

                        	        	$window.location.href = data;
                        	        }
                        			
                        		});
                			} 
            				
            	        });
            		}
            		
            		function sweetAlertSaveSuccess() {
            			SweetAlert.swal({
                            title: $translate.instant('SUCCESS_SAVE_PAYMENT'),
                            text: null,
                            type: 'success',
                            confirmButtonColor: '#337ab7',
                            confirmButtonText: $translate.instant('OK'),
                            closeOnConfirm: true,
                        
						});
						
						$state.go(originPage, {procedureType: vm.procedureType, queryType: 'VERSARE', procedureId: vm.procedureId}); 
            		}
            		
            		function submitPaymentFeeSigned() {
            			
						var criteria = {
								paymentFeeId: {equals: vm.paymentFeeDTO.id },
								category: {equals: 'DOC_SUBMIT'},
								deleted: {equals: false},
								type: {equals: 'PAYMENT_PDF_SIGNED'}
						}
						
				
						sphaPaymentServices.getPaymentFeeFiles(criteria, function (files, error) {
							if(files) {
								
								var maxId = files.reduce(
											(max, file) => (file.id > max ? file.id : max),
											files[0].id
										);

								var requestProtocolFile = {
									idProcedure: paymentDTO.procedureId,
									idDocument: maxId,
									paymentFeeId: vm.paymentFeeDTO.id,
									companyCode: paymentDTO.codiceSis,
								}
								vm.isLoading = true;
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
											$state.go(originPage, {procedureType: vm.procedureType, queryType: 'VERSARE', procedureId: vm.procedureId}); 
										} else {
											
											var errorProtocol = "";
		  									if(protocol_success) {
		  										errorProtocol = protocol_success;
		  									} else {
		  										errorProtocol = protocol_error.message;
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
											$state.go(originPage, {procedureType: vm.procedureType, queryType: 'VERSARE', procedureId: vm.procedureId}); 
										}
								});
								
							} else {
								vm.message = error.message;
								vm.alertClass = error.alertClass;
							}
							
						});
            		}
            		
            		function redirect(url) {
    					if (url !== "") {
                            $state.go(url, {procedureType: vm.procedureType, queryType: 'VERSARE', procedureId: vm.procedureId});
                        } else {
                            vm.message = "SIGN_FAIL";
                            vm.alertClass = "alert alert-danger";
                        }
    				}
                    // DECLARE this FUNCTIONS
                    
                    vm.goToTop = function () {
                        document.documentElement.scrollTop = 0;
                    }


                    vm.goBack = function () {
                        if ($rootScope.goBack) {
                            $state.go($rootScope.goBack, {procedureType: vm.procedureType, queryType: 'VERSARE', procedureId: vm.procedureId});
                        } else {
                            $window.history.back();
                        }
                    };

                    vm.reset = function() {
                    	vm.difference = vm.difference_;
                    	
						vm.paidAmount = null;
						vm.paymentDetails = null;
						vm.paymentDate = null;

						vm.soggetto = null;
						vm.qualificaSoggetto = null;
						vm.companyName = null;
						vm.sedeAzienda = null;
						vm.potereSoggetto = null;
                    }
                    
                    
                    
                    
                    vm.save = function() {
						// aggiorno il pagamento con eventuali allegati
                    	insertPaymentFee(false);
                    	
                    };

					vm.getWidth = function(field) {
						var size = field && field.length || 0
						return {width: (!size || size < 20 ? 20 : size) + 5 + 'ch'};
					};
                    
                    vm.submit = function() {
                    	// sottometto il pagamento con eventuali allegati
                    	insertPaymentFee(true);
                    };
                    
                    vm.remove = function(file) {
                	  vm.fileToDelete.push(file.id);
            		  var index = vm.paymentFiles.indexOf(file);
            		  vm.paymentFiles.splice(index, 1); 
                    };
                    
	      			vm.validateAndPushFile = function( file ){
	    				  var validFile = true;
	    				  if ($scope.validateFn) {
	    					  validFile = $scope.validateFn()( file );
	    				  }
	    				  if( validFile ){
	    					vm.files.push ( file );	  
	    				  }
	    				  return validFile;
	    			 };
                    
                    // DECLARE FUNCTIONS FOR INIT CONTROLLER
                    
                    function init() {
                        //Recupero i filtri salvati nei cookies dalla pagina delle istanze o dalla stessa pagina
                        handleCookiesAndSharedData();
                    }

                    // EXECUTIONS
                    init();
                    }
})();

