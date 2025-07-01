


/**
 * @ngdoc function
 * @name sphaSubmitProcedureInstanceCtrl
 * @description controller for close procedure instance
 * # sphaSubmitProcedureInstanceCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaSubmitProcedureInstanceCtrl',
            ['PropertiesServiceSpha', '$rootScope', '$stateParams', '$state', '$scope', '$window', '$cookies', '$q', '$translate', 'httpServices',
                'NgTableParams', '$uibModal', 'shareDataServices', '$filter', 'SweetAlert', 'sphaProcedureInstanceServices', 'sphaUtilsServices', 
                '$sce', 'uploadServicesSpha',
                function (PropertiesServiceSpha, 
                          $rootScope, $stateParams, $state, $scope, $window, $cookies, $q, $translate, httpServices,
                          NgTableParams, $uibModal, shareDataServices, $filter, SweetAlert, sphaProcedureInstanceServices,  sphaUtilsServices,
                          $sce, uploadServicesSpha) {

					// DECLARE GLOBAL non $scope VARIABLES/CONSTANTS
					var vm = this;
					var pdfRequest = null;
					const procedimentiMsBaseUrl = PropertiesServiceSpha.get('baseUrlProcedure');
					const apiProcedureInstanceFileUrl = procedimentiMsBaseUrl + 'api/procedure-instance-files';
					
					// DECLARE this VARIABLES
					
					vm.message = "";
					vm.result = $stateParams.result;
					vm.isLoading = false;
					vm.filtersForm = null;
					vm.description = null;
					vm.files = [];
					vm.procedureInstanceDTO = null;
					vm.procedureInstanceFiles = [];
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
                   	
                    	
                    	if (shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO')) {
                    		vm.procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
                    		setOriginProcedureInstacePage();
                    	}
                    	if(shareDataServices.get('instanceCompanyName')) {
                    		vm.companyName = shareDataServices.get('instanceCompanyName');
                    	}
                       
                   }

                    function getIdsDataSnapshot(dataSnapshots) {
    					var dataImportIds = [];
    					if (dataSnapshots && dataSnapshots != null && dataSnapshots != []) {
    						dataSnapshots.forEach(dataSnapshot => {
    							dataImportIds.push(dataSnapshot.dataImportId);
    						})
                  	  	}
    					return dataImportIds;
    				}
                    
                    
                    function createPreviewFile() {
                    	//chiama endpoint che restituisce il file di submit del procedimento
                    	pdfRequest =  {
                        	    companyName: vm.companyName,
                        	    companyCode: vm.procedureInstanceDTO.company,
                        	    procedure: $translate.instant(vm.procedureInstanceDTO.procedure.type + '_LABEL'),
                        	    procedureType: vm.procedureInstanceDTO.procedure.type,
                        	    idProcedureInstance: vm.procedureInstanceDTO.id,
                        	    procedureInstanceStatus: vm.procedureInstanceDTO.status,
                        	    validMarketingFrom: vm.procedureInstanceDTO.procedure.startPeriodDate,
  	                        	validMarketingTo: vm.procedureInstanceDTO.procedure.endPeriodDate,
  	                        	dataImportIds: getIdsDataSnapshot(vm.procedureInstanceDTO.procedure.dataSnapshots)
                        };
                    	
                    	shareDataServices.set(pdfRequest, 'PDF_REQUEST_PARAMS');
                    	
                		sphaProcedureInstanceServices.getProcedureInstancePdfPreview(pdfRequest, function (data, error) {
                		    if(error && error.message) {
                		        vm.message = error.message;
                                vm.alertClass = error.alertClass;
                                
                            }
                    		if(data.data) {
                    			$scope.type = 'application/pdf';
                        	    var blob = new Blob([data.data], { type: $scope.type });
                        	    var fileURL = URL.createObjectURL(blob);
                        	    $scope.pdfContent = $sce.trustAsResourceUrl(fileURL);
                    		}
                        });
                	}
                    
                    function getProcedureInstanceFile() {
                    	if(pdfRequest) {
                    		var criteria = {
                    				procedureInstanceId: {equals: pdfRequest.idProcedureInstance },
                    				category: {equals: 'DOC_CLOSE'},
                    				deleted: {equals: false},
                    				type: {equals: 'ATTACHMENTS'}
                    		}
                    
                    		sphaProcedureInstanceServices.getProcedureInstanceFiles(criteria, function (data, error) {
                        		if(data) {
                        			vm.procedureInstanceFiles = data;
                        		} else {
                        			vm.message = error.message;
                                    vm.alertClass = error.alertClass;
                        		}
                        		
                            });
                    	}
                    }
                    
                    function updateProcedureInstance(isSubmitEvent) {
                    	                		
                    	// salvataggio e cancellazione di tutti i file
                    	if(vm.files.length >0 || vm.fileToDelete.length >0) {
                    		saveFiles(isSubmitEvent);
                    	} else {
                    		// sottometti
                    		if(isSubmitEvent) {
                    			submitProcedureInstance();
                    		}
                    		
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
            				sphaProcedureInstanceServices.deleteProcedureInstanceFile(idFile, function (data, error) {
                        		if (error && error.message) {
                                    vm.message = error.message;
                                    vm.alertClass = 'alert alert-warning';
                                } else if ( isSubmitEvent) {
                                	submitProcedureInstance();
                                } else {
                                	sweetAlertSaveSuccess();
                                }
            				});
            			});
                    }
                    
                    function addNewFiles(filesToDelete, isSubmitEvent) {
                    	
                    	var procedureInstanceFileDTO = {
            					procedureInstanceId: vm.procedureInstanceDTO.id,
                    			category: 'DOC_CLOSE',
                    			type: 'ATTACHMENTS'
                    	};
            			
            			vm.files.forEach(file => {
            				procedureInstanceFileDTO.description = file.name;
                			uploadServicesSpha.uploadOneOptionalMultipartFileWithData(file,
                					procedureInstanceFileDTO, 'meta', apiProcedureInstanceFileUrl, function (data, success, error) {
                				if (error) {
                                    vm.message = error.message ? error.message : error;
                                    vm.alertClass = 'alert alert-warning';
                                } else {
                                	// rimuovo il file dalla lista da salvare e lo inserisco nella lista dei file visualizzati
                                	vm.files.splice(vm.files.indexOf(file),1);
                                	vm.procedureInstanceFiles.push(data);
                                	if (filesToDelete) {
                                		deletePreviouslyCreatedFiles(isSubmitEvent);
                                	} else if(isSubmitEvent) {
                                		// sottomettiamo
                                		submitProcedureInstance();
                                	} else {
                                		sweetAlertSaveSuccess();
                                	}
                                }  
                            });
            			});
                    }
                    
                    function submitProcedureInstance() {
                		if(pdfRequest.procedureInstanceStatus === 'NEW' || 
                				pdfRequest.procedureInstanceStatus ===  'CREATION_ATTACHMENTS' || 
                				pdfRequest.procedureInstanceStatus === 'DELETED') {
                    		submitProcedureInstanceDraft();
                    	} else if (pdfRequest.procedureInstanceStatus === 'SIGNED' || 
                    			pdfRequest.procedureInstanceStatus === 'SIGNED_DELETED') {
                    		submitProcedureInstanceSigned();
            				// significa che è già stato firmato ma qualcosa è andato storto sulla protocollazione
            				// manda solamente richiesta di protocollazione
            			}
                		
                    	
                    }

            		function submitProcedureInstanceDraft() {
            			
            			sphaProcedureInstanceServices.submitProcedureInstance(pdfRequest, function (idFile,  errorSubmit) {
                			var errors = {};
                			if(!idFile){
                				 SweetAlert.swal({
                                     title: $translate.instant('ATTACHMENT_LOADING'),
                                     text: null,
                                     type: 'warning',
                                     confirmButtonColor: '#337ab7',
                                     confirmButtonText: $translate.instant('OK'),
                                     closeOnConfirm: true,
                                 
                                 });
                	        } 
                			else {
                				var signRequest = {
                					    successUrl: "/procedure-instances/signConnector?entityType=PROCEDURE_INSTANCE",
                					    fileParams: [{
                					        "entityId": pdfRequest.idProcedureInstance, // id istanza
                					        "entityCategory":"PROCEDURE_INSTANCE",
                					        "entityType": "PROCEDURE_INSTANCE",
                					        "eventId": 0 // evento SPH_RECT_EVENT
                					    }]
                					}
                				// data -> id file appena generato
                				sphaProcedureInstanceServices.signProcedureGet(signRequest, idFile, function (data,  error) {
                        			
                        			if(!data){
                        			    errors.message = error && error.message ? error.message : error;
                        	            errors.alertClass = 'alert alert-danger';
                        	            
                        	            SweetAlert.swal({
                                            title: $translate.instant('ERROR_FET'),
                                            text: null,
                                            type: 'error',
                                            confirmButtonColor: '#337ab7',
                                            confirmButtonText: $translate.instant('Ok'),
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
                            title: $translate.instant('SUCCESS_SAVE_PROCEDURE'),
                            text: null,
                            type: 'success',
                            confirmButtonColor: '#337ab7',
                            confirmButtonText: $translate.instant('OK'),
                            closeOnConfirm: true,
                        
                        });
            		}
            		
            		function submitProcedureInstanceSigned() {
            			
            			if(pdfRequest) {
                    		var criteria = {
                    				procedureInstanceId: {equals: pdfRequest.idProcedureInstance },
                    				category: {equals: 'DOC_SUBMIT'},
                    				deleted: {equals: false},
                    				type: {equals: 'PROCEDURE_INSTANCE_PDF_SIGNED'}
                    		}
                    
                    		sphaProcedureInstanceServices.getProcedureInstanceFiles(criteria, function (files, error) {
                        		if(files) {
                        			
                        			var maxId = files.reduce(
                        					  (max, file) => (file.id > max ? file.id : max),
                        					  files[0].id
                        					);
                    				var requestProtocolFile = {
	                             		idProcedureInstance: pdfRequest.idProcedureInstance,
	                             		idDocument: maxId, 
	            						anagraphicType: 'PROCEDURE_INSTANCE'
		                             }
                    				vm.isLoading = true;
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
		                                	vm.isLoading = false;
		                                	returnToProcedureInstacePage();
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
		                                	  	returnToProcedureInstacePage();
		                                  }
		                         });
                    				
                        		} else {
                        			vm.message = error.message;
                                    vm.alertClass = error.alertClass;
                        		}
                        		
                            });
                    	}
            		}
            		
            		function returnToProcedureInstacePage() {
            			switch(vm.procedureInstanceDTO.procedure.type) {
            			case 'SHELF':
            				$state.go('spha.shelfProcedureInstanceView'); 
            				break;
            			case 'PB183':
            				$state.go('spha.pb183ProcedureInstanceView'); 
            				break;
            			case 'PB5':
            				$state.go('spha.pb5ProcedureInstanceView'); 
            				break;
            			case 'BUDGET':
            				$state.go('spha.budgetProcedureInstanceView'); 
            				break;
            			default:
            				break;            				
            			}
            			
            		}
            		
            		
            		function setOriginProcedureInstacePage() {
            			switch(vm.procedureInstanceDTO.procedure.type) {
            			case 'SHELF':
            				shareDataServices.set('spha.shelfProcedureInstanceView', 'ORIGIN_PAGE');
            				break;
            			case 'PB183':
            				shareDataServices.set('spha.pb183ProcedureInstanceView', 'ORIGIN_PAGE');
            				break;
            			case 'PB5':
            				shareDataServices.set('spha.pb5ProcedureInstanceView', 'ORIGIN_PAGE');
            				break;
            			case 'BUDGET':
            				shareDataServices.set('spha.budgetProcedureInstanceView', 'ORIGIN_PAGE');
            				break;
            			default:
            				break;            				
            			}
            			
            		}
            		
            		
                    // DECLARE this FUNCTIONS
                    
                    vm.goToTop = function () {
                        document.documentElement.scrollTop = 0;
                    }


                    vm.goBack = function () {
                        if ($rootScope.goBack) {
                            $state.go($rootScope.goBack);
                        } else {
                            $window.history.back();
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
                    
                    
                    vm.save = function() {
                   
                		// se i file non sono presenti, salvo solamente la descrizione
                		// altrimenti salvo pure i file
                		updateProcedureInstance(false);
                    };
                    
                    vm.submit = function() {
                    	if(pdfRequest) {
                    		updateProcedureInstance(true);
                    	}
                    };
                    
                    vm.remove = function(file) {
                	  vm.fileToDelete.push(file.id);
            		  var index = vm.procedureInstanceFiles.indexOf(file);
            		  vm.procedureInstanceFiles.splice(index, 1); 
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

                    	// create preview file 
                        createPreviewFile();
                        //get procedure file
                        getProcedureInstanceFile();
                    }

                    // EXECUTIONS
                    init();
                }
            ]);
})();
