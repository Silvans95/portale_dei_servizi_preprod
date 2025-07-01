(function () {
    'use strict';
    angular.module('sphaApp')
        .factory('sphaPossibleValueServices', sphaPossibleValueServices)
        .$inject = ['$log', '$http', 'httpServices', 'PropertiesServiceSpha', '$q'];
    
    function sphaPossibleValueServices ($log, $http, httpServices, PropertiesServiceSpha, $q) {
                var services = {};

                var vm = this;

                //URLS
                var apiAnagraphicUrl = PropertiesServiceSpha.get("baseUrlAnagraphic");
                
                var possibleValuesUrl = apiAnagraphicUrl + "api/possible-values/list";
              
                // search companies filters
                var searchElementPerPage = 10;

                vm.filtersRequest = {
                    atc: {
                        start: searchElementPerPage,
                        length: searchElementPerPage,
                        order: [{"property": 'id', "direction": 'ASC'}],
                        valueType: "atc"
                    },
                    reimbursementClass: {
                        start: searchElementPerPage,
                        length: searchElementPerPage,
                        order: [{"property": 'id', "direction": 'ASC'}],
                        valueType: "reimbursementClass"
                    },
                    agreementType: {
                        start: searchElementPerPage,
                        length: searchElementPerPage,
                        order: [{"property": 'id', "direction": 'ASC'}],
                        valueType: "agreementType"
                    },
                    erogationChannel: {
                    	start: searchElementPerPage,
                        length: searchElementPerPage,
                        order: [{"property": 'id', "direction": 'ASC'}],
                        valueType: "erogationChannel"
                    }
                };

                vm.possibleValueRequest = {
                    start: searchElementPerPage,
                    length: searchElementPerPage,
                    order: [{"property": 'id', "direction": 'ASC'}],
                    valueType: null,
                    filters: null 
                };
                

                /**
                 * Service for getting Search Filters
                 * data.
                 * Call rest services at specified url.
                 *
                 * @callback function callback
                 */
                services.getPossibleValues = function (pageIn, filterPossibleValue, valueType, search, callback) {
                    var page = pageIn ? pageIn : 0;
                    var filterRequestToUse = {};
                    vm.possibleValueRequest.valueType = vm.filtersRequest[valueType].valueType;
                    vm.possibleValueRequest.filters = filterPossibleValue;
                    Object.assign(filterRequestToUse, vm.possibleValueRequest);
                    filterRequestToUse.start = page * searchElementPerPage;
                    
                    vm.possibleValueRequest.filters ? filterRequestToUse.filters = vm.possibleValueRequest.filters : filterRequestToUse.filters = {};
                    filterRequestToUse.filters.valueType = valueType;
                    
                    if(search != undefined && search != "") {
                    	filterRequestToUse.filters.freeSearch = search;
                    } 
                	return httpServices.post(possibleValuesUrl, filterRequestToUse, function (data, success, error) {
                        var errors = {};
                        if ( success && data) {
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
                    
                    
                    
                };
                
                return services;
            }
})();
