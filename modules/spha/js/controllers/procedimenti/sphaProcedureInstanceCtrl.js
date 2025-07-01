'use strict';
/**
 * @ngdoc function
 * @name sphaMonitorProcedureInstanceCtrl
 * @description controller for handling a monitor procedure instance
 * # sphaMonitorProcedureInstanceCtrl
 * Controller of the sbAdminApp
 */
(function() {
	angular.module('sphaApp')
		.controller('sphaProcedureInstanceCtrl', ['httpServices', '$scope', '$q', '$state', '$sce', 
			'$cookies', 'sphaProcedureInstanceServices', 'sphaCompanyServices', 'shareDataServices', 'sphaPaybackServices', '$rootScope', '$window', 'SweetAlert', '$translate',
			function(httpServices, $scope, $q, $state, $sce,
				$cookies, sphaProcedureInstanceServices, sphaCompanyServices, shareDataServices, sphaPaybackServices, $rootScope, $window, SweetAlert, $translate) {

				var vm = this;
				vm.message = "";
				vm.alertClass = "";
				vm.procedureType = $state.params.type;

				$scope.data = null;
				$scope.selectedIndex = 0;
				$scope.procedureClosed = false;
				$scope.procedureFase1 = false;
				$scope.procedureSubmitted = false;
				vm.companies = [];
				vm.company = null;
				vm.companyName = null;
				$scope.foundedProcedure = false;
				$scope.canCreateInstance = false;
				$scope.showHelp = false;
				$scope.canSubmissionPB5 = true;
				$scope.canEnableSubmission = false;
				$scope.reloadLastIndex = false;
				$scope.lockedMode = false;
				vm.isProtocolling = false;
				// init static links
				vm.links = [];
				$scope.isFromReportProc = true;

				// init date components parameters
				var locale = $cookies.get('lang') ? $cookies.get('lang') : 'it';
				var dateFormats = {
					'it': 'dd/MM/yyyy',
					'en': 'MM/dd/yyyy',
				};
				$scope.dateFormat = dateFormats[locale] ? dateFormats[locale] : dateFormats['it'];

				// Init companies list
				$scope.filters = {
					companies: { elements: [], page: 0 }
				}

                /**
                 * Aggiorno i dati del servizio condiviso
                 * che mi serviranno nelle pagine a cui si accede tramite link cliccabili
                 */

				$scope.initCookie = function() {
					resetFiltersCookies();
				}
				$scope.initCookie();
				$scope.updateInstanceCookieSelected = function() {
					$scope.foundedProcedure = false;
					if ($scope.selectedInstance) {
						$scope.foundedProcedure = true;
						var companiesCookie = shareDataServices.get('instanceCompanies');
						if (companiesCookie != null && companiesCookie.indexOf(vm.company) === -1) {
							var resetConfigs = {};
							vm.links.forEach(value => {
								resetConfigs[value.sref] = {};
								resetConfigs[value.sref]['resetFilters'] = true;
							});
							shareDataServices.set(resetConfigs, 'resetConfigs');
						}

						if ($scope.selectedInstance.procedure.status === 'CLOSED') {
							$scope.procedureClosed = true;
						}
						if (($scope.selectedInstance.procedure.phase === 2 && $scope.selectedInstance.status === 'SUBMITTED') ||
							($scope.selectedInstance.status === 'STAMPED' && $scope.selectedInstance.procedure.phase === 1)) { // non va bene così
							$scope.procedureSubmitted = true;
						}

						if ($scope.selectedInstance.procedure.phase === 1) {
							$scope.procedureFase1 = true;
						}
						shareDataServices.set(moment($scope.selectedInstance.procedure.startPeriodDate).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
							, 'instanceValidMarketingFrom');
						shareDataServices.set(moment($scope.selectedInstance.procedure.endPeriodDate).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z",
							'instanceValidMarketingTo');
						shareDataServices.set([vm.company], 'instanceCompanies');
						shareDataServices.set(vm.company, 'instanceCompany');
						shareDataServices.set(vm.companyName, 'instanceCompanyName');

						shareDataServices.set($scope.selectedInstance, 'SELECTED_PROCEDURE_INSTANCE_DTO');


					}
				};

				$scope.canCreateProcedureInstance = function() {
					if (vm.company) {
						$scope.canCreateInstance = false;
						var getAllowedActionRequestBody = {
							filters: {
								procedureType: vm.procedureType,
								company: vm.company
							}
						};
						sphaProcedureInstanceServices.getAllowedActionsProcedureInstance(getAllowedActionRequestBody, function(data, error) {
							if (error && error.message) {
								vm.message = error.message;
								vm.alertClass = error.alertClass;
							} else {
								if (data && Array.isArray(data) && data.length > 0) {
									data.forEach(meta => {
										if (meta === 'PROCEDURE_INSTANCE_CREATE') {
											$scope.canCreateInstance = true;
										}
										if (meta === 'SHOW_HELP') {
											$scope.showHelp = true;
										}
									});
								}
							}
						});
					}
				};


				$scope.canEnableSubmissionPB5 = function() {

					if (vm.procedureType == 'PB5') {
						$scope.canSubmissionPB5 = false;
						if (vm.links && vm.company) {
							var roleValid = false;
							var phaseValid = false;
							vm.links.forEach(value => {
								if (value.sref == 'spha.acceptanceAifaManagement' || value.sref == 'spha.sphaPaybackAcceptance') {
									if (value.role == 'SPHA_AIFA_PAYBACK5' || (!$scope.procedureClosed && value.role == 'SPHA_AZIENDA')) {
										roleValid = true;
									}
									if (value.phase == 2) {
										phaseValid = true;
									}
								}

							});



							if (roleValid && phaseValid && vm.procedureType == 'PB5') {

								sphaProcedureInstanceServices.getProtocolledAcceptanceFile($scope.selectedInstance.id, function(data, error) {
									if (data.data && data.data.signature) {
										$scope.canSubmissionPB5 = true;
									} else {
										$scope.canSubmissionPB5 = false;
									}
								});


							}

						}
					} else {
						$scope.canSubmissionPB5 = true;
					}
				};




				$scope.canEnableModelSubmission = function() {
					$scope.canEnableSubmission = false;
					if (vm.links && vm.company) {
						var roleValid = false;
						var phaseValid = false;
						vm.links.forEach(value => {
							if (value.sref == 'spha.acceptanceAifaManagement') {
								if (value.role == 'SPHA_AIFA_PAYBACK5') {
									roleValid = true;
								}
								if (value.phase == 2) {
									phaseValid = true;
								}
							}

						});
						if ($scope.procedureClosed && roleValid && phaseValid && vm.procedureType == 'PB5' && !vm.isProtocolling) {
							$scope.canEnableSubmission = true;
						}

					}
				};

				vm.reactivateAcceptanceSubmission = function() {
					if (vm.company) {
						$scope.canCreateInstance = false;
						sphaProcedureInstanceServices.reactivateAcceptanceSubmission($scope.selectedInstance, function(data, errors) {
							if (errors) {
								vm.message = errors.message;
								vm.alertClass = errors.alertClass;
								$scope.canEnableSubmission = false;
							} else {
								$scope.canEnableSubmission = true;
								$scope.reloadLastIndex = true;
								vm.loadProcedureInstances();
							}

						});
					}
				};

				vm.suspendAcceptanceSubmission = function() {
					if (vm.company) {
						$scope.canCreateInstance = false;
						sphaProcedureInstanceServices.suspendAcceptanceSubmission($scope.selectedInstance, function(data, errors) {
							if (errors) {
								vm.message = errors.message;
								vm.alertClass = errors.alertClass;
								$scope.canEnableSubmission = false;
							} else {
								$scope.canEnableSubmission = true;
								$scope.reloadLastIndex = true;
								vm.loadProcedureInstances();

							}

						});
					}
				};
				$scope.getLinkProcedure = function(procedureType) {
					if ($scope.selectedInstance) {

						$scope.lockedMode = false;
						sphaProcedureInstanceServices.getProcedureLinks(procedureType + "/"
							+ $scope.selectedInstance.procedure.phase + "/" + false
							+ "/" + $scope.selectedInstance.procedure.id, function(data, error) {
								if (error && error.message) {
									$scope.lockedMode = true;
									resetFiltersCookies();
									vm.company = null;
									vm.message = error.message;
									vm.alertClass = error.alertClass;

								} else {
									vm.links = data;
									$scope.canEnableModelSubmission();
									$scope.canEnableSubmissionPB5();
								}
							});
					}

				};

				$scope.getCompaniesPossibleValues = function(page, search) {
					if ($scope.timeout) {
						clearTimeout($scope.timeout);
						$scope.timeout = 0;
					}

					$scope.timeout = setTimeout(() => {

						if (!page) {
							$scope.filters.companies.elements = [];
						}
						var obj = { companies: $scope.lockedMode ? $scope.data.companies : undefined };
						$scope.filters.companies.page = page;

						if (!$scope.lockedMode &&  (!$scope.data || !$scope.data.companies)) {
							obj = null;
						}

					sphaCompanyServices.getPossibleValues(page, obj, search,
						function(data, error) {
							if (error && error.message) {
								if (error.message.indexOf("-1") > -1) {
									// 'Status Code -1 Error Server Timeout or NotDefined';
									$scope.filters.companies.elements = [];
									$scope.filters.companies.page = 0;
									obj = null;
									return;
								} else {
									$scope.message = error.message;
									$scope.alertClass = error.alertClass;
								}
							} else {
								mapSearchFilterResponse([data]);
							}
						});

					}, 5000);

				}


				function resetFiltersCookies() {
					updateCookie('SELECTED_PROCEDURE_INSTANCE_DTO', null);
					updateCookie('instanceCompanies', null);
					updateCookie('instanceCompany', null);
					updateCookie('instanceCompanyName', null);
					updateCookie('instanceValidMarketingFrom', null);
					updateCookie('instanceValidMarketingTo', null);
					updateCookie('medicineCompanies', null);
					updateCookie('medicineValidMarketingFrom', null);
					updateCookie('medicineValidMarketingTo', null);
				}
				// Mapping Search Filters Response to Filter Domain
				function mapSearchFilterResponse(data) {
					data.forEach(meta => {
						if (meta.name === 'companies') {
							vm.companies = meta.options;
						}

						if (meta.name && $scope.filters[meta.name]) {
							$scope.filters[meta.name].elements = $scope.filters[meta.name].elements.concat(meta.options);
							if (meta.page) {
								$scope.filters[meta.name].page = meta.page;
							}
							if (meta.total) {
								$scope.filters[meta.name].total = meta.total;
							}
							if (meta.totalPages) {
								$scope.filters[meta.name].totalPages = meta.totalPages;
							}
						}
					});
				}

				function handleResponse(data, error) {
					if (error && error.message) {
						vm.message = error.message;
						vm.alertClass = error.alertClass
					} else {
						vm.loadProcedureInstances();
					}
				}

				var sharedValue = shareDataServices.get('instanceCompany');
				if (sharedValue) {
					vm.company = sharedValue;
					vm.companyName = shareDataServices.get('instanceCompanyName');
					$scope.lockedMode = true;
				} else {
					vm.companies = $cookies.get('medicineCompanies') ? JSON.parse($cookies.get('medicineCompanies')) : null;
				}


				function submitInstanceSubmitted(instanceId) {
					// invio id procotollo per riprovare a fare timbro e update      
					vm.isProtocolling = true;
					sphaProcedureInstanceServices.retryProtocolSignatureAndUpdate(instanceId, function(protocol_success, protocol_error) {

						if (JSON.stringify(protocol_success) != "{}" && protocol_success != null && protocol_success != 'PROTOCOL_NOT_CREATED') {
							// documento firmato
							SweetAlert.swal({
								title: $translate.instant('PROTOCOL_FILE_SUCCESS_RECTIFICATION') + protocol_success.split("|")[1],
								text: null,
								type: 'success',
								confirmButtonColor: '#337ab7',
								confirmButtonText: $translate.instant('OK'),
								closeOnConfirm: true,
							});
							vm.isProtocolling = false;

						} else {
							var errorProtocol = "";
							if (protocol_success) {
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
							vm.isProtocolling = false;

						}
					});

					vm.loadProcedureInstances();

				}


				$scope.getLinkProcedure(vm.procedureType);

				// Get Search Filters first page
                /**
                 * on selected company change callback
                 */
				vm.onCompanyChange = function(companyName) {
					vm.companyName = companyName;
					vm.loadProcedureInstances();
					$scope.canCreateProcedureInstance();

				};

				$scope.help = function() {
					SweetAlert.swal({
						title: "Informazione",
						text: 'Nel menù "Lista Procedimenti" vengono visualizzati solo i procedimenti ai quali hai già acceduto. Per visualizzare i dati di un nuovo procedimento attivato da AIFA, cliccare sul pulsante "Accedi al Procedimento" in basso a destra in questa pagina.',
						type: 'info',
						confirmButtonColor: '#337ab7',
						confirmButtonText: $translate.instant('OK'),
						closeOnConfirm: true,
					});
				}

				//gestione click per cambio sezione
				$scope.changeSelectedEntry = function(index) {
					if (shareDataServices.get('PROCEDURE_DTO') && $scope.isFromReportProc) {
						var procedure = shareDataServices.get('PROCEDURE_DTO');
						index = $scope.data.findIndex(record => record.procedure.id === procedure.id);
						$scope.isFromReportProc = false;
					}

					$scope.selectedIndex = index;
					$scope.procedureClosed = false;
					$scope.procedureFase1 = false;
					$scope.procedureSubmitted = false;
					if (index >= 0) {
						$scope.selectedInstance = $scope.data && $scope.data[index] ? $scope.data[index] : null;
						$scope.updateInstanceCookieSelected();
						$scope.getLinkProcedure(vm.procedureType);
					} else {
						$scope.selectedInstance = null;
						vm.links = [];
					}
					$scope.reloadLastIndex = false;

				};





                /**
                 * Gets Procedure Instances of for selected company, if any
                 */
				vm.loadProcedureInstances = function() {
					if (vm.company) {
						sphaProcedureInstanceServices.findByTypeAndCompany(vm.procedureType, vm.company, function(data, errors) {
							if (errors) {
								vm.message = errors.message;
								vm.alertClass = errors.alertClass;
							}
							if (data && data.items && data.items.length > 0) {
								$scope.data = data.items;
								$scope.data.forEach(instance => {
									$scope.foundedProcedure = true;
									instance.procedure.startDate = sphaProcedureInstanceServices.serverToClientDate(instance.procedure.startDate);
									instance.procedure.endDate = sphaProcedureInstanceServices.serverToClientDate(instance.procedure.endDate);
									instance.procedure.startPeriodDate = sphaProcedureInstanceServices.serverToClientDate(instance.procedure.startPeriodDate);
									instance.procedure.endPeriodDate = sphaProcedureInstanceServices.serverToClientDate(instance.procedure.endPeriodDate);

								});
								if ($scope.reloadLastIndex) {
									$scope.changeSelectedEntry($scope.selectedIndex);
								} else {
									$scope.changeSelectedEntry(0);
								}

							} else {
								$scope.foundedProcedure = false;
								$scope.data = [];
								$scope.changeSelectedEntry(-1);
							}
						});
					} else {
						$scope.data = [];
						if ($scope.reloadLastIndex) {
							$scope.changeSelectedEntry($scope.selectedIndex);
						} else {
							$scope.changeSelectedEntry(0);
						}
					}

				};
				if (vm.companies != null) {
					vm.loadProcedureInstances();
				}
				$scope.statusColor = function(instanceStatus, phase) {
					switch (instanceStatus) {
						case 'NEW':
						case 'CREATION_ATTACHMENTS':
						case 'SIGNED':
						case 'DELETED':
						case 'SIGNED_DELETED':
							return 'yellow';
						case 'STAMPED':
							return 'green';
						case 'SUBMITTED':
							if (phase == 1) {
								return 'yellow';
							} else {
								return 'green';
							}
						default:
							break;
					}
				}
				if ($scope.lockedMode) {
					vm.loadProcedureInstances();
				}


				$scope.submitInstance = function() {

					var instanceStatus = $scope.selectedInstance.status;
					var instanceActions = $scope.selectedInstance.actions;

					switch (instanceStatus) {
						case 'NEW':
						case 'CREATION_ATTACHMENTS':
						case 'SIGNED':
						case 'DELETED':
						case 'SIGNED_DELETED':
							if (instanceActions.indexOf('PROCEDURE_INSTANCE_SUBMIT_PRATICA') !== -1 || instanceActions.indexOf('PROCEDURE_INSTANCE_STAMPED_PRATICA') !== -1) {
								$state.go('spha.submitProcedureInstanceDocs');
							}
							break;
						case 'SUBMITTED':
							submitInstanceSubmitted($scope.selectedInstance.id);
							break;
						case 'STAMPED':
							vm.showProtocolledFile($scope.selectedInstance.id);
							break;
						default:
							console.log('Unknown status: ' + instanceStatus);
							break;
					}
				}

				$scope.clickAcceptance = function(link) {
					var instanceActions = $scope.selectedInstance.actions;
					if (instanceActions.indexOf('PROCEDURE_INSTANCE_SUBMIT_ACCEPTANCE') !== -1) {
						shareDataServices.set(undefined, 'ACCEPTANCE_REQUEST')
						$state.go(link.sref);
					} else if (instanceActions.indexOf('PROCEDURE_INSTANCE_READ_ACCEPTANCE') !== -1) {
						vm.showAcceptanceFile($scope.selectedInstance.id);
					}
				};


				$scope.deleteInstance = function() {

					sphaProcedureInstanceServices.deleteProcedureInstance($scope.selectedInstance.id, function(data, error) {
						handleResponse(data, error);
					});

				}


				$scope.showProtcolNumber = function() {

					SweetAlert.swal({
						title: $translate.instant('SHOW_PROTOCOL_NUMBER') + $scope.selectedInstance.signature,
						text: null,
						type: 'success',
						confirmButtonColor: '#337ab7',
						confirmButtonText: $translate.instant('OK'),
						closeOnConfirm: true,
					});
				}


				$scope.showCanSubmissionPB5 = function(queryType, procedureType, procedureId, procedureInstanceId) {
					if (!$scope.canSubmissionPB5) {
						SweetAlert.swal({
							title: $translate.instant("CONFIRM_SUBMISSION_PB5"),
							text: null,
							type: "warning",
							//showCancelButton: true,
							confirmButtonColor: "#337ab7",
							confirmButtonText: $translate.instant('OK'),
							//cancelButtonText: $translate.instant('NO'),
							closeOnConfirm: true,
							closeOnCancel: true,
						}
							//,function( isConfirm ){
							//				   if( isConfirm ){
							//						 $state.go('spha.paymentManagement', {queryType: queryType , 
							//                                                   procedureType: procedureType, 
							//                                                   procedureId: procedureId,
							//                                                   procedureInstanceId: procedureInstanceId});
							//					   }
							//			   }
						);
					}
				};

				$scope.showAcceptanceProtcolNumber = function() {
					sphaProcedureInstanceServices.getProtocolledAcceptanceFile($scope.selectedInstance.id, function(data, error) {
						SweetAlert.swal({
							title: $translate.instant('SHOW_PROTOCOL_NUMBER') + data.data.signature,
							text: null,
							type: 'success',
							confirmButtonColor: '#337ab7',
							confirmButtonText: $translate.instant('OK'),
							closeOnConfirm: true,
						});
					});
				}

				function formatDate(date) {
					return date ? new Date(moment(date).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z') : null;
				}

				vm.exportAll = function() {
					let linksForReport = [];
					vm.links.forEach(data => {
						if (data.queryType != "EXPORT" && data.queryType != "VERSARE") {
							const objForArray = {
								queryType: data.queryType,
								company: vm.company,
								istanceId: $scope.selectedInstance.procedure.id,
								procedureInstanceId: $scope.selectedInstance.id

							};
							linksForReport.push(objForArray);
						}
					});


					let arrayForAllReport = [];
					let report = linksForReport[0];
					sphaProcedureInstanceServices.getProcedureInstance(report.procedureInstanceId, function(data, error) {
						if (error && error.message) {
							vm.message = error.message;
							vm.alertClass = error.alertClass;
						} else {
							console.log("DATA:", data);
							let filtersDirective = {};
							const objSendDTO = data;
							const procedureDTO = objSendDTO.procedure;
							const companies = [objSendDTO.company];
							filtersDirective.companies = companies;
							report.procedureDTO = procedureDTO;

							linksForReport.forEach(value => {
								if (value.queryType != 'ATTI_VERSAMENTO_AZIENDA') {
									var objForExport = {
										reportType: value.queryType.indexOf(procedureDTO.type) > -1 ? value.queryType : procedureDTO.type + "_" + value.queryType
									};
									switch (objForExport.reportType) {
										case 'SHELF_NSIS_TR_A_H':
											objForExport.criteria = { "filters": { "procedureId": { "equals": procedureDTO.id }, "medicineFilters": { "companies": companies, "validMarketingTo": formatDate(procedureDTO && procedureDTO.endPeriodDate), "validMarketingFrom": formatDate(procedureDTO && procedureDTO.startPeriodDate), "allCompanies": false } }, "unpaged": true }
											break;
										case 'SHELF_NSIS_TR_A_H_EXCLUSIVE':
										case 'SHELF_NSIS_TR_A_H_V03AN':
										case 'SHELF_NSIS_TR_A_H_INN_ONC':
										case 'SHELF_PAYBACK_AMOUNT_DIRECT_PURCHASES':
										case 'SHELF_MARKET_SHARES_EXCLUSIVE':
										case 'SHELF_MARKET_SHARES_MEDICINE_GAS':
										case 'SHELF_MARKET_SHARES_INN_ONC':
										case 'SHELF_TOT_SIS':
										case 'SHELF_SHARE_REGION':
											objForExport.criteria = { "filters": { "procedureId": { "equals": procedureDTO.id }, "codiceSis": { "in": companies } }, "unpaged": true }
											break;
									}
									arrayForAllReport.push(objForExport);
								}
							});

							exportAllFileData(arrayForAllReport);
						}
					});

				}

				/**
				* Funzione per esportare i dati
				*/
				function exportAllFileData(obj) {
					var deferred = $q.defer();

					httpServices.post(sphaPaybackServices.getExportUrlAllFile(), obj, function(data, success, error) {
						if (success) {
							SweetAlert.swal({
								title: $translate.instant('EXPORT_DATA'),
								text: null,
								type: 'success',
								confirmButtonColor: '#337ab7',
								confirmButtonText: $translate.instant('OK'),
								closeOnConfirm: true,
							});
							deferred.resolve({
								data: data
							});
						} else {
							vm.message = error;
							vm.alertClass = 'alert alert-danger';
						}
					});

					return deferred.promise;
				}

				/**
				 * Funzione per esportare i dati
				 */
				function exportData(obj) {
					console.log("Export: ", obj);
					var deferred = $q.defer();

					httpServices.post(sphaPaybackServices.getExportUrlAll(), obj, function(data, success, error) {
						if (success) {
							SweetAlert.swal({
								title: $translate.instant('EXPORT_DATA'),
								text: null,
								type: 'success',
								confirmButtonColor: '#337ab7',
								confirmButtonText: $translate.instant('OK'),
								closeOnConfirm: true,
							});
							deferred.resolve({
								data: data
							});
						} else {
							vm.message = error;
							vm.alertClass = 'alert alert-danger';
						}
					});

					return deferred.promise;
				}

                /** 
               * get Protocolled procedureInstance file 
               * @param idProcedureInstance 
               */
				vm.showAcceptanceFile = function(idProcedureInstance) {
					sphaProcedureInstanceServices.getAcceptanceFilePDF(idProcedureInstance, function(data, error) {
						if (data) {
							$scope.type = 'application/pdf';
							var blob = new Blob([data], { type: $scope.type });
							var fileURL = URL.createObjectURL(blob);
							$scope.pdfContent = $sce.trustAsResourceUrl(fileURL);
							var newWin = window.open(fileURL);

							if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
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
			   * get Protocolled procedureInstance file 
			   * @param idProcedureInstance 
			   */
				vm.showProtocolledFile = function(idProcedureInstance) {
					sphaProcedureInstanceServices.getProtocolledProcedureFile(idProcedureInstance, function(data, error) {
						if (data) {
							$scope.type = 'application/pdf';
							var blob = new Blob([data], { type: $scope.type });
							var fileURL = URL.createObjectURL(blob);
							$scope.pdfContent = $sce.trustAsResourceUrl(fileURL);
							var newWin = window.open(fileURL);

							if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
								//POPUP BLOCKED
								alert('Impossibile aprire il pop up per visualizzare il documento');
							}
						} else {
							vm.message = error.message;
							vm.alertClass = error.alertClass;
						}

					});
				}

				vm.newInstance = function() {
					if (vm.company) {
						$scope.canCreateInstance = false;
						sphaProcedureInstanceServices.createNewProcedureInstance(vm.procedureType, vm.company, function(data, errors) {
							if (errors) {
								vm.message = errors.message;
								vm.alertClass = errors.alertClass;
								$scope.canCreateInstance = true;
							} else if (data) {
								if ($scope.data != null && $scope.data.length > 0) {
									$scope.data.unshift(data)
								} else {
									$scope.data = [data];
								}

								$scope.data.forEach(instance => {
									$scope.foundedProcedure = true;
									instance.procedure.startDate = sphaProcedureInstanceServices.serverToClientDate(instance.procedure.startDate);
									instance.procedure.endDate = sphaProcedureInstanceServices.serverToClientDate(instance.procedure.endDate);
									instance.procedure.startPeriodDate = sphaProcedureInstanceServices.serverToClientDate(instance.procedure.startPeriodDate);
									instance.procedure.endPeriodDate = sphaProcedureInstanceServices.serverToClientDate(instance.procedure.endPeriodDate);

								});

								$scope.changeSelectedEntry(0);
							} else {
								$scope.canCreateInstance = true;
								$scope.data = [];
								$scope.changeSelectedEntry(-1);
							}

						});
					}
				};

				vm.goBack = function() {

					if (shareDataServices.get('PROCEDURE_PROTOCOL_PAGE')) {
						$state.go('spha.searchProcedimenti');
					} else {
						if ($rootScope.goBack) {
							$state.go($rootScope.goBack);
						} else {
							$window.history.back();
						}
					}


				};

				function updateCookie(cookieName, cookieValue) {
					if (cookieValue) {
						$cookies.put(cookieName, cookieValue);
					} else {
						$cookies.remove(cookieName);
					}
				}

				$scope.canCreateProcedureInstance();

			}]);


})();
