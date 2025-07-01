
(function () { 
 'use strict';
	angular.module('cityServicesSpha', [])
		
	.factory('cityServicesSpha', ['$http', '$cookies', function( $http, $cookies ){
		var service = { };
		
		
		function compare( a, b ) {
		  if (a.label < b.label){
		    return -1;
		  }
		  else if (a.label > b.label){
		    return 1;
		  }else{
			  return 0;
		  }
		}
		
		/**
		 * Filter object by lacale
		 * 
		 * @param array of object to filter
		 * @param lang locale
		 * @return objects filtered
		 */
		function filterByLocale(array, lang ){
			var resultsWithLocale = [];
			var resultsWithDefaultLocale = []; 
			for( var i in array ){
				if( array[i].language_code == lang.toUpperCase() ){
					resultsWithLocale.push( array[i] );
				}
				if( array[i].language_code == 'IT' ){
					resultsWithDefaultLocale.push( array[i] );
				}
			}
			//se non esitono elementi con quel locale 
			//restituisco il locale 'it' per default
			if( resultsWithLocale.length > 0){
				return resultsWithLocale;
			}else{
				return resultsWithDefaultLocale;
			}
			
			
		}
		
		/**
		 * Get countries from local json file.
		 * Returns all list of countries.
		 * (localized)
		 * 
		 * @param callback function
		 */
		service.getCountries = function ( callback ){
			var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
			 $http.get( 'modules/spha/json/country.json').then( function ( result ) {
				 	if( result.status == 200  ){
				 		var countries = [];
				 		for( var i in result.data ){
				 				result.data[i].object = String(result.data[i].object);
				 				countries.push( result.data[i] );
				 		}
				 		countries = filterByLocale( countries, locale );
				 		callback ( countries.sort( compare ) );
				 	}
	        });
		};
		
		/**
		 * Get EU Member States from local json file.
		 * Returns all list of EU Member States.
		 * (localized)
		 * 
		 * @param callback function
		 */
		service.getMemberStates = function ( callback ){
			var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
			 $http.get( 'modules/spha/json/eu.json').then( function ( result ) {
				 	if( result.status == 200  ){
				 		var memberState = [];
				 		for( var i in result.data ){
			 				result.data[i].object = String(result.data[i].object);
				 			memberState.push( result.data[i] );
				 		}
				 		memberState = filterByLocale( memberState, locale );
				 		callback ( memberState.sort( compare ) );
				 	}
	        });
		};
		
		/**
		 * Get country  by countryName.
		 * (localized)
		 * 
		 * @param countryName name of the country
		 * @param callback function
		 */
		service.getCountryByCountryName = function ( countryName, callback ){
			var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
			service.getCountries (function ( result ){
				if( result ){
					for( var i in result){
						if( result[i].label.toLowerCase() == countryName.toLowerCase() ){
							callback ( result[i].object );
						}
					}
				}
			});
		};
		/**
		 * Get regions from local json file.
		 * (localized)
		 * 
		 * @param callback function
		 */
		service.getRegions = function ( callback ){
				service.getRegionsByCountryName( null, function ( response ){
					if( response ){
						callback( response );
					}
				});
		};
		
		/**
		 * Get regions from local json file by countryId.
		 * (localized)
		 * 
		 * @param countryId id of the country
		 * @param callback function
		 */
		service.getRegionsByCountryId = function ( countryId, callback ){
			var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
			$http.get( 'modules/spha/json/region.json').then( function ( result ) {
				if( result.status == 200  ){
					var regions = [];
					for( var i in result.data ){
						if( result.data[i].id_country == countryId ){
							result.data[i].object = String(result.data[i].object);
							regions.push( result.data[i] );
						}
					}
					regions = filterByLocale( regions, locale );
					callback ( regions.sort( compare ) );
				}
			});
		};
		
		/**
		 * Get regions from local json file
		 * finding country id searched by label
		 * 
		 * @param countryName id of the country 
		 * 		  if null default is "Italia" 
		 * @param callback function
		 */
		service.getRegionsByCountryName = function ( countryName, callback ){
			service.getCountries ( function ( response ){
				if( response ){
					var country = countryName ? countryName : "Italia";
					var countryId = null;
					for( var i in response ){
						if( response[i].label == country ){
							countryId = response[i].object;
							break;
						}
					}
					service.getRegionsByCountryId( countryId, function( regions ){
						if( regions ){
							callback( regions );
						}
					} );
				}
			});
		};
		
		/**
		 * Get provinces of a specific region
		 * from local json file. 
		 * (localized)  
		 * @param regionId id of the region
		 * @param callback function		 *
		 */
		service.getProvinces = function ( regionId ,callback ){
			var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
			$http.get( 'modules/spha/json/province.json').then( function ( result ) {
				if( result.status == 200  ){
					var provinces = [];
					for( var i in result.data ){
						if( result.data[i].id_region == regionId ){
							result.data[i].object = String(result.data[i].object);
							provinces.push( result.data[i] );
						}
					}
					provinces = filterByLocale( provinces, locale );
					callback ( provinces.sort( compare ) );
				}
			});
		};
		
		/**
		 * Get cities of a specific province 
		 * from local json file 
		 * (localized).
		 * 
		 * @param provinceId id of the province
		 * @param callback function
		 */
		service.getCities = function ( provinceId ,callback ){
			var locale = $cookies.get( 'lang' ) ? $cookies.get( 'lang' ) : 'it';
			$http.get( 'modules/spha/json/city.json').then( function ( result ) {
				if( result.status == 200  ){
					var cities = [];
					for( var i in result.data ){
						if( result.data[i].id_province == provinceId ){
							result.data[i].object = String(result.data[i].object);
							cities.push( result.data[i] );
						}
					}
					cities = filterByLocale( cities, locale );
					callback ( cities.sort( compare ) );
				}
			});
		};
		return service;
	}]);
	
})();
		 