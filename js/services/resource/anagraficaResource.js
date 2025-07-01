(function() {

	'use strict';

	angular
		.module('portalApp')
		.factory('AnagraficaResource', anagraficaResource)
		.$inject = ['$resource', 'PropertiesService'];

		function anagraficaResource($resource, PropertiesService){

            var context = "abilitazioni";
            var baseUrl = PropertiesService.get("baseUrl");
			var newAbilitazioniURL = PropertiesService.get("newAbilitazioniURL");
			var gestioneAbilitazioniURL = PropertiesService.get("gestioneAbilitazioniURL");


			return $resource(baseUrl + context, {idApp: '@idApp'},{
                get : {
                    url : newAbilitazioniURL.trim() + 'anagrafica/',
                    method : "GET"
                },
				getListaApplicazioniAbilitate : {
                    url: newAbilitazioniURL,
                    method : "GET"
                },
				getListaRuoli : {
				            url: newAbilitazioniURL.trim() + 'profili/' + ':idApp',
										isArray: true,
				            method : "GET"
				        },
				getListaOrganizzazioni : {
								    url: newAbilitazioniURL.trim() + 'organizzazioni/' + ':idApp' + '/:idProfilo',
								     method : "GET"
								},
				getListaOrganizzazioniLdap : {
								    url: baseUrl + context + '/organizzazioni/' + ':idApp',
										method : "GET"
								},
				getUserInfo : {
					url: gestioneAbilitazioniURL + 'utente',
                    method : "GET"
				},
            });
	    };

})();
