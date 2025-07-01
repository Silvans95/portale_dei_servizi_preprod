'use strict';
/**
 * @ngdoc function
 * @name sphaGSDPSubmitCtrl
 * @description controller for submit a GSDP
 */
(function () {
    angular.module('sphaApp')
        .controller('sphaSubmitGSDPCtrl', ['$location', '$anchorScroll','$document', 'httpServices', 'SweetAlert','$uibModal', '$translate', 'PropertiesServiceSpha', '$scope', '$state', '$stateParams', '$cookies', '$http', 'sphaGSDPServices',
            function ($location, $anchorScroll, $document, httpServices, SweetAlert, $uibModal, $translate, PropertiesServiceSpha, $scope, $state, $stateParams, $cookies, $http, sphaGSDPServices) {

                var vm = this;
                vm.message = "";
                vm.alertClass = "";

                vm.gsdpInstance = null;
                vm.id = $stateParams.id;

                const apiAnagraphicUrl = PropertiesServiceSpha.get("baseUrlProcedure");
                const checkInstanceUrl = apiAnagraphicUrl + "api/gsdp-instances/";
                const apiGSDPFilesUrl = apiAnagraphicUrl + "api/gsdp-files";
                const SLASH_ARG = "/{0}"
                vm.bkpFiles = [];

                //questo oggetto terrà traccia se avvengono modifiche nella directive. Sto usando un object per questioni di refenrce
                vm.dirty = false;
                vm.files = [];



                vm.modalInstance = null;
                $scope.waitModalMessage = null;
                $scope.validateFilesFn = validateFilesFn;
                $scope.progressWidth = 0;
                /**
                 * Init of input fields with :id gsdpInstance Values
                 */
                sphaGSDPServices.readGSDPInstance(checkInstanceUrl + vm.id, function (data, errors) {


                    if (errors) {
                        vm.message = errors.message;
                        vm.alertClass = errors.alertClass;
                    }
                    if (data) {
                        vm.gsdpInstance = data;
                        loadGSDPFiles();
                    }
                });

                $scope.reset = function () {
                    SweetAlert.swal({
                        title: $translate.instant("DIRTY_TRUE_CONFIRM"),
                        text: null,
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#337ab7",
                        confirmButtonText: $translate.instant('YES'),
                        cancelButtonText: $translate.instant('NO'),
                        closeOnConfirm: true,
                        closeOnCancel: true,
                    }, function (isConfirm) {
                        //ritorno ai file originali
                        vm.files = JSON.parse(JSON.stringify(vm.bkpFiles));
                        vm.dirty = false;
                    });
                }
                $scope.save = function () {
                    console.log(vm.files);
                    var filesToUpload = [];
                    var idFilesToDelete = [];
                    angular.forEach(vm.files, function (file) {
                        /*
                        * le operazioni da svolgere sono principalemente 2:
                        * Se nell'oggetto è presento un campo STATE = DELETED, devo rimuovere il file
                        * Se è un oggetto di tipo FILE, devo salvarlo nel db perche è stato appena caricato
                         */
                        if (file.hasOwnProperty('state') && file.state === "DELETED") {
                            idFilesToDelete.push(file.id);
                        } else if (file instanceof File) {
                            filesToUpload.push(file);
                        }
                    });
                    updateGSDPFiles(filesToUpload, idFilesToDelete);
                }

                $scope.submit = function() {
                    sphaGSDPServices.submitGSDPInstance(vm.gsdpInstance.id, "SUBMITTED", function (data, success, errors) {
                        if (success) {
                            SweetAlert.swal({
                                title: $translate.instant("SUCCESS"),
                                text: $translate.instant("SUCCESS_GSDP_SAVE"),
                                type: "success"
                            });
                        }else{
                            vm.message = errors.message;
                            vm.alertClass = errors.alertClass;
                        }
                    });
                }

                function updateGSDPFiles(filesToUpload, idFilesToDelete) {
                    loadModal();
                    syncFiles(filesToUpload, 0, idFilesToDelete, 0)
                }

                /*
                 *Questa funzione gestisce la sincronizzazione dei file con il BE in modalita sincrona
                 * Essa non fa altro che richiamarsi ricorsivamente più volte, fino
                 * a quando gli indici indexToUpload e indexToDelete risultano superiore al numero dei rispettivi elementi
                 */
                function syncFiles(filesToUpload, indexToUpload, idFilesToDelete, indexToDelete) {
                    const numberOfFiles = filesToUpload.length + idFilesToDelete.length;

                    if (indexToUpload < filesToUpload.length) {
                        const file = filesToUpload[indexToUpload];
                        $scope.waitModalMessage = { message: $translate.instant('UPLOAD_FILE_NAME_WAIT')+file.name};
                        $scope.progressWidth = ((indexToUpload+1) / numberOfFiles) * 100;

                        const metaData = {
                            gsdpInstanceId: vm.gsdpInstance.id,
                            description: file.name,
                            filename: file.name
                        };
                        sphaGSDPServices.uploadFile(metaData, file, function (data, success, errors) {
                            if (success) {
                                console.log("upload(success) in uploadFile modal controller");
                                syncFiles(filesToUpload, indexToUpload + 1, idFilesToDelete, indexToDelete);
                            } else {
                                vm.message = errors.message;
                                vm.alertClass = errors.alertClass;
                                vm.modalInstance.close();
                            }
                        });
                        return;
                    }else if (indexToDelete < idFilesToDelete.length) {
                        $scope.waitModalMessage = { message: $translate.instant('DELETE_FILE_NAME_WAIT') };
                        $scope.progressWidth = ((indexToUpload + indexToDelete+1) / numberOfFiles) * 100;

                        sphaGSDPServices.deleteFile(idFilesToDelete[indexToDelete], function (data, success, errors) {
                            if (success) {
                                syncFiles(filesToUpload, indexToUpload, idFilesToDelete, indexToDelete + 1);
                            } else {
                                vm.message = errors.message;
                                vm.alertClass = errors.alertClass;
                                vm.modalInstance.close();
                            }
                        });
                        return;
                    }
                    vm.modalInstance.close();
                    SweetAlert.swal({
                        title: $translate.instant("SUCCESS"),
                        text: $translate.instant("SUCCESS_GSDP_FILE_SAVE"),
                        type: "success"
                    });

                    //refresh delle informazioni
                    loadGSDPFiles();
                }

                function validateFilesFn(file) {
                    var validFile = true;
                    if (file && file.name) {
                        const MAX_FILES_LENGTH = 200;
                        validFile = file.name.length < MAX_FILES_LENGTH;
                        if (!validFile) {
                            alert($translate.instant('ERROR_FILENAME_TOO_LONG'));
                        }
                    }
                    return validFile;
                }

                function loadGSDPFiles() {
                    sphaGSDPServices.readGsdpInstanceFiles(vm.gsdpInstance.id, function (data, errors) {
                        if (errors != null) {
                            scope.message = errors.message;
                            scope.alertClass = errors.alertClass;
                        }
                        if (data) {
                            //aggiungo ad ogni file il link per il download. Questa operazione mi è utile nella diorettiva di
                            //visualizzazione
                            angular.forEach(data, function (file) {
                                file.link = apiGSDPFilesUrl+stringFormat(SLASH_ARG, file.id) +"/view";
                                file.download = apiGSDPFilesUrl+stringFormat(SLASH_ARG, file.id) +"/download";

                            })
                            //clonazione oggeti
                            vm.bkpFiles = JSON.parse(JSON.stringify(data));
                            vm.files = data;
                        }

                    });
                }

                function loadModal() {
                    const el = $document[0].querySelector( '#uploadMultiFileActions');
                    const parentElement  =angular.element(el);
                    vm.modalInstance = $uibModal.open({
                        templateUrl: 'modules/spha/js/directives/modal-waitbar/modalWaitbar.html',
                        size: 'm',
                        windowClass: 'relative',
                        appendTo: parentElement,
                        scope: $scope,
                        controllerAs: '$sphaSubmitGSDPCtrl',
                        /*controller: function ($scope) {
                            $scope.title = $translate.instant('UPLOAD_FILE_NAME_WAIT');
                            $scope.message =vm.waitModalMessage != null ? vm.waitModalMessage.message : "";
                            $scope.progressType = "progress-bar-primary";
                        }*/
                    });
                    $scope.title = $translate.instant('UPLOAD_FILE_NAME_WAIT');
                    $scope.$watch('waitModalMessage', function (waitModalMessage) {
                        $scope.message= waitModalMessage != null ? waitModalMessage.message : "";

                    });
                    $scope.$watch('progressWidth', function (progressWidth) {
                        $scope.progressWidth= progressWidth;

                    });
                    $scope.progressType = "progress-bar-primary";
                }

                var stringFormat = function(format) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    return format.replace(/{(\d+)}/g, function(match, number) {
                        return typeof args[number] != 'undefined'
                            ? args[number]
                            : match
                            ;
                    });
                };
            }]);

})();
