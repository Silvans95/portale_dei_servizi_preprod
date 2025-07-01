
(function () {
    'use strict';
    angular.module('sphaApp')
    .factory( 'sphaTransparencyServices', sphaTransparencyServices)
    .$inject = ['$log', '$http', '$cookies', 'httpServices', 'PropertiesServiceSpha'];

    function sphaTransparencyServices($log, $http, $cookies, httpServices, PropertiesServiceSpha) {
        const anagraphicMsBaseUrl = PropertiesServiceSpha.get('baseUrlAnagraphic');
        const detailUrl = anagraphicMsBaseUrl + 'api/transparencies/detail';
        const getMassiveActionByUserUrl = anagraphicMsBaseUrl + 'api/transparencies/actions';
        const getRectificationAddKeysUrl = anagraphicMsBaseUrl + 'api/transparencies/aic6-object-identifiers';
        const dataVisibilityRule = anagraphicMsBaseUrl + 'api/data-visibility-rules';
        
        const services = {
            anagraphicName: 'TRANSPARENCY',
            anagraphicType: 'ANAG_TRANSPARENCY',
            tableType: 'FLUSSO_FARMACI',
            states: {
                search: 'spha.searchTransparency',
                view: 'spha.viewTransparency',
                submitRectification: 'spha.submitRectification'
            },
            searchUrl: anagraphicMsBaseUrl + 'api/transparencies/list',
            searchWithRectificationsUrl: anagraphicMsBaseUrl +'api/transparencies/list-with-rectifications/',
            exportCsvUrl: anagraphicMsBaseUrl +'api/transparencies/export',
            exportXlsxMassiveUrl: anagraphicMsBaseUrl +'api/transparencies/massive-export',
            exportPdfUrl: anagraphicMsBaseUrl + 'api/transparencies/report',
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
                'dateInTransparency',
                'dateOutTransparency',
                'firstMarketing',
                'validMarketing'
            ];
        };

        /**
         * Get Massive action by user
         *
         */
        services.getMassiveActionByUser = function (callback) {
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
        services.getDetail = function (detailInputParams, callback) {
            detailInputParams['order'] = [{property: 'validMarketing', direction: 'DESC'}];
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
            updateCookie('transparencyId', controller.id);
            updateCookie('transparencyCompanies', controller.companies ? JSON.stringify(controller.companies) : null);
            updateCookie('transparencyDescription', controller.medicineDescription);
            updateCookie('transparencyAic', controller.aic);
            updateCookie('transparencyBoxDescription', controller.boxDescription);
            updateCookie('transparencyFirstMarketingFrom', controller.firstMarketingFrom ? controller.firstMarketingFrom.toISOString() : null);
            updateCookie('transparencyFirstMarketingTo', controller.firstMarketingTo ? controller.firstMarketingTo.toISOString() : null);
            updateCookie('transparencyDateInTransparency', controller.dateInTransparency ? controller.dateInTransparency.toISOString() : null);
            updateCookie('transparencyDateOutTransparency', controller.dateOutTransparency ? controller.dateOutTransparency.toISOString() : null);
            updateCookie('transparencyReimbursementClass', controller.reimbursementClass ? JSON.stringify(controller.reimbursementClass) : null);
            updateCookie('transparencyAtc', controller.atc ? JSON.stringify(controller.atc) : null);
            updateCookie('transparencyOrphan', controller.orphan);
            updateCookie('transparencyInnovative', controller.innovative);
            updateCookie('transparencyPatented', controller.patented);
            updateCookie('transparencyValidMarketingFrom', controller.validMarketingFrom ? controller.validMarketingFrom.toISOString() : null);
            updateCookie('transparencyValidMarketingTo', controller.validMarketingTo ? controller.validMarketingTo.toISOString() : null);
        };
        
        services.getFiltersFromCookies = function(controller) {
            controller.id = $cookies.get('transparencyId') ? $cookies.get('transparencyId') : null;
            controller.medicineDescription = $cookies.get('transparencyDescription') ? $cookies.get('transparencyDescription') : null;
            controller.aic = $cookies.get('transparencyAic') ? $cookies.get('transparencyAic') : null;
            controller.boxDescription = $cookies.get('transparencyBoxDescription') ? $cookies.get('transparencyBoxDescription') : null;
            controller.firstMarketingFrom = $cookies.get('transparencyFirstMarketingFrom') ? new Date($cookies.get('transparencyFirstMarketingFrom')) : null;
            controller.firstMarketingTo = $cookies.get('transparencyFirstMarketingTo') ? new Date($cookies.get('transparencyFirstMarketingTo')) : null;
            controller.dateInTransparency= $cookies.get('transparencyDateInTransparency') ? new Date($cookies.get('transparencyDateInTransparency')) : null;
            controller.dateOutTransparency= $cookies.get('transparencyDateOutTransparency') ? new Date($cookies.get('transparencyDateOutTransparency')) : null;
            controller.orphan = $cookies.get('transparencyOrphan') ? $cookies.get('transparencyOrphan') === 'true' : null;
            controller.innovative = $cookies.get('transparencyInnovative') ? $cookies.get('transparencyInnovative') === 'true' : null;
            controller.patented = $cookies.get('transparencyPatented') ? $cookies.get('transparencyPatented') === 'true' : null;
            controller.transparency = true;
        };
        
        services.getFilters = function(controller) {
            if(controller.isRectificationAic6ADD || controller.isRectificationAic6DEL) {
                return {
                    validMarketingFrom: controller.validMarketingFrom ? controller.validMarketingFrom : null,
                    validMarketingTo: controller.validMarketingTo ? controller.validMarketingTo : null,
                    aic6In: controller.aic6ForRectification ? [controller.aic6ForRectification] : null,
                    allCompanies: controller.isRectificationAic6ADD === true,
                    companies: controller.companies && controller.isRectificationAic6ADD !== true ? controller.companies : undefined,
                    transparency: true
                };
            } else {
                return {
                    companies: controller.companies ? controller.companies : null,
                    medicineDescription: controller.medicineDescription ? controller.medicineDescription : null,
                    aic: controller.aic ? controller.aic : null,
                    boxDescription: controller.boxDescription ? controller.boxDescription : null,
                    firstMarketingFrom: controller.firstMarketingFrom ? controller.firstMarketingFrom : null,
                    firstMarketingTo: controller.firstMarketingTo ? controller.firstMarketingTo : null,
                    dateInTransparency: controller.dateInTransparency ? controller.dateInTransparency : null,
                    dateOutTransparency: controller.dateOutTransparency ? controller.dateOutTransparency : null,
                    reimbursementClass: controller.reimbursementClass != null && controller.reimbursementClass.length !== 0 ? controller.reimbursementClass : null,
                    atc: controller.atc != null && controller.atc.length !== 0 ? controller.atc : null,
                    transparency: true,
                    orphan: controller.orphan != null ? controller.orphan : null,
                    innovative: controller.innovative != null ? controller.innovative : null,
                    patented: controller.patented != null ? controller.patented : null,
                    validMarketingFrom: controller.validMarketingFrom ? controller.validMarketingFrom : null,
                    validMarketingTo: controller.validMarketingTo ? controller.validMarketingTo : null
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
            controller.dateInTransparency = null;
            controller.dateOutTransparency = null;
            controller.reimbursementClass = null;
            controller.atc = null;
            controller.orphan = null;
            controller.innovative = null;
            controller.patented = null;
        };

        return services;
    }
})();
