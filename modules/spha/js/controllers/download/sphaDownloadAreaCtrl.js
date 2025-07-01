/**
 * @ngdoc function
 * @name sphaDownloadAreaCtrl
 * @description controller for search procedimenti
 * # sphaDownloadAreaCtrl Controller of the sphaApp
 */
(function() {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaDownloadAreaCtrl', ['PropertiesServiceSpha', '$rootScope', '$stateParams', '$state', '$scope', '$window', '$q', '$translate', 'httpServices', 'NgTableParams', 'shareDataServices', 'SweetAlert',
            function(PropertiesServiceSpha, $rootScope, $stateParams, $state, $scope, $window, $q, $translate, httpServices, NgTableParams, shareDataServices, SweetAlert) {
                var vm = this;

                //URLS
                var apiProcedureUrl = PropertiesServiceSpha.get("baseUrlProcedure");
                var searchUrl = apiProcedureUrl + "api/user-files/list";
                var downloadAllUrl = apiProcedureUrl + "api/user-files/downloads/"

                $rootScope.goBack = null;
                $scope.url = PropertiesServiceSpha.get("baseUrlProcedure") + "api/user-files/";

                vm.message = "";
                vm.result = $stateParams.result;
                vm.isLoading = false;
                vm.dataTest = "";
                vm.filesToDownload = [];
                vm.allItemsSelected = false;
                vm.data = null;

                /**
                 * Go to New Procedimento
                 */
                vm.new = function() {
                    shareDataServices.set(vm.typeProcedimenti, 'Type-Procedimenti');
                    $state.go('spha.newProcedimenti');
                };

                /**
				 * Actions callback
				 * @param {*} action Action name
				 * @param {*} aic9 Action object
				 */
				$scope.onActionCallback = function (action, aic9) {
					switch( action ) {
                        case 'VIEW':
						default:
							alert('Hai premuto ' + action + ' sulla riga ' + aic9);
							console.log('Unknown Action: ' + action);
					}
                };

                /**
                 * Inizializzazione NGTable
                 */
                vm.downloadTable = new NgTableParams({
                    page: 1,
                    count: 5,
                }, {
                    enableRowSelection: true,
                    //number of element option to visualize for page
                    counts: [5, 10, 25, 50],
                    //get data : server side processing
                    getData: function(params) {

                        //count of element
                        var count = params.count();
                        //page
                        var page = params.page();

                        var order = [{
                            "property": "creationDate",
                            "direction": "DESC",
                        }];

                        //enable loading spinner
                        vm.isLoading = true;

                        var obj = {
                            start: (page - 1) * count,
                            length: count,
                            search: "",
                            order: order,
                            filters: {}
                        }

                        //rendering data
                        var data = getData(obj).then(function(result) {
                            params.total(result.total);
                            vm.isLoading = false;
                            vm.data = result.data;
                            return result.data;
                        });

                        return data;
                    }
                });

                /**
                 * Funzione per recuperare i dati per popolare la NGTable 
                 */
                function getData(obj) {
                    var deferred = $q.defer();

                        httpServices.post(searchUrl, obj, function(data, success, error) {
                            if (success) {
                                deferred.resolve({
                                    data: data ? data.items : null,
                                    total: data ? data.total : 0,
                                });
                            } else {
                                vm.message = error;
                                vm.alertClass = "alert alert-danger";
                            }
                        });
                   
                    return deferred.promise;
                };

                vm.goBack = function( ){
					if( $rootScope.goBack ){
						$state.go( $rootScope.goBack );
					}else{
						$window.history.back();
					}
                };

                /**
				 * Download files function
				 */
				vm.downloadFiles = function(){
					
					var alert = {
						   		title:  $translate.instant('ARE_YOU_SURE'),
								text: 	$translate.instant('DOWNLOAD_N_FILE') + vm.filesToDownload.length + " files",	
						   		type: "warning",
						   		showCancelButton: true,
						   		confirmButtonColor: "#337ab7",
						   		confirmButtonText: $translate.instant('YES'),
						   		cancelButtonText: $translate.instant('NO'),
						   		closeOnConfirm: true,
						   		closeOnCancel: true, 
					 };
					 
					SweetAlert.swal(alert, function( isConfirm ){
						if (isConfirm) {
				            if (vm.filesToDownload.length > 0){
										
                                var params = "";					
								
				            	for (var i = 0; i < vm.filesToDownload.length; i++) {		            	
                                    if (i<vm.filesToDownload.length-1) {
                                        params=params+vm.filesToDownload[i].id+",";
                                    } else {
                                        params=params+vm.filesToDownload[i].id;
                                    }
                                }
				            	var redirectUrl = downloadAllUrl + params;
								//download and open in new TAB
				            	$window.open(redirectUrl, '_blank');
                                //$window.location.href = redirectUrl;
									
				            }
						}
					});
				};

                /**
				 * select entity to sign
				 */
		        // This executes when entity in table is checked
		        $scope.selectEntity = function (entity) {	        	 		            
		            if (entity.isChecked){
			            //If not the check the "allItemsSelected" checkbox
			            vm.allItemsSelected = true;
			            
		            	vm.filesToDownload.push(entity);
		            }else{
		            	var index = vm.filesToDownload.indexOf(entity);
		            	if (index > -1) {
		            		vm.filesToDownload.splice(index, 1);
		            	}		            	
		            }
		            
		            if (vm.filesToDownload.length === 0){
		            	vm.allItemsSelected = false;
		            }
		            
		        };
                
                /**
		         * select all entities to sign
		         */
		        // This executes when checkbox in table header is checked
		        $scope.selectAll = function () {
		            // Loop through all the entities and set their isChecked property
		            for (var i = 0; i < vm.data.length; i++) {
		            	vm.data[i].isChecked = vm.allItemsSelected;
		            	
		            	if (vm.allItemsSelected){
		            		vm.filesToDownload.push(vm.data[i]);
		            	}else{
		            		vm.filesToDownload = [];
		            	}
		            }
		        };

            }
        ]);
})();