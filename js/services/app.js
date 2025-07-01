(function() {
  'use strict';

  angular
    .module('portalApp', ['ui.router', 'oc.lazyLoad', 'headerApp', 'faqApp', 'dashboardApp', 'carenzeApp', 'notificheApp', 'whdApp', 'menuApp', 'imsApp','osscApp',
      'ngCookies', 'ngResource', 'ncy-angular-breadcrumb', 'ui.bootstrap', 'ui.select', 'ngSanitize', 'angular.filter', 'smart-table', 'ngFileUpload',
      'pascalprecht.translate'
    ], configPortalApp)
    .$inject = ['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$httpProvider', '$breadcrumbProvider', '$translateProvider', 'uibPaginationConfig'];

//Load text with Ajax synchronously: takes path to file and optional MIME type
  function loadTextFileAjaxSync(filePath, mimeType)
  {

    var xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET",filePath,false);
    if (mimeType != null) {
      if (xmlhttp.overrideMimeType) {
        xmlhttp.overrideMimeType(mimeType);
      }


    }
    xmlhttp.send();
    if (xmlhttp.status==200)
    {
      return xmlhttp.responseText;
    }
    else {
      return null;
    }

  }

  function configPortalApp($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $httpProvider, $breadcrumbProvider, $translateProvider, uibPaginationConfig, $provide) {

    //Modifiche del caching del browser IE
    $httpProvider.defaults.cache = false;
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    // disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
    //Fine Modifiche caching

    uibPaginationConfig.previousText ="Precedente";
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

    // HOME STATES AND NESTED VIEWS ========================================
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: './html/dashboard-template.html',
      controller: function($scope, $rootScope) {
        $rootScope.currentApp = "DHB"
      },
      abstract: true
    })

    .state('carenze', {
      url: '/carenze',
      templateUrl: './html/template.html',
      controller: function($scope, $rootScope) {
        $scope.applicationTitle = "Carenze";
        $rootScope.currentApp = "CAR"
      },
      abstract: true
    })

    .state('ims', {
      url: '/ims',
      templateUrl: './html/template.html',
      controller: function($scope, $rootScope) {
        $scope.applicationTitle = "Informazione Medico Scientifica";
        $rootScope.currentApp = "IMS"
      },
      abstract: true
    })
	
	.state('ossc', {
        url: '/ossc',
        templateUrl: './modules/ossc/html/templateCollapsibleMenu.html',
        controller: function ($scope, $rootScope) {
          $scope.applicationTitle = "OSSC";
          $rootScope.currentApp = "OSSC"
        },
        abstract: true
      })

    .state('faq', {
      url: '/faq',
      templateUrl: './html/template.html',
      controller: function($scope, $rootScope) {
        $scope.applicationTitle = "FAQ - Frequently Asked Questions";
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

    .state('whd', {
      url: '/web_help_desk',
      templateUrl: './html/template.html',
      controller: function($rootScope, $scope) {
        $scope.applicationTitle = "Web Helpdesk";
        $rootScope.currentApp = "WHD"
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
      //events: true,
      //debug: true,
      loadedModules: ['portalApp']
    });

    $breadcrumbProvider.setOptions({
      templateUrl: 'html/breadcrumb.html'
    });


    //logger

    $provide.decorator("$exceptionHandler", ['$delegate','$window','stacktraceService', 'PropertiesService',
                                             function($delegate, $window, stacktraceService, PropertiesService) {
        return function(exception, cause) {
            $delegate(exception, cause);
            var stacktrace = stacktraceService.print($window, exception);

            var clientSideErrorInfo={
            	cause: cause ||'',
            	message:exception.message,
            	url: $window.location.href,
            	stacktrace: stacktrace.join('\n')
            };

            var json = JSON.stringify(clientSideErrorInfo);

            var baseUrl = PropertiesService.get("baseUrl");

            $.ajax({
          	    url: baseUrl + 'logger/rest/log/',
          	    method: "POST",
          	    data: JSON.stringify(clientSideErrorInfo),
          	    headers: {'Content-Type': 'application/json'}
          	})
        };
    }]);

  };

  angular
    .module('portalApp')
    .run(['$rootScope', '$state', 'AccessManager', 'UserProfile', 'PortalService', '$ocLazyLoad', '$http', 'PropertiesService', '$translate','$cookies',
      function($rootScope, $state, AccessManager, UserProfile, PortalService, $ocLazyLoad, $http, PropertiesService, $translate, $cookies) {

        $http.defaults.headers.common['ruoloOperativo'] = "";

        //LOAD DIPENDENZE
        $ocLazyLoad.load({
          name: 'menuApp',
          files: ['modules/menu/js/menuApp.js', 'modules/menu/js/controller/menuCtrl.js']
        });
        $ocLazyLoad.load({
          name: 'carenzeApp',
          files: ['modules/carenze/js/carenzeApp.js']
        });
        $ocLazyLoad.load({
          name: 'notificheApp',
          files: ['modules/notifiche/js/notificheApp.js']
        });
        $ocLazyLoad.load({
          name: 'whdApp',
          files: ['modules/whd/js/whdApp.js']
        });
        //DIPEDENZA IMS
        $ocLazyLoad.load({
          name: 'imsApp',
          files: ['modules/ims/js/imsApp.js', 'modules/ims/js/controller/imsCtrl.js']
        });
		$ocLazyLoad.load({
	  name : 'osscApp',
	  files : [
	     'modules/ossc/js/osscApp.js',
	     'modules/ossc/js/services/propertiesServiceOssc.js',
	     'modules/ossc/js/services/uploadFilesServicesOssc.js',
	     'modules/ossc/js/services/shareDataServices.js'
	]
	});
        //APP NON AUTORIZZATA
        $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
          if (error == AccessManager.UNAUTHORIZED) {
            $state.go("unauthorized");
          }
        });

        //WATCH ULTIMO ACCESSO APPLICAZIONE
        $rootScope.$watch("currentApp", function(newValue, oldValue) {
          if (newValue != undefined && newValue != oldValue) {
            PortalService.setUltimoAccessoApplicazione({
              idApp: newValue
            });
            $rootScope.vociMenu = PortalService.getVociMenu({
              idApp: $rootScope.currentApp,
              idProfilo: $rootScope.currentRole
            });

            if($rootScope.currentApp != 'DHB') {

              PortalService.getLink().$promise.then(function(response) {
                if (response[$rootScope.currentApp].flagProfile && ($http.defaults.headers.common['ruoloOperativo'] == undefined || $http.defaults.headers.common['ruoloOperativo']  == '') ) {
                  $state.go('dashboard.profile',{codiceApplicazione: $rootScope.currentApp });
                }
              });

          }

          }
        });

        //WATCH HEADER RUOLO OPERATIVO VALORIZZATO DAI COOKIES
        $rootScope.$watch($http.defaults.headers.common['ruoloOperativo'] , function(newValue, oldValue) {
          if (newValue == undefined || newValue == '') {
              if($cookies.get("profilo")) {
                $http.defaults.headers.common['ruoloOperativo'] = $cookies.get("profilo");
              }
          }
       });

        $rootScope.currentRole = "All";

        //CHANGE APPLICATION
        var listaStati = PortalService.getLink();

        $rootScope.doChangeApp = function(idApp,idProfilo) {
          if(idProfilo) {

            $rootScope.currentRole = idProfilo;
            var ruoloEncoded = window.btoa($rootScope.currentRole);
            $http.defaults.headers.common['ruoloOperativo'] = ruoloEncoded;
            $cookies.put("profilo", ruoloEncoded);
          }

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

        $rootScope.changeApp = function(idApp) {
          $http.defaults.headers.common['ruoloOperativo'] = '';
          $cookies.remove("profilo");

          if (listaStati[idApp]) {
            if(listaStati[idApp].flagProfile) {
              $state.go('dashboard.profile',{codiceApplicazione: idApp });
            } else {
              $rootScope.doChangeApp(idApp,'')
            }

          }

        };

        $rootScope.changeLanguage = function(lang) {
           $translate.use(lang);
        };

        $rootScope.setManualeDownloadUrl = function(idApp){
             var baseUrl = PropertiesService.get("manuali-baseUrl");
            UserProfile.then(function (user) {
                 if(idApp == 'CAR'){
                    if(user.$hasProfile('CAR_REF_AIFA')){
                        $rootScope.downloadUrl = baseUrl+"Carenze - Guida al servizio - AIFA.pdf";
                    } else if(user.$hasProfile('CAR_REF_AZIENDA')){
                        $rootScope.downloadUrl = baseUrl+"Carenze - Guida al servizio - AZIENDA.pdf";
                    } else if(user.$hasProfile('CAR_REF_OSMED')){
                        $rootScope.downloadUrl = baseUrl+"Carenze - Guida al servizio - OSMED.pdf";
                    }
                  }else if(idApp == 'WHD'){
                        $rootScope.downloadUrl = baseUrl+"WebHelpDesk - Guida al servizio.pdf";
                  }else if(idApp == 'IMS'){
                        if(user.$hasOneProfile(['IMS_AZIENDA', 'IMS_SCHEDA_AZIENDA'])){
                            $rootScope.downloadUrl = baseUrl+"IMS - Guida al servizio - Utente Azienda.pdf";
                        } else if(user.$hasOneProfile(['IMS_AIFA_AMM','IMS_AIFA_TEC', 'IMS_AIFA_SUPER'])){
                            $rootScope.downloadUrl = baseUrl+"IMS - Guida al servizio - Utente Interno.pdf";
                        } else if(user.$hasProfile('IMS_CITTADINO')){
                            $rootScope.downloadUrl = baseUrl+"IMS - Guida al servizio - Utente Cittadino.pdf";
                        }
                  }
                  else{
                    $rootScope.downloadUrl = "";
                  }
              });



        }


      }
    ]);


})();
