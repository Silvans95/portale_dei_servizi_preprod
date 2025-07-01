(function() {
	
	'use strict';
	
	var app = angular.module('portalApp');
		
	app.factory('RequireTranslations', ['$translatePartialLoader', '$translate', '$cookies', function ($translatePartialLoader, $translate, $cookies) {
			return function (translationKey, application) {
				angular.forEach(arguments, function () {
					if (application && translationKey) {
						var part = "modules/" + application + "/i18n/" + translationKey;
						$translatePartialLoader.addPart(part);
					}
				});
				return $translate.refresh();
			};
		}]);
		//configure translate function
	 app.config(['$translateProvider', '$translatePartialLoaderProvider', 'tmhDynamicLocaleProvider',
				function ($translateProvider, $translatePartialLoaderProvider, tmhDynamicLocaleProvider) {
		 			$translatePartialLoaderProvider.addPart('i18n');
					$translatePartialLoaderProvider.addPart('modules/spha/i18n/common');
					$translateProvider
						.useSanitizeValueStrategy('sanitizeParameters')
						.fallbackLanguage('it')
						.useLoader('$translatePartialLoader', {
							urlTemplate : '{part}/{lang}.json'
						})
						.useLoaderCache(true)
						.determinePreferredLanguage()
						.preferredLanguage('it');
					tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}-{{ locale | uppercase}}.js');
	
				}
		]);
	 
	 app.run(['$rootScope', '$cookies','$translate', function ($rootScope, $cookies, $translate){
		 $rootScope.$watch( function (){
			 return $translate.use();
		 }, function (lang){
			 if( lang ){
				 $cookies.put( 'lang', lang, {path: '/'} );
			 }
		 } )
	 }]);
	

})();
