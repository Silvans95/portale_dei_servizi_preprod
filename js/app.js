(function() {
    'use strict';

    angular
        .module('portalApp', ['ui.router', 'oc.lazyLoad', 'headerApp', 'notificheApp',  'menuApp',
            'fetApp', 'ngCookies', 'ngResource', 'ncy-angular-breadcrumb', 'ui.bootstrap', 'ui.select', 'ngSanitize', 'angular.filter', 'smart-table', 'ngFileUpload',
            'pascalprecht.translate', 'ngStorage', 'ngAnimate', 'ngTouch', 'tmh.dynamicLocale', 'sphaApp'
        ], configPortalApp)
        .$inject = ['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$httpProvider', '$breadcrumbProvider', '$translateProvider', 'uibPaginationConfig'];


    function loadTextFileAjaxSync(filePath, mimeType) {

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", filePath, false);
        if (mimeType != null) {
            if (xmlhttp.overrideMimeType) {
                xmlhttp.overrideMimeType(mimeType);
            }


        }
        xmlhttp.send();
        if (xmlhttp.status == 200) {
            return xmlhttp.responseText;
        } else {
            return null;
        }

    }

    function configPortalApp($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $httpProvider, $breadcrumbProvider, $translateProvider, uibPaginationConfig, $provide) {

    
        $httpProvider.defaults.cache = false;
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
  
        $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';


        uibPaginationConfig.previousText = "Precedente";
        uibPaginationConfig.nextText = "Successivo";

        $httpProvider.defaults.withCredentials = true;
        $httpProvider.interceptors.push("errorInterceptor");

        var IT_JSON = JSON.parse(loadTextFileAjaxSync("i18n/it.json", "application/json"));
        var EN_JSON = JSON.parse(loadTextFileAjaxSync("i18n/en.json", "application/json"));

        $translateProvider
            .translations('en', EN_JSON)
            .translations('it', IT_JSON);

        $translateProvider.useSanitizeValueStrategy('sanitizeParameters');

        $translateProvider.preferredLanguage('it');

        $stateProvider

            .state('login', {
            url: '/login',
            templateUrl: './html/login.html',
            controller: 'loginCtrl'
        })


        .state('fet', {
            url : '/fet',
            templateUrl : 'modules/fet/html/templateCollapsibleMenu.html',
            controller : function ($scope, $rootScope) {
              $scope.applicationTitle = "FET";
              $rootScope.currentApp = "FET"
            },
            abstract: true
        })

        .state('spha', {
			url : '/spha',
			templateUrl : 'modules/spha/html/templateCollapsibleMenu.html',
			controller : function ($scope, $rootScope) {
				$scope.applicationTitle = "SPHA";
				$rootScope.currentApp = "SPHA"
			},
			abstract: true
		})
        .state('notifiche', {
            url: '/notifiche',
            templateUrl: './html/template.html',
            controller: function($rootScope, $scope) {
                $scope.applicationTitle = "Notifiche";
                $rootScope.currentApp = "NTF"
            },
            abstract: true
        })

        .state('unauthorized', {
                url: '/unauthorized',
                templateUrl: './html/unauthorized.html',
                controller: function($rootScope, $scope) {
                    $scope.applicationTitle = "Non autorizzato";
                },
            })
            .state('404', {
                url: '/404',
                templateUrl: './html/404.html',
                controller: function($rootScope, $scope) {
                    $scope.applicationTitle = "Pagina non trovata";
                },
            });

        $urlRouterProvider.otherwise(function($injector) {
            $injector.invoke(['$state', function($state) {
                if (location.hash == '' || location.hash == '/')
                    $state.go('dashboard.home');
                else
                    $state.go('404', {}, {
                        location: false
                    });
            }]);
        });

        $ocLazyLoadProvider.config({

            loadedModules: ['portalApp']
        });

        $breadcrumbProvider.setOptions({
            templateUrl: 'html/breadcrumb.html'
        });



        $provide.decorator("$exceptionHandler", ['$delegate', '$window', 'stacktraceService', 'PropertiesService',
            function($delegate, $window, stacktraceService, PropertiesService) {
                return function(exception, cause) {
                    $delegate(exception, cause);
                    var stacktrace = stacktraceService.print($window, exception);

                    var clientSideErrorInfo = {
                        cause: cause || '',
                        message: exception.message,
                        url: $window.location.href,
                        stacktrace: stacktrace.join('\n')
                    };

                    var json = JSON.stringify(clientSideErrorInfo);

                    var baseUrl = PropertiesService.get("baseUrl");

                    $.ajax({
                        url: baseUrl + 'logger/rest/log/',
                        method: "POST",
                        data: JSON.stringify(clientSideErrorInfo),
                        headers: { 'Content-Type': 'application/json' }
                    })
                };
            }
        ]);

    };

    angular
        .module('portalApp')
        .run(['$rootScope', '$state', 'AccessManager', 'UserProfile', 'PortalService', 'AnagraficaResource','$ocLazyLoad', '$http', 'PropertiesService', '$translate', '$cookies',
            function($rootScope, $state, AccessManager, UserProfile, PortalService, AnagraficaResource,$ocLazyLoad, $http, PropertiesService, $translate, $cookies) {

                $http.defaults.headers.common['ruoloOperativo'] = "";

                $ocLazyLoad.load({
                    name: 'menuApp',
                    files: ['modules/menu/js/menuApp.js', 'modules/menu/js/controller/menuCtrl.js']
                });

                $ocLazyLoad.load({
                    name: 'notificheApp',
                    files: ['modules/notifiche/js/notificheApp.js']
                });


                $ocLazyLoad.load ([{
                name: 'menuApp',
                files: [
                  'modules/menu/js/menuApp.js',
                  'modules/menu/js/controller/menuCtrl.js'
                  ],
                serie:true,
                },{
                  name : 'sphaApp',
                  files : [
                      'modules/spha/js/sphaApp.js',
                  ],
                  serie:true,
              }
              ]);

                $ocLazyLoad.load({
                    name: 'fetApp',
                    files: [
                         'modules/fet/js/fetApp.js'
                    ],
                    serie:true
                });


                $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
                    if (error == AccessManager.UNAUTHORIZED) {
                        $state.go("unauthorized");
                    }
                });

               $rootScope.$watch("currentApp", function(newValue, oldValue) {
                	PortalService.getLink().$promise.then(function (data) {
                   	 var listaStati;
                        listaStati = data;
                        if (newValue != undefined && newValue != oldValue) {
                            PortalService.setUltimoAccessoApplicazione({
                                idApp: newValue
                            });
                            $rootScope.idProfiloCached = $rootScope.currentRole;
                            if ($cookies.get("profilo")) {
                                $rootScope.idProfiloCached = window.atob($cookies.get("profilo"));
                            }
                            $rootScope.vociMenu = PortalService.getVociMenu({
                                idApp: $rootScope.currentApp,
                                idProfilo: $rootScope.idProfiloCached
                            });

                        }
                    });
                });   

                $rootScope.$watch($http.defaults.headers.common['ruoloOperativo'], function(newValue, oldValue) {
                    if (newValue == undefined || newValue == '') {
                        if ($cookies.get("profilo")) {
                            $http.defaults.headers.common['ruoloOperativo'] = $cookies.get("profilo");
                        }
                    }
                });

                $rootScope.currentRole = "All";

				var listaStati;
				PortalService.getLink().$promise.then(function(data) {
					listaStati = data;
				});

        $rootScope.doChangeApp = function(idApp, idProfilo, organizzazione) {


        $rootScope.setManualeDownloadUrl(idApp);

        if (listaStati[idApp]) {

            if (listaStati[idApp].href) {
               PortalService.setUltimoAccessoApplicazione({idApp: idApp});
               if(listaStati[idApp].openTab){
                  window.open(listaStati[idApp].href);
               }else{
                window.open(listaStati[idApp].href, "_self");
               }
            } else if (listaStati[idApp].sref) {
              try {
                $state.go(listaStati[idApp].sref);
              } catch (e) {
                $state.go('404');
              }
            }


        }

      };

                $rootScope.changeLanguage = function(lang) {
                    $translate.use(lang.toLowerCase());
                };

                $rootScope.setManualeDownloadUrl = function(idApp) {
                    var baseUrl = PropertiesService.get("manuali-baseUrl");
                    UserProfile.then(function(user) {
						if(idApp == 'FET'){
	                            $rootScope.downloadUrl = baseUrl+"FirmaTrasversaleElettronicaManualeUsoV1.0.pdf";
                        } else if(idApp == 'SPHA'){
                            $rootScope.downloadUrl = baseUrl+"SPHA - Manuale utente.pdf";
                    }else {
                            $rootScope.downloadUrl = "";
                    }
                    });



                }


            }
        ]);


})();
