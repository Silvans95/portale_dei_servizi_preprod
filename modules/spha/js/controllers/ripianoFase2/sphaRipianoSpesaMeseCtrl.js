/**
 * @ngdoc function
 * @name sphaRipianoSpesaMeseCtrl
 * @description controller for search RipianoSpesaMese data
 * # sphaRipianoSpesaMeseCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaRipianoSpesaMeseCtrl', sphaRipianoSpesaMeseCtrl);
        
    sphaRipianoSpesaMeseCtrl.$inject = ['$translate', '$q', '$controller', '$scope', '$extend', 'sphaPaybackServices'];

    function sphaRipianoSpesaMeseCtrl ($translate, $q, $controller, $scope, $extend, sphaPaybackServices) {
        
        var vm = $extend ? $extend : this;

        $scope.setSubmitSearchFn = function (directiveReloadTableDataFn) {
            $scope.submitSearch = directiveReloadTableDataFn;
        };

        vm.findData = function (filters, table) {
            console.log("FILTERS:", filters);
            var deferred = $q.defer();
            sphaPaybackServices.getQueryTypeData(
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
        var parent = $controller('sphaSecondPhaseProcedureController', {$scope: $scope, $extend:this});
        
        angular.extend(vm, parent);
        
        // initializing parent controller
        vm.initController(sphaPaybackServices).then();
    }
})();
