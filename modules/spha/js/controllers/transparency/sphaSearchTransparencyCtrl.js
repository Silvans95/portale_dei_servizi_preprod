/**
 * @ngdoc function
 * @name sphaSearchTransparencyCtrl
 * @description controller for search procedimenti
 * # sphaSearchTransparencyCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaSearchTransparencyCtrl', sphaSearchTransparencyCtrl);
        
    sphaSearchTransparencyCtrl.$inject = ['$controller', '$scope', '$extend', 'sphaTransparencyServices'];
        
    function sphaSearchTransparencyCtrl ($controller, $scope, $extend, sphaTransparencyServices) {
        
        // Init Filters' domains
        $scope.filters = {
            companies: {elements: [], page: 0},
            reimbursementClass: {elements: [], page: 0, valueType: 'reimbursementClass'},
            atc: {elements: [], page: 0, valueType: 'atc'},
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
        vm.initController(sphaTransparencyServices);
    }
})();
