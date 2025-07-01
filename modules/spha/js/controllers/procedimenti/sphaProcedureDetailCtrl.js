'use strict';
/**
 * @ngdoc function
 * @name sphaProcedureDetailCtrl
 * @description controller for edit a procedure
 * # sphaProcedureDetailCtrl
 * Controller of the sbAdminApp
 */
(function () {
    angular.module('sphaApp')
        .controller('sphaProcedureDetailCtrl', ['$location', '$anchorScroll', '$window', '$rootScope', 'httpServices', 'PropertiesServiceSpha', 'uploadServicesSpha',
            'SweetAlert', '$translate' ,'$scope', '$state', '$stateParams', '$cookies', '$http', 'sphaProcedureServices',
            'sphaProcedureInstanceServices', 'sphaPaymentServices', 'shareDataServices',
            function ($location, $anchorScroll, $window, $rootScope, httpServices, PropertiesServiceSpha, uploadServicesSpha,
            		SweetAlert, $translate, $scope, $state, $stateParams, $cookies, $http, sphaProcedureServices,
            		sphaProcedureInstanceServices, sphaPaymentServices, shareDataServices) {

                var vm = this;
                vm.message = '';
                vm.alertClass = '';

                vm.procedure = null;
                vm.id = $stateParams.id;
                vm.links = [];

                const apiProcedimentiUrl = PropertiesServiceSpha.get('baseUrlProcedure');
                const checkProcedureTypeUrl = apiProcedimentiUrl + 'api/procedures/check';
                const getProcedureInstancessUrl = apiProcedimentiUrl + 'api/procedure-instances/list/';
                const apiAnagraficheUrl = PropertiesServiceSpha.get('baseUrlAnagraphic') ;
                const exportSasUrl = apiAnagraficheUrl + 'api/sas/massive-export';
                const importSasUrl = apiProcedimentiUrl + 'api/import-sas/';

                $rootScope.goBack=null;	

                $scope.canExportSas = false;
                
				vm.goToTop = function() {
					document.documentElement.scrollTop = 0;
				};
				
                vm.goBack = function( ){
					if( $rootScope.goBack ){
						$state.go( $rootScope.goBack );
					}else{
						$window.history.back();
					}
				}; 
				
				if(shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO')) {
					shareDataServices.set(null,'SELECTED_PROCEDURE_INSTANCE_DTO')
				}
				
				function getIdsDataSnapshot(dataSnapshots) {
					var dataImportIds = [];
					if (dataSnapshots && dataSnapshots.length > 0) {
						dataSnapshots.forEach(dataSnapshot => {
							dataImportIds.push(dataSnapshot.dataImportId);
						});
              	  	}
					return dataImportIds;
				}
                vm.exportSas = function() {
                	// chiamata a procedimenti per prelevare le istanze associate e verificare l'utente
                	// chiamata ad anagrafiche per effetuare export sas
                	var request = {
                            start: 0,
                            length: 2147483647,
                            order: [{
                                property: 'createdDate',
                                direction: 'DESC'
                            }],
                            filters: {
                            	procedureType: vm.procedure.type,
                                procedureId: vm.procedure.id
                            }
                        };
                        httpServices.post(getProcedureInstancessUrl + vm.procedure.type, request, function (data, success, error) {

                            if (success && data) {
                              
                              var companiesList = [];
	                          data.items.forEach(procedureInstance => {
	                        	  companiesList.push(procedureInstance.company);
	                          });
	                          
	                          if ( vm.procedure.id != null && vm.procedure.startPeriodDate != null &&
	                        		  vm.procedure.endPeriodDate != null) {
	                        	  
	                        	  
	                        	  var exportSasParams = {
	      	                        	companies: companiesList,
	      	                        	procedureId: vm.procedure.id,
	      	                        	validMarketingFrom: vm.procedure.startPeriodDate,
	      	                        	validMarketingTo: vm.procedure.endPeriodDate,
	      	                        	dataImportIds: getIdsDataSnapshot(vm.procedure.dataSnapshots),
	      	                        	procedureType: vm.procedure.type
	      	                          };
	      	                          
	      	                          exportSasWithParams(exportSasParams);
	                          } else {
	                        	  SweetAlert.swal({
	                                  title: $translate.instant('EXPORT_DATA_ERROR'),
	                                  text: null,
	                                  type: 'error',
	                                  confirmButtonColor: '#337ab7',
	                                  confirmButtonText: $translate.instant('OK'),
	                                  closeOnConfirm: true,
	                              });
	                          }
	                          
	                          
                            } else {
                                vm.message = error;
                                vm.alertClass = 'alert alert-danger';
                            }
                            
                        });
                	
                	
                };

                vm.uploadSasPartial = function () {
                    document.getElementById('import_sas_partial_file_content').click();
                };
                
                vm.uploadSas = function () {
                    document.getElementById('import_sas_file_content').click();
                };
                
                vm.importSas = function(fileInput, isPartial, isAsinc) {
                    var importSasDTO = {
                       procedureId: vm.procedure.id,
                       parentProcedureId: vm.procedure.parentId,
                       partial: isPartial,
                       async: isAsinc
                    };
                    uploadServicesSpha.uploadOneOptionalMultipartFileWithData(fileInput,
                    importSasDTO, 'meta', importSasUrl + vm.procedure.type, function (data, success, error) {
                        if (error) {
                            vm.message = error.message ? error.message : error;
                            vm.alertClass = 'alert alert-warning';
                        } else {
                            vm.message = isAsinc ? 'IMPORT_SAS_STARTED' : 'IMPORT_SAS_IMPORTED';
                            vm.alertClass = 'alert alert-success';
                            SweetAlert.swal({
                                title: $translate.instant(vm.message),
                                text: null,
                                type: 'success',
                                confirmButtonColor: '#337ab7',
                                confirmButtonText: $translate.instant('OK'),
                                closeOnConfirm: true,
                            }, function(val) {
                                setTimeout(() => {
                                    SweetAlert.swal({
                                        title: $translate.instant("IMPORT_SAS_WARN"),
                                        text: null,
                                        type: 'warning',
                                        confirmButtonColor: '#337ab7',
                                        confirmButtonText: $translate.instant('OK'),
                                        closeOnConfirm: true,
                                    });
                                }, 200)
                            });  

                        }
                    });
                };
                
                $scope.importSasPartialFileChanged = function () {
                    // get <input> element and the selected file 
                    var csvFileInput = document.getElementById('import_sas_partial_file_content');
                    vm.importSas(csvFileInput.files[0], true, true);
                };
                
                $scope.importSasFileChanged = function () {
                    // get <input> element and the selected file 
                    var csvFileInput = document.getElementById('import_sas_file_content');
                    vm.importSas(csvFileInput.files[0],false, true);
                };

                
                $scope.getLinkProcedure = function () {
                	if(vm.procedure.phase === 2) {
                		sphaProcedureInstanceServices.getProcedureLinks(vm.procedure.type + '/' + vm.procedure.phase + '/' + true + '/'+vm.procedure.id, function(data,error) {
                    		if (error && error.message) {
                                vm.message = error.message;
                                vm.alertClass = error.alertClass;
                            } else {
                            	vm.links = data;
                            }
                    	});
                	}
                	
                };
				
               
                function exportSasWithParams(request) {
                	httpServices.post(exportSasUrl, request, function (data, success, error) {
                        if (success && data) {
                        	SweetAlert.swal({
                                title: $translate.instant('EXPORT_DATA'),
                                text: null,
                                type: 'success',
                                confirmButtonColor: '#337ab7',
                                confirmButtonText: $translate.instant('OK'),
                                closeOnConfirm: true,
                            });     
                        	vm.goBack();
                        } else {
                        	 vm.message = error;
                             vm.alertClass = 'alert alert-danger';
                            
                        }
                        
                    });
                }
                
				$scope.closedProcedure=false;
				
				function getProcedureStatus (endDate,startDate) {
					var today = new Date().setHours( 0,0,0,0 );
					var endDateFormatted = new Date(endDate).setHours( 0,0,0,0 );
					var startDateFormatted = new Date(startDate).setHours( 0,0,0,0 );
					return endDateFormatted < today && startDateFormatted <= today ? true : false;
				
				}
                /**
                 * Init of input fields with :id procedure Values
                 */
                sphaProcedureServices.readProcedure( vm.id, function( data, errors ){
                    if( errors ){
                        vm.message = errors.message;
                        vm.alertClass = errors.alertClass;
                    }
                    if( data ){
                        vm.procedure = data;
                        $scope.canExportSas = data.canExportSas;
                        vm.procedure.startDate = sphaProcedureServices.serverToClientDate(data.startDate);
                        vm.procedure.endDate = sphaProcedureServices.serverToClientDate(data.endDate);
                        vm.procedure.startPeriodDate = sphaProcedureServices.serverToClientDate(data.startPeriodDate);
                        vm.procedure.endPeriodDate = sphaProcedureServices.serverToClientDate(data.endPeriodDate);
                        vm.procedure.feeExpireDates = null;
                        $scope.closedProcedure = getProcedureStatus(vm.procedure.endDate, vm.procedure.startDate);
                        
                        $scope.getLinkProcedure();

                        getDataImportLog();
                        
                        if(vm.procedure.id && vm.procedure.phase == 2) {
                        	getAllPaymentFeeDateIfExists(vm.procedure.id);
                        }
                    }
                });
                
                function getAllPaymentFeeDateIfExists(procedureId) {
			                	
                	sphaPaymentServices.getPaybackPaymentFeeDates({procedureId: {equals: procedureId}}, function (data, error) {
                		if (error && error.message) {
                            vm.message = error.message;
                            vm.alertClass = error.alertClass;
                        } else {
                        	vm.procedure.feeExpireDates = data;
                        	vm.procedure.feeExpireDates.forEach(feeData => {
                        		feeData.feeExpireDate = sphaProcedureServices.serverToClientDate(feeData.feeExpireDate); 
                        	});
                        	
                        	vm.procedure.feeExpireDates = vm.procedure.feeExpireDates.sort(
                     			   function(a, b) {          
                     			      if (a.feeNumber === b.feeNumber) {
                     			         // id is only important when feeNumber are the same
                     			         return b.id - a.id;
                     			      }
                     			      return a.feeNumber > b.feeNumber ? 1 : -1;
                     			   });
                        	vm.procedure.feeExpireDates = vm.procedure.feeExpireDates.slice(0, vm.procedure.feeNumber);   	
                        	
                        	
                        }
                    });
                }
                
                function getDataImportLog() {
                    const criteria = {
                        "filters": {
                            "entityId": {
                                "equals": vm.procedure.id
                            },
                            "importType": {
                                "in": ["SAS_PB_183", "SAS_PB_5"]
                            }
                        },
                        "length": 2,
                        "order": [
                            {
                                "property": "createdDate",
                                "direction": "DESC"
                            }
                        ]
                    }
			                	
                	sphaPaymentServices.getDataImportLog(criteria, function (data, error) {
                		if (error && error.message) {
                            vm.message = error.message;
                            vm.alertClass = error.alertClass;
                        } else {
                        	vm.importLogs = data.filter(data => data.importStatus === 'ERROR');
                        }
                    });
                }
                
              
                

            }]);
})();
