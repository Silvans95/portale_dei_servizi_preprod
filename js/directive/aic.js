(function() {
  'use strict';

angular.module('portalApp').
  directive('ngAic', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs, ngModelCtrl) {
      
	      var keyCode = [8,9,37,39,48,49,50,51,52,53,54,55,56,57,96,97,98,99,100,101,102,103,104,105];
	      var keyCodeControl = [8,9,37,39];
	      element.bind("keydown", function(event) {
	        if(			//tasto non consentito
	        			$.inArray(event.which, keyCode) == -1 
	        			//lunghezza maggiore di 8 e tasto non di controllo e testo non selezionato
	        		|| (event.currentTarget.value.length > 8 && $.inArray(event.which, keyCodeControl) == -1 && event.currentTarget.selectionEnd - event.currentTarget.selectionStart == 0 ) 
	        	) {
	            scope.$apply(function(){
	                scope.$eval(attrs.onlyNum);
	                event.preventDefault();
	            });
	            event.preventDefault();
	        }
	        
	      });
      }
      
    };
  })

})();