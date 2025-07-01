(function () { 
 'use strict';
  angular.module( 'sphaApp' )
  .directive( 'editHistorySpha', ['$compile', '$q','$sce', '$document', 'httpServices', 'NgTableParams','$translate', '$filter',
	  						function( $compile, $q, $sce, $document, httpServices, NgTableParams, $translate, $filter ) {
	 return {
		 restrict: 'E',
		 templateUrl: 'modules/spha/js/directives/edit_history/editHistory.html',
		 scope:{
			 id:"=id",
			 url:"=url"
		 },
		 link: function( scope, el, attrs ){
			 var searchUrl = scope.url + scope.id + "/log";
			 scope.isCollapsed = true;
				
			/**
			 * function for showing the edits log for every log entry
			 */
			 scope.parseEditsLog = function ( fields, groups, ctaLog ){
					var strings = [];
					var string ="";
					if( fields ){
						for( var i in fields ){
							if( !excludedField( i ) ){
								string = differenceBetweenValue( fields[i], i, false );
						   		strings.push( string );
							}
						 }
					}
					strings = parseEditGroupsLog( groups, strings );
					if( ctaLog ) {
						if( ctaLog.fields ){
							for( var i in ctaLog.fields ){
								string = differenceBetweenValue( ctaLog.fields[i], i, false );
							   	strings.push( string );
							 }
						}
						strings = parseEditGroupsLog( ctaLog.groups, strings );
					}
					return strings;
				}
			 
			  function parseEditGroupsLog( groups, strings ){
				 var string = "";
				 if( groups ){
						for( var i in groups){
							if( groups[i] && groups[i].elements ){
								for( var j in groups[i].elements ){
									if( groups[i].elements[j].deleted == true ){
										string = $translate.instant('DELETED_GROUP') + " " + $translate.instant( i ) + " " + j; 
										strings.push( string );
									}else{
										if( groups[i].elements[j].id != null ){
											if( groups[i].elements[j] && groups[i].elements[j].fields ){
												for( var k in groups[i].elements[j].fields ){
													if( k == 'D_3_ACTIVE_SUBSTANCES' && groups[i].elements[j].fields[k].value &&  groups[i].elements[j].fields[k].value.length>0 ){
														strings = parseEditSubGroupsLog( groups[i].elements[j].fields[k].value, strings );
													}else{
														string = differenceBetweenValue( groups[i].elements[j].fields[k], k, false );
														strings.push( string );
													}
												}
											}
										}else{
											string = $translate.instant('ADDED_GROUP') + " " + $translate.instant( i ) + " " + j; 
											strings.push( string );
										}
									}
								}
							}
						}
					}
				 return strings;
			 	}
			 
			  	function parseEditSubGroupsLog( groups, strings ){
			  		var string = "";
			  		if( groups ){
						for( var i in groups){
							if( groups[i].deleted == true ){
								string = $translate.instant('DELETED_GROUP') + " " + $translate.instant( i ) + " " + j; 
								strings.push( string );
							}else{
								if( groups[i].fields ){
									for( var j in groups[i].fields ){
										string = differenceBetweenValue( groups[i].fields[j], j, true );
										strings.push( string );
									}
								}
							}
						}
			  		}
				 return strings;
			  	}
			  
			 	function differenceBetweenValue(field, i, skipModified){
			 		var string = "";
			 		if( field.modified || skipModified ){
			 			if( i.startsWith("DOC_") ){
			 				if( field.value && field.value.length > 0 ){
			 					for( var j in field.value ){
			 						var name = filesAdded ( field.previousValue, field.value[j] );
			 						if( name ){
			 							string += $translate.instant( 'FILE_ADDED' ) + name +". ";
			 						}
			 					}
			 				}
			 				if( field.previousValue && field.previousValue.length > 0 ){
			 					for( var k in field.previousValue ){
			 						var name = filesAdded ( field.value, field.previousValue[k] );
			 						if( name ){
			 							string += $translate.instant( 'FILE_REMOVED' ) + name +". ";
			 						}
			 					}
			 				}			 				
			 			}else{
					 		if ( field.previousValue && field.previousValue != field.value ) {
				   				string = $translate.instant( 'FIELD' ) + " '" + 
				   						 $translate.instant( i ) + "' -> " + 
				   						 $translate.instant( 'FROM' ) + " " + 
				   						 fieldFormatByType( field.type, field.previousValue) + " " +
				   						 $translate.instant( 'TO' ) + " " + 
				   						 fieldFormatByType( field.type, field.value);
				   			} else if( !field.previousValue && field.value != null ) {
				   				string = $translate.instant( 'FIELD_FIRST_EDIT' ) + " '" + 
				   						 $translate.instant( i ) + "' " + 
				   						 $translate.instant( 'TO' ) + " " + 
				   						 fieldFormatByType( field.type, field.value);
				   				
				   			} else if ( field.previousValue && field.previousValue == field.value ) {
				   				string = $translate.instant( 'FIELD' ) + " '" + 
				   						 $translate.instant( i ) + "' -> " + 
				   						 $translate.instant( 'FROM' ) + " " + 
				   						 fieldFormatByType( field.type, field.previousValue) + " " +
				   						 $translate.instant( 'TO' ) + " " + 
				   						 fieldFormatByType( field.type, field.value);
				   			} 
					 		
					 		
			 			}
			 		}
			 		return string;
			 	}
			 	
			 	function fieldFormatByType( type, value ){
			 		switch ( type ){
			 			case "LIST":
			 				return value;
			 			case "DATE":
			 				return $filter('date')(value, 'dd/MM/yyyy');
			 			case "BOOLEAN":
			 				return value == true ? $translate.instant( 'YES' ) : $translate.instant( 'NO' );
			 			case "BOOLEAN_1":
			 				return value == true ? $translate.instant( 'YES' ) : $translate.instant( 'NO' );
			 			case "BOOLEAN_2":
			 				return value == true ? $translate.instant( 'YES' ) : "NA";
			 			case "BOOLEAN_3":
			 				if( value == true ){
			 					return $translate.instant( 'YES' );
			 				} else if( value == false ){
			 					return $translate.instant( 'NO' );
			 				}else{
			 					return "NA";
			 				}
			 			case "STRING":
			 			case "INTEGER":
			 				if( value == null || value == undefined ){
			 					return "'null'"; 
			 				}else{
			 					return value;
			 				}
			 		}
			 	}
			 	

				/**
				 * Function for finding added/removed file in the relative field value
				 * returns the name of the file if was removed or added, or null if not
				 */
				 function filesAdded( previousFiles, file ){
					 if( previousFiles && previousFiles.length > 0 ){
					 	var previousIds = previousFiles.map(function(file) { return file.id } );
					 	if ( previousIds.indexOf( file.id ) < 0 ) {
					 			return file.filename;
					 	}else{
					 		return null;
					 	}
					 }else{
						 return file.filename;
					 }
				}
				 
				 
				function excludedField( field ){
					switch( field ){
						case "A_0_AIFA_MAPPER_REPORT":
						case "A_0_0_SUBMIT_DATE":
						case "A_0_1_AIFA_VALIDATION_DATE":
						case "A_0_1_1_AIFA_RICH_INT_VALID_DATE":
						case "A_0_1_2_AIFA_INT_VALID_DATE":
						case "A_0_1_3_AIFA_VALID_EXPIRY_DATE":
						case "A_0_1_4_AIFA_INT_VALID_EXPIRY_DATE":
						case "A_0_2_CEC_VALIDATION_DATE":
						case "A_0_2_1_CEC_RICH_INT_VALID_DATE":
						case "A_0_2_2_CEC_INT_VALID_DATE":
						case "A_0_2_3_CEC_VALID_EXPIRY_DATE":
						case "A_0_2_4_CEC_INT_VALID_EXPIRY_DATE":
						case "A_0_3_AIFA_VALUTATION_DATE":
						case "A_0_3_1_AIFA_RICH_INT_VALUT_DATE":
						case "A_0_3_2_AIFA_INT_VALUT_DATE":
						case "A_0_3_3_AIFA_VALUT_EXPIRY_DATE":
						case "A_0_3_4_AIFA_INT_VALUT_EXPIRY_DATE":
						case "A_0_4_CEC_PU_EMISSION_DATE":
						case "A_0_4_1_CEC_RICH_INT_PU_DATE":
						case "A_0_4_2_CEC_INT_PU_DATE":
						case "A_0_4_3_CEC_PU_EXPIRY_DATE":
						case "A_0_4_4_CEC_INT_PU_EXPIRY_DATE":
						case "A_0_5_CEC_VALUTATION_DATE":
						case "A_0_4_1_AIFA_RICH_INT_PU_DATE":
						case "A_0_4_2_AIFA_INT_PU_DATE":
						case "A_0_4_3_AIFA_PU_EXPIRY_DATE":
						case "A_0_4_4_AIFA_INT_PU_EXPIRY_DATE":
						case "CTA_APPLICANT":
						case "A_SECTION_A_FIELD":
						case "B_SECTION_B_FIELD":
						case "C_SECTION_C_FIELD":
						case "D_SECTION_D_FIELD":
						case "D8_SECTION_D8_FIELD":
						case "D9_SECTION_D9_FIELD":
						case "E_SECTION_E_FIELD":
						case "F_SECTION_F_FIELD":
						case "G_SECTION_G_FIELD":
						case "H_SECTION_H_FIELD":
						case "I_SECTION_FILE_FIELD":
							return true;
						default:
							return false;
					}
				}
				 
				/**
				 * Inizializzazione NGTable
				 */
				scope.editHistoryTable = new NgTableParams({
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