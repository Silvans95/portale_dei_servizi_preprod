/**
 * @ngdoc function
 * @name sphaSearchCompanyCtrl
 * @description controller for search procedimenti
 * # sphaSearchCompanyCtrl Controller of the sphaApp
 */
(function () { 
 'use strict';
	angular.module('sphaApp')
	.controller('sphaSearchCompanyCtrl',
		['PropertiesServiceSpha', '$rootScope', '$stateParams', '$state', '$scope', '$window', '$cookies', '$q', '$translate', 
            'httpServices','sphaCompanyServices', 'NgTableParams','$uibModal', '$filter', 'SweetAlert',
		function ( PropertiesServiceSpha, $rootScope, $stateParams, $state, $scope, $window, $cookies, $q, $translate,
                   httpServices, sphaCompanyServices, NgTableParams, $uibModal, $filter, SweetAlert ) {

			var vm = this;
			
			//URLS
			var apiAnagraphicUrl = PropertiesServiceSpha.get("baseUrlAnagraphic");
			var searchUrl = apiAnagraphicUrl + "api/companies/list";
			var searchFiltersUrl = apiAnagraphicUrl + "api/companies/companies-filters-meta";
			var exportUrl = apiAnagraphicUrl + "api/companies/export";


			$rootScope.goBack=null;				

			vm.message = "";
			vm.result = $stateParams.result;
			vm.isLoading = false;
			vm.filtersForm = null;
			
			//Recupero i filtri salvati nei cookies
			vm.id = $cookies.get( 'companyId' ) ? $cookies.get( 'companyId' ) : null ;
			vm.companies = $cookies.get( 'companies' ) ? JSON.parse( $cookies.get( 'companies' ) ) : null;
			vm.validProcedureTo = $cookies.get( 'companyValidProcedureTo' ) ? new Date( $cookies.get( 'companyValidProcedureTo' ) ) : new Date("2020-06-30T00:00:00.000Z");

			var initialSortingKey = $cookies.get( 'sortingKeyCompany' ) ? $cookies.get( 'sortingKeyCompany' ) : 'id';
			var initialSortingDirection = $cookies.get( 'sortingValueCompany' ) ? $cookies.get( 'sortingValueCompany' ) : 'desc';
			

			
			
			vm.goToTop = function() {
				document.documentElement.scrollTop = 0;
			}

            // Init Search Filters' domains
			$scope.filters = {
				companies: {
				    elements: [],
                    page:0
				},
				validProcedureTo: null
			};

			//TODO da rimuovere validProcedureTo in futuro
			$scope.filtersRequest = {
				companies: {companies: [], validProcedureTo: "2300-01-21T00:00:00.000Z"},
				reimbursementClass: {},
				atc: {}
			}
			$scope.getCompaniesPossibleValues = function (page, search) {
				if(page==0 && search !== "") {
        			$scope.filters.companies.elements = [];
        		}
            	if( (page==0 && search !== "") || page ) {
				sphaCompanyServices.getPossibleValues(page,
					($scope.filtersRequest.companies.companies!= null &&
						$scope.filtersRequest.companies.companies.length > 0)
						? $scope.filtersRequest.companies
						: null, search,
					function (data, error) {
						if (error && error.message) {
							vm.message = error.message;
							vm.alertClass = error.alertClass
						} else {
							mapSearchFilterResponse([data]);
						}
					});
            	}
			}


			//Recupero i filtri salvati nei cookies dalla pagina delle istanze o dalla stessa pagina
			if($cookies.get('companies')) {
				vm.companies =  JSON.parse($cookies.get('companies'));
			}
			if(vm.companies != null){
				$scope.filtersRequest.companies.companies = (vm.companies);
			}

			$scope.getCompaniesPossibleValues($scope.filters.companies.page);

			// Mapping Search Filters Response to Filter Domain
			var mapSearchFilterResponse = function (data) {
                data.forEach(meta => {
                    if (meta.name && $scope.filters[meta.name]) {
                        $scope.filters[meta.name].elements = $scope.filters[meta.name].elements.concat(meta.options);
                        if (meta.page) {
                            $scope.filters[meta.name].page = meta.page
                        }
                        if (meta.total) {
                        	$scope.filters[meta.name].total = meta.total
                        }
                    }
                });
            }



			vm.export = function () {
				var obj = {
					
					search : "",
					filters: {
						companies : vm.companies ? vm.companies : null,
						validProcedureTo : vm.validProcedureTo ? vm.validProcedureTo : null
					},
				};
				
                exportData(obj).then(function (result) {
                	SweetAlert.swal({
                        title: $translate.instant("EXPORT_DATA"),
                        text: null,
                        type: "success",
                        confirmButtonColor: "#337ab7",
                        confirmButtonText: $translate.instant('OK'),
                        closeOnConfirm: true,
                    });
                    return result.data;
                });

			};
			
			/**
			 * Funzione per il submit della ricerca tramite input 
			 */
			vm.submitSearch = function(form){
				updateFiltersCookies();
				vm.filtersForm = form;
				vm.companyTable.page( 1 );
				vm.companyTable.reload();
			};
			
			function updateFiltersCookies(){
				updateCookie('companyId', vm.id);
				updateCookie('companies', vm.companies ? JSON.stringify(vm.companies): null);
				updateCookie('companyValidProcedureTo', vm.validProcedureTo ? vm.validProcedureTo.toISOString() : null);

			}

			function updateCookie(cookieName, cookieValue){
				if( cookieValue ){
					$cookies.put( cookieName, cookieValue );
				} else {
					$cookies.remove( cookieName );
				}
			}

			$scope.resetOrderBy=function(){
				$cookies.remove( 'sortingKeyCompany' );
				$cookies.remove( 'sortingValueCompany' );
				vm.companyTable.sorting({id:'desc'});
				vm.companyTable.reload();
			};
			
			/**
			 * Actions callback
			 * @param {*} action Action name
			 * @param {*} companyCode Action object
			 */
			$scope.onActionCallback = function (action, row) {
				switch( action ) {
					default:
						alert('Hai premuto ' + action + ' sulla riga ' + row.object.companyCode);
						console.log('Unknown Action: ' + action);
				}
			};

			/**
			 * Enhances data object array building Action object
			 * containing Action name callback and parameter object
			 * and adding it to each row
			 * @param {*} data data object array
			 */
			var rowActionsObjects = function( data ){
				if (data) {
					data.forEach(function( row ){
						if (row && row.actions && row.actions.length>0){
							var rowActions = row.actions.map(function(a){
									return {
									callback: $scope.onActionCallback,
									object: row,
									action: a
								};
							});
							row.actions = rowActions;
						}
					});
				}
			};

			/**
			* Go to New Procedimento
			*/
			vm.new = function (){
				shareDataServices.set( vm.typeProcedimenti, 'Type-Procedimenti' );
				$state.go('spha.newProcedimenti');
			};

			/**
			* Set shared data between controllers
			*/
			vm.setObject = function ( object , id ){
				shareDataServices.set( object, id + 'Procedimenti' );
			};

			/**
			 * Function to init permitted action for every Procedure. It returns an
			 * array of obects used to populate buttons and dropdowns of action column
			 */
			vm.initActions = function ( allowedActions, id ){
				return sphaProcedureServices.getProcedureActions( allowedActions, id );
			}
			
			/**
			 * Reset search
			 */
			vm.reset = function(){
				vm.id = null;
				if(!$scope.lockedMode) {
                	vm.companies = null;
                }
				updateFiltersCookies();
				$scope.resetOrderBy();
			}
			
			/**
			 * Funzione associata al bottone per la cancellazione di una riga.
			 * Chiama il servizio rest delete cta 
			 */
			vm.deleteRow = function( row ){
				SweetAlert.swal({
					   title: $translate.instant("CONFIRM_DELETE_PROCEDIMENTO") + " " + row.number + "?",
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
							   httpServices.post( deleteUrl , row.id, function ( data, success, error ) {
								   if( success ){
									   vm.alertClass = "alert alert-success";
									   vm.message = "SUCCESS_DELETE_CTA";
									   vm.companyTable.reload();
								   }else{
									   vm.message = error;
									   vm.alertClass = "alert alert-danger";
								   }
							   });
						   }
					   }
				);
			};
			
			/**
			 * Inizializzazione NGTable
			 */
			vm.companyTable = new NgTableParams({
					page : 1,
					count : 10,
					sorting : {
						[initialSortingKey] : initialSortingDirection.toLowerCase(),
					}
				}, {
					enableRowSelection:true,
					//number of element option to visualize for page
					counts : [5, 10, 25, 50],
					//get data : server side processing
					getData : function (params) {
						//for filtering data
						var filter = params.filter();
						//count of element
						var count = params.count();
						//page
						var page = params.page();
						//sorting
						var sorting = params.sorting();
						var sortingKey = Object.keys( sorting )[0];
						var sortingValue = sortingKey ? sorting[sortingKey] : null;
						var order = [{
								"property" : sortingKey ? sortingKey : '',
								"direction" : sortingValue ? sortingValue.toUpperCase() : null,
							}
						];
						//enable loading spinner
						vm.isLoading = true;
						//object for api rest
						var obj = {
							start : ( page - 1 ) * count,
							length : count,
							search : "",
							filters: {
							    companies : vm.companies ? vm.companies : null,
							    validProcedureTo : vm.validProcedureTo ? vm.validProcedureTo : null
							},
						};
						if ( sortingKey ) {
							obj.order = order;
							$cookies.put( 'sortingKeyCompany', order[0].property );
							$cookies.put( 'sortingValueCompany', order[0].direction );
						}

						//rendering data
						 var data = getData( obj ).then( function ( result ) {
								 params.total( result.total );
								 rowActionsObjects(result.data);
								 vm.isLoading = false;
						 		return result.data;
						 	});

						return data;
					}
				
				});
		            /**
                     * Funzione per esportare i dati
                     */
                    function exportData(obj) {
                        var deferred = $q.defer();

                        if (!vm.filtersForm || vm.filtersForm.$invalid) {
                            deferred.resolve({
                                data: null,
                                total: 0,
                            });
                        } else {
                            httpServices.post(exportUrl, obj, function (data, success, error) {
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
                        }
                        return deferred.promise;
                    };
			
			/**
			 * Funzione per recuperare i dati per popolare la NGTable 
			 */
			function getData(obj) {
				var deferred = $q.defer();

				if (!vm.filtersForm || vm.filtersForm.$invalid) {
					deferred.resolve({
							data : null,
							total : 0,
						});
				} else {
					httpServices.post( searchUrl, obj, function ( data, success, error ) {
						if( success ){ 
							deferred.resolve({
								data : data.items,
								total : data.total,
							});
						}else{
							vm.message = error;
							vm.alertClass = "alert alert-danger";
						}
					});
				}
				return deferred.promise;
			};
			
			vm.goBack = function( ){
				if( $rootScope.goBack ){
					$state.go( $rootScope.goBack );
				}else{
					$window.history.back();
				}
			}; 
		}]);
})();
