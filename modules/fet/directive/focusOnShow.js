(function() {
	'use strict';

	angular.module('portalApp').directive('focusOnShow',
			[ '$timeout', function($timeout) {
				return {
					restrict : 'A',
					link : function($scope, $element, $attrs) {
						// Find attribute
						function findElementWithAttr( element, attr ) {
							if( $(element).attr(attr) !== undefined ) {
								return element;
							} else if( element.parentElement ) {
								return findElementWithAttr( element.parentElement, attr );
							} else {
								return null;
							}
						}
						//
						var ngShowElement = findElementWithAttr( $element[0], "ng-show" );
						if( ngShowElement ) {
							$scope.$watch( $(ngShowElement).attr("ng-show"), function( newValue ) {
								if (newValue) {
									$timeout(function() {
										$element[0].focus();
									}, 0);
								}
							})
						}
					}

				};
			} ])

})();