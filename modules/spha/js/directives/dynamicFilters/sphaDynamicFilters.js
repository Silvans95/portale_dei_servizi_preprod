'use strict';
/**
 * @ngdoc function
 * @name sphaDynamicFilters
 * @description directive for filter payback
 * # sphaDynamicFilters
 * Controller of the sbAdminApp
 */
(function () {
    angular.module('sphaApp')
        .directive('sphaDynamicFilters',
            ['$timeout', 'blockUI', '$cookies', 'sphaUtilsServices', 'sphaCompanyServices',
                'shareDataServices', 'sphaPossibleValueServices', sphaDynamicFilters]);

    function sphaDynamicFilters($timeout, blockUI, $cookies, sphaUtilsServices, sphaCompanyServices,
                             shareDataServices, sphaPossibleValueServices) {


        return {
            restrict: 'E',
            templateUrl: 'modules/spha/js/directives/dynamicFilters/sphaDynamicFilters.html',
            scope: {
                data: '=data',
                procedure:'=procedure',
                shareDataPrefix: '=shareDataPrefix',
                lockedMode: '=lockedMode',
                filtersForm: '=filtersForm',
                service: '=service',
                commonFiltersConfig: '=commonFiltersConfig',
                accordionsIn: '=accordionsIn',
                setResetFn: '&'
            },
            link: linkFunc
        };

        function linkFunc(scope, el, attrs) {
            const baseTemplatePath = 'modules/spha/js/directives/dynamicFilters/';
            var companySisModelName = null;
            var setValidMarketingFilters = null;
            
            scope.accordions = {
                accordionRefPeriod: {open: true, show: false,
                    template: baseTemplatePath + 'medicineFiltersAccordions/accordionRefPeriod.html'},
                accordionMedicineData: {open: false, show: false,
                    template: baseTemplatePath + 'medicineFiltersAccordions/accordionMedicineData.html'},
                accordionMarketingAndMore: {open: false, show: false, 
                    template: baseTemplatePath + 'medicineFiltersAccordions/accordionMarketingAndMore.html'}
            };
            
            scope.filters = {
                companies: {elements: [], page: 0},
                reimbursementClass: {elements: [], page: 0, valueType: 'reimbursementClass'},
                atc: {elements: [], page: 0, valueType: 'atc'},
                transparency: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
                orphan: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
                innovative: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
                patented: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
            };

            scope.filtersRequest = {
                companies: {companies: []},
                reimbursementClass: {reimbursementClass: [], valueType: 'reimbursementClass'},
                atc: {atc: [], valueType: 'atc'}
            };
            
            /**
             *
             * @param page page
             * @param search search
             */
            scope.getCompaniesPossibleValues = function (page, search) {
                if (!page) {
                    scope.filters.companies.elements = [];
                }
                var obj = {companies: scope.lockedMode ? scope.data[companySisModelName] : undefined};
                scope.filters.companies.page = page;

                if(!scope.lockedMode && !scope.data[companySisModelName]) {
                    obj = null;
                }

                sphaCompanyServices.getPossibleValues(page, obj, search,
                    function (data, error) {
                        if (error && error.message) {
                            scope.message = error.message;
                            scope.alertClass = error.alertClass;
                        } else {
                            sphaUtilsServices.mapSearchFilterResponse([data], scope.filters);
                        }
                    });
            };
            
            scope.removeCompanies = function () {
                if(scope.data[companySisModelName] == null || 
                        scope.data[companySisModelName].length === 0) {
                    scope.data[companySisModelName] = undefined;
                    scope.data['allCompanies'] = !scope.lockedMode;
                    scope.getCompaniesPossibleValues(0, null);
                } else {
                    scope.data['allCompanies'] = false;
                }
            };
            
            scope.addCompanies = function () {
                scope.data['allCompanies'] = false;
            };
            /**
             * get di tutti gli atc e classi
             * @param page page
             * @param valueType valueType
             * @param search search
             */
            scope.getPossibleValues = function (page, valueType, search) {
                if (!page) {
                    scope.filters[valueType].elements = [];
                }
                scope.filters[valueType].page = page;
                sphaPossibleValueServices.getPossibleValues(page,
                    (scope.filtersRequest[valueType][valueType] != null &&
                        scope.filtersRequest[valueType][valueType].length > 0) ?
                        scope.filtersRequest[valueType] : null, valueType, search,
                    function (data, error) {
                        if (error && error.message) {
                            scope.message = error.message;
                            scope.alertClass = error.alertClass;
                        } else {
                            sphaUtilsServices.mapSearchFilterResponse([data], scope.filters);
                        }
                    });

            };

            function setValidMarketing() {
                if(setValidMarketingFilters) {
                    scope.datesOptions.VALID_MARKETING_FROM.datepickerOptions.maxDate = scope.data.validMarketingTo;
                    scope.datesOptions.VALID_MARKETING_TO.datepickerOptions.maxDate = scope.data.validMarketingTo;

                    scope.datesOptions.VALID_MARKETING_FROM.datepickerOptions.minDate = scope.data.validMarketingFrom;
                    scope.datesOptions.VALID_MARKETING_TO.datepickerOptions.minDate = scope.data.validMarketingFrom;
                }
            }

            function handleCookiesAndSharedData() {
                
                scope.service.getFiltersFromCookies(scope.data, scope.shareDataPrefix, scope.lockedMode);


                if (scope.data.atc) {
                    scope.filtersRequest.atc.atc = (scope.data.atc);
                }
                if (scope.data.reimbursementClass) {
                    scope.filtersRequest.reimbursementClass.reimbursementClass = (scope.data.reimbursementClass);
                }
                if (scope.data[companySisModelName]) {
                    scope.filtersRequest.companies.companies = (scope.data[companySisModelName]);
                }
                setValidMarketing();
                intiAllCompaniesFilter();
            }
            
            function intiAllCompaniesFilter() {
                if(scope.data[companySisModelName] == null || 
                        scope.data[companySisModelName].length === 0) {
                    scope.data[companySisModelName] = undefined;
                    scope.data['allCompanies'] = !scope.lockedMode;
                } else {
                    scope.data['allCompanies'] = false;
                }
            }
            
            function buildCommonFilters() {
                companySisModelName = scope.commonFiltersConfig.companySisModelName;
                setValidMarketingFilters = scope.commonFiltersConfig.setValidMarketingFilters;
            }
            
            function buildAccordions() {
                if(scope.accordionsIn) {
                    for(let accordion in scope.accordionsIn) {
                        if(scope.accordionsIn.hasOwnProperty(accordion)) {
                            if(scope.accordions.hasOwnProperty(accordion)) {
                                scope.accordions[accordion].show = scope.accordionsIn[accordion].show;
                            } else {
                                scope.accordions[accordion] = scope.accordionsIn[accordion];
                            }
                        }
                    }
                }
            }
            
            function reset() {
                var companies = scope.data[companySisModelName];
                scope.data = {};
                if (scope.lockedMode) {
                    scope.data[companySisModelName] = companies;
                } else {
                    scope.getCompaniesPossibleValues();
                }
                scope.data.validMarketingTo = formatDate(scope.procedure && scope.procedure.endPeriodDate);
                scope.data.validMarketingFrom = formatDate(scope.procedure && scope.procedure.startPeriodDate);
                intiAllCompaniesFilter();
            }
            
            function formatDate(date) {
                return date ?  new Date(moment(date).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z') : null;
            }


            /**
             * Date Pickers
             */
            scope.datesOptions = {
                VALID_MARKETING_FROM: {opened: false, datepickerOptions: {}},
                VALID_MARKETING_TO: {opened: false, datepickerOptions: {}},
            };

            /**
             *
             * @param dateField dateField
             */
            scope.openDatePopup = function (dateField) {
                scope.datesOptions[dateField].opened = !scope.datesOptions[dateField].opened;
            };


            // se l'elemento del form è invalido -> bordo rosso
            scope.addClass = function (idField) {
                if ( scope.filtersForm && !scope.readOnly && scope.filtersForm[idField] && scope.filtersForm[idField].$invalid) {
                    return 'has-errors';
                }
                return '';
            };
            
            function init() {
                buildCommonFilters();
                handleCookiesAndSharedData();
                buildAccordions();
                
                // always at end used for say to controller that init is ended
                scope.setResetFn({resetFn: reset});
            }
            
            init();
        }
    }
})();