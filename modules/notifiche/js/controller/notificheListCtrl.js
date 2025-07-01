(function() {

	'use strict';

	angular
		.module('notificheApp')
		.controller('notificheListCtrl', notificheListController)
		.$inject = ['$scope', '$rootScope', '$stateParams', 'NotificheResource','$filter'];

	function notificheListController($scope, $rootScope ,$stateParams, NotificheResource,$filter){
		$scope.convertiInData = function(dataString) {

			   let   date = new Date(dataString);
				 let offset = date.getTimezoneOffset();
				 let timestamp = date.getTime();
				 date = new Date(timestamp + (offset * 60 * 1000));

			    return date;
			  };
		var currentApp = localStorage.getItem("codiceApplicazione");
		$scope.errorMessage = false;

		NotificheResource.getApplicazioniNas().$promise.then(function (responseArray) {
			$scope.applicazioniNas = responseArray;
			for(let x=0; x < $scope.applicazioniNas.length; x++) {
			  if($scope.applicazioniNas[x] === currentApp) {
				NotificheResource.getNotificheNas().$promise.then(function (response) {
				  $scope.listaNotifiche = response["content"];
					if($scope.listaNotifiche.length>0){
						$scope.listaNotifiche = $filter('orderBy')(response["content"], 'dataInizioValidita', true);
					}
				  return;
				});
			  }
			}
		  });
		$rootScope.setManualeDownloadUrl('NTF');
		
	};

})();
