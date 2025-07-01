(function() {
    function isTouchDevice() {
        return "ontouchstart" in window || navigator.msMaxTouchPoints > 0;
    }

    function encapsulateResponse(id, filename, responseJSON, $scope){
        $scope.$parent.uploadResponse = responseJSON;
    }

    function clearAllupload(){
        $scope.$parent.uploadResponse = responseJSON;
        $('.fs').show()
    }

    function initButtonText($scope) {
        var input = document.createElement("input");

        input.setAttribute("multiple", "false");

       /* if (input.multiple === true && !qq.android()) {
            $scope.uploadButtonText = "Select Files";
        }
        else {*/
            $scope.uploadButtonText = "Seleziona File";
            $('.fs').show()
      /*  } */
    }

    function initDropZoneText($scope, $interpolate) {
   /*     if (qq.supportedFeatures.folderDrop && !isTouchDevice()) {
            $scope.dropZoneText = "Drop Files or Folders Here";
        }
        else if (qq.supportedFeatures.fileDrop && !isTouchDevice()) {
            $scope.dropZoneText = "Drop Files Here";
        }
        else { */
            $scope.dropZoneText = $scope.$eval($interpolate("Premi '{{uploadButtonText}}'"));
        /*}*/
    }

    function bindToRenderedTemplate($compile, $scope, $interpolate, element) {
        $compile(element.contents())($scope);

        initButtonText($scope);
        //initDropZoneText($scope, $interpolate);
    }

    function openLargerPreview($scope, uploader, modal, size, fileId) {
        uploader.drawThumbnail(fileId, new Image(), size).then(function(image) {
            $scope.largePreviewUri = image.src;
            $scope.$apply();
            modal.showModal();
        });
    }

    function closePreview(modal) {
        modal.close();
    }

    angular.module("portalApp")
        .directive("fineUploader", function($compile, $interpolate) {
            return {
                restrict: "A",
                replace: true,
                scope: {
                	onCompleteFunction: '=onCompleteFunction',
                	onSubmitFunction: '=onSubmitFunction',
                	param: '=param'                },
                templateUrl: "js/directive/fine-uploader/html/qq-template.html",
                link: function($scope, element, attrs) {
                    var endpoint = attrs.uploadServer,
                        notAvailablePlaceholderPath = attrs.notAvailablePlaceholder,
                        waitingPlaceholderPath = attrs.waitingPlaceholder,
                        acceptFiles = attrs.allowedMimes,
                        sizeLimit = attrs.maxFileSize,
                        largePreviewSize = parseInt(attrs.largePreviewSize),
                        allowedExtensions = JSON.parse(attrs.allowedExtensions),
                        previewDialog = document.querySelector('.large-preview'),
                        uploader = new qq.FineUploader({
                            debug: true,
                            multiple:false,
                            element: element[0],
                            request: {endpoint: endpoint},

                            validation: {
                                acceptFiles: acceptFiles,
                                allowedExtensions: allowedExtensions,
                                sizeLimit: sizeLimit
                            },

                            deleteFile: {
                                endpoint: endpoint,
                                enabled: true
                            },

                            thumbnails: {
                                placeholders: {
                                    notAvailablePath: notAvailablePlaceholderPath,
                                    waitingPath: waitingPlaceholderPath
                                }
                            },

                            display: {
                                prependFiles: true
                            },

                            failedUploadTextDisplay: {
                                mode: "custom"
                            },

                            retry: {
                                enableAuto: false
                            },

                            chunking: {
                                enabled: false
                            },

                            resume: {
                                enabled: true
                            },

                            callbacks: {
                                onSubmitted: function(id, name) {
                                  var parts = name.split(".");

                                  $('.fs').hide()
                                  if(allowedExtensions.indexOf(parts[parts.length-1])==-1){

                                  }else{
                                    $('#msgExt').hide()
                                  }
                                },
                                onError: function(id, name, errorReason, xhrOrXdr) {

                                  if(name==undefined){
                                    $('#msgExt').show()
                                  }
                                  var parts = name.split(".");
                                  if(allowedExtensions.indexOf(parts[parts.length-1])==-1){
                                        $('#msgExt').show()
                                        this.cancelAll();
                                        this.clearStoredFiles();
                                        $('.fs').show()
                                  }else{
                                    $('#msgExt').hide()
                                  }
                                },

                                onComplete: function(id, fileName, responseJSON) {
                                	$scope.onCompleteFunction();
                                    $scope.$apply();

                                    this.cancelAll();
                                    this.clearStoredFiles();
                                    $('.fs').show()
                                },

                                onSubmit: function (id, fileName) {
                                	if ($scope.onSubmitFunction)
                                		$scope.onSubmitFunction();
                                        $scope.loading = true;
                                        this.setParams($scope.param);
                                        this.setParams($scope.param);
                                }
                            }
                        });

                   qq(document.getElementById("trigger-upload")).attach("click", function() {
                        uploader.uploadStoredFiles();
                    });

                    //dialogPolyfill.registerDialog(previewDialog);
                    //$scope.closePreview = closePreview.bind(this, previewDialog);
                    bindToRenderedTemplate($compile, $scope, $interpolate, element);
                }
            }
        });
})();
