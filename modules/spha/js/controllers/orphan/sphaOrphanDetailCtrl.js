/**
 * @ngdoc function
 * @name sphaOrphanDetailCtrl
 * @description controller for search procedimenti
 * # sphaOrphanDetailCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp').controller('sphaOrphanDetailCtrl', sphaOrphanDetailCtrl);

    sphaOrphanDetailCtrl.$inject = ['$controller', '$scope', '$extend', 'sphaOrphanServices'];

    function sphaOrphanDetailCtrl($controller, $scope, $extend, sphaOrphanServices) {
        var vm = $extend ? $extend : this;

        // instantiate parent controller
        var parent = $controller('sphaAbstractRectifiableAnagraphicDetailController', {$scope: $scope, $extend: this});

        angular.extend(vm, parent);

        // initializing parent controller

        vm.initController(sphaOrphanServices);
    }
})();