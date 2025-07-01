(function () {
    'use strict';
    angular.module('sphaApp')
        .factory('sphaGsdbdfServices', sphaGsdbdfServices).$inject = ['$log', '$http', '$cookies', 'httpServices', 'PropertiesServiceSpha'];

    function sphaGsdbdfServices($log, $http, $cookies, httpServices, PropertiesServiceSpha) {
        var vm = this;

        const anagraphicMsBaseUrl = PropertiesServiceSpha.get('baseUrlAnagraphic');
        const getMassiveActionByUserUrl = anagraphicMsBaseUrl + 'api/gsdbdf/actions';
        const possibleValuesUrl = anagraphicMsBaseUrl + 'api/gsdbdf/possible-values';
        const possibleValuesDistinctUrl = anagraphicMsBaseUrl + 'api/gsdbdf/possible-values/distinct';
        const getRectificationAddKeysUrl = anagraphicMsBaseUrl + 'api/gsdbdf/object-identifiers';

        const services = {
            anagraphicName: 'GSDBDF',
            anagraphicType: 'ANAG_GSDBDF',
            tableType: 'FLUSSO_GSD_BDF',
            states: {
                search: 'spha.searchGsdbdf',
                view: null,
                submitRectification: 'spha.submitRectification'
            },
            searchUrl: anagraphicMsBaseUrl + 'api/gsdbdf/list',
            searchWithRectificationsUrl: anagraphicMsBaseUrl + 'api/gsdbdf/list-with-rectifications/',
            exportCsvUrl: anagraphicMsBaseUrl + 'api/gsdbdf/export',
            exportPdfUrl: anagraphicMsBaseUrl + 'api/gsdbdf/report',
        };

        // search companies filters
        var searchElementPerPage = 10;

        /**
         * 
         * @param companiesObject {{companyDescription,
         *                          companySys
         *                          }}[]
         */
        function extractCompaniesSis(companiesObject) {
            var ret = [];
            companiesObject.forEach(companyObj => {
                ret.push(companyObj.companySis);
            });
            return ret;
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
        
        vm.possibleValueRequest = {
            start: searchElementPerPage,
            length: searchElementPerPage,
            order: [{'property': 'groupDescription', 'direction': 'ASC'}],
            filters: null
        };

        /**
         * 
         * @returns {{gsdbdf: {elements: *[], page: number}}}
         */
        services.defaultSearchFilters = function () {
            return {
                gsdbdf: {elements: [], page: 0}
            };
        };

        /**
         * 
         * @returns {{companies: {elements: *[], page: number}, gsdbdf: {elements: *[], page: number}}}
         */
        services.defaultSearchFiltersForRectification = function () {
            return {
                gsdbdf: {elements: [], page: 0},
                companies: {elements: [], page: 0},
            };
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
         * Service for getting Search Filters
         * data.
         * Call rest services at specified url.
         *
         * @callback function callback
         */
        services.getPossibleValues = function (pageIn, filterPossibleValue, search, callback) {

            var page = pageIn ? pageIn : 0;
            var filterRequestToUse = {};
            vm.possibleValueRequest.filters = filterPossibleValue;
            Object.assign(filterRequestToUse, vm.possibleValueRequest);
            filterRequestToUse.start = page * searchElementPerPage;

            if (search && search !== '') {
                if (!filterRequestToUse.filters) {
                    filterRequestToUse.filters = {};
                }
                filterRequestToUse.filters.freeSearch = search;
            }
            httpServices.post(possibleValuesUrl, filterRequestToUse, function (data, success, error) {
                var parsedResponse = parseHttpServiceResponse(success, data, error);
                callback(parsedResponse.data, parsedResponse.errors);
            });
        };
        
        /**
         * Service for getting Search Filters
         * data.
         * Call rest services at specified url.
         *
         * @callback function callback
         */
        services.getPossibleValuesDistinct = function (pageIn, filterPossibleValue, search, callback) {

            var page = pageIn ? pageIn : 0;
            var filterRequestToUse = {};
            vm.possibleValueRequest.filters = filterPossibleValue;
            Object.assign(filterRequestToUse, vm.possibleValueRequest);
            filterRequestToUse.start = page * searchElementPerPage;

            if (search && search !== '') {
                if (!filterRequestToUse.filters) {
                    filterRequestToUse.filters = {};
                }
                filterRequestToUse.filters.freeSearch = search;
            }
            httpServices.post(possibleValuesDistinctUrl, filterRequestToUse, function (data, success, error) {
                var parsedResponse = parseHttpServiceResponse(success, data, error);
                callback(parsedResponse.data, parsedResponse.errors);
            });
        };
        
        services.getRectificationAddKeys = function (filters, rectificationDetailInfoType, callback) {
            httpServices.post(getRectificationAddKeysUrl + '/' + rectificationDetailInfoType, filters, function (data, success, error) {
                var parsedResponse = parseHttpServiceResponse(success, data, error);
                callback(parsedResponse.data, parsedResponse.errors);
            });
        };
        
        services.updateFiltersCookies = function(controller) {
            updateCookie('gsdbdfId', controller.id);
            updateCookie('gsdbdfGsdbdf', controller.gsdbdf ? JSON.stringify(controller.gsdbdf) : null);
        };
        
        services.getFiltersFromCookies = function(controller) {
            controller.id = $cookies.get('gsdbdfId') ? $cookies.get('gsdbdfId') : null;
            controller.gsdbdf = $cookies.get('gsdbdfGsdbdf') ? JSON.parse($cookies.get('gsdbdfGsdbdf')) : null;
        };
        
        services.getFiltersForRectification = function(controller) {
            if(controller.rowForRectification) {
                return {
                    gsdbdf: controller.gsdbdf != null && controller.gsdbdf.length !== 0 ? controller.gsdbdf : null,
                    companies: controller.rowForRectification.rectificationDetailInfoType === 'ADD' ?
                        controller.companyForRectification : extractCompaniesSis(controller.companyForRectification)
                };
            }
            return null;
        };
        
        services.getFilters = function(controller) {
            return {
                gsdbdf: controller.gsdbdf != null && controller.gsdbdf.length !== 0 ? controller.gsdbdf : null
            };
        };
        
        services.resetFilters = function(controller) {
            controller.id = null;
            controller.gsdbdf = null;
        };

        return services;
    }
})();