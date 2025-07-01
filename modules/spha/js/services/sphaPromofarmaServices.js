
(function () { 
 'use strict';
	angular.module('sphaApp')
	.factory( 'sphaPromofarmaServices', ['$log', '$http', 'httpServices', 'sphaCompanyServices' ,'PropertiesServiceSpha', '$q',
        function ( $log, $http, httpServices, sphaCompanyServices, PropertiesServiceSpha, $q ) {
			var services = {};
			var anagraphicMsBaseUrl = PropertiesServiceSpha.get("baseUrlAnagraphic");
			var dataVisibilityRule = anagraphicMsBaseUrl + "api/data-visibility-rules";

			const SLASH_ARG = "/{0}"

			/**
			 * Function for cloning object 
			 * Used for object with multeplicity
			 * 
			 * @param object
			 * @return cloned object
			 */
			services.cloneObject = function( object ){
				var obj = {};
				obj = angular.merge(obj, object);
				return obj;
			}

			var stringFormat = function(format) {
				var args = Array.prototype.slice.call(arguments, 1);
				return format.replace(/{(\d+)}/g, function(match, number) { 
				  return typeof args[number] != 'undefined'
					? args[number] 
					: match
				  ;
				});
			  };

			/**
			 * Converts Date received from Backend
			 * to a Date object suitable to be displayed
			 * in frontend Date component
			 * @param beDate Date in String format received from BE
			 */
			services.serverToClientDate = function ( beDate ){
				if (beDate) {
					return new Date(beDate);
				}
				return null;
			};

			/**
			 * Converts Date from Frontend
			 * to a String object suitable for the Beckend
			 * @param feDate Date in Date format received from FE
			 */
			services.clientToServerDate = function ( feDate ){
				return feDate.toISOString();
			};

			/**
			 * Function for add class to fields in section 
			 * 
			 * @param idField
			 * @param data
			 * @param form
			 */
			services.addFieldClass = function( idField, data, form ){
				if( data && data[idField] && form && form[idField] && form[idField].$invalid ){
					return 'has-errors';
				}
				return fieldHasBeenModified( idField, data );
		   } 

			/**
			 * Function for fields that has been previously modified inside a section
			 * 
			 * @param idField
			 * @param data 
			 */
			function fieldHasBeenModified( idField, data ){
				if( data && data[idField] && data[idField].edited == true ){
					$('#'+idField).closest('.col-xs-12').addClass('hasBeenModified');
				} else {
					$('#'+idField).closest('.col-xs-12').removeClass('hasBeenModified');
				}
				return null;
			}
			
            /**
             * Get Massive action by user 
             * 
             */
            services.getMassiveActionByUser  = function (getMassiveActionByUserUrl,callback) {
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
			
			services.getDataVisibilityRule = function (dataType, callback) {
                const body = {dataType: {equals: dataType}};
                
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