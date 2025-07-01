
(function() {
	'use strict';
	angular
		.module('sphaApp')
		.factory( 'shareDataServices',['$cookies', function($cookies){
			var services ={};
			var sharedData = {};
			
			
			services.get = function( key ){
				if( sharedData.length > 0 && sharedData[key] && sharedData[key].length > 0 ){
					return sharedData[key];
				}else{
					return $cookies.getObject( 'sharedData' + key );
				}
			};
			
			services.set = function( data, key ){
				sharedData[key] = data;
				$cookies.putObject( 'sharedData' + key, data  );
			};
			
			services.delete = function( key ){
				$cookies.remove('sharedData' + key);
			};
			
			services.getLS = function( key ){
				if( sharedData.length > 0 && sharedData[key] && sharedData[key].length > 0 ){
					return sharedData[key];
				}else{
					return JSON.parse(localStorage.getItem( 'sharedData' + key ));
				}
			};
			
			services.setLS = function( data, key ){
				sharedData[key] = data;
				return localStorage.setItem( 'sharedData' + key , JSON.stringify(data));
			};
			
			services.deleteLS = function( key ){
				localStorage.removeItem(key);
			};
			
			 return services;		
		}] );
		
		
})();