
/**
 * @ngdoc function
 * @name sphaGSDPSignConnectorCtrl
 * @description controller for sign Connector - GSDP Entities
 * # sphaGSDPSignConnectorCtrl
 */
(function () { 
 'use strict';
	angular.module('sphaApp')
	.controller('sphaGSDPSignConnectorCtrl',
		['$location','PropertiesServiceSpha', '$state', '$window', 'httpServices', 
			function ( $location, PropertiesServiceSpha, $state, $window, httpServices ) {
				var vm = this;
				vm.message = "";
				vm.alertClass = "";
				vm.data = {};
				
				var searchObject = $location.search();
				var sessionId = searchObject.sessionId;
				var status = searchObject.status;
				
				var signConnectorUrl = '';
				
				var urlProcedure = PropertiesServiceSpha.get("baseUrlProcedure");
						
				var param = searchObject.entityType;
				
				switch( param ){
					case 'GSDP':
						signConnectorUrl = urlProcedure + "api/gsdp-files/" + sessionId + "/sign-fet-post"
						break;
				}
							
				
				/** SIGN FET COMMON VARIABLE**/
				var resultValue  = "";
				var messageValue = "";
				var redirectURL  = "";
				var entityId;
				
				/** POST SIGN FET **/
				if(signConnectorUrl && signConnectorUrl !== '') {
                    httpServices.post(signConnectorUrl, null, function (data, success, error) {
                        /*console.log("## data.entityType: " + data.entityType);*/
                        if (data && data.entities) {
                            if (success) {
                                resultValue = "success";
                                messageValue = "SIGN_SUCCESS";
                            } else if (data.entities.length > 1 || data.entities.length === 0) {
                                resultValue = "failed";
                                messageValue = "SIGN_FAIL";
                                console.log("## Sign failed : " + error);
                            } else {
                                resultValue = "failed";
                                messageValue = "SIGN_FAIL";
                                console.log("## Sign failed : " + error);
                            }

                            entityId = data.entities[0].entityId
                        } else {
                            vm.message = "SIGN_FAIL";
                            vm.alertClass = "alert alert-danger";
                            resultValue = "failed";
                            messageValue = "SIGN_FAIL";
                        }

                        // new redirect logic
                        switch (param) {
                            case 'GSDP':
                                redirectURL = !success && entityId ? 'spha.gsdpSubmit' : 'spha.gsdpList';
                                break;
                        }
                        if (redirectURL !== "") {
                            if (entityId) {
                                $state.go(redirectURL, {result: resultValue, message: messageValue, id: entityId});
                            } else {
                                $state.go(redirectURL, {result: resultValue, message: messageValue});
                            }
                        } else {
                            vm.message = "SIGN_FAIL";
                            vm.alertClass = "alert alert-danger";
                        }
                    });
                }
			}
		]);
})();