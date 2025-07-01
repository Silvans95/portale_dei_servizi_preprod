 (function () { 
 'use strict';
angular.module( 'versionableFileDirective', ['httpServicesSpha'] )
  .directive( 'ngVersionableFile', ['$uibModal', 'httpServices','$timeout', 'SweetAlert', '$translate',
	  function( $uibModal, httpServices, $timeout, SweetAlert, $translate ) {
	 return {
		 restrict: 'E',
		 templateUrl: 'modules/spha/js/directives/versionable-file/versionableFile.html',
		 scope : {
			 file : "=file",
			 files: "=files",
			 url: '=url',
			 showVersion : '=showVersion',
			 removeDisable : '=removeDisable',
			 uploadVersion : "=uploadVersion",
			 uploadUrl : "=uploadUrl",
			 form:"=form",
             configs:"=configs", // {uploadTitle:string}
			 removeExternalDisable:"=removeExternalDisable",
			 functionRemoveFile:"&functionRemoveFile",
			 functionUploadVersion:"&functionUploadVersion"
		 },
		 link: function( scope, el, attrs ) {
			 switch( scope.file.mimetype ){
			 	case "text/pdf":  
			 	case "application/pdf":
			 	   scope.path ="modules/spha/images/file/pdf.png";
			 	   break;
			 	case "application/msword": 
			 	case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				 	   scope.path ="modules/spha/images/file/word.png";
				 	   break;
			 	case "application/vnd.ms-excel": 
			 	case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
			 		scope.path ="modules/spha/images/file/excel.png";
			 		break;
			 	case "application/vnd.ms-powerpoint": 
			 	case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
			 		scope.path ="modules/spha/images/file/ppt.png";
			 		break;
			 	default :
			 		scope.path ="modules/spha/images/file/document.png";
			 		break;
			 }
			 scope.modalInstance = null;
			 scope.enablePreview = false;
			 
			 scope.$watch( function(){
				 return scope.file;
			 },function( file ){
				 if( file ){
					 if( file.version ){
						 scope.viewUrl = scope.url + file.id + "/" + file.version + "/view";
						 scope.downloadUrl = scope.url + file.id + "/" + file.version + "/download";
					 }else{
						 scope.viewUrl = scope.url + file.id  + "/view";
						 scope.downloadUrl = scope.url + file.id + "/download";
					 }
				 }
			 } );
			 
//			 //controllo che ci siano richieste di modifiche sul file
//			 if( scope.file && scope.file.modifyRequested ){
//				 if( scope.form ){
//					 $timeout( function(){
//						 scope.form.$setValidity('file_'+scope.file.id, false);
//						 scope.form['file_'+ scope.file.id].$setValidity('pattern', false);
//					 },0 );
//				 }
//			 }
			 
			 
			 /**
		      * Modal show
		      * 
		      */
			scope.open = function ( fileId, size, parentSelector ) {
			    if(scope.file.mimetype && scope.file.mimetype.indexOf('pdf') > -1) {
                    var parentElem = parentSelector ?
                        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
                    scope.modalInstance = $uibModal.open({
                        animation: scope.animationsEnabled,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'modules/spha/js/directives/modal/modal.html',
                        appendTo: parentElem,
                        size: 'lg',
                        controllerAs: '$ctrl',
                        controller: function ($scope, $sce) {
                            $scope.link = $sce.trustAsResourceUrl(scope.viewUrl);
                            $scope.isPdf = true;
                            if (scope.file.mimetype.indexOf("image") > -1) {
                                $scope.isPdf = false;
                            }
                            $scope.cancel = function () {
                                scope.modalInstance.dismiss('cancel');
                            };
                        }

                    });
                }
			};
			
			
			
			scope.remove = function( file ){
				for( var i in scope.files ){
					if( scope.files[i] == file ){
						scope.files.splice( i, 1 );
						  if( file.modifyRequested && scope.form ){
	    	    			  scope.form.$setValidity('file_'+file.id, true);
	 						  scope.form['file_'+ file.id].$setValidity('pattern', true);
	    	    		  }
					}
				}
			};
			
			scope.externalRemove = function ( file ){
				if( !scope.removeExternalDisable ){
					SweetAlert.swal({
						   title: $translate.instant("CONFIRM_DELETE_FILE") + " " + file.filename + "?",
						   text: null,
						   type: "warning",
						   showCancelButton: true,
						   confirmButtonColor: "#337ab7",
						   confirmButtonText: $translate.instant('YES'),
				   		   cancelButtonText: $translate.instant('NO'),
					   	   closeOnConfirm: true,
					   	   closeOnCancel: true, 
						   },function( isConfirm ){
							   if( isConfirm ){
								   scope.functionRemoveFile({ file: file });
							   }
						   }
					);
					
				}
			}
			
			scope.remove = function( file ){
				for( var i in scope.files ){
					if( scope.files[i] == file ){
						scope.files.splice( i, 1 );
						if( file.modifyRequested && scope.form ){
							scope.form.$setValidity('file_'+file.id, true);
							scope.form['file_'+ file.id].$setValidity('pattern', true);
						}
					}
				}
			};
			
			scope.openVersion = function( id, size, parentSelector ){
				httpServices.get( scope.url + id +'/versions', function ( data, success, error ){
					if( success ){
						if( error ){
							vm.message = error;
							vm.alertClass = "alert alert-warning";
						}
						var parentElem = parentSelector ? 
						    	angular.element($document[0].querySelector( '.modal-demo ' + parentSelector ) ) : undefined;
						    	    scope.modalInstance = $uibModal.open({
						    	      animation: scope.animationsEnabled,
						    	      ariaLabelledBy: 'modal-title',
						    	      ariaDescribedBy: 'modal-body',
						    	      templateUrl: 'modules/spha/js/directives/modal/modalShowVersion.html',
						    	      appendTo: parentElem,
						    	      size: 'lg',
						    	      controllerAs: '$ctrl',
						    	      controller: function( $scope, $sce ) {
						    	    	  $scope.url = scope.url; 
						    	    	  $scope.fileVersions = data;
						    	    	  $scope.cancel = function () {
						    	    		  scope.modalInstance.dismiss( 'cancel' );
						    	    	  };
						    	      }
						    	      
						    });
					}else{
						scope.message = error;
						scope.alertClass = "alert alert-danger";
					}
				});
			};
			
			scope.openUploadPopup = function( file, size, parentSelector ){
				scope.functionUploadVersion( { file:file } ); 
			};
			
		 }		  
	 }	  
  }]);
})();
 