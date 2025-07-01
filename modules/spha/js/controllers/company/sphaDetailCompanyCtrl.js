/**
 * @ngdoc function
 * @name sphaDetailCompanyCtrl
 * @description controller for search procedimenti
 * # sphaDetailCompanyCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp').controller('sphaDetailCompanyCtrl', sphaDetailCompanyCtrl);

    sphaDetailCompanyCtrl.$inject = [
        '$rootScope', '$stateParams', '$state', '$scope', '$window', '$cookies', '$translate', '$uibModal', '$filter', '$q',
        'SweetAlert',
        'PropertiesServiceSpha', 'sphaCompanyServices', 'httpServices', 'shareDataServices', 'sphaProcedureInstanceServices', 
        'sphaRectificationServices', 'sphaUtilsServices'];

    function sphaDetailCompanyCtrl(
        $rootScope, $stateParams, $state, $scope, $window, $cookies, $translate, $uibModal, $filter, $q,
        SweetAlert,
        PropertiesServiceSpha, sphaCompanyServices, httpServices, shareDataServices, sphaProcedureInstanceServices, 
        sphaRectificationServices, sphaUtilsServices) {

        const MAX_PAGE_SIZE = 0x7fffffff;
        // enumerationImports
        const rectificationType = sphaRectificationServices.rectificationTypeEnum.COMPANY;
        const rectificationDetailInfoTypes = sphaRectificationServices.rectificationDetailInfoTypeEnum;
        const tableType = 'FLUSSO_FARMACI';

        var vm = this;
        var rectificationDTO = null;
        var rectificationDetailInfoDto = null;
        var procedureInstanceDTO = null; // from cookies
        var companyObjBackup = null;
        
        vm.message = '';
        vm.isLoading = false;
        vm.filtersForm = null;
        vm.companyObj = null;
        vm.company = null;

        $scope.readOnly = true;

        $scope.actions = {
            EXPORT: false,
            VIEW: false,
            EDIT: false,
            RECTIFICATION_VIEW_DETAIL: false,
            SUBMIT: false
        };

        $scope.lockedMode = true; // show single company data

        $scope.filters = {
            companies: {elements: [], page: 0}
        };

        $scope.filtersRequest = {
            companies: {companies: []}
        };

        function handleCookiesAndSharedData() {
            //Recupero eventuali filtri imposti
            var sharedSelectedCompanyCode = shareDataServices.get('instanceCompany');
            if (sharedSelectedCompanyCode) {
                // company code from other pages
                vm.company = sharedSelectedCompanyCode;
            } else if ($cookies.get('selectedCompanyCode')) {
                // Recupero i filtri salvati nei cookies
                vm.company = $cookies.get('selectedCompanyCode');
            }
            if (vm.company != null) {
                $scope.filtersRequest.companies.companies = [vm.company];
            }
            if(shareDataServices.get('RECTIFICATION_DTO')) {
                shareDataServices.delete('RECTIFICATION_DTO');
            }
            procedureInstanceDTO = shareDataServices.get('SELECTED_PROCEDURE_INSTANCE_DTO');
        }
        
        function handleState() {
            var deferred = $q.defer();
            /// recupero l'istanza di procedimento se l'istanza salvata nei cookie non corrisponde a quella presente nell'URL
            if($state.params['procedureInstanceId'] && (!(procedureInstanceDTO && procedureInstanceDTO.id && 
                    $state.params['procedureInstanceId'] === procedureInstanceDTO.id))) {
                sphaProcedureInstanceServices.getProcedureInstance($state.params['procedureInstanceId'], function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        procedureInstanceDTO = data;
                        vm.company = procedureInstanceDTO.company;
                        $scope.filtersRequest.companies.companies = [vm.company];
                        deferred.resolve();
                    }
                });
            } else {
                if (!vm.company) {
                    vm.company = procedureInstanceDTO.company;
                    $scope.filtersRequest.companies.companies = [vm.company];
                }
                deferred.resolve();
            }
            
            return deferred.promise;
        }

        /**
         * gestione azioni disponibili
         * @param data
         */
        function handleActions(data) {
            if (data) {
                data.forEach(action => $scope.actions[action] = true);
            }
            sphaProcedureInstanceServices.setMassiveActionByProcedureInstance(procedureInstanceDTO, $scope.actions);
        }

        /**
         * Get massive action by user
         */
        function getMassiveActionByUser() {
            var deferred = $q.defer();
            sphaCompanyServices.getMassiveActionByUser(function (data, error) {
                parseServiceResponse(data, error, null, handleActions);
                deferred.resolve();
            });
            return deferred.promise;
        }
        
        function getFilters() {
            var filters = {
                companies: [vm.company]
            };
            if (filters && procedureInstanceDTO) {
                var dataImportIds = sphaProcedureInstanceServices.getDataImportIds(procedureInstanceDTO, tableType);
                if (dataImportIds && dataImportIds.length > 0) {
                    filters.dataImportIds = dataImportIds;
                }
            }
            return filters;
        }

        /**
         * Funzione per recuperare i dati di dettaglio dell'azienda selezionata
         */
        function loadCompanyDetail() {
            var deferred = $q.defer();
            if(vm.company) {
                var bodyRequest = {
                    search: '',
                    length: MAX_PAGE_SIZE,
                    filters: getFilters()
                };
                sphaCompanyServices.getDetail(bodyRequest, function (data, error) {
                    parseServiceResponse(data, error, null, parseCompanyDetailResponse);
                    deferred.resolve();
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }

        function parseCompanyDetailResponse(data) {
            vm.isLoading = false;
            vm.companyObj = null;
            if (data && data.items) {
                data.items.forEach(company => {
                    if (company.companyCode.value === vm.company) {
                        vm.companyObj = angular.copy(company, {});
                        companyObjBackup = angular.copy(company, {});
                    }
                });
                if (vm.companyObj == null) {
                    alert('Dettaglio Azienda non trovato');
                }
            }
        }
        
        function getRectification() {
            var deferred = $q.defer();
            if (procedureInstanceDTO && procedureInstanceDTO.id && vm.company && vm.company.length > 0 && 
                    $scope.actions.RECTIFICATION_VIEW_DETAIL === true) {
                var criteria = {
                    procedureInstanceId: {equals: procedureInstanceDTO.id},
                    type: {equals: rectificationType},
                    companyCode: {in: [vm.companyObj.companyCode.value]},
                    status: {equals: 'DRAFT'}
                };
                if($state.params['idRectification']) {
                    criteria['id'] = {equals: $state.params['idRectification']};
                    criteria.status = null;
                }
                sphaRectificationServices.getAllRectificationsByCriteria(
                    criteria,
                    null,
                    null,
                    true,
                    null,
                    function (data, error) {
                        if (error && error.message) {
                            vm.message = error.message;
                            vm.alertClass = error.alertClass;
                        } else {
                            handleRectificationResponse(data);
                            deferred.resolve();
                        }
                    });
            }
            return deferred.promise;
        }

        /**
         * recupera l'identificativo del farmaco per la rettifica
         * @returns {{aic9, validMarketing, companyCode}}
         */
        function getSelectedObjectIdentifier() {
            return {
                companyCode: vm.companyObj.companyCode.oldValue
            };
        }

        /**
         * recupera il dettaglio di una rettifica per un farmaco (info ed items)
         */
        function getSelectedObjectRectificationDetailInfo() {
            if (vm.companyObj && rectificationDTO && rectificationDTO.id && $scope.actions.RECTIFICATION_VIEW_DETAIL === true) {
                var rectificationDetailCriteria = {
                    objectId: {equals: JSON.stringify(getSelectedObjectIdentifier())},
                    rectificationId: {equals: rectificationDTO.id}
                };
                sphaRectificationServices.getRectificationDetailInfoByCriteria(rectificationDetailCriteria,
                    null,
                    null,
                    true,
                    null,
                    function (rectificationDetailDTOs, error) {
                        parseServiceResponse(rectificationDetailDTOs, error, null, parseRectificationDetailInfoResponse);
                    });
            }
        }

        /**
         *
         * @param rectificationDetailDTOs
         * @param form
         */
        function parseRectificationDetailInfoResponse(rectificationDetailDTOs, form) {
            var items = rectificationDetailDTOs ? rectificationDetailDTOs.items : null;
            if (rectificationDetailDTOs && (items && items[0] && items[0].id) || rectificationDetailDTOs.id) {
                rectificationDetailInfoDto = items && items[0] ? items[0] : rectificationDetailDTOs;
                sphaRectificationServices.parseRectificationDetailItems(rectificationDetailInfoDto,  vm.companyObj);
            } else {
                rectificationDetailInfoDto = null;
            }
            getRectification();
        }
        
        /**
         * crea una nuova rettifica
         * @param form
         */
        function createNewRectification(form) {
            var rectificationInfo = {
                type: rectificationType,
                companyCode: vm.company,
                procedureInstanceId: procedureInstanceDTO.id,
                detailInfo: {
                    type: rectificationDetailInfoTypes.MOD,
                    objectId: getSelectedObjectIdentifier()
                },
                selectedObject:  vm.companyObj
            };
            sphaRectificationServices.createNewRectificationWithDetails(form, rectificationInfo, function (data, error) {
                if(data && !error.message) {
                    rectificationDTO = data;
                }
                parseServiceResponse(data, error, {message: 'SUCCESS_SAVE_RECTIFICATION'}, getSelectedObjectRectificationDetailInfo);
            });
        }
        
        /**
         * aggiorna il dettaglio (items) di un dettaglio di una rettifica di un farmaco
         * @param form
         */
        function updateRectificationDetailInfo(form) {
            sphaRectificationServices.updateRectificationDetailInfo(form, vm.companyObj, rectificationDetailInfoDto,
                function (data, error) {
                    if(error && error.message === 'RECTIFICAITON_DETAIL_ITEMS_IS_EMPTY') {
                        // rectificationDetailInfo has been deleted
                        rectificationDetailInfoDto = null;
                        vm.resetForm(form);
                        vm.companyObj = angular.copy(companyObjBackup,{});
                        getRectification();
                    }
                    parseServiceResponse(data, error, {message:'SUCCESS_SAVE_RECTIFICATION_DETAILS'}, 
                        parseRectificationDetailInfoResponse, [form]);
                });
        }
        
        /**
         * crea un nuovo dettaglio (info ed items) per la rettifica di un farmaco
         * @param form
         */
        function createRectificationDetailInfo(form) {
            var rectificationDetailInfoToSave;
            if (rectificationDTO && rectificationDTO.id) {
                rectificationDetailInfoToSave = {
                    rectificationId : rectificationDTO.id,
                    objectId: JSON.stringify(getSelectedObjectIdentifier()),
                    type: rectificationDetailInfoTypes.MOD,
                    status: null
                };
            }
            sphaRectificationServices.createRectificationDetailInfo(form, vm.companyObj, rectificationDetailInfoToSave,
                function (data, error) {
                    // clean selected object before mapping rectification data
                    if(error && error.message === 'RECTIFICAITON_DETAIL_ITEMS_IS_EMPTY') {
                        // rectificationDetailInfo has been deleted
                        rectificationDetailInfoDto = null;
                        vm.resetForm(form);
                        vm.companyObj = angular.copy(companyObjBackup,{});
                    }
                    parseServiceResponse(data, error, {message: 'SUCCESS_SAVE_RECTIFICATION_DETAILS'},
                        parseRectificationDetailInfoResponse, [form]);
                });
        }
        
        function handleRectificationResponse(responseData) {
            var rectificationIsOk = responseData && responseData.items && responseData.items.length === 1 &&  responseData.items[0].id;
            if (rectificationIsOk) {
                rectificationDTO = responseData.items[0];
            }
            sphaRectificationServices.setMassiveActionByRectification(rectificationDTO, $scope.actions);
        }

        /**
         *
         * @param data
         * @param error
         * @param successMessage
         * @param callback
         * @param callbackArgs
         */
        function parseServiceResponse(data, error, successMessage, callback, callbackArgs) {
            if (error && error.message) {
                vm.message = error.message;
                vm.alertClass = error.alertClass;
            } else {
                if (data) {
                    if (successMessage) {
                        vm.message = successMessage.message ? successMessage.message : 'SUCCESS';
                        vm.alertClass = successMessage.alertClass ? successMessage.alertClass : 'alert alert-success';
                    }
                    if (typeof callback === 'function') {
                        if (callbackArgs) {
                            callback(data, ...callbackArgs);
                        } else {
                            callback(data);
                        }
                    }
                }
            }
        }

        /**
         * Funzione per il submit della ricerca tramite form
         */
        function mapSearchFilterResponse(data) {
            data.forEach(meta => {
                if (meta.name && $scope.filters[meta.name]) {
                    $scope.filters[meta.name].elements = $scope.filters[meta.name].elements.concat(meta.options);
                    if (meta.page) {
                        $scope.filters[meta.name].page = meta.page;
                    }
                    if (meta.total) {
                        $scope.filters[meta.name].total = meta.total;
                    }
                }
            });
        }

        $scope.getCompaniesPossibleValues = function (page, search) {
            if (!page) {
                $scope.filters.companies.elements = [];
            }
            $scope.filters.companies.page = page;
            sphaCompanyServices.getPossibleValues(page,
                ($scope.filtersRequest.companies.companies != null &&
                    $scope.filtersRequest.companies.companies.length > 0) ?
                    $scope.filtersRequest.companies
                    : null, search,
                function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                    } else {
                        mapSearchFilterResponse([data]);
                    }
                });
        };
        
        /**
         * se l'elemento del form � invalido -> aggiunge la classe has-errors
         * se l'elemento del form � rettificato -> aggiunge la classe hasBeenRectified
         * se l'elemento del form � modificato -> aggiunge la classe hasBeenModified
         * @param {*} idField
         * @param {*} form
         */
        $scope.addClass = function (idField, form) {
            return sphaUtilsServices.addFieldClass(idField, vm.companyObj, form);
        };

        vm.submitSearch = function (form) {
            if (!form || form.$invalid) {
                vm.companyObj = null;
            } else {
                loadCompanyDetail();
            }
        };

        /**
         * Reset
         */
        vm.reset = function () {
            if (!$scope.lockedMode) {
                vm.company = null;
            }
            vm.companyObj = null;
        };

        /**
         * Save
         */
        vm.save = function (form) {
            if (form && form.$valid && vm.company) {
                if(rectificationDTO && rectificationDTO.id) {
                    if(rectificationDetailInfoDto && rectificationDetailInfoDto.id) {
                        updateRectificationDetailInfo(form);
                    } else {
                        createRectificationDetailInfo(form);
                    }
                } else {
                    createNewRectification(form);
                }
            }
        };
        
        /**
         * delete rectification detail info
         */
        vm.deleteRectificationDetail = function () {
            if(rectificationDetailInfoDto && rectificationDetailInfoDto.id) {
                sphaRectificationServices.deleteRectificationDetail(rectificationDetailInfoDto, function (data, error) {
                    parseServiceResponse(data, error, {message: 'RECTIFICATION_DETAIL_DELETED', alertClass: 'alert alert-danger'}, 
                        loadCompanyDetail);
                });
            }
        };
        

        /**
         * 
         * @param form
         * @param reloadRectificationData
         */
        vm.resetForm = function (form, reloadRectificationData) {
            vm.companyObj = angular.copy(companyObjBackup,{});
            if(reloadRectificationData) {
                getSelectedObjectRectificationDetailInfo();
            }
            if(form) {
                form.$setPristine();
            }
        };

        /**
         * Submit della rettifica
         */
        vm.submit = function () {
        	if(rectificationDTO.status  === 'DRAFT' ||  rectificationDTO.status  === 'SIGNED') {

                gatherSubscriberData().then(function(vm) {

                    var pdfRequest =  {
                        empowered: vm.potereSoggetto,
                        subjectName: vm.soggetto,
                        subjectQualification: vm.qualificaSoggetto,
                        companyHeadquarters: vm.sedeAzienda,
                	    companyName: $scope.filters.companies.elements[0].label,
                	    companyCode: $scope.filters.companies.elements[0].value,
                	    procedure: $translate.instant(procedureInstanceDTO.procedure.type + '_LABEL'),
                	    idRectification: rectificationDTO.id ,
                	    rectificationType: rectificationDTO.type,
                	    idProcedureInstance: rectificationDTO.procedureInstanceId,
                	    rectificationStatus: rectificationDTO.status
                	};
                	// invio questa request alla pagina di sottomissione rettifiche
                    shareDataServices.set(pdfRequest, 'PDF_REQUEST_PARAMS');
        			shareDataServices.set('spha.detailCompany', 'ORIGIN_PAGE');
                	$state.go('spha.submitRectification');
                });
        	} else {
        		// non è presente nessuna rettifica da sottomettere
        		SweetAlert.swal({
                    title: $translate.instant('NO_RECTIFICATION_TO_SUBMIT'),
                    text: null,
                    type: 'warning',
                    confirmButtonColor: '#337ab7',
                    confirmButtonText: $translate.instant('YES'),
                    closeOnConfirm: true,
                });
        	}
        };

        function gatherSubscriberData() {
            var scope = $scope;
            scope.modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'modules/spha/js/directives/modal/modalGatherSubscriberData.html',
                size: '900px',
                controllerAs: '$ctrl',
                controller: function( $scope, shareDataServices ) {

                    var vm = this;

                    vm.subscriber = shareDataServices.get('PDF_SUBSCRIBER_PARAMS') || {};

                    vm.soggetto = vm.subscriber.soggetto || null;
                    vm.qualificaSoggetto = vm.subscriber.qualificaSoggetto || null;
                    vm.companyName = scope.filters.companies.elements[0].label;
                    vm.sedeAzienda = vm.subscriber.sedeAzienda || null;
                    vm.potereSoggetto = vm.subscriber.potereSoggetto || null;

                    $scope.submit= function(){
                        var data = {
                            potereSoggetto: vm.potereSoggetto,
                            soggetto: vm.soggetto,
                            qualificaSoggetto: vm.qualificaSoggetto,
                            sedeAzienda: vm.sedeAzienda,
                        }
                        shareDataServices.set(data, 'PDF_SUBSCRIBER_PARAMS');
                        scope.modalInstance.close(data);
                    }

                    $scope.cancel = function () {
                        scope.modalInstance.dismiss( 'cancel' );
                    };

					$scope.addClass = function (idField, form) {
						if (!$scope.readOnly && form && form[idField] && form[idField].$invalid) {
							return 'has-errors';
						}
						return '';
					};

					vm.getWidth = function(field) {
						var size = field && field.length || 0
						return {width: (!size || size < 20 ? 20 : size) + 5 + 'ch'};
					};
                }
            });
            return scope.modalInstance.result;
        }

        /**
         * Edit
         */
        vm.edit = function () {
            if ($scope.actions.EDIT) {
                $scope.readOnly = !$scope.readOnly;
            }
        };

        vm.goToTop = function () {
            document.documentElement.scrollTop = 0;
        };

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

        // DECLARE FUNCTION FOR INIT CONTROLLER
        function init() {
            //Recupero i filtri salvati nei cookies dalla pagina delle istanze o dalla stessa pagina
            handleCookiesAndSharedData();
            
            handleState().then(function (result) {
                //Recupero le azioni per l'utente
                getMassiveActionByUser().then(function (result) {
                    // get History
                    loadCompanyDetail().then(function (result) {
                        getRectification().then(function(result) {
                            getSelectedObjectRectificationDetailInfo();
                        });
                    });
                });
            });
        }

        // EXECUTIONS
        init();
    }
})();
