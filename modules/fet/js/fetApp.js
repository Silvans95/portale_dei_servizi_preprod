(function() {

	angular
			.module(
					'fetApp',
					[ 'ui.router', 'ngTable', 'required', 'ckeditor',
							'xtForm', 'blockUI', 'ui.select', 'ui.utils.masks',
							'oitozero.ngSweetAlert', ], configFetApp)
			.run(
					[ '$templateCache', '$rootScope',
							function($templateCache, $rootScope) {
							} ])
			.config(
					[
							'xtFormConfigProvider',
							'blockUIConfig',
							function(xtFormConfigProvider, blockUIConfig) {

								/**
								 * BlockUI Active only for request with url
								 * contains "ossc-web" and "acc-web"
								 * 
								 */
								blockUIConfig.requestFilter = function(config) {
									// Perform a global, case-insensitive search
									// on the request url for 'noblockui' ...
									if (config.url.indexOf("ossc-web") > 0) {
										return true;
									} else if (config.url.indexOf("acc-web") > 0) {
										return true;
									} else {
										return false;
									}
								}

								/* OVERRIDE XTFORM PLUGIN SETTINGS */
								var errors = {
									minlength : "{{ 'MIN_LENGTH_MESSAGE' | translate}} {{ngMaxlength}}",
									maxlength : "{{ 'MAX_LENGTH_MESSAGE' | translate}} {{ngMinlength}}",
									required : "{{'REQUIRE_MESSAGE' | translate }}",
									number : "{{'NUMBER_MESSAGE' | translate }}",
									min : "{{ 'MIN_MESSAGE' | translate }} {{min}}",
									max : "{{ 'MAX_MESSAGE' | translate }} {{max}}",
									email : "{{'EMAIL_MESSAGE' | translate }}",
									pattern : "{{'PATTERN_MESSAGE' | translate }} {{ngPattern}}",
									url : "{{'URL_MESSAGE' | translate }}",
									date : "{{'DATE_MESSAGE' | translate }}",
									dateDisabled : "{{'DATE_MESSAGE' | translate }}",
									datetimelocal : "{{'DATE_MESSAGE' | translate }}",
									time : "{{'TIME_MESSAGE' | translate }}",
									week : "{{'WEEK_MESSAGE' | translate }}",
									month : "{{'MONTH_MESSAGE' | translate }}",
									$$server : "{{'SERVER_MESSAGE' | translate }}"
								};
								xtFormConfigProvider.setErrorMessages(errors);
								// Add custom validation strategy
								xtFormConfigProvider
										.addValidationStrategy(
												'customStrategy',
												function(form, ngModel) {
													return ngModel.$focused
															|| (form.$invalid && form.$submitted);
												});
								/* END OVERRIDE XTFORM */

							} ])

	.$inject = [ '$stateProvider' ];

	function configFetApp($stateProvider) {
		
		var moduleName = "fet";

		$stateProvider

				.state(
						'fet.home',
						{
							url : '/home',
							ncyBreadcrumb : {
								label : "{{'MENU.ROOT' | translate}}",
								parent : 'dashboard.home'
							},
							views : {
								'content' : {
									templateUrl : './modules/fet/html/fetHome.html',
									controller : 'fetHomeCtrl'
								},
								'menu' : {
									templateUrl : './modules/menu/html/menu.html',
									controller : 'menuCtrl'
								}
							},
							resolve : {
								translate : [ 'RequireTranslations',
									function(RequireTranslations) {
			        			RequireTranslations( "sign", moduleName );
									} ],
								'' : [
										'$ocLazyLoad',
										function($ocLazyLoad) {
											return $ocLazyLoad
													.load({
														name : '',
														files : [
																'modules/fet/js/controllers/fetHomeCtrl.js', ]
													});
										} ]
							}
						})

				.state(
						'fet.signStandAlone',
						{
							url : '/sign/standAlone',
							ncyBreadcrumb : {
								label : "{{'MENU.STANDALONE' | translate}}",
								parent : 'fet.home'
							},
							views : {
								'content' : {
									templateUrl : './modules/fet/html/sign/sign.html',
									controller : 'fetStandAloneSignCtrl'
								},
								'menu' : {
									templateUrl : './modules/menu/html/menu.html',
									controller : 'menuCtrl'
								}
							},
							resolve : {
								translate : [ 'RequireTranslations',
										function(RequireTranslations) {
				        			RequireTranslations( "sign", moduleName );
										} ],
								'' : [
										'$ocLazyLoad',
										function($ocLazyLoad) {
											return $ocLazyLoad
													.load({
														name : '',
														files : [
																'modules/fet/js/controllers/standAloneSign/fetStandAloneSignCtrl.js', ]
													});
										} ]
							}
						})
						

				.state(
						'fet.signSession',
						{
							url : '/sign/session/:sessionId',
							ncyBreadcrumb : {
								label : "{{'MENU.SESSION' | translate}}",
								parent : 'fet.home'
							},
							views : {
								'content' : {
									templateUrl : './modules/fet/html/sign/sign.html',
									controller : 'fetSessionSignCtrl'
								},
								'menu' : {
									templateUrl : './modules/menu/html/menu.html',
									controller : 'menuCtrl'
								}
							},
							resolve : {
								translate : [ 'RequireTranslations',
										function(RequireTranslations) {
				        			RequireTranslations( "sign", moduleName );
										} ],
								'' : [
										'$ocLazyLoad',
										function($ocLazyLoad) {
											return $ocLazyLoad
													.load({
														name : '',
														files : [
																'modules/fet/js/controllers/sessionSign/fetSessionSignCtrl.js', ]
													});
										} ]
							}
						});

	}

})();