
(function () { 
    'use strict';
	angular.module('sphaApp')
	.factory( 'sphaInnovativeServices', sphaInnovativeServices)
    .$inject = ['$log', '$http', '$cookies', 'httpServices', 'PropertiesServiceSpha'];
	
	function sphaInnovativeServices ( $log, $http, $cookies, httpServices, PropertiesServiceSpha) {
        const anagraphicMsBaseUrl = PropertiesServiceSpha.get('baseUrlAnagraphic');
        const detailUrl = anagraphicMsBaseUrl + 'api/innovative/detail';
        const getMassiveActionByUserUrl = anagraphicMsBaseUrl + 'api/innovative/actions';
        const getRectificationAddKeysUrl = anagraphicMsBaseUrl + 'api/innovative/aic6-object-identifiers';
        const dataVisibilityRule = anagraphicMsBaseUrl + 'api/data-visibility-rules';
        
        const services = {
            anagraphicName: 'INNOVATIVE',
            anagraphicType: 'ANAG_INNOVATIVE',
            tableType: 'FLUSSO_FARMACI',
            states: {
                search: 'spha.searchInnovative',
                view: 'spha.viewInnovative',
                submitRectification: 'spha.submitRectification'
            },
            searchUrl: anagraphicMsBaseUrl + 'api/innovative/list',
            searchWithRectificationsUrl: anagraphicMsBaseUrl +'api/innovative/list-with-rectifications/',
            exportCsvUrl: anagraphicMsBaseUrl +'api/innovative/export',
            exportXlsxMassiveUrl: anagraphicMsBaseUrl +'api/innovative/massive-export',
            exportPdfUrl: anagraphicMsBaseUrl + 'api/innovative/report',
        };

        function parseVisibilityRule(data) {
            var visibilityRule = {
                fieldsToNotShow: null
            };
            if (data && Array.isArray(data) && data.length === 1 && data[0]['visibilityRule'] && data[0]['visibilityRule']['fieldsToNotShow']) {
                if (data[0]['visibilityRule']['fieldsToNotShow'] && data[0]['visibilityRule']['fieldsToNotShow'].length > 0) {
                    visibilityRule.fieldsToNotShow = data[0]['visibilityRule']['fieldsToNotShow'];
                }
                return visibilityRule;
            }
            return undefined;
        }
        
        function parseHttpServiceResponse(success, data, error) {
            var parsedResponse = {
                data: data,
                errors: null
            };
            if (success && data) {
                if (error) {
                    parsedResponse.errors = {};
                    parsedResponse.errors.message = error;
                    parsedResponse.errors.alertClass = 'alert alert-warning';
                }
                parsedResponse.data = data;
            } else {
                parsedResponse.errors = {};
                parsedResponse.errors.message = error;
                parsedResponse.errors.alertClass = 'alert alert-danger';
            }
            return parsedResponse;
        }
        
        function updateCookie(cookieName, cookieValue) {
            if (cookieValue) {
                $cookies.put(cookieName, cookieValue);
            } else {
                $cookies.remove(cookieName);
            }
        }

        services.getDateFields = function () {
            return [
                'effectiveDate',
                'expirationDate',
                'tscDate',
                'validMarketing'
            ];
        };
        
        /**
         * Get Massive action by user 
         * 
         */
        services.getMassiveActionByUser  = function (callback) {
            httpServices.get(getMassiveActionByUserUrl, function (data, success, error) {
                var parsedResponse = parseHttpServiceResponse(success, data, error);
                callback(parsedResponse.data, parsedResponse.errors);
            });
        };

        /**
         * Service for getting Orphan Detail
         * data.
         * Call rest services at specified url.
         * 
         * @callback function callback
         */
        services.getDetail = function ( detailInputParams, callback ) { 
            detailInputParams['order'] = [ {property:'validMarketing', direction:'DESC'}];
            httpServices.post(detailUrl, detailInputParams, function (data, success, error) {
                var parsedResponse = parseHttpServiceResponse(success, data, error);
                callback(parsedResponse.data, parsedResponse.errors);
            });
        };
        
        services.getDataVisibilityRule = function (callback) {
            const body = {dataType: {equals: services.anagraphicType}};
            
            httpServices.post(dataVisibilityRule, body, function (data, success, error) {
                var parsedResponse = parseHttpServiceResponse(success, data, error);
                callback(parseVisibilityRule(parsedResponse.data), parsedResponse.errors);
            });
        };

        services.getRectificationAddKeys = function (filters, callback) {
            httpServices.post(getRectificationAddKeysUrl, filters, function (data, success, error) {
                var parsedResponse = parseHttpServiceResponse(success, data, error);
                callback(parsedResponse.data, parsedResponse.errors);
            });
        };
        
        
        services.updateFiltersCookies = function(controller) {
            updateCookie('innovativeId', controller.id);
            updateCookie('innovativeCompanies', controller.companies ? JSON.stringify(controller.companies) : null);
            updateCookie('innovativeDescription', controller.medicineDescription);
            updateCookie('innovativeAic', controller.aic);
            updateCookie('innovativeBoxDescription', controller.boxDescription);
            updateCookie('innovativeFirstMarketingFrom', controller.firstMarketingFrom ? controller.firstMarketingFrom.toISOString() : null);
            updateCookie('innovativeFirstMarketingTo', controller.firstMarketingTo ? controller.firstMarketingTo.toISOString() : null);
            updateCookie('innovativeExpirationDate', controller.expirationDate ? controller.expirationDate.toISOString() : null);
            updateCookie('innovativeEffectiveDate', controller.effectiveDate ? controller.effectiveDate.toISOString() : null);
            updateCookie('innovativeReimbursementClass', controller.reimbursementClass ? JSON.stringify(controller.reimbursementClass) : null);
            updateCookie('innovativeAtc', controller.atc ? JSON.stringify(controller.atc) : null);
            updateCookie('innovationLevel', controller.innovationLevel);
            updateCookie('innovativeFundAccess', controller.fundAccess);
            updateCookie('innovativeFundType', controller.fundType);
            updateCookie('innovativeTransparency', controller.transparency);
            updateCookie('innovativeOrphan', controller.orphan);
            updateCookie('innovativePatented', controller.patented);
            updateCookie('innovativeValidMarketingFrom', controller.validMarketingFrom ? controller.validMarketingFrom.toISOString() : null);
            updateCookie('innovativeValidMarketingTo', controller.validMarketingTo ? controller.validMarketingTo.toISOString() : null);
        };
        
        services.getFiltersFromCookies = function(controller) {
            controller.id = $cookies.get('innovativeId') ? $cookies.get('innovativeId') : null;
            controller.medicineDescription = $cookies.get('innovativeDescription') ? $cookies.get('innovativeDescription') : null;
            controller.aic = $cookies.get('innovativeAic') ? $cookies.get('innovativeAic') : null;
            controller.boxDescription = $cookies.get('innovativeBoxDescription') ? $cookies.get('innovativeBoxDescription') : null;
            controller.firstMarketingFrom = $cookies.get('innovativeFirstMarketingFrom') ? new Date($cookies.get('innovativeFirstMarketingFrom')) : null;
            controller.firstMarketingTo = $cookies.get('innovativeFirstMarketingTo') ? new Date($cookies.get('innovativeFirstMarketingTo')) : null;
            controller.expirationDate = $cookies.get('innovativeExpirationDate') ? new Date($cookies.get('innovativeExpirationDate')) : null;
            controller.effectiveDate = $cookies.get('innovativeEffectiveDate') ? new Date($cookies.get('innovativeEffectiveDate')) : null;
            controller.innovationLevel = $cookies.get('innovationLevel') ? $cookies.get('innovationLevel') : null;
            controller.fundAccess = $cookies.get('innovatveFundAccess') ? $cookies.get('innovativeFundAccess') : null;
            controller.fundType = $cookies.get('innovatveFundType') ? $cookies.get('innovativeFundType') : null;
            controller.orphan = $cookies.get('innovatveOrphan') ? $cookies.get('innovatveOrphan') : null;
            controller.transparency = $cookies.get('innovatveTransparency') ? $cookies.get('innovatveTransparency') : null; 
            controller.patented = $cookies.get('innovatvePatented') ? $cookies.get('innovatvePatented') : null; 
            controller.innovative = true;
        };
        
        services.getFilters = function(controller) {
            if(controller.isRectificationAic6ADD || controller.isRectificationAic6DEL) {
                return {
                    validMarketingFrom: controller.validMarketingFrom ? controller.validMarketingFrom : null,
                    validMarketingTo: controller.validMarketingTo ? controller.validMarketingTo : null,
                    aic6In: controller.aic6ForRectification ? [controller.aic6ForRectification] : null,
                    allCompanies: controller.isRectificationAic6ADD === true,
                    companies: controller.companies && controller.isRectificationAic6ADD !== true ? controller.companies : undefined,
                    innovative: true
                };
            } else {
                return {
                    companies: controller.companies ? controller.companies : null,
                    medicineDescription: controller.medicineDescription ? controller.medicineDescription : null,
                    aic: controller.aic ? controller.aic : null,
                    boxDescription: controller.boxDescription ? controller.boxDescription : null,
                    firstMarketingFrom: controller.firstMarketingFrom ? controller.firstMarketingFrom : null,
                    firstMarketingTo: controller.firstMarketingTo ? controller.firstMarketingTo : null,
                    expirationDate: controller.expirationDate ? controller.expirationDate : null,
                    effectiveDate: controller.effectiveDate ? controller.effectiveDate : null,
                    reimbursementClass: controller.reimbursementClass != null && controller.reimbursementClass.length !== 0 ? controller.reimbursementClass : null,
                    atc: controller.atc != null && controller.atc.length !== 0 ? controller.atc : null,
                    transparency: controller.transparency != null ? controller.transparency : null,
                    orphan: controller.orphan != null ? controller.orphan : null,
                    fundType: controller.fundType,
                    fundAccess: controller.fundAccess ? controller.fundAccess : null,
                    innovationLevel: controller.innovationLevel ? controller.innovationLevel : null,
                    innovative: true,
                    patented: controller.patented != null ? controller.patented : null,
                    validMarketingFrom: controller.validMarketingFrom ? controller.validMarketingFrom : null,
                    validMarketingTo: controller.validMarketingTo ? controller.validMarketingTo : null,
                };
            }
        };
        
        services.resetFilters = function(controller) {
            controller.id = null;
            controller.medicineDescription = null;
            controller.aic = null;
            controller.boxDescription = null;
            controller.firstMarketingFrom = null;
            controller.firstMarketingTo = null;
            controller.expirationDate = null;
            controller.effectiveDate = null;
            controller.reimbursementClass = null;
            controller.atc = null;
            controller.innovationLevel = null;
            controller.fundAccess = null;
            controller.fundType = null;
            controller.orphan = null;
            controller.transparency = null;
            controller.patented = null;
        };

        return services;
	}
})();