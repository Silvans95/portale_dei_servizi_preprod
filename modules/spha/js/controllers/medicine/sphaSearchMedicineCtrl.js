/**
 * @ngdoc function
 * @name sphaSearchMedicineCtrl
 * @description controller for search procedimenti
 * # sphaSearchMedicineCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaSearchMedicineCtrl', sphaSearchMedicineCtrl);
        
    sphaSearchMedicineCtrl.$inject = ['$controller', '$scope', '$extend', 'sphaMedicineServices'];

    function sphaSearchMedicineCtrl ($controller, $scope, $extend, sphaMedicineServices) {
        
        // Init Filters' domains
        $scope.filters = {
            companies: {elements: [], page: 0},
            reimbursementClass: {elements: [], page: 0, valueType: 'reimbursementClass'},
            atc: {elements: [], page: 0, valueType: 'atc'},
            transparency: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
            orphan: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
            innovative: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
            patented: [{value: true, label: 'YES'}, {value: false, label: 'NO'}],
        };
        
        $scope.filtersRequest = {
            companies: {companies: []},
            reimbursementClass: {reimbursementClass: [], valueType: 'reimbursementClass'},
            atc: {atc: [], valueType: 'atc'}
        };
        
        var vm = $extend ? $extend : this;
        
        // instantiate parent controller
        var parent = $controller('sphaRectifiableAnagraphicController', {$scope: $scope, $extend:this});
        
        angular.extend(vm, parent);
        
        // initializing parent controller
        vm.initController(sphaMedicineServices);
    }
})();
