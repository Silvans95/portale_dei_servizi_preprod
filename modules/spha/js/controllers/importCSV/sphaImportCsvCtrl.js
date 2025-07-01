/**
 * @ngdoc function
 * @name sphaImportCsvCtrl
 * @description controller for import csv
 */
(function() {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaImportCsvCtrl', ['PropertiesServiceSpha', 'uploadServicesSpha', '$rootScope', '$stateParams', 
            '$state', '$scope', '$window',
            '$compile', '$document', '$q', '$translate', 'httpServices', 'shareDataServices', 'SweetAlert',
            function(PropertiesServiceSpha, uploadServicesSpha, $rootScope, $stateParams, $state, $scope, $window,
                     $compile, $document, $q, $translate, httpServices, shareDataServices, SweetAlert) {
                var vm = this;

                //URLS
                var apiProcedureUrl = PropertiesServiceSpha.get('baseUrlProcedure');
                var apiAnagraphicUrl = PropertiesServiceSpha.get('baseUrlAnagraphic');
                var validateUrl = apiAnagraphicUrl  + 'api/data-imports/import-csv/validate';
                var saveUrl = apiAnagraphicUrl  + 'api/data-imports/import-csv/import';
                
                $rootScope.goBack = null;

                vm.message = '';
                vm.result = $stateParams.result;
                vm.isLoading = false;
                vm.data = null;
                vm.fileName = null;
                vm.logImport = null;
                vm.csvFile = null;
                vm.importSuccess = false;
                vm.dataImportId = null;
                vm.disableSave = null;
                
                function resetInternal() {
                    vm.tableType = null;
                    vm.fileName = null;
                    vm.logImport = null;
                    vm.importSuccess=false;
                    $scope.csvFile = null;
                    vm.csvFile = null;
                    vm.dataImportId = null;
                    document.getElementById('file_content').value = "";
                }
                

				// Init dbType
				$scope.dbType =  [
                    {value: 'FLUSSO_FARMACI', label: 'FARMACI'},
                    //{value: 'INDICAZIONI_TERAPEUTICHE', label: 'INDICAZIONI TERAPEUTICHE'}
                ];
				
                /**
                 * Go to New Procedimento
                 */
                vm.new = function() {
                    shareDataServices.set(vm.typeProcedimenti, 'Type-Procedimenti');
                    $state.go('spha.newProcedimenti');
                };
                
				vm.reset = function(){
					/* Se l’import era ok segnala che così facendo l’import non verrà salvato su DB. */
					if(vm.importSuccess) {
	                    SweetAlert.swal({
	                        title: $translate.instant('CONFIRM_RESET'),
	                        text: null,
	                        type: 'warning',
	                        showCancelButton: true,
	                        confirmButtonColor: '#337ab7',
	                        confirmButtonText: $translate.instant('YES'),
	                        cancelButtonText: $translate.instant('NO'),
	                        closeOnConfirm: true,
	                        closeOnCancel: true,
	                    }, function(isConfirm) {
	                        if (isConfirm) {
                                resetInternal();
	                        }
	                    });
					} else {
						resetInternal();
					}
				};
					
				vm.upload = function() {
					document.getElementById('file_content').click();
				};
				
				$scope.fileChanged = function() {

					  // define reader
					  var reader = new FileReader();

					  // A handler for the load event (just defining it, not executing it right now)
					  reader.onloadend = function(e) {
					      $scope.$apply(function() {
					          $scope.csvFile = reader.result;
					      });
					  };

					  // get <input> element and the selected file 
					  var csvFileInput = document.getElementById('file_content');    
					  vm.csvFile = csvFileInput.files[0];
                      vm.fileName = null;
                      if(vm.csvFile) {
                          vm.fileName = vm.csvFile.name;
                          // use reader to read the selected file
                          // when read operation is successfully finished the load event is triggered
                          // and handled by our reader.onload function
                          reader.readAsText(vm.csvFile);
                      }
					  $scope.$apply();
					  vm.dataImportId = null;
					  vm.importSuccess = false;
				};
				
				vm.validateCsv = function() {
					/* POST del csv da validare */
                    var obj = {
                        tableType: vm.tableType
                    };
                    if (vm.csvFile !== null || vm.csvFile) {
                        vm.isLoading = true;
                        uploadServicesSpha.uploadOneMultipartFileWithData(vm.csvFile, obj, 'metadata', validateUrl, function (data, success, error) {
                            if (success) {
                                vm.logImport = parsLogImport(data);
                                vm.importSuccess = true;
                                vm.dataImportId = data.dataImportId;
                            } else {
                                vm.importSuccess = false;
                                vm.message = error && error.message ? error.message : error;
                                vm.alertClass = error.alertClass;
                            }
                            vm.isLoading = false;
                        });
                    }
				};
				
				vm.save = function() {
					
					if(vm.importSuccess) {
						/* POST del csv da salvare */
						// invio csv, tipo db, nome file 
						var obj = {
								tableType: vm.tableType,
                                dataImportId: vm.dataImportId,
                                isAsync: true
						};
                        vm.isLoading = true;
						uploadServicesSpha.uploadOneMultipartFileWithData(vm.csvFile, obj, 'metadata', saveUrl, function (data, success, error) {
                            if (success) {
                                vm.logImport = parsLogImport(data);
                                vm.importSuccess = false;
                                SweetAlert.swal({
                                    title: $translate.instant('IMPORT_STARTED_ASYNC'),
                                    text: null,
                                    type: 'success',
                                    confirmButtonColor: '#337ab7',
                                    confirmButtonText: $translate.instant('OK'),
                                    closeOnConfirm: true,
                                });  
                            } else {
                                vm.importSuccess = false;
                                vm.message = error && error.message ? error.message : error;
                                vm.alertClass = error.alertClass;
                            }
                            vm.isLoading = false;
                            vm.reset();
                        });
						
					}

				};
				
				function parsLogImport(data) {
				    return data && data.status + '\n' + data.dataYear + '\n' + data.logDescription + '\n' + parseErrors(data.errors);
                }
                
                function parseErrors(errors) {
				    let errorsString = '';
				    for(let i in errors) {
                        if(errors.hasOwnProperty(i)) {
                            errorsString = errorsString + errors[i] + '\n';
                        }
                    }
				    return errorsString;
                }
				
				vm.exit = function() {
					if(vm.importSuccess) {
	                    SweetAlert.swal({
	                        title: $translate.instant('CONFIRM_EXIT') + '?',
	                        text: null,
	                        type: 'warning',
	                        showCancelButton: true,
	                        confirmButtonColor: '#337ab7',
	                        confirmButtonText: $translate.instant('YES'),
	                        cancelButtonText: $translate.instant('NO'),
	                        closeOnConfirm: true,
	                        closeOnCancel: true,
	                    }, function(isConfirm) {
	                        if (isConfirm) {
	                        	vm.save();
	                        	$window.history.back();
	                        }
	                    });
					} else {
						$window.history.back();
					}
				};

                $scope.addClass = function (idField, form) {
                    if (!$scope.readOnly && form && form[idField] && form[idField].$invalid) {
                        return 'has-errors';
                    }
                    return '';
                };

                vm.goBack = function( ){
					if( $rootScope.goBack ){
						$state.go( $rootScope.goBack );
					}else{
						$window.history.back();
					}
                };
            }
        ]);
})();