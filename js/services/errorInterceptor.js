(function() {

	'use strict';

	angular
	  .module('portalApp')
	  .factory('errorInterceptor', ErrorInterceptor)
	  .$inject = ['$q', '$injector', 'PropertiesService', '$sce'];

	function ErrorInterceptor($q, $injector, PropertiesService, $sce){

	  var enableModal = true;

	  function setEnableModal(open) {
		enableModal = open;
	  }

	  function getEnableModal() {
		return enableModal;
	  }

	  return {
		'setEnableModal': setEnableModal,
		'getEnableModal': getEnableModal,
		'responseError': function (rejection) {

		  var $uibModal = $injector.get('$uibModal');

		  if (rejection.config.url == "html/modalError.html")
			return $q.reject(rejection);

		  if (getEnableModal()) {
			var modalInstance = $uibModal.open({
			  templateUrl: "html/modalError.html",
			  controller:  function($scope){
				$scope.error = rejection;

				var errString = rejection.data;
				$scope.showAsHTML=true;
				if (rejection.data && rejection.data.detail){
				  errString = rejection.data.detail;
				  $scope.showAsHTML=false;
				}

				if (typeof errString == "string")
				  $scope.errorHTML = $sce.trustAsHtml(errString);
				else{
					if(rejection.data.errore != undefined){
						$scope.errorHTML = rejection.data.errore;
					}else{
						$scope.errorHTML = rejection.data;

					}
 					
				}
				 
				$scope.date = new Date();
				$scope.closeModal = function () {
				  modalInstance.dismiss('cancel');
				};
			  },
			  size: "lg",
			  windowClass: "app-modal-window",
			  backdrop: true,

			});
		  }

		  return $q.reject(rejection);
		},

		'request': function(config) {
		  return config;
		},
	   'requestError': function(rejection) {
		  return $q.reject(rejection);
		},
		'response': function(response) {
		  if (response.data && typeof response.data == "string" && response.data.indexOf("jam/UI/Login") != -1)
		  {
		window.location.href = PropertiesService.get("loginUrl") + encodeURIComponent(window.location.href);
		  }

		  return response;
		},
	  }
	}


  })();
