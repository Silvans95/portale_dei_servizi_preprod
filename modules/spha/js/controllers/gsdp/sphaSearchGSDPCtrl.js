/**
 * @ngdoc function
 * @name sphaSearchGSDPCtrl
 * @description controller for search gsdbdf
 * # sphaSearchGsdbdfCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .filter('startFrom', function () {
            return function (input, start) {
                if (input != null) {
                    start = +start; //parse to int
                    return input.slice(start);
                }
            }
        })
        .controller('sphaSearchGSDPCtrl', ['PropertiesServiceSpha', '$rootScope', '$window', '$stateParams', '$state', 
            '$scope', '$cookies', '$q', '$translate', 'httpServices', '$uibModal', '$filter', 'SweetAlert', '$location',
            'sphaGSDPServices','sphaGsdbdfServices', 'shareDataServices', 'sphaUtilsServices',
            function (PropertiesServiceSpha, $rootScope, $window, $stateParams, $state,
                      $scope, $cookies, $q, $translate, httpServices, $uibModal, $filter, SweetAlert, location, 
                      sphaGSDPServices, sphaGsdbdfServices, shareDataServices, sphaUtilsServices) {
                var vm = this;

                //TODO
                //suppongo di ricevere la data di fine procedura dalla url, in data gg/mm/aaaa. ALtrimenti utilizzo la data attuale
                const dateProcedureTo = location.search().dateProcedureTo != null ? moment(location.search().dateProcedureTo, "DD/MM/YYYY") : moment();

                //TODO
                //suppongo di ricevere l'id della procedura dalla url. Altrimenti prendo un valore generico
                const idProcedureInstance = location.search().idProcedureInstance != null ? location.search().idProcedureInstance : 1;

                var firstLoad = true;

                $scope.actions = {
                		'EXPORT': false,
                		'IMPORT': false,
                		'VIEW': false,
                		'EDIT': false,		
                }
                //URLS
                var apiAnagraphicUrl = PropertiesServiceSpha.get("baseUrlAnagraphic");
                var gsdbdfList = apiAnagraphicUrl + "api/gsdbdf/list";

                $rootScope.goBack = null;


                vm.message = "";
                vm.result = $stateParams.result;
                vm.isLoading = false;
                vm.filtersForm = null;
                vm.companies = [];
                //vm.gsdpList = [];
                vm.selectedBoxIndex = null;
                vm.codSisCorporation = null;

                vm.currentGSDPInstance = null;
                //questa variabile mi serve per tornare indietro una volta che l'utente preme il tasto reset
                vm.bkpGSDPInstance = null;

                /**Questa variabile mi serve per indicare all'utente che vuole tornare indietro alla pressione del tasto**/
                vm.dirty = false;
                vm.gsdbdf = null;
                vm.companiesFilter = null;
                
                vm.showData = false;
                
                var sharedValue = shareDataServices.get('instanceCompanies');
                if (sharedValue) {
                    vm.companiesFilter = sharedValue;
                    //add the company to filter
                }

                /** Get massive action by user 
                 * 
                 */
                $scope.getMassiveActionByUser = function() {
                	sphaGsdbdfServices.getMassiveActionByUser( function(data,error) {
                		if (error && error.message) {
                            vm.message = error.message;
                            vm.alertClass = error.alertClass
                        } else {
                        	if(data) {
                        		data.forEach(action => {
                        			$scope.actions[action] = true;
                            	});
                        	}
                        	
                        }
                        	
                	});
                }
               
                $scope.getMassiveActionByUser();
                
                $scope.pagesSizeAllowed = [1, 2, 4, 5, 10];
                $scope.pageSize = 2;
                $scope.currentPage = 0;
                $scope.numberOfPages = function () {
                    if (vm.currentGSDPInstance != null)
                        return Math.ceil(vm.currentGSDPInstance.groups.length / $scope.pageSize);
                    else
                        return 0;
                }
                $scope.selectPageSize = function (key) {
                    $scope.pageSize = $scope.pagesSizeAllowed[key];
                }

                $scope.filters = {
                    gsdbdf: []
                }
                vm.ENUM_GROUP_BOX_STATE = {
                    new: 'NEW',
                    edit: 'EDIT',
                    delete: 'DELETE',
                    default: 'DEFAULT'
                }

				vm.goToTop = function() {
					document.documentElement.scrollTop = 0;
				}

                $scope.filters = {
                    gsdbdf: {elements: [], page: 0}
                };
                
                $scope.filtersRequest = {
                    gsdbdf: null,
                    companies: null
                }
                if (vm.companiesFilter != null) {
                    $scope.filtersRequest.companies = (vm.companiesFilter);
                }
                
                $scope.getGsdbdfPossibleValues = function (page, search, form) {
                    if (!page) {
                        $scope.filters.gsdbdf.elements = [];
                    }
                    $scope.filters.gsdbdf.page = page;
                    sphaGsdbdfServices.getPossibleValues(page,
                        $scope.filtersRequest, search,
                        function (data, error) {
                            if (error && error.message) {
                                vm.message = error.message;
                                vm.alertClass = error.alertClass;
                            } else {
                                sphaUtilsServices.mapSearchFilterResponse([data], $scope.filters);
                                vm.gsdbdf = sphaUtilsServices.prefillFilterWithFirstValue($scope.filters, 'gsdbdf', false);
                                vm.showData = true;
                                if (firstLoad) {
                                    vm.submitSearch(form);
                                    firstLoad = false;
                                }
                            }
                        });
                }


                vm.submitSearch = function (form) {
                    vm.filtersForm = form;
                    vm.codSisCorporation = vm.gsdbdf;
                    loadGSDP();
                };

                $scope.addGroup = function () {
                    vm.dirty = true;
                    const gsdp = {
                        "groupDescription": getValidDefaultGroupDescription(1),
                        "groupBoxState": vm.ENUM_GROUP_BOX_STATE['new'] //questo field viene utilizzato per gestire le classi css
                    }

                    if (vm.currentGSDPInstance.groups == null)
                        vm.currentGSDPInstance.groups = [];

                    restoreDefaultStateAllGroup();

                    vm.currentGSDPInstance.groups.push(gsdp);
                    vm.selectedBoxIndex = vm.currentGSDPInstance.groups.indexOf(gsdp);

                    //TODO
                    //gli altri box devono essere messi a stato default
                }

                $scope.editGroup = function (index) {
                    vm.dirty = true;
                    //ripristino allo stato di default tutti gli altri
                    restoreDefaultStateAllGroup();

                    vm.selectedBoxIndex = index;
                    vm.currentGSDPInstance.groups[vm.selectedBoxIndex].groupBoxState = vm.ENUM_GROUP_BOX_STATE['edit'];
                }

                $scope.deleteGroup = function (index) {
                    vm.dirty = true;

                    //Per sicurezza imposto a null il gruppo attuale
                    vm.selectedBoxIndex = null;
                    //ripristino allo stato di default tutti gli altri
                    restoreDefaultStateAllGroup();
                    vm.currentGSDPInstance.groups[index].groupBoxState = vm.ENUM_GROUP_BOX_STATE['delete'];
                    SweetAlert.swal({
                        title: $translate.instant("CONFIRM_DELETE_GROUP"),
                        text: null,
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#337ab7",
                        confirmButtonText: $translate.instant('YES'),
                        cancelButtonText: $translate.instant('NO'),
                        closeOnConfirm: true,
                        closeOnCancel: true,
                    }, function (isConfirm) {
                        //ripristino allo stato selezionabile i gruppi
                        angular.forEach(vm.currentGSDPInstance.groups[index].companies, function (companyGroup) {
                            for (let i = 0; i < vm.companies.length; i++) {
                                if (vm.companies[i].companySis == companyGroup.companySis) {
                                    vm.companies[i].isBelongToInstance = false;
                                    break;
                                }
                            }
                        });
                        vm.currentGSDPInstance.groups.splice(index, 1);

                        //la pagina corrente de sistema di paginazione non si autoaggiorna
                        if ($scope.currentPage >= $scope.numberOfPages()) {
                            $scope.currentPage = $scope.numberOfPages() - 1;
                        }
                    });
                }
                $scope.save = function () {
                    sphaGSDPServices.writeGSDP(vm.currentGSDPInstance, function (data, success, errors) {
                        if (success === "OK") {
                            vm.dirty = false;
                            vm.currentGSDPInstance = data;
                            SweetAlert.swal({
                                title: $translate.instant("SUCCESS"),
                                text: $translate.instant("SUCCESS_GSDP_SAVE"),
                                type: "success"
                            });
                        } else {
                            if (errors.message != null) {
                                vm.message = errors.message;
                                vm.alertClass = errors.alertClass;
                            } else {
                                vm.message = errors;
                                vm.alertClass = "alert alert-danger";
                            }
                        }
                    });
                };

                $scope.submit = function(){
                    $state.go('spha.gsdpSubmit', {
                        id: vm.currentGSDPInstance.id
                    });
                };
                /**In base allo stato del box, assegnamo una classe css diversa **/
                $scope.addClassToBox = function (state) {
                    switch (state) {
                        case vm.ENUM_GROUP_BOX_STATE['new']:
                            return 'gsdp_list_create';
                            break;
                        case vm.ENUM_GROUP_BOX_STATE['edit']:
                            return 'gsdp_list_edit';
                            break;
                        case vm.ENUM_GROUP_BOX_STATE['delete']:
                            return 'gsdp_list_delete';
                            break;
                        default:
                            return 'gsdp_list';
                            break;
                    }
                };

                function restoreDefaultStateAllGroup() {
                    angular.forEach(vm.currentGSDPInstance.groups, function (gsdp) {
                        gsdp.groupBoxState = vm.ENUM_GROUP_BOX_STATE['default'];
                    });
                };

                function loadGSDP() {
                    if(vm.showData) {
                        vm.currentGSDPInstance = null;
                        const queryMap = {
                            "codSisCorporation.equals": vm.codSisCorporation,
                            "idProcedureInstance.equals": idProcedureInstance
                        };
//                    sphaGSDPServices.findOrCreateGSDPInstance(queryMap).then(function (response) {
                        sphaGSDPServices.findByCriteriaGSDPInstance(queryMap).then(function (response) {
                            if (response && response.length > 0) {
                                vm.currentGSDPInstance = response[0];

                                //clono l'instanza, in modo da renderla indipendente
                                vm.bkpGSDPInstance = JSON.parse(JSON.stringify(vm.currentGSDPInstance));
                                $scope.numOfPages = function () {
                                    return Math.ceil(vm.currentGSDPInstance.groups.length / vm.itemsPerPage);

                                };

                                $scope.$watch('curPage + numPerPage', function () {
                                    var begin = ((vm.curPage - 1) * vm.itemsPerPage);
                                    var end = begin + vm.itemsPerPage;


                                    $scope.filteredItems = vm.currentGSDPInstance.groups.slice(begin, end);
                                });
                                var obj = {
                                    start: 1,
                                    length: 10,
                                    filters: {
                                        gsdbdf: [vm.gsdbdf] ? [vm.gsdbdf] : null,
                                        validProcedureTo: dateProcedureTo.format("YYYY-MM-DD").toString()
                                    },
                                };
                                getCompanies(obj).then(function (result) {
                                    populateCompanies(result.data);
                                });
                                //vm.gsdpList = currentGSDPInstance.groups;
                            } else {
                                vm.message = "NO_GSDP_INSTANCES";
                                vm.alertClass = "alert alert-danger";
                            }
                        }, function (error) {
                            vm.message = error;
                            vm.alertClass = "alert alert-danger";
                        });
                    }
                }

                function getValidDefaultGroupDescription(increment) {
                    var name = "GSDP_" + (parseInt(vm.currentGSDPInstance.groups.length, 10) + increment);
                    var flag = false;
                    for (var i = 0; i < vm.currentGSDPInstance.groups.length; i++) {
                        if (vm.currentGSDPInstance.groups[i].groupDescription === name) {
                            flag = true;
                            break;
                        }
                    }
                    if (flag)
                        name = getValidDefaultGroupDescription(increment + 1);

                    return name;
                }

                function populateCompanies(companyList) {
                    //vm.companies=companyList;

                    /**Utilizzo una variabile temporanea così la lista verrà renderizzata per intera subito**/
                    const tempCompanyList = [];

                    /**TODO da rimuovere**/
                    const tmpCompanySis = [];

                    angular.forEach(companyList, function (company) {

                        //Il servizio sottostante verifica se l'azienda (tramite il suo code) appartiene già ad un gruppo, per l'istanza e il codice della gsdbdf in questione
                        sphaGSDPServices.checkCompanyBelongToInstance(company.companySis, idProcedureInstance, vm.codSisCorporation).then(function (response) {

                            /** TODO In fase di mock abbiamo aziende che vengono replicate. Non aggiungo quelle già presenti per evitare problemi. Da rimuovere**/
                            if (!tmpCompanySis.includes(company.companySis)) {

                                company.isBelongToInstance = response;
                                tempCompanyList.push(company)

                                /**TODO da rimuovere**/
                                tmpCompanySis.push(company.companySis)
                            }
                        });
                        vm.companies = tempCompanyList;

                    });

                }

                function getCompanies(obj) {
                    var deferred = $q.defer();


                    httpServices.post(gsdbdfList, obj, function (data, success, error) {
                        if (success) {
                            deferred.resolve({
                                data: data.items,
                                total: data.total,
                            });
                        } else {
                            vm.message = error;
                            vm.alertClass = "alert alert-danger";
                        }
                    });

                    return deferred.promise;

                }


                $scope.handleDrop = function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var dataText = JSON.parse(e.dataTransfer.getData('data'));
                    /*
                    * dataText contiene il codice dell'azienda draggata e il container di origine. La prima differenza
                    * va fatta in base al base container di origine, poi si recupera l'oggetto in questione dalle liste
                    * */


                    for (var i = 0, len = vm.companies.length; i < len; i++) {

                        if (vm.companies[i].companySis === dataText.companySis) {

                            //flusso relativo allo spostamento dall'elenco delle aziende ai gruppi
                            if (dataText.startContainer === "companyList") {
                                vm.companies[i].isBelongToInstance = true;

                                if (vm.currentGSDPInstance.groups[vm.selectedBoxIndex].companies == null)
                                    vm.currentGSDPInstance.groups[vm.selectedBoxIndex].companies = [];

                                //per differenziare gli oggetti, li clono
                                const clonedCompany = {...vm.companies[i]};
                                $scope.$apply(function () {
                                    vm.currentGSDPInstance.groups[vm.selectedBoxIndex].companies.push(clonedCompany);
                                });


                            } else {
                                //flusso relativo allo spostamento ddi gruppi all'elenco aziende

                                //devo farlo tornare disponibile nella lista delle aziende
                                vm.companies[i].isBelongToInstance = false
                                //e rimuoverlo dai gruppi

                                angular.forEach(vm.currentGSDPInstance.groups[vm.selectedBoxIndex].companies, function (groupCompany) {
                                    if (groupCompany.companySis === vm.companies[i].companySis) {
                                        $scope.$apply(function () {
                                            vm.currentGSDPInstance.groups[vm.selectedBoxIndex].companies.splice(groupCompany, 1);
                                        });
                                    }
                                });
                            }
                            break;
                        }
                    }
                }

                $scope.handleDragOver = function (e) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
                    return false;
                };
                $scope.reset = function () {
                    if (vm.dirty) {
                        SweetAlert.swal({
                            title: $translate.instant("DIRTY_TRUE_CONFIRM"),
                            text: null,
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#337ab7",
                            confirmButtonText: $translate.instant('YES'),
                            cancelButtonText: $translate.instant('NO'),
                            closeOnConfirm: true,
                            closeOnCancel: true,
                        }, function (isConfirm) {
                            //ritorno all'instanza originale
                            vm.currentGSDPInstance = JSON.parse(JSON.stringify(vm.bkpGSDPInstance));
                            vm.dirty = false;
                            vm.message = null;
                            vm.alertClass = null;
                        });
                    }
                    vm.message = null;
                    vm.alertClass = null;
                    vm.companies = null;
                    vm.gsdbdf = null;
                    vm.currentGSDPInstance = null;
                };

                vm.goBack = function () {
                    if (vm.dirty) {
                        SweetAlert.swal({
                            title: $translate.instant("DIRTY_TRUE_CONFIRM"),
                            text: null,
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#337ab7",
                            confirmButtonText: $translate.instant('YES'),
                            cancelButtonText: $translate.instant('NO'),
                            closeOnConfirm: true,
                            closeOnCancel: true,
                        }, function (isConfirm) {
                            goBack();
                        });
                    } else
                        goBack();
                };

                function goBack() {
                    if ($rootScope.goBack) {
                        $state.go($rootScope.goBack);
                    } else {
                        $window.history.back();
                    }
                }

            }
        ]);
})
();



