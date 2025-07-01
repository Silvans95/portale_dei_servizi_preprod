(function() {

	'use strict';

	angular
		.module('notificheApp')
		.controller('notificheReadCtrl', notificheReadController)
		.$inject = ['$scope', '$stateParams', 'NotificheResource', '$sce'];

	function notificheReadController($scope, $stateParams, NotificheResource, $sce){
		$scope.convertiInData = function(dataString) {

				 let   date = new Date(dataString);
				 let offset = date.getTimezoneOffset();
				 let timestamp = date.getTime();
					 date = new Date(timestamp + (offset * 60 * 1000));

					return date;
				};
		$scope.idNotificaObj = {id:$stateParams.idNotifica};
		let idNotifica = $scope.idNotificaObj.id;
		NotificheResource.leggiNotifica({id:idNotifica}).$promise.then(function (response) {
			$scope.dettaglioNotifica = response;
			$scope.$emit('readNotifica');

		  });
			 
	};

})();
