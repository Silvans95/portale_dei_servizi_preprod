/**
 * @ngdoc function
 * @name sphaSearchInnovativeCtrl
 * @description controller for search procedimenti
 * # sphaSearchInnovativeCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaSearchInnovativeCtrl', sphaSearchInnovativeCtrl);
        
    sphaSearchInnovativeCtrl.$inject = ['$controller', '$scope', '$extend', 'sphaInnovativeServices'];
        
    function sphaSearchInnovativeCtrl ($controller, $scope, $extend, sphaInnovativeServices) {
        
        // Init Filters' domains
        $scope.filters = {
            companies: {elements: [], page: 0},
            reimbursementClass: {elements: [], page: 0, valueType: 'reimbursementClass'},
            atc: {elements: [], page: 0, valueType: 'atc'},
            innovative: [{ value: true, label: 'YES' }],
            innovationLevel: [{ value: true, label: 'CONDITIONED' }, { value: false, label: 'NOT_CONDITIONED' }],
            fundAccess: [{ value: true, label: 'YES' }, { value: false, label: 'NO' }],
            fundType: [{ value: true, label: 'ONCOLOGICAL' }, { value: false, label: 'NOT_ONCOLOGICAL' }],
            orphan: [{ value: true, label: 'YES' }, { value: false, label: 'NO' }],
            transparency: [{ value: true, label: 'YES' }, { value: false, label: 'NO' }],
            patented: [{ value: true, label: 'YES' }, { value: false, label: 'NO' }]
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
        vm.initController(sphaInnovativeServices);
    }
})();
