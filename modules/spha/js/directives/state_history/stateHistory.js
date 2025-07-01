(function () { 
 'use strict';
angular.module( 'sphaApp' )
  .directive( 'stateHistorySpha', ['$compile', '$q', '$document', 'httpServices', 'loadingSpinnerService', 'NgTableParams','$translate','actionBpmnServices',
	  						function( $compile, $q, $document, httpServices, loadingSpinnerService, NgTableParams, $translate, actionBpmnServices ) {
	 var vm = this;
	 return {
		 restrict: 'E',
		 templateUrl: 'modules/spha/js/directives/state_history/stateHistory.html',
		 scope:{
			 id: "=id",
			 url:"=url",
		 },
		 link: function( scope, el, attrs ){
			 var searchUrl = scope.url + scope.id + "/state";
			 
			 
			 scope.isLoading = false;
			 
		  /**
		   * loading spinner
		   */
			var loading = $compile( angular.element( loadingSpinnerService.loadingSpinner() ) )( scope );
			var el = $document.find( "#loadingSpinnerRow" );
			el.append( loading );
			
			/**
			 * Inizializzazione NGTable
			 * 
			 */
			scope.stateHistoryTable = new NgTableParams({
					page : 1,
					count : 10,
					sorting: { bpmTaskEndTime: "desc" }
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
						scope.isLoading = true;
						
						
						//object for api rest
						var obj = {
							start : (page  - 1 ) * count,
							length : count,
							search : null,
							filters: {
								
							},
						};
						
						if (sortingKey) {
							obj.order = order;
						}

						//rendering data
						var data = getData( obj ).then(function ( result ) {
								params.total( result.total );
								scope.isLoading = false;
								if (result.endEvent) {
									scope.endEventId = $translate.instant("WORKFLOW_ENDED");
//									+ " " + $translate.instant(result.endEvent.bpmTaskDefinitionKey);
									scope.endIconPath = "modules/spha/icons/stop_sign-icon-128x128.png";
								}
								return result.data;
						});
						return data;
					}
				});
			
				/**
				 * Funzione per recuperare i dati per popolare la 
				 * NGTable 
				 */
				function getData( obj ) {
					var deferred = $q.defer();
		
					httpServices.post( searchUrl, obj, function ( data, success, error ) {
						if( success ){
							deferred.resolve({
								data : data.items,
								total : data.total,
								endEvent : data.endEvent
							});
						}else{
							scope.isLoading = false;
							scope.message = error;
							scope.alertClass = "alert alert-danger";
						}
					});
					return deferred.promise;
				}

			
		 }
	 };
  }]);
})();
  