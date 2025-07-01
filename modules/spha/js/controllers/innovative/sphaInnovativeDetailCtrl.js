/**
 * @ngdoc function
 * @name sphaInnovativeDetailCtrl
 * @description controller for search procedimenti
 * # sphaInnovativeDetailCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp').controller('sphaInnovativeDetailCtrl', sphaInnovativeDetailCtrl);

    sphaInnovativeDetailCtrl.$inject = ['$controller', '$scope', '$extend', 'sphaInnovativeServices'];

    function sphaInnovativeDetailCtrl($controller, $scope, $extend, sphaInnovativeServices) {
        var vm = $extend ? $extend : this;

        // instantiate parent controller
        var parent = $controller('sphaAbstractRectifiableAnagraphicDetailController', {$scope: $scope, $extend: this});

        angular.extend(vm, parent);

        // initializing parent controller

        vm.initController(sphaInnovativeServices);
    }
})();