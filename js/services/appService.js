(function() {

	'use strict';

	angular
		.module('portalApp')
		.factory('AppService', AppService)
		.$inject = [];

		function AppService(){

            var currentApp = null;

			return {
                getApp : function (){
                    return currentApp;
                },
                setApp : function (app){
                    currentApp = app;
                }
            };
	    };

})();
