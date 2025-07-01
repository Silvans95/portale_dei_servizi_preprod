(function() {
	'use strict';
	angular.module('sphaApp')
		.factory('sphaCompanyServices', ['$log', '$http', 'httpServices', 'PropertiesServiceSpha', '$q',
			function($log, $http, httpServices, PropertiesServiceSpha, $q) {
				var services = {};

				var vm = this;

				//URLS
				var apiAnagraphicUrl = PropertiesServiceSpha.get('baseUrlAnagraphic');
				var searchFiltersUrl = apiAnagraphicUrl + 'api/companies/companies-filters-meta';
				var possibleValuesUrl = apiAnagraphicUrl + 'api/companies/possible-values';
				var getMassiveActionByUserUrl = apiAnagraphicUrl + 'api/companies/actions';
				var searchUrl = apiAnagraphicUrl + 'api/companies/list';
				var detailUrl = apiAnagraphicUrl + 'api/companies/detail';

				// search companies filters
				var searchElementPerPage = 10;

				vm.filtersRequest = {
					companies: {
						start: searchElementPerPage,
						length: searchElementPerPage,
						order: [{ property: 'companyName', direction: 'ASC' }]
					}
				};

				vm.possibleValueRequest = {
					start: searchElementPerPage,
					length: searchElementPerPage,
					order: [{ property: 'companyName', direction: 'ASC' }],
					filters: null
				};

                /**
                 * Service for getting Search Filters
                 * data.
                 * Call rest services at specified url.
                 *
                 * @callback function callback
                 * @deprecated replaced by getPossibleValues
                 */
				services.getSearchFiltersMeta = function(pageIn, callback) {
					var page = pageIn ? pageIn : 0;
					var filterRequestToUse = {};
					Object.assign(filterRequestToUse, vm.filtersRequest);
					filterRequestToUse.companies.start = page * searchElementPerPage;
					httpServices.post(searchFiltersUrl, filterRequestToUse, function(data, success, error) {
						var errors = {};
						if (success && data) {
							if (error) {
								errors.message = error;
								errors.alertClass = 'alert alert-warning';
							}
						} else {
							errors.message = error;
							errors.alertClass = 'alert alert-danger';
						}
						callback(data, errors);
					});
				};

                /**
                 * Service for getting Search Filters
                 * data.
                 * Call rest services at specified url.
                 *
                 * @callback function callback
                 */
				services.getPossibleValues = function(pageIn, filterPossibleValue, search, callback) {

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
					httpServices.post(possibleValuesUrl, filterRequestToUse, function(data, success, error) {
						var errors = {};
						if (success && data) {
							if (error) {
								errors.message = error;
								errors.alertClass = 'alert alert-warning';
							}
						} else {
							errors.message = error;
							errors.alertClass = 'alert alert-danger';
						}
						callback(data, errors);
					});
				};

                /**
                 * Get Massive action by user 
                 * 
                 */
				services.getMassiveActionByUser = function(callback) {
					httpServices.get(getMassiveActionByUserUrl, function(data, success, error) {
						var errors = {};
						if (success && data) {
							if (error) {
								errors.message = error;
								errors.alertClass = 'alert alert-warning';
							}
						} else {
							errors.message = error;
							errors.alertClass = 'alert alert-danger';
						}
						callback(data, errors);
					});
				};

                /**
                 * Service for getting Company Detail
                 * data.
                 * Call rest services at specified url.
                 * 
                 * @callback function callback
                 */
				services.getDetail = function(detailInputParams, callback) {
					var dataObj = {};
					httpServices.post(detailUrl, detailInputParams, function(data, success, error) {
						var errors = {};
						if (success && data) {
							if (error) {
								errors.message = error;
								errors.alertClass = 'alert alert-warning';
							}
							dataObj = data;
						} else {
							errors.message = error;
							errors.alertClass = 'alert alert-danger';
						}
						callback(dataObj, errors);
					});
				};
				return services;
			}]);


})();
