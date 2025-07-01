(function() {

	'use strict';

	angular
		.module('menuApp')
		.controller('menuCtrl', menuHomeController)
		.$inject = ['$scope', 'PortalService', '$rootScope', '$state', '$uibModal','$timeout','UserProfile'];

		function menuHomeController ($scope, PortalService, $rootScope, $state, $uibModal, $timeout,UserProfile){
			$scope.app = $rootScope.currentApp;

			$scope.openModal = function(stateId) {
				var state = $state.get(stateId);

				var modalInstance = $uibModal.open({
		              templateUrl: state.views.content.templateUrl,
		              controller:  state.views.content.controller,
		              size: "lg",
		              windowClass: "app-modal-window",
		              backdrop: true,
		          });
			}

            $scope.loadScroll = function(){
                $('.scrollable').mCustomScrollbar({setHeight: 343});
            }
		}
})();
