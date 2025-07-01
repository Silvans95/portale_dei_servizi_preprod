/**
 * @ngdoc function
 * @name sphaTransparencyDetailCtrl
 * @description controller for search procedimenti
 * # sphaTransparencyDetailCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp').controller('sphaTransparencyDetailCtrl', sphaTransparencyDetailCtrl);

    sphaTransparencyDetailCtrl.$inject = ['$controller', '$state','$scope', '$window','$rootScope', '$extend', 'sphaTransparencyServices'];

    function sphaTransparencyDetailCtrl($controller, $state, $scope,$window,$rootScope, $extend, sphaTransparencyServices) {
        var vm = $extend ? $extend : this;

        // instantiate parent controller
        var parent = $controller('sphaAbstractRectifiableAnagraphicDetailController', {$scope: $scope, $extend: this});

        angular.extend(vm, parent);
		if (!vm.isUpdateRectification){
			$rootScope.goBack=null;	
		}
        // initializing parent controller

        vm.initController(sphaTransparencyServices);

		/**
         * Funzione per il submit della ricerca tramite input
         */
        vm.saveFormRect = function (form) {
          
		  vm.saveForm(form);
  		  vm.isUpdateRectification=true;
		  $rootScope.goBack = 'spha.searchRectification';
        };
     
        vm.goBack = function () {
     		
            if ($rootScope.goBack) {
                $state.go($rootScope.goBack);
            } else {
                $window.history.back();
            }
        };
    }
})();