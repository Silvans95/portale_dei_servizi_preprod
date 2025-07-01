(function() {

	'use strict';

	angular.module('portalApp').directive('fetWizardItem',
			[ '$parse', function($parse) {
				return {
					restrict : 'E',
					templateUrl: "modules/fet/directive/fet-wizard-item/html/fet-wizard-item.html",
					transclude: {
						before: "?before",
						enabled: "?enabled",
						disabled: "?disabled",
						loading: "?loading",
						commands: "?commands"
					},
	                scope: {
	                	title: "@",
	                	status: "=",
	                	submitButton: "@?",
	                	onsubmit: "&?",
	                	button1: "@?",
	                	button1OnClick: "&?",
	                	cssClasses: "@?",
	                	showCommands: "=?"
	                },
					link : function(scope, element, attrs) {
						// Initialize scope
						scope.FET = FET;
						// Update commands visibility
						updateCommandsVisibility( scope );
						// Set buttons status
						scope.submitButtonEnabled = scope.submitButton ? true : false;
						scope.button1Enabled = typeof scope.button1OnClick == "function";
						// Calculate controls cells size
						var controlsCount = ( scope.submitButtonEnabled ? 1 : 0 )
							+ ( scope.button1Enabled ? 1 : 0 );
						var controlsCellSize;
						switch( controlsCount ) {
							case 0:	
							case 1:
							case 2:
							case 3:
							case 4:
							case 6:
								controlsCellSize = 12 / controlsCount;
								break;
							case 5:
								controlsCellSize = 4;
								break;
							default:
								controlsCellSize = 12;
								break;
						}
						scope.internalCommandsVisible = controlsCellSize > 0;
						scope.controlsCellSize = controlsCellSize;
						// FN: submit()
						scope.submit = function() {
							if( typeof scope.onsubmit == 'function' ) {
								scope.onsubmit();
							}
						};
						// FN: button1Submit()
						scope.button1OnClick = function() {
							if( typeof scope.button1OnClick == 'function' ) {
								scope.button1OnClick();
							}
						};
						// WATCH: status change
						scope.$watchGroup( ["status.status", "showCommands"], function(){
							updateCommandsVisibility( scope );
						} );
					}
				};
			} ]);
	
	function updateCommandsVisibility( scope ) {
		if( typeof scope.showCommands != 'undefined' ) {
			scope.commandsVisible = !!scope.showCommands;
		} else {
			scope.commandsVisible = ( scope.status.status == FET.PanelStatus.ENABLED );
		}
	}

})();