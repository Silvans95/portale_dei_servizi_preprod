(function() {
	'use strict';

	angular.module('fetApp').controller('fetHomeCtrl', fetHomeController).$inject = [
			'$scope', '$state' ];

	function fetHomeController($scope, $state) {
		let codiceApplicazione = $state.current.name.split(".")[0].toUpperCase();
        localStorage.setItem('codiceApplicazione', codiceApplicazione);

        $scope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl) {
            if (newUrl != undefined && newUrl != oldUrl) {
                location.reload();
                }
            });

        
	}

})();
