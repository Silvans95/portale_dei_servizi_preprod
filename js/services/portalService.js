(function() {

	'use strict';

	angular
		.module('portalApp')
		.factory('PortalService', portalService)
		.$inject = ['$resource', 'PropertiesService'];

		function portalService($resource, PropertiesService){

            var context = "portalservices/";
            var baseUrl = PropertiesService.get("baseUrl");


			return $resource(baseUrl + context, {idApp: '@idApp', idProfilo: '@idProfilo'}, {

                getTipologiaRichiesta : {
                    url : baseUrl + context + "tipologiarichiesta",
                    method : "GET",
                    isArray: true
                },
				getNotificheLivello : {
                    url: baseUrl + context + "notifichelivello",
                    method : "GET",
                    isArray: true
                },
				getNotificheTipoCanale : {
                    url: baseUrl + context + "notifichetipocanale",
                    method : "GET",
                    isArray: true
                },
				getNotificheTipoCriterio : {
										url: baseUrl + context + "notifichetipocriterio",
										method : "GET",
										isArray: true
				},
				getNotificheAppCriterio : {
										url: baseUrl + context + "notificheapplicazionecriterio",
										method : "GET",
										isArray: true
				},
				getNotificheRuoloCriterio : {
										url: baseUrl + context + "notificheruolocriterio",
										method : "GET",
										isArray: true
				},
				getUltimoAccessoApplicazione : {
                    url: baseUrl + context + "ultimoaccesso/:idApp",
                    method : "GET"
                },
				setUltimoAccessoApplicazione : {
                    url: baseUrl + context + "ultimoaccesso/:idApp",
                    method : "POST"
                },
                getVociMenu : {
                    url: baseUrl + context + "vocimenu/:idApp/:idProfilo",
                    method : "GET",
                    isArray: true
                },
                getLink : {
                    url: baseUrl + context + "applicazioni/link",
                    method : "GET"
                },
								getAuthenticationLevel : {
									url: baseUrl + context + "auth/level",
									method : "GET"
								}
            });
	    };

})();
