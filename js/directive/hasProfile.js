(function() {
  'use strict';

angular.module('portalApp').
  directive('ngHasProfile', ['UserProfile', function(UserProfile) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs, ngModelCtrl) {
    	  $(element).hide();
    	  
    	  UserProfile.then(function(user){
        	  if (!user.$hasProfile(attrs.ngHasProfile))
        		  $(element).remove();
        	  else
        		  $(element).show();
      	  })
      }
      
    };
  }])

})();