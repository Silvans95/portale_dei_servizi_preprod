
(function () { 
 'use strict';
	angular.module('sphaApp')
	.factory( 'sphaFfiServices', ['$log', '$http', 'httpServices' ,'PropertiesServiceSpha', '$q',
        function ( $log, $http, httpServices, PropertiesServiceSpha, $q ) {
			var services = {};
			var anagraphicMsBaseUrl = PropertiesServiceSpha.get("baseUrlAnagraphic");
			var getMassiveActionByUserUrl = anagraphicMsBaseUrl + "api/ffi/actions";
			var dataVisibilityRule = anagraphicMsBaseUrl + "api/data-visibility-rules";

            /**
             * Get Massive action by user 
             * 
             */
            services.getMassiveActionByUser  = function (callback) {
            	httpServices.get(getMassiveActionByUserUrl, function (data, success, error) {
            		var errors = {};
                    if (success && data) {
                        if (error) {
                            errors.message = error;
                            errors.alertClass = "alert alert-warning";
                        }
                    } else {
                        errors.message = error;
                        errors.alertClass = "alert alert-danger";
                    }
                    callback(data, errors);
            	});
            }
            
            function parseVisibilityRule(data) {
                var visibilityRule = {
                    fieldsToNotShow: null
                };
                if (data && Array.isArray(data) && data.length === 1 && data[0]["visibilityRule"] && data[0]["visibilityRule"]["fieldsToNotShow"]) {
                    if (data[0]["visibilityRule"]["fieldsToNotShow"] && data[0]["visibilityRule"]["fieldsToNotShow"].length > 0) {
                        visibilityRule.fieldsToNotShow = data[0]["visibilityRule"]["fieldsToNotShow"];
                    }
                    return visibilityRule;
                }
                return undefined;
            }
			
			services.getDataVisibilityRule = function (callback) {
                const body = {dataType: {equals: "FLOW_FFI"}};
                
                httpServices.post(dataVisibilityRule, body, function (data, success, error) {
                    var errors = {};
                    if (success && data) {
                        if (error) {
                            errors.message = error;
                            errors.alertClass = "alert alert-warning";
                        }
                    } else {
                        errors.message = error;
                        errors.alertClass = "alert alert-danger";
                    }
                    callback(parseVisibilityRule(data), errors);
                });
            }

			return services;
	}]);
})();