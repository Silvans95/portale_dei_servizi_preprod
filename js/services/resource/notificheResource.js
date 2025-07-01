(function() {

	'use strict';

	angular
		.module('portalApp')
		.factory('NotificheResource', notificheResource)
		.$inject = ['$resource', 'PropertiesService'];

		function notificheResource($resource, PropertiesService){
            var context = "notifiche/";
            var baseUrl = PropertiesService.get("baseUrl");
            var nesAdapterUrl = PropertiesService.get("notificheLegacyNas");
            var codApp = localStorage.getItem("codiceApplicazione");

			return $resource(baseUrl + context + ":id" , {id:'@id'}, {
                inserisciNotifica: {
                        url : baseUrl + context,
                        method: "POST"
                },
                leggiNotifica : {
                    url : nesAdapterUrl + codApp + "/" + context + ":id",
                    method : "GET"
                },
                getNotificheNonLette : {
                    url : nesAdapterUrl + codApp + "/" + context + "?letta=false",
                    method : "GET"
                },
                getNotificheNas : {
                    url : nesAdapterUrl + codApp + "/notifiche" ,
                    method : "GET"
                },
                getApplicazioniNas : {
                    url : nesAdapterUrl ,
                    method : "GET",
                    isArray: true
                }
            });
	    };

})();
