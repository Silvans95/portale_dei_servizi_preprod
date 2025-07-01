/**
 * @ngdoc function
 * @name sphaSubmitAcceptanceCtrl
 * @description controller for acceptance submitting
 * # sphaSubmitAcceptanceCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaSubmitAcceptanceCtrl',
            ['PropertiesServiceSpha', '$rootScope', '$stateParams', '$state', '$scope', '$window', '$cookies', '$q', '$translate', 'httpServices',
                'NgTableParams', '$uibModal', 'shareDataServices', '$filter', 'SweetAlert', 'sphaPaybackServices', 'sphaUtilsServices', 
                '$sce', 'uploadServicesSpha',
                function (PropertiesServiceSpha, 
                          $rootScope, $stateParams, $state, $scope, $window, $cookies, $q, $translate, httpServices,
                          NgTableParams, $uibModal, shareDataServices, $filter, SweetAlert, sphaRectificationServices,  sphaUtilsServices,
                          $sce, uploadServicesSpha) {

					// DECLARE GLOBAL non $scope VARIABLES/CONSTANTS
					var vm = this;
					var pdfRequest = null;
					var originPage = null;
					const procedimentiMsBaseUrl = PropertiesServiceSpha.get('baseUrlProcedure');
					const apiAcceptanceFileUrl = procedimentiMsBaseUrl + 'api/modulo-accettazione-files';
					
					// DECLARE this VARIABLES
					
					vm.message = "";
					vm.result = $stateParams.result;
					vm.isLoading = false;
					vm.filtersForm = null;
					vm.description = null;
					vm.files = [];
					vm.rectificationDTO = null;
					vm.rectificationFiles = [];
					vm.fileToDelete = [];
					$scope.draggedFile = [];
					vm.draggedFile = [];

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
                    
                    // DECLARE FUNCTIONS                   
                    
                    function handleCookiesAndSharedData() {
                   	 // pdfRequest cookies
                    	if(shareDataServices.get('PDF_REQUEST_PARAMS')){
                    		pdfRequest = shareDataServices.get('PDF_REQUEST_PARAMS');  
                    	}
                         
                    	if(shareDataServices.get('OBJECT_REQUEST_PARAMS')){
                    	   vm.description = shareDataServices.get('OBJECT_REQUEST_PARAMS');
                    	}
                    	
                    	if(shareDataServices.get('ORIGIN_PAGE')) {
        					originPage = shareDataServices.get('ORIGIN_PAGE');
        				}
                       
                   }

                    
                    function createPreviewFile() {
                    	//chiama endpoint che restituisce il file di rettifiche
                    	if(pdfRequest) {
                    		sphaRectificationServices.getAcceptancePdfPreview(pdfRequest, function (data, error) {
                    		    if(error && error.message) {
                    		        vm.message = error.message;
                                    vm.alertClass = error.alertClass;
                                    $scope.$apply();
                                }
                        		if(data.data) {
                        			$scope.type = 'application/pdf';
                            	    var blob = new Blob([data.data], { type: $scope.type });
                            	    var fileURL = URL.createObjectURL(blob);
                            	    $scope.pdfContent = $sce.trustAsResourceUrl(fileURL);
                        		}
                            });
                    	}
                    }
                    
                    function getRectification() {
                        var deferred = $q.defer();
                    	if(pdfRequest) {
                    		sphaRectificationServices.getAcceptanceById(pdfRequest.id, function (data, error) {
                        		if(data) {
                        			vm.rectificationDTO = data;
                        			if(vm.description !== vm.rectificationDTO.description) {
                        			    if(vm.rectificationDTO.description !== 'DEFAULT_DESCRIPTION') {
                                            vm.description = vm.rectificationDTO.description;
                                        } else {
                        			        vm.description = null;
                                        }
                                    }
                        			
                        			deferred.resolve();
                        		} else {
                        			vm.message = error.message;
                                    vm.alertClass = error.alertClass;
                        		}
                            });
                    	}
                    	return deferred.promise;
                    }
                    
                    function getRectificationFile() {
                    	if(pdfRequest) {
                    		var criteria = {
									moduloAccettazioneId: {equals: pdfRequest.id },
                    				// category: {equals: 'DOC_SUBMIT'},
                    				deleted: {equals: false},
                    				type: {equals: 'ATTACHMENTS'}
                    		}
                    
                    		sphaRectificationServices.getAcceptanceFiles(criteria, function (data, error) {
                        		if(data) {
                        			vm.rectificationFiles = data;
                        		} else {
                        			vm.message = error.message;
                                    vm.alertClass = error.alertClass;
                        		}
                        		
                            });
                    	}
                    }
                    
                    function updateRectification(isSubmitEvent) {
                    	vm.rectificationDTO.description = vm.description;
                		
            			sphaRectificationServices.updateAcceptance(vm.rectificationDTO, function (data, error) {
                    		if (error && error.message) {
                                vm.message = error.message;
                                vm.alertClass = error.alertClass
                            } else {
                            	// salvataggio e cancellazione di tutti i file
                            	if(vm.files.length >0 || vm.fileToDelete.length >0) {
                            		saveFiles(isSubmitEvent);
                            	} else {
                            		// sottometti
                            		if(isSubmitEvent) {
                            			submitRectification();
                            		}
                            		
                            	}
                            	
                            	
                            }
                        });
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
            				sphaRectificationServices.deleteAcceptanceFile(idFile, function (data, error) {
                        		if (error && error.message) {
                                    vm.message = error.message;
                                    vm.alertClass = 'alert alert-warning';
                                } else if ( isSubmitEvent) {
                                	submitRectification();
                                } else {
                                	sweetAlertSaveSuccess();
                                }
            				});
            			});
                    }
                    
                    function addNewFiles(filesToDelete, isSubmitEvent) {
                    	
                    	var acceptanceFileDTO = {
								moduloAccettazioneId: vm.rectificationDTO.id,
                    			category: 'DOC_SUBMIT',
                    			sphType: 'ATTACHMENTS'
                    	};
            			
            			vm.files.forEach(file => {
            				acceptanceFileDTO.description = file.name;
                			uploadServicesSpha.uploadOneOptionalMultipartFileWithData(file,
								acceptanceFileDTO, 'meta', apiAcceptanceFileUrl, function (data, success, error) {
                				if (error) {
                                    vm.message = error.message ? error.message : error;
                                    vm.alertClass = 'alert alert-warning';
                                } else {
                                	// rimuovo il file dalla lista da salvare e lo inserisco nella lista dei file visualizzati
                                	vm.files.splice(vm.files.indexOf(file),1);
                                	vm.rectificationFiles.push(data);
                                	if (filesToDelete) {
                                		deletePreviouslyCreatedFiles(isSubmitEvent);
                                	} else if(isSubmitEvent) {
                                		// sottomettiamo
                                		submitRectification();
                                	} else {
                                		sweetAlertSaveSuccess();
                                	}
                                }  
                            });
            			});
                    }
                    
                    function submitRectification() {
                		if(pdfRequest.status === 'DRAFT') {
                    		submitRectificationDraft();
                    	} else if (pdfRequest.status === 'SIGNED') {
                    		submitRectificationSigned();
            				// significa che è già stato firmato ma qualcosa è andato storto sulla protocollazione
            				// manda solamente richiesta di protocollazione
            			}
                		
                    	
                    }

            		function submitRectificationDraft() {
            			
            			sphaRectificationServices.submitAcceptance(pdfRequest, function (idFile,  errorSubmit) {
                			var errors = {};
                			if(!idFile){
                			    errors.message = errorSubmit && errorSubmit.message ? errorSubmit.message : errorSubmit;
                	            errors.alertClass = 'alert alert-danger';
                	        } 
                			else {
                				var signRequest = {
                					    successUrl: "/acceptance/signConnector",
                					    fileParams: [{
                					        "entityId": pdfRequest.id, // id rettifica
                					        "entityCategory":"ACCEPTANCE",
                					        "entityType":"ACCEPTANCE",
                					        "eventId": 0 // evento SPH_RECT_EVENT
                					    }]
                					}
                				// data -> id file appena generato
                				sphaRectificationServices.signAcceptanceGet(signRequest, idFile, function (data,  error) {
                        			
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
                            title: $translate.instant('SUCCESS_SAVE_RECTIFICATION'),
                            text: null,
                            type: 'success',
                            confirmButtonColor: '#337ab7',
                            confirmButtonText: $translate.instant('OK'),
                            closeOnConfirm: true,
                        
                        });
            		}
            		
            		function submitRectificationSigned() {
            			
            			if(pdfRequest) {
                    		var criteria = {
                    				rectificationId: {equals: pdfRequest.idRectification },
                    				category: {equals: 'DOC_SUBMIT'},
                    				deleted: {equals: false},
                    				type: {equals: 'RECTIFICATION_PDF_SIGNED'}
                    		}
                    
                    		sphaRectificationServices.getRectificationFiles(criteria, function (files, error) {
                        		if(files) {
                        			
                        			var maxId = files.reduce(
                        					  (max, file) => (file.id > max ? file.id : max),
                        					  files[0].id
                        					);
                    				var requestProtocolFile = {
	                             		idProcedureInstance: pdfRequest.idProcedureInstance,
	                             		idDocument: maxId,
	                             		idRectification: pdfRequest.idRectification,
	            						anagraphicType: pdfRequest.rectificationType,
		                             }
                    				vm.isLoading = true;
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
		                                  	  redirect(originPage);
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
			                                	$state.go(originPage); 
		                                  }
		                         });
                    				
                        		} else {
                        			vm.message = error.message;
                                    vm.alertClass = error.alertClass;
                        		}
                        		
                            });
                    	}
            		}
            		
            		function redirect(url) {
    					if (url !== "") {
                            $state.go(url);
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
                    	if(shareDataServices.get('RECTIFICATION_PROTOCOL_PAGE')) {
                            shareDataServices.delete('RECTIFICATION_PROTOCOL_PAGE');
                    		$state.go('spha.searchRectification');
                    	} else {
	                        if ($rootScope.goBack) {
	                            $state.go($rootScope.goBack);
	                        } else {
	                            $window.history.back();
	                        }
                    	}
                    };

                    vm.reset = function() {
                    	if(!vm.files || vm.files.length == 0) {
                    		vm.goBack();
                    	} else {
                    		SweetAlert.swal({
                                title: $translate.instant('CONFIRM_EXIT'),
                                text: null,
                                type: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#337ab7',
                                confirmButtonText: $translate.instant('YES'),
                                cancelButtonText: $translate.instant('NO'),
                                closeOnConfirm: true,
                                closeOnCancel: true,
                            }, function (isConfirm) {
                                if (isConfirm) {
                                	vm.files = [];
                                	vm.description = null;
                                	vm.goBack();
                                }
                            }
                        );
                    	}
                    }
                    
                    vm.delete = function() {
                    	if(pdfRequest && pdfRequest.idRectification) {
	                    	sphaRectificationServices.deleteRectification(pdfRequest.idRectification, function (data, error) {
	                    		if (error && error.message) {
	                                vm.message = error.message;
	                                vm.alertClass = error.alertClass;
	                            } else {
	                            	vm.goBack();
	                            }
	                        });
                    	}
                    }
                    
                    
                    vm.save = function() {
                    	
                    	if(vm.description) {
                    		// se è presente la descrizione posso salvare la rettifica
                    		// se i file non sono presenti, salvo solamente la descrizione
                    		// altrimenti salvo pure i file
                    		updateRectification(false);
                    	}
                    };
                    
                    vm.submit = function() {
                    	if(pdfRequest && vm.description) {
                    		updateRectification(true);
                    	}
                    };
                    
                    vm.remove = function(file) {
                	  vm.fileToDelete.push(file.id);
            		  var index = vm.rectificationFiles.indexOf(file);
            		  vm.rectificationFiles.splice(index, 1); 
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
                        
                        //get rectification
                        getRectification().then(function(res) {
                            // create preview file 
                            createPreviewFile();
                            //get rectification file
                            getRectificationFile();
                        });
                    }

                    // EXECUTIONS
                    init();
                }
            ]);
})();
