/**
 * @ngdoc function
 * @name sphaRipianoSpesaCtrl
 * @description controller for search sphaRipianoSpesaCtrl data
 * # sphaRipianoSpesaCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaRipianoSpesaCtrl', sphaRipianoSpesaCtrl);
        
    sphaRipianoSpesaCtrl.$inject = ['$translate', '$q', '$controller', '$scope', '$extend', 'sphaRipianoSpesaServices'];

    function sphaRipianoSpesaCtrl ($translate, $q, $controller, $scope, $extend, sphaRipianoSpesaServices) {
        
        var vm = $extend ? $extend : this;

        $scope.setSubmitSearchFn = function (directiveReloadTableDataFn) {
            $scope.submitSearch = directiveReloadTableDataFn;
        };

        vm.findData = function (filters, table) {
            var deferred = $q.defer();
            sphaRipianoSpesaServices.getRipianoSpesa(
                filters,
                vm.queryType,
                vm.procedureDTO,
                table,
                function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                        deferred.resolve();
                    } else {
                        deferred.resolve({
                            total: data && data.total,
                            data: data && data.items
                        });
                    }
                });
            return deferred.promise;
        };
        
        // instantiate parent controller
        var parent = $controller('sphaRipianoSecondPhaseProcedureController', {$scope: $scope, $extend:this});
        
        angular.extend(vm, parent);
        
        // initializing parent controller
        vm.initController(sphaRipianoSpesaServices).then();
    }
})();
