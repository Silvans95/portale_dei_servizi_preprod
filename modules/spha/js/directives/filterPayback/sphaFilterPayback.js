'use strict';
/**
 * @ngdoc function
 * @name sphaFilterPayback
 * @description directive for filter payback
 * # sphaFilterPayback
 * Controller of the sbAdminApp
 */
(function() {
	angular.module('sphaApp')
		.directive('sphaFilterPayback',
			['$timeout', 'blockUI', '$cookies', 'sphaUtilsServices', 'sphaCompanyServices',
				'shareDataServices', 'sphaPaybackServices', 'sphaPossibleValueServices', sphaFilterPayback]);

	function sphaFilterPayback($timeout, blockUI, $cookies, sphaUtilsServices, sphaCompanyServices,
		shareDataServices, sphaPaybackServices, sphaPossibleValueServices) {


		return {
			restrict: 'E',
			templateUrl: 'modules/spha/js/directives/filterPayback/sphaFilterPayback.html',
			scope: {
				data: '=data',
				procedure: '=procedure',
				shareDataPrefix: '=shareDataPrefix',
				lockedMode: '=lockedMode',
				filtersForm: '=filtersForm',
				setResetFn: '&'
			},
			link: linkFunc
		};

		function linkFunc(scope, el, attrs) {
			var sharedValue;

			scope.accordionRefPeriod = true;
			scope.accordionMedicineData = false;
			scope.accordionMarketingAndMore = false;
			scope.accordionMoreInfo = false;
			// Init Filters' domains
			scope.filters = {
				companies: { elements: [], page: 0 },
				reimbursementClass: { elements: [], page: 0, valueType: 'reimbursementClass' },
				atc: { elements: [], page: 0, valueType: 'atc' },
				transparency: [{ value: true, label: 'YES' }, { value: false, label: 'NO' }],
				orphan: [{ value: true, label: 'YES' }, { value: false, label: 'NO' }],
				innovative: [{ value: true, label: 'YES' }, { value: false, label: 'NO' }],
				patented: [{ value: true, label: 'YES' }, { value: false, label: 'NO' }],
			};

			scope.filtersRequest = {
				companies: { companies: [] },
				reimbursementClass: { reimbursementClass: [], valueType: 'reimbursementClass' },
				atc: { atc: [], valueType: 'atc' }
			};


            /**
             * ng-model
             */
            /**
             *
             * @param page page
             * @param search search
             */
			scope.getCompaniesPossibleValues = function(page, search) {
				if (scope.timeout){
				   clearTimeout(scope.timeout);
            	   scope.timeout = 0;
				 }

				scope.timeout = setTimeout(() => {

					if (!page) {
						scope.filters.companies.elements = [];
					}
					var obj = { companies: scope.lockedMode ? scope.data.companies : undefined };
					scope.filters.companies.page = page;

					if (!scope.lockedMode && (!scope.data || !scope.data.companies)) {
						obj = null;
					}
					sphaCompanyServices.getPossibleValues(page, obj, search,
						function(data, error) {
							if (error && error.message) {
								if (error.message.indexOf("-1") > -1) {
									// 'Status Code -1 Error Server Timeout or NotDefined';
									scope.filters.companies.elements = [];
									scope.filters.companies.page = 0;
									obj = null;
									return;
								} else {
									scope.message = error.message;
									scope.alertClass = error.alertClass;
								}
							} else {
								sphaUtilsServices.mapSearchFilterResponse([data], scope.filters);
							}
						});
				}, 5000);

			};

			scope.removeCompanies = function() {
				if (scope.data.companies == null || scope.data.companies.length === 0) {
					scope.data.companies = undefined;
					scope.data['allCompanies'] = !scope.lockedMode;
					scope.getCompaniesPossibleValues(0, null);
				} else {
					scope.data['allCompanies'] = false;
				}
			};

			scope.addCompanies = function() {
				scope.data['allCompanies'] = false;
			};
            /**
             * get di tutti gli atc e classi
             * @param page page
             * @param valueType valueType
             * @param search search
             */
			scope.getPossibleValues = function(page, valueType, search) {
				if (!page) {
					scope.filters[valueType].elements = [];
				}
				scope.filters[valueType].page = page;

				sphaPossibleValueServices.getPossibleValues(page,
					(scope.filtersRequest[valueType][valueType] != null &&
						scope.filtersRequest[valueType][valueType].length > 0) ?
						scope.filtersRequest[valueType] : null, valueType, search,
					function(data, error) {
						if (error && error.message) {
							scope.message = error.message;
							scope.alertClass = error.alertClass;
						} else {
							sphaUtilsServices.mapSearchFilterResponse([data], scope.filters);
						}
					});

			};

			function setValidMarketing() {
				scope.datesOptions.VALID_MARKETING_FROM.datepickerOptions.maxDate = scope.data.validMarketingTo;
				scope.datesOptions.VALID_MARKETING_TO.datepickerOptions.maxDate = scope.data.validMarketingTo;

				scope.datesOptions.VALID_MARKETING_FROM.datepickerOptions.minDate = scope.data.validMarketingFrom;
				scope.datesOptions.VALID_MARKETING_TO.datepickerOptions.minDate = scope.data.validMarketingFrom;
			}

			function handleCookiesAndSharedData() {

				sphaPaybackServices.getFiltersFromCookies(scope.data, scope.shareDataPrefix, scope.lockedMode);


				if (scope.data.atc != null) {
					scope.filtersRequest.atc.atc = (scope.data.atc);
				}
				if (scope.data.reimbursementClass != null) {
					scope.filtersRequest.reimbursementClass.reimbursementClass = (scope.data.reimbursementClass);
				}
				if (scope.data.companies != null) {
					scope.filtersRequest.companies.companies = (scope.data.companies);
				}
				setValidMarketing();
				intiAllCompaniesFilter();
			}

			function intiAllCompaniesFilter() {
				if (scope.data.companies == null || scope.data.companies.length === 0) {
					scope.data.companies = undefined;
					scope.data['allCompanies'] = !scope.lockedMode;
				} else {
					scope.data['allCompanies'] = false;
				}
			}

			function formatDate(date) {
				return date ? new Date(moment(date).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z') : null;
			}


            /**
             * Date Pickers
             */
			scope.datesOptions = {
				VALID_MARKETING_FROM: { opened: false, datepickerOptions: {} },
				VALID_MARKETING_TO: { opened: false, datepickerOptions: {} },
			};

            /**
             *
             * @param dateField dateField
             */
			scope.openDatePopup = function(dateField) {
				scope.datesOptions[dateField].opened = !scope.datesOptions[dateField].opened;
			};


			// se l'elemento del form è invalido -> bordo rosso
			scope.addClass = function(idField) {
				if (scope.filtersForm && !scope.readOnly && scope.filtersForm[idField] && scope.filtersForm[idField].$invalid) {
					return 'has-errors';
				}
				return '';
			};

			function reset() {
				var companies = scope.data.companies;
				scope.data = {};
				if (scope.lockedMode) {
					scope.data.companies = companies;
				} else {
					scope.getCompaniesPossibleValues();
				}
				scope.data.validMarketingTo = formatDate(scope.procedure && scope.procedure.endPeriodDate);
				scope.data.validMarketingFrom = formatDate(scope.procedure && scope.procedure.startPeriodDate);
				intiAllCompaniesFilter();
			}

			function init() {
				handleCookiesAndSharedData();

				// always at end used for say to controller that init is ended
				scope.setResetFn({ resetFn: reset });
			}

			init();
		}
	}
})();