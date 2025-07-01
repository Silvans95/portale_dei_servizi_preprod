(function () { 
 'use strict';
angular.module( 'uploadFilesDirectiveSpha', [] )
  .directive( 'uploadFilesSpha', function( ) {
	 return {
		 restrict: 'E',
		 templateUrl: 'modules/spha/js/directives/upload-files/uploadSpha.html',
		 scope : {
			 draggedFile : "=draggedFile",
			 files: "=files",
			 onlyOneFile: "=onlyOneFile",
			 acceptedFiles:"=acceptedFiles",
			 validateFn: '&validateFn',
		 },
		 link: function( scope, el, attrs ) {			 
			
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
						  scope.files.splice( i, 1 );
					  }
				  }
				  
			  };
			  
			  scope.validateAndPushFile = function( file ){
				  var validFile = true;
				  if (scope.validateFn) {
					  validFile = scope.validateFn()( file );
				  }
				  if( validFile ){
					scope.files.push ( file );	  
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
						  scope.files = [];
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
})();