(function () { 
 'use strict';
  angular.module( 'sphaApp' )
  .directive( 'historyDelegation', ['$compile', '$q','$sce', '$document', 'httpServices', 'NgTableParams','$translate', '$filter',
	  						function( $compile, $q, $sce, $document, httpServices, NgTableParams, $translate, $filter ) {
	 return {
		 restrict: 'E',
		 templateUrl: 'modules/spha/js/directives/history_delegation/historyDelegation.html',
		 scope:{
			 id:"=id",
			 url:"=url",
		 },
		 link: function( scope, el, attrs ){
			 var searchUrl = scope.url + scope.id +"/delegations";
			 
				/**
				 * Inizializzazione NGTable
				 */
				scope.historyDelegationTable = new NgTableParams({
						page : 1,
						count : 10,
						sorting:{
							lastModifiedDate: "desc",
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
								return result.data;
							});
							return data;
						}
					});
				
				
					/**
					 * Funzione per recuperare i dati per popolare la NGTable 
					 */
					function getData( obj ) {
						var deferred = $q.defer();
			
						httpServices.post( searchUrl, obj, function ( data, success, error ) {
							if( success ){
								deferred.resolve({
									data : data.items,
									total : data.total,
								});
							}else{
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