
(function () { 
    'use strict';
	angular.module('sphaApp')
	.factory( 'sphaOrphanServices', sphaOrphanServices)
    .$inject = ['$log', '$http', '$cookies', 'httpServices', 'PropertiesServiceSpha'];
	
    function sphaOrphanServices ( $log, $http, $cookies, httpServices, PropertiesServiceSpha) {
        const anagraphicMsBaseUrl = PropertiesServiceSpha.get('baseUrlAnagraphic');
        const detailUrl = anagraphicMsBaseUrl + 'api/orphans/detail';
        const getMassiveActionByUserUrl = anagraphicMsBaseUrl + 'api/orphans/actions';
        const getRectificationAddKeysUrl = anagraphicMsBaseUrl + 'api/orphans/aic6-object-identifiers';
        const dataVisibilityRule = anagraphicMsBaseUrl + 'api/data-visibility-rules';

        const services = {
            anagraphicName: 'ORPHAN',
            anagraphicType: 'ANAG_ORPHAN',
            tableType: 'FLUSSO_FARMACI',
            states: {
                search: 'spha.searchOrphan',
                view: 'spha.viewOrphan',
                submitRectification: 'spha.submitRectification'
            },
            searchUrl: anagraphicMsBaseUrl + 'api/orphans/list',
            searchWithRectificationsUrl: anagraphicMsBaseUrl +'api/orphans/list-with-rectifications/',
            exportCsvUrl: anagraphicMsBaseUrl +'api/orphans/export',
            exportXlsxMassiveUrl: anagraphicMsBaseUrl +'api/orphans/massive-export',
            exportPdfUrl: anagraphicMsBaseUrl + 'api/orphans/report',
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
            updateCookie('orphanId', controller.id);
            updateCookie('orphanCompanies', controller.companies ? JSON.stringify(controller.companies) : null);
            updateCookie('orphanDescription', controller.medicineDescription);
            updateCookie('orphanAic', controller.aic);
            updateCookie('orphanBoxDescription', controller.boxDescription);
            updateCookie('orphanFirstMarketingFrom', controller.firstMarketingFrom ? controller.firstMarketingFrom.toISOString() : null);
            updateCookie('orphanFirstMarketingTo', controller.firstMarketingTo ? controller.firstMarketingTo.toISOString() : null);
            updateCookie('orphanExpirationDate', controller.expirationDate ? controller.expirationDate.toISOString() : null);
            updateCookie('orphanEffectiveDate', controller.effectiveDate ? controller.effectiveDate.toISOString() : null);
            updateCookie('orphanReimbursementClass', controller.reimbursementClass ? JSON.stringify(controller.reimbursementClass) : null);
            updateCookie('orphanAtc', controller.atc ? JSON.stringify(controller.atc) : null);
            updateCookie('orphanTransparency', controller.transparency);
            updateCookie('orphanInnovative', controller.innovative);
            updateCookie('orphanPatented', controller.patented);
            updateCookie('orphanValidMarketingFrom', controller.validMarketingFrom ? controller.validMarketingFrom.toISOString() : null);
            updateCookie('orphanValidMarketingTo', controller.validMarketingTo ? controller.validMarketingTo.toISOString() : null);
        };
        
        services.getFiltersFromCookies = function(controller) {
            controller.id = $cookies.get('orphanId') ? $cookies.get('orphanId') : null;
            controller.medicineDescription = $cookies.get('orphanDescription') ? $cookies.get('orphanDescription') : null;
            controller.aic = $cookies.get('orphanAic') ? $cookies.get('orphanAic') : null;
            controller.boxDescription = $cookies.get('orphanBoxDescription') ? $cookies.get('orphanBoxDescription') : null;
            controller.firstMarketingFrom = $cookies.get('orphanFirstMarketingFrom') ? new Date($cookies.get('orphanFirstMarketingFrom')) : null;
            controller.firstMarketingTo = $cookies.get('orphanFirstMarketingTo') ? new Date($cookies.get('orphanFirstMarketingTo')) : null;
            controller.expirationDate = $cookies.get('orphanExpirationDate') ? new Date($cookies.get('orphanExpirationDate')) : null;
            controller.effectiveDate = $cookies.get('orphanEffectiveDate') ? new Date($cookies.get('orphanEffectiveDate')) : null;
            controller.transparency = $cookies.get('orphanTransparency') ? $cookies.get('orphanTransparency') === 'true' : null;
            controller.innovative = $cookies.get('orphanInnovative') ? $cookies.get('orphanInnovative') === 'true' : null;
            controller.patented = $cookies.get('orphanPatented') ? $cookies.get('orphanPatented') === 'true' : null;
            controller.orphan = true;
        };
        
        services.getFilters = function(controller) {
            if(controller.isRectificationAic6ADD || controller.isRectificationAic6DEL) {
                return {
                    validMarketingFrom: controller.validMarketingFrom ? controller.validMarketingFrom : null,
                    validMarketingTo: controller.validMarketingTo ? controller.validMarketingTo : null,
                    aic6In: controller.aic6ForRectification ? [controller.aic6ForRectification] : null,
                    allCompanies: controller.isRectificationAic6ADD === true,
                    companies: controller.companies && controller.isRectificationAic6ADD !== true ? controller.companies : undefined,
                    orphan: true
                };
            } else {
                return {
                    companies: controller.companies ? controller.companies : null,
                    medicineDescription: controller.medicineDescription ? controller.medicineDescription: null,
                    aic: controller.aic ? controller.aic : null,
                    boxDescription: controller.boxDescription ? controller.boxDescription : null,
                    firstMarketingFrom: controller.firstMarketingFrom ? controller.firstMarketingFrom : null,
                    firstMarketingTo: controller.firstMarketingTo ? controller.firstMarketingTo : null,
                    expirationDate: controller.expirationDate ? controller.expirationDate : null,
                    effectiveDate: controller.effectiveDate ? controller.effectiveDate : null,
                    reimbursementClass: controller.reimbursementClass != null && controller.reimbursementClass.length !== 0 ? controller.reimbursementClass : null,
                    atc: controller.atc != null && controller.atc.length !== 0 ? controller.atc : null,
                    transparency: controller.transparency != null ? controller.transparency : null,
                    orphan: true,
                    innovative: controller.innovative != null ? controller.innovative : null,
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
            controller.transparency = null;
            controller.innovative = null;
            controller.patented = null;
            controller.firstMarketingFrom = null;
        };
        
        return services;
	}
})();