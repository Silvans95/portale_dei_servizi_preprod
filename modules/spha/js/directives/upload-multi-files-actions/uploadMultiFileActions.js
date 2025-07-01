angular.module( 'sphaApp')
	.config(['$compileProvider',
		function ($compileProvider) {
			$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
		}])
  .directive( 'uploadMultiFileActions', function( ) {
	 return {
		 restrict: 'E',
		 templateUrl: 'modules/spha/js/directives/upload-multi-files-actions/uploadMultiFileActions.html',
		 scope : {
			 draggedFile : "=draggedFile",
			 files: "=files",
			 onlyOneFile: "=onlyOneFile",
			 acceptedFiles:"=acceptedFiles",
			 validateFn: '&validateFn',
			 dirty:'=dirty'
		 },
		 link: function( scope, el, attrs ) {

		 	scope.viewFile = function(f){
		 		console.log(f);
				/*var r = new FileReader();
				r.readAsDataURL(f);
				r.onloadend = function(event){
					console.error(event);
					r.readAsBinaryString(f);
					r.onloadend = function (event) {
						console.log(event);
					}
				};*/


			}
			/**
			 * Upload dei file
			 */
			 scope.upload = function( files ){
				  if( files && files.length > 0 ){
					  if( !scope.onlyOneFile ){
						  for( var i in files ){
							  if( files[i] ){
								scope.validateAndPushFile( files[i] );
							  }
						  }
					  }else if( scope.onlyOneFile ){
						  scope.files = [];
						  scope.validateAndPushFile(files[0]);
					  }
				  }
			  };
			  
			  /**
			   * Rimuove un file dalla lista per l'upload
			   */
			  scope.removeFile = function( file ){
				  for( var i in scope.files ){
					  if( scope.files[i] == file ){
						  scope.dirty = true;
					  	   //rimuovendoli dall'array perderei informazioni su chi è stato realmente cancellato
						  scope.files[i].state = "DELETED";
						  //scope.files.splice( i, 1 );
					  }
				  }
				  
			  };
			  
			  scope.validateAndPushFile = function( file ){
				  var validFile = true;
				  if (scope.validateFn) {
					  validFile = scope.validateFn()( file );
				  }
				  if( validFile ){
				  	scope.dirty = true;
				  	scope.files.push ( file );
					  scope.link=(window.URL || window.webkitURL).createObjectURL(file);
				  }
				  return validFile;
			  }


			  scope.$watch('acceptedFiles', function( acceptedFiles ){
				  if( acceptedFiles ){
					  acceptedFiles = "'*'";
				  }
				  return acceptedFiles;
			  });

			  scope.$watch( 'draggedFile', function( files ){
				  if( files ){
					  if( files.length > 0 ){
						  var theFiles = files.slice();
						  for( var i in theFiles ){
							if( theFiles[i] ){
								scope.validateAndPushFile( theFiles[i] );
							}
						  }
					  }
				  }
				  
			  });
	
		 }
	 }	  
  });
