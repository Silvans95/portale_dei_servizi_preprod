(function () { 
 'use strict';
angular.module( 'sphaApp' )
  .directive( 'procedureFiles', ['$translate', '$timeout','blockUI', '$uibModal', '$rootScope', 'PropertiesServiceSpha', 'sphaProcedureServices',
	  function ( $translate, $timeout, blockUI, $uibModal, $rootScope, PropertiesServiceSpha, sphaProcedureServices ){
	 
	  return {
			 restrict: 'E',
			 templateUrl: 'modules/spha/js/directives/procedure/procedure-files.html',
		 scope: {
			idProcedure:"=idProcedure",
			readOnly: "=readOnly",
			showImportButton: "=showImportButton",
			import: "=import",
			message:"= message",
			alertClass:"=alertClass",
		 },
		 link: function( scope, el, attrs ){

			   if( blockUI.isBlocking() == false ){
				   blockUI.start();
			   }
			   
//			   var urlGetDocumentType = scope.url + "get_document_types/WORKING";
//			   var urlGetListOfCentre = scope.url + (scope.idCte && scope.idCte!=null ? "ctefacilities" : "ctafacilities");			   

			   scope.files = [];
			   scope.count = 0;
			   scope.debugMode = $rootScope.debugMode;
			   scope.sectionOrder = ['DOC_CORE'];
			   scope.url = PropertiesServiceSpha.get("baseUrlProcedure") + "api/procedure-files/";
			   scope.versionabelFileConfigs = {uploadTitle: 'PROCEDURE_FILE_SUBSTITUTE'};

			   /**
				* Loads all procedure Files from BE
				* and updates data model
				*/
			   function loadAllFiles(){
					sphaProcedureServices.readProcedureFiles(scope.idProcedure, function( data, errors ){
						if( errors ){
							scope.message = errors.message;
							scope.alertClass = errors.alertClass;
						}
						if( data ){
							scope.files = data;
						}
					});
			   }

				function validateFilesFn( file ){
					var validFile = true;
					if( file && file.name ){
						const MAX_FILES_LENGTH = 200;
						validFile = file.name.length < MAX_FILES_LENGTH;
						if( !validFile ){
							alert( $translate.instant('ERROR_FILENAME_TOO_LONG') );
						}
					}
					return validFile;
				}

			   function init(){
				 
					// Loads all procedure Files
					loadAllFiles();

				   /**
				     * Remove File
				     */
					scope.removeFile = function( file ){
						console.log("removeFile() callback in procedureFiles directive");
						sphaProcedureServices.deleteFile( file, function( success, errors ){
							if( success ){
								// TODO
								loadAllFiles();
							}else{
							   scope.message = errors.message;
							   scope.alertClass = errors.alertClass;
							}
						});
					} 
					
					
					/**
				      * Modal upload file
				      */
					scope.importFiles = function () {
						sphaProcedureServices.importFiles(scope.idProcedure, function (data, success, errors) {
							if( success ){
								console.log("import(success) in importFiles modal controller");
								scope.cancel();
								loadAllFiles();
							} else {
								scope.message=errors.message;
								scope.alertClass=errors.alertClass;
							}
						});
					};
					
					
					/**
				      * Modal upload file
				      */
					scope.uploadFile = function () {
						scope.modalInstance = $uibModal.open({
							animation: scope.animationsEnabled,
							ariaLabelledBy: 'modal-title',
							ariaDescribedBy: 'modal-body',
							templateUrl: 'modules/spha/js/directives/modal/modalUploadProcedureFile.html',
							size: 'lg',
							controllerAs: '$ctrl',
							controller: function( $scope, $sce ) {
								$scope.metadata = {
									id: null,
									procedureId: scope.idProcedure,
									description : null,
									// 	creationGroup : null,
									// 	creationGroups : [],
								};
								
								$scope.files = [];
								$scope.validateFilesFn = validateFilesFn;

								$scope.upload= function(){
									console.log("upload() in uploadFile modal controller");
									sphaProcedureServices.uploadFile($scope.metadata, $scope.files[0], function (data, success, errors) {
										if( success ){
											console.log("upload(success) in uploadFile modal controller");
											$scope.cancel();
											loadAllFiles();
										} else {
											$scope.message=errors.message;
						    	    		$scope.alertClass=errors.alertClass;
										}
									});
								}

								$scope.cancel = function () {
									scope.modalInstance.dismiss( 'cancel' );
								};
							}
						});
					};

					/**
					 * Modal upload file
					 */
					scope.uploadFileVersion = function ( file ) {
						scope.modalInstance = $uibModal.open({
							animation: scope.animationsEnabled,
							ariaLabelledBy: 'modal-title',
							ariaDescribedBy: 'modal-body',
							templateUrl: 'modules/spha/js/directives/modal/modalUploadProcedureFile.html',
							size: 'lg',
							controllerAs: '$ctrl',
							controller: function( $scope, $sce ) {
								$scope.metadata = {
									id: file.id,
									procedureId: file.procedureId,
									description : file.description,
									// 	creationGroup : null,
									// 	creationGroups : [],
								};
								
								$scope.files = [];
								$scope.validateFilesFn = validateFilesFn;

								$scope.upload= function(){
									console.log("upload() in uploadFileVersion modal controller");
									sphaProcedureServices.uploadFile($scope.metadata, $scope.files[0], function (data, success, errors) {
										if( success ){
											console.log("upload(success) in uploadFile modal controller");
											$scope.cancel();
											loadAllFiles();
										} else {
											$scope.message=errors.message;
						    	    		$scope.alertClass=errors.alertClass;
										}
									});
								}

								$scope.cancel = function () {
									scope.modalInstance.dismiss( 'cancel' );
								};
							}
						});
					};
			   }
			
			 $timeout(function(){
				init(); 
				blockUI.stop();
			 },0);
			 
		 }
	  };		 
	  
  }]);
})();