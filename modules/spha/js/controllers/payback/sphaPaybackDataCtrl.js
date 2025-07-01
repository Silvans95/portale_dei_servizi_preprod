/**
 * @ngdoc function
 * @name sphaPaybackDataCtrl
 * @description controller for search payback data
 * # sphaPaybackDataCtrl Controller of the sphaApp
 */
(function() {
	'use strict';
	angular.module('sphaApp')
		.controller('sphaPaybackDataCtrl', sphaPaybackDataCtrl);

	sphaPaybackDataCtrl.$inject = ['$translate', '$q', '$controller', '$scope', '$extend', 'sphaPaybackServices'];

	function sphaPaybackDataCtrl($translate, $q, $controller, $scope, $extend, sphaPaybackServices) {

		var vm = $extend ? $extend : this;

		vm.findData = function(filters, table) {
			var deferred = $q.defer();
			sphaPaybackServices.getQueryTypeData(
				filters,
				vm.queryType,
				vm.procedureDTO,
				table,
				function(data, error) {
					if (error && error.message) {
						vm.message = error.message;
						vm.alertClass = error.alertClass;
						deferred.resolve();
					} else {
						if (table.footer) {
						sphaPaybackServices.getQueryTypeData(
                                {start: 0, length: 1, filters: filters.filters},
                                vm.queryType,
                                vm.procedureDTO,
                                table.footer,
                                function (data1, error1) {
                                    if (error1 && error1.message) {
                                        vm.message = error1.message;
                                        vm.alertClass = error1.alertClass;
                                        table.footer.data = undefined;
                                        deferred.resolve();
                                    } else {
                                        table.footer.data = data1;
                                        deferred.resolve({
                                            total: data && data.total,
                                            data: data && data.items,
                                            footer: data1
                                        });
                                    }
                                });
						} else {
							deferred.resolve({
								total: data && data.total,
								data: data && data.items
							});
						}
					}
				});
			return deferred.promise;
		};

		// instantiate parent controller
		var parent = $controller('sphaSecondPhaseProcedureController', { $scope: $scope, $extend: this });

		angular.extend(vm, parent);

		// initializing parent controller
		vm.initController(sphaPaybackServices).then();
	}
})();
