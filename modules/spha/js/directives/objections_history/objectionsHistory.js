(function () { 
 'use strict';
angular.module( 'sphaApp' )
  .directive( 'objectionsHistory', ['$compile', '$q','$sce', '$document', 'httpServices', 'loadingSpinnerService', 'NgTableParams','$translate',
	  						function( $compile, $q, $sce, $document, httpServices, loadingSpinnerService, NgTableParams, $translate ) {
	 return {
		 restrict: 'E',
		 templateUrl: 'modules/spha/js/directives/objections_history/objectionsHistory.html',
		 scope:{
			 id:"=id",
			 url:"=url"
		 },
		 link: function( scope, el, attrs ){
			 var searchUrl = scope.url + scope.id + "/objections";
			 
			 scope.isLoading = false;
			 scope.isCollapsed = true;
			 
		   /**
		    * loading spinner
		    */
			var loading = $compile( angular.element( loadingSpinnerService.loadingSpinner() ) )( scope );
			var el = $document.find( "#loadingSpinnerRow" );
			el.append( loading );
				
				
			/**
			 * function for showing the edits log
			 * for every log entry
			 */
			 scope.parseEditsLog = function ( fields, groups ){
					var strings = [];
					var string ="";
					if( fields ){
						for( var i in fields ){
							string = differenceBetweenValue( fields[i], i );
						   	strings.push( string );
						   	if( fields[i].backendId.indexOf( "DOC_" ) > -1  ){
						   		parseEditFilesLog( fields[i].value, strings, fields[i].backendId );
						   	}
						 }
					}
					
					strings = parseEditGroupsLog( groups, strings );
					
					return strings;
			 }
			 
			  function parseEditGroupsLog ( groups, strings ){
				 var string ="";
				 if( groups ){
						for( var i in groups){
							if( groups[i] && groups[i].elements ){
								for( var j in groups[i].elements ){
									if( groups[i].elements[j] && groups[i].elements[j].fields ){
										for( var k in groups[i].elements[j].fields ){
										 string = differenceBetweenValue( groups[i].elements[j].fields[k], k );
										 strings.push( string );
										}
									}
								}
							}
						}
					}
				 return strings;
			   }
			  
			  
			  	function parseEditFilesLog( files, strings, area ){
			  		if( files && files.length>0 ){
			  			angular.forEach( files, function( file, index ){
			  				var string = filesModifyRequest(area, file);
			  				strings.push( string );
			  			});
			  		}
			  	} 
			  
			  
			 
			 	function differenceBetweenValue(field, i){
			 		var string ="";
			 		if( field ){
				 		if (field.modifyRequestedCause) {
			   				string = $translate.instant( 'FIELD' ) + " " + 
			   				$translate.instant( i ) + " " + 
			   				$translate.instant( 'CAUSE' ) + " " + field.modifyRequestedCause;
				 		}
			 		}
			 		return string;
			 	}
			 	
			 

				/**
				 * function for finding added file in the relative field value
				 * returns the index of the added file in the actualFiles array
				 */
				 function filesModifyRequest( area, file ){
					 var string ="";
					 if( file && area && file.modifyRequestedCause ){
						 string = $translate.instant( area ) + "->" +  $translate.instant( file.documentArea ) + "->" + 
						 		  $translate.instant( file.documentTypeCode ) + "->" + file.filename + "    " + 
						 		  $translate.instant( 'CAUSE' ) + " " + file.modifyRequestedCause;
					 }
					 return string;
				 }
				 
				/**
				 * Inizializzazione NGTable
				 * 
				 */
				scope.objectionsHistoryTable = new NgTableParams({
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