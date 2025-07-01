/**
 * @ngdoc function
 * @name sphaCloseRectificationCtrl
 * @description controller for close rectification
 * # sphaCloseRectificationCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaCloseRectificationCtrl',
            ['PropertiesServiceSpha', 
                '$rootScope', '$stateParams', '$state', '$scope', '$window', '$cookies', '$q', '$translate', 'httpServices',
                 '$uibModal', 'shareDataServices', '$filter', 'SweetAlert', 'sphaRectificationServices', 'sphaUtilsServices',
                 'uploadServicesSpha', '$sce',
                function (PropertiesServiceSpha, 
                          $rootScope, $stateParams, $state, $scope, $window, $cookies, $q, $translate, httpServices,
                          $uibModal, shareDataServices, $filter, SweetAlert, sphaRectificationServices, sphaUtilsServices,
                          uploadServicesSpha, $sce) {

                    // DECLARE GLOBAL non $scope VARIABLES/CONSTANTS
                    var vm = this;

                    const procedimentiMsBaseUrl = PropertiesServiceSpha.get('baseUrlProcedure');
                    const apiRectificationUrl = procedimentiMsBaseUrl + 'api/rectifications';
                    const closeRectificationUrl =  apiRectificationUrl + '/close';
                    // DECLARE this VARIABLES

                    // RECTIFICATION_variables
                    var rectificationDTO = null; // from cookies
                    vm.note = null;
                    vm.description = null;
                    vm.showRequiredFields = false;
                    vm.file = null;
                    vm.closeForm = null;
                    vm.mode = null;
                    vm.message = "";
                    vm.isSaveAvailable = false;
                    vm.isLoading = false;
                    

                    // Init Filters' domains
                    $scope.filters = {
                        mode: [{value: 0, label: 'APPROVED'}, {value: 1, label: 'NOT_APPROVED'}, {value: 2, label: 'PARTIALLY_APPROVED'}],
                    };

                    $scope.idProtocol = null;
                    
                    $scope.protocolNumber = null;
                    
                    $scope.viewMode = false;

                    $scope.downloadUrl = "";
                    
    				$scope.fileChanged = function() {
	
	  					  // get <input> element and the selected file 
	  					  var fileInput = document.getElementById('file_content');    
	  					  vm.file = fileInput.files[0];

	  					  if(vm.file != null) {
	  						vm.isSaveAvailable = true;
	  					  }
	  					 
	  					  vm.fileName = vm.file.name;
	  					  vm.dataImportId = null;
	  					  vm.importSuccess = false;
	  					  document.getElementById('NOTE').focus();
	  				};

                    // DECLARE FUNCTIONS
  				
  				
	                function getFiles() {
	                	
	                	var criteria = {
	                			rectificationId: {equals: rectificationDTO.id},
								category: {equals: 'DOC_CLOSE'},
								type: {equals: 'RECTIFICATION_PDF_CLOSED'},
								deleted: {equals: false}
                		}
	                	
	                
							
							sphaRectificationServices.getRectificationFiles(criteria, function (data, error) {
	                    		if (error && error.message) {
	                                vm.message = error.message;
	                                vm.alertClass = error.alertClass
	                                
	                            } else {
	                            	if(data && data[0] && data[0].protocolNumber) {
	                            		$scope.idProtocol = data[0].protocolNumber;
	                            		$scope.protocolNumber = data[0].signature;
	                            	}
	                            	
	                            }
			            });
	                }
                    function handleCookiesAndSharedData() {
                    	 // rectification cookies
                        rectificationDTO = shareDataServices.get('OPERATION_RECTIFICATION_PARAMS').rectification;
                        $scope.viewMode = shareDataServices.get('OPERATION_RECTIFICATION_PARAMS').viewMode;
                        if($scope.viewMode) {
                        	vm.note = shareDataServices.get('OPERATION_RECTIFICATION_PARAMS').aifaNote;
                        	var value = $scope.filters.mode.filter(function(item) { return item.label === rectificationDTO.status; });
                        	vm.mode = {value:  value, label: rectificationDTO.status};
                        }
                        vm.description = rectificationDTO.description;
                       
                    }

                    function handleResponse(data, success, error) {
                    	if (error) {
                    		
							SweetAlert.swal({
								title: $translate.instant('PROTOCOL_FILE_ERROR_LABEL') + error.message + $translate.instant('PROTOCOL_FILE_ERROR'),
								text: null,
								type: 'error',
								confirmButtonColor: '#337ab7',
								confirmButtonText: $translate.instant('OK'),
								closeOnConfirm: true,
							});
							vm.isLoading = false;
							$state.go('spha.searchRectification');
							
                        } else {
                        	
                        	if(data.signature){
                        		SweetAlert.swal({
                          		  title: $translate.instant('PROTOCOL_FILE_CLOSE_SUCCESS_RECTIFICATION') + data.signature,
                                    text: null,
                                    type: 'success',
                                    confirmButtonColor: '#337ab7',
                                    confirmButtonText: $translate.instant('OK'),
                                    closeOnConfirm: true,
                                });
                        	}
                        	$state.go('spha.searchRectification');
                        }
                        vm.isLoading = false;
                    }

                    // DECLARE this FUNCTIONS
                    
                    vm.goToTop = function () {
                        document.documentElement.scrollTop = 0;
                    }

                    vm.setViewNote = function (mode) {
                    	if(mode == 'NOT_APPROVED' || mode == 'PARTIALLY_APPROVED'){
                    		vm.showRequiredFields = true;
                    		vm.isSaveAvailable = false;
                    	} else {
                    		vm.showRequiredFields = false;
                    		vm.isSaveAvailable = true;
                    	}
                    }
                    
                    
                    vm.showProtocolledFile = function(idProtocol) {
                    	sphaRectificationServices.getProtocolledFile(idProtocol, function (data, error) {
                    		if(data) {
                    			$scope.type = 'application/pdf';
                        	    var blob = new Blob([data], { type: $scope.type });
                        	    var fileURL = URL.createObjectURL(blob);
                        	    $scope.pdfContent = $sce.trustAsResourceUrl(fileURL);
                        	    var newWin = window.open(fileURL);
                        	    
                        	    if(!newWin || newWin.closed || typeof newWin.closed === 'undefined') 
                                {
                                    //POPUP BLOCKED
                                    alert('Impossibile aprire il pop up per visualizzare il documento');
                                }
                    		} else {
                    			vm.message = error.message;
                                vm.alertClass = error.alertClass;
                    		}
                    		
                        });
                    }
                    /**
                     * Reset close
                     */
                    vm.reset = function (form) {
                    	if(form.$dirty) {
                    		// vuoi davvero lasciare la pagina?
                    		SweetAlert.swal({
     						   title: $translate.instant("DIRTY_CLOSE") + "?",
     						   text: null,
     						   type: "warning",
     						   showCancelButton: true,
     						   confirmButtonColor: "#337ab7",
     						   confirmButtonText: $translate.instant('YES'),
     				   		   cancelButtonText: $translate.instant('NO'),
     					   	   closeOnConfirm: true,
     					   	   closeOnCancel: true, 
     						   },function( isConfirm ){
     							   if( isConfirm ){
     								  vm.goBack(); 
     							   }
     						   }
     					);
                    	} else {
                    		vm.goBack();
                    	}
                    };
                    
                    /**
                     * save rectification close
                     */
                    vm.closeRectification = function (form) {
   						
                    	vm.closeForm = form;

                    	var rectificationEventDTO = {
                    		status: vm.closeForm['MODE'].$modelValue.label,
                    		rectificationId: rectificationDTO.id
                    	}
  
                    	var rectificationFileDTO = null;
                    	if(vm.file != null) {
                    		rectificationFileDTO = {
                    			rectificationId: rectificationDTO.id,
                    			category: 'DOC_CLOSE'
                    		}
                    	}
                    	
                    	var metadata = {
                    			eventDTO: rectificationEventDTO,
                    			rectificationFileDTO: rectificationFileDTO
                    	};
                    	
                    	if(vm.closeForm['MODE'].$modelValue.label != 'APPROVED' && vm.file != null ) {
                    		rectificationEventDTO['aifaNote'] = vm.closeForm['NOTE'].$viewValue;
                    	} 

                    	vm.isLoading = true;
                    	uploadServicesSpha.uploadOneOptionalMultipartFileWithData(vm.file, metadata, 'metadata', closeRectificationUrl, function (data, success, error) {
                    		handleResponse(data, success, error);
                        });
                    };
                    
                    /**
  				      * Modal upload file
  				      */
                    vm.uploadAttachment = function() {
                    	document.getElementById('file_content').click();
   					};
   					
   					
                    vm.goBack = function () {
                        if ($rootScope.goBack) {
                            $state.go($rootScope.goBack);
                        } else {
                            $window.history.back();
                        }
                    };

                    // DECLARE SCOPE FUNCTIONS

                    /**
                     * se l'elemento del form è invalido -> bordo rosso
                     * @param idField idField
                     * @param form form
                     * @returns {string}
                     */
                    $scope.addClass = function (idField, form) {
                        if (!$scope.readOnly && form && form[idField] && form[idField].$invalid) {
                            return 'has-errors';
                        }
                        return '';
                    }
                    
                    $scope.showProtcolNumber = function() {
                    	
                   	 SweetAlert.swal({
                  		  	title: $translate.instant('SHOW_PROTOCOL_NUMBER') + $scope.protocolNumber,
                            text: null,
                            type: 'success',
                            confirmButtonColor: '#337ab7',
                            confirmButtonText: $translate.instant('OK'),
                            closeOnConfirm: true,
                        });
                   }
                    
                    // DECLARE FUNCTION FOR INIT CONTROLLER
                    function init() {
                        //Recupero i filtri salvati nei cookies dalla pagina delle istanze o dalla stessa pagina
                        handleCookiesAndSharedData();
                        // get all files
                        if($scope.viewMode) {
                        	 getFiles();
                        }
                    }

                    // EXECUTIONS
                    init();
                }
    ]);
})();
