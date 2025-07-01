(function() {
	'use strict';

	var StacktraceService = function() {};
	StacktraceService.prototype.print = function($window, exception) {
	  return $window.printStackTrace({
	    e: exception
	  });
	};
	
	angular.module('portalApp').service('stacktraceService', StacktraceService);

})();