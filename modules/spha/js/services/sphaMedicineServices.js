
(function () { 
    'use strict';
	angular.module('sphaApp')
	    .factory( 'sphaMedicineServices', sphaMedicineServices)
        .$inject = ['$log', '$http', '$cookies', 'httpServices','PropertiesServiceSpha'];
	
    function sphaMedicineServices( $log, $http, $cookies, httpServices, PropertiesServiceSpha) {
        const anagraphicMsBaseUrl = PropertiesServiceSpha.get('baseUrlAnagraphic');
        
        const detailUrl = anagraphicMsBaseUrl + 'api/medicines/detail';
        const getMassiveActionByUserUrl = anagraphicMsBaseUrl + 'api/medicines/actions';
        const getRectificationAddKeysUrl = anagraphicMsBaseUrl + 'api/medicines/aic6-object-identifiers';
        const dataVisibilityRule = anagraphicMsBaseUrl + 'api/data-visibility-rules';
        
        const services = {
            anagraphicName: 'MEDICINE',
            anagraphicType: 'ANAG_MEDICINE',
            tableType: 'FLUSSO_FARMACI',
            states: {
                search: 'spha.searchMedicine',
                view: 'spha.viewMedicine',
                submitRectification: 'spha.submitRectification'
            },
            searchUrl: anagraphicMsBaseUrl + 'api/medicines/list',
            searchWithRectificationsUrl: anagraphicMsBaseUrl +'api/medicines/list-with-rectifications/',
            exportCsvUrl: anagraphicMsBaseUrl +'api/medicines/export',
            exportXlsxMassiveUrl: anagraphicMsBaseUrl +'api/medicines/massive-export',
            exportPdfUrl: anagraphicMsBaseUrl + 'api/medicines/report',
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
                'firstMarketing',
                'authorizationDate',
                'withdrawalEffectivenessDate',
                'stockDisposalDate',
                'authorizationSuspensionDate',
                'delayCorrectionDate',
                'temporaryTerminationDate',
                'terminationDate',
                'sunsetClause',
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
         * Service for getting Medicine Detail
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
            updateCookie('medicineId', controller.id);
            updateCookie('medicineCompanies', controller.companies ? JSON.stringify(controller.companies) : null);
            updateCookie('medicineDescription', controller.medicineDescription ? controller.medicineDescription : null);
            updateCookie('medicineAic', controller.aic ? controller.aic : null);
            updateCookie('medicineBoxDescription', controller.boxDescription ? controller.boxDescription : null);
            updateCookie('medicineFirstMarketingFrom', controller.firstMarketingFrom ? controller.firstMarketingFrom.toISOString() : null);
            updateCookie('medicineFirstMarketingTo', controller.firstMarketingTo ? controller.firstMarketingTo.toISOString() : null);
            updateCookie('medicineReimbursementClass', controller.reimbursementClass ? JSON.stringify(controller.reimbursementClass) : null);
            updateCookie('medicineAtc', controller.atc ? JSON.stringify(controller.atc) : null);
            updateCookie('medicineTransparency', controller.transparency ? controller.transparency : null);
            updateCookie('medicineOrphan', controller.orphan ? controller.orphan : null);
            updateCookie('medicineInnovative', controller.innovative ? controller.innovative : null);
            updateCookie('medicinePatented', controller.patented ? controller.patented : null);
            updateCookie('medicineactiveIngredient', controller.activeIngredient ? controller.activeIngredient : null);
            updateCookie('medicineValidMarketingFrom', controller.validMarketingFrom ? controller.validMarketingFrom.toISOString() : null);
            updateCookie('medicineValidMarketingTo', controller.validMarketingTo ? controller.validMarketingTo.toISOString() : null);
        };
        
        services.getFiltersFromCookies = function(controller) {
            controller.id = $cookies.get('medicineId') ? $cookies.get('medicineId') : null;
            controller.medicineDescription = $cookies.get('medicineDescription') ? $cookies.get('medicineDescription') : null;
            controller.aic = $cookies.get('medicineAic') ? $cookies.get('medicineAic') : null;
            controller.boxDescription = $cookies.get('medicineBoxDescription') ? $cookies.get('medicineBoxDescription') : null;
            controller.firstMarketingFrom = $cookies.get('medicineFirstMarketingFrom') ? new Date($cookies.get('medicineFirstMarketingFrom')) : null;
            controller.firstMarketingTo = $cookies.get('medicineFirstMarketingTo') ? new Date($cookies.get('medicineFirstMarketingTo')) : null;
            controller.transparency = $cookies.get('medicineTransparency') ? $cookies.get('medicineTransparency') === 'true' : null;
            controller.orphan = $cookies.get('medicineOrphan') ? $cookies.get('medicineOrphan') === 'true' : null;
            controller.innovative = $cookies.get('medicineInnovative') ? $cookies.get('medicineInnovative') === 'true' : null;
            controller.patented = $cookies.get('medicinePatented') ? $cookies.get('medicinePatented') === 'true' : null;
            controller.activeIngredient = $cookies.get('medicineactiveIngredient') ? $cookies.get('medicineactiveIngredient') === 'true' : null;
        };
        
        services.getFilters = function(controller) {
            if(controller.isRectificationAic6ADD || controller.isRectificationAic6DEL) {
                return {
                    validMarketingFrom: controller.validMarketingFrom ? controller.validMarketingFrom : null,
                    validMarketingTo: controller.validMarketingTo ? controller.validMarketingTo : null,
                    aic6In: controller.aic6ForRectification ? [controller.aic6ForRectification] : null,
                    allCompanies: controller.isRectificationAic6ADD === true,
                    companies: controller.companies && controller.isRectificationAic6ADD !== true ? controller.companies : undefined
                };
            } else {
                return {
                    companies: controller.companies ? controller.companies : null,
                    medicineDescription: controller.medicineDescription ? controller.medicineDescription : null,
                    aic: controller.aic ? controller.aic : null,
                    boxDescription: controller.boxDescription ? controller.boxDescription : null,
                    firstMarketingFrom: controller.firstMarketingFrom ? controller.firstMarketingFrom : null,
                    firstMarketingTo: controller.firstMarketingTo ? controller.firstMarketingTo : null,
                    reimbursementClass: controller.reimbursementClass != null && controller.reimbursementClass.length > 0 ? 
                        controller.reimbursementClass : null,
                    atc: controller.atc != null && controller.atc.length > 0 ? controller.atc : null,
                    transparency: controller.transparency != null ? controller.transparency : null,
                    orphan: controller.orphan != null ? controller.orphan : null,
                    innovative: controller.innovative != null ? controller.innovative : null,
                    patented: controller.patented != null ? controller.patented : null,
                    activeIngredient: controller.activeIngredient ? controller.activeIngredient : null,
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
            controller.reimbursementClass = null;
            controller.atc = null;
            controller.transparency = null;
            controller.orphan = null;
            controller.innovative = null;
            controller.patented = null;
            controller.activeIngredient = null;
        };

        return services;
	}
})();