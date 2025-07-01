/// <reference path="../libs/angular/index.d.ts"/>
/// <reference path="../libs/aifa/PropertiesService.d.ts"/>
/// <reference path="../utils/EnumUtils.ts"/>
/// <reference path="../bean/Session.d.ts"/>
/// <reference path="../bean/SignFile.d.ts"/>
/// <reference path="../bean/SignedFile.d.ts"/>
/// <reference path="../asol/ASOLSigner.ts"/>
/// <reference path="../api/APIService.ts"/>
/// <reference path="SignScope.d.ts"/>
/// <reference path="SignCtrlConfig.d.ts"/>
/// <reference path="SignCtrl.ts"/>
/// <reference path="../classes/workflow/SignWorkflow.ts"/>

namespace FET {

    export abstract class AbstractSignCtrl implements SignCtrl {

        private session: Session;
        private workflow: SignWorkflow;

        public _asolCertificates: ASOL.Certificate[];

        private $scope: SignScope;
        private $http: angular.IHttpService;
        private $timeout: angular.ITimeoutService;
        private baseUrl: string;

        private signUsername: string;
        private signPassword: string;
        private signOtp: string;
        private signPin: string;
        private signCertificateId: number;

        private asolSigner: ASOL.ASOLSigner;
        private asolUrl: string;
        private asolClientCode: string;
    
        constructor(
            config: SignCtrlConfig,
            $scope: angular.IScope,
            $http: angular.IHttpService,
            $timeout: angular.ITimeoutService,
            PropertiesService: PropertiesService) {
            // Initialize context
            this.$scope = $scope as SignScope;
            this.baseUrl = PropertiesService.get("baseUrl") + "fet-web/";
            this.$http = $http;
            this.$timeout = $timeout;
            // Initalize
            this.initSession(config);
            this.initWorkflow();
            this.initScope();
            // Retrieve server configurations
            this.retrieveServerConfigurations();
        }

        private initSession(config: SignCtrlConfig): void {
            this.session = {
                uid: config ? config.sessionUID : null,
                availableSignMethods: EnumUtils.values(SignMethod),
                availableSignTypes: EnumUtils.values(SignType),
                availableSignChannels: EnumUtils.values(SignChannel),
                availableSignTypologies: EnumUtils.values(SignTypology),
                addFilesAllowed: true,
                signedFilesDownloadAllowed: true,
                files: [],
                signedFiles: [],
                redirectURL: null,
                signMethod: null,
                signType: null,
                signChannel: null,
                signTypology: null,
                isStandalone : false,
            }
        }

        private initWorkflow(): void {
            let self = this;
            this.workflow = new SignWorkflow(
                this.session,
                {
                    stateChanged: function (workflow: SignWorkflow, oldState: SignWorkflowState, newState: SignWorkflowState): void {
                        // Set state into the scope variable
                        self.$scope.state = newState;
                        // Reset panel errors
                        self.$scope.panels.initialization.errorMessage = null;
                        self.$scope.panels.files.errorMessage = null;
                        self.$scope.panels.signMethods.errorMessage = null;
                        self.$scope.panels.signChannels.errorMessage = null;
                        self.$scope.panels.signExt.errorMessage = null;
                        self.$scope.panels.completedSignExt.errorMessage = null;
                        self.$scope.panels.arssCredentials.errorMessage = null;
                        self.$scope.panels.asolCredentials.errorMessage = null;
                        self.$scope.panels.completed.errorMessage = null;
                        // Refresh UI
                        self.refreshUI();
                    },
                });
        }

        private initScope(): void {
            let self = this;
            // Initialize globals
            this.$scope.FET = FET;
            // Initialize configurations
            this.$scope.workflow = this;
            this.$scope.state = this.workflow.getState();
            this.$scope.availableSignMethods = EnumUtils.values(SignMethod);
            this.$scope.availableSignTypes = EnumUtils.values(SignType);
            this.$scope.availableSignChannels = EnumUtils.values(SignChannel);
            this.$scope.availableSignTypologies = EnumUtils.values(SignTypology);
            // Initialize UI variables
            this.$scope.file = null;
            this.$scope.files = this.session.files;
            this.$scope.signedFiles = [];
            this.$scope.signedFilesZipURL = null;
            this.$scope.filesToSignZipURL = null;
            this.$scope.signMethod = null;
            this.$scope.signType = null;
            this.$scope.signChannel = null;
            this.$scope.arssUsername = null;
            this.$scope.arssPassword = null;
            this.$scope.arssOtp = null;
            this.$scope.asolPin = null;
            this.$scope.asolCertificateId = null;
            this.$scope.redirectURL = null;
            this.$scope.redirectTimeoutSec = null;
            this.$scope.redirectRequested = false;
            this.$scope.downloadZip = false;
            this.$scope.downloadFile = [];
            this.$scope.countFilesUploaded = 0;
            this.$scope.isDisableBtnDone = true;
            this.$scope.isStandalone = false;
            this.$scope.volFiles = [];
            this.$scope.resultVol = true;
            // Initialize UI panels
            this.$scope.panels = {
                initialization: { status: PanelStatus.ENABLED },
                files: { status: PanelStatus.HIDDEN },
                signMethods: { status: PanelStatus.HIDDEN },
                signChannels: { status: PanelStatus.HIDDEN },
                signExt: { status: PanelStatus.HIDDEN },
                arssCredentials: { status: PanelStatus.HIDDEN },
                asolCredentials: { status: PanelStatus.HIDDEN },
                signTypologies : { status: PanelStatus.HIDDEN},
                signExtsysResult: { status: PanelStatus.HIDDEN },
                completedSignExt: { status: PanelStatus.HIDDEN },
                completed: { status: PanelStatus.HIDDEN },
            };
            // fn: sendFile
            this.$scope.sendFile = function () {
                self.uploadAndAddFile(self.$scope.file);
            };
            // fn: addFileUploaded
            this.$scope.addFileUploaded = function (file, index) {
                self.addFileUploaded(file, index);
            };
            // fn: addAnotherFile
            this.$scope.addAnotherFile = function () {
                // TODO Clear form
                self.moreFilesRequired(true);
            };
            // fn: filesAddingCompleted
            this.$scope.filesAddingCompleted = function () {
                switch (+self.workflow.getState()) {
                    case FET.SignWorkflowState.FILE_SELECTION:
                        if (!confirm("Cancel file addition and continue to next pass?")) {
                            return;
                        }
                        break;
                    case FET.SignWorkflowState.ASKING_FOR_MORE_FILES:
                        break;
                    default:
                        return;
                }
                self.moreFilesRequired(false);
            };
            // fn: setSignChannel
            this.$scope.setSignChannel = function () {
                // Check channel is selected
                if (!self.$scope.signChannel) {
                    alert("Select a channel");
                    return;
                }
                // Select Type Signature
                self.setSignChannel(self.$scope.signChannel);
            }

            // fn: setSignMethod
            this.$scope.setSignMethod = function () {
                // Check method is selected
                if (!self.$scope.signMethod) {
                    alert("Select a method");
                    return;
                }
                // Upload file
                self.setSignMethod(self.$scope.signMethod, self.$scope.signType);
            }
            this.$scope.onClickDownloadFile= function(index : number){
                self.$scope.downloadFile[index] = true;
                self.setErrorSignTypology();
            }
            this.$scope.onChangeSelectTypology = function(){
                self.initializeTable();
                self.setErrorSignTypology();
            }
            this.$scope.onClickSelectbox = function(){
                self.setWarningChangeTypology();
            }
            this.$scope.onClickDownloadZip = function(){
                self.$scope.downloadZip = true;
            }
            this.$scope.setRedirectRequested = function(){
                self.$scope.redirectRequested = true;
            }
            this.$scope.deleteSignedDocument = function(originalFile: SignFile, signedFile: SignFile, index: number){
                self.deleteSignedDocument(originalFile.uid, signedFile.uid, index);
            }
            this.$scope.onClickBtnDone = function(){
                self.onClickBtnDone();
            }
            // fn: sign
            this.$scope.sign = function () {
                switch (self.getSignMethod()) {
                    case FET.SignMethod.ARSS:
                        // Check credentials
                        if (!(self.$scope.arssUsername && self.$scope.arssPassword && self.$scope.arssOtp)) {
                            alert("Missing credentials");
                            return;
                        }
                        // Set credentials
                        self.setARSSCredentials(self.$scope.arssUsername, self.$scope.arssPassword, self.$scope.arssOtp);
                        //
                        break;
                    case FET.SignMethod.ASOL:
                        // Check credentials
                        if ((!self.$scope.asolPin) || self.$scope.asolCertificateId === null || isNaN(self.$scope.asolCertificateId)) {
                            alert("Missing credentials");
                            return;
                        }
                        // Set credentials
                        self.setASOLCredentials(self.$scope.asolPin, self.$scope.asolCertificateId);
                        //
                        break;
                    default:
                        alert("Unsupported signature method");
                        return;
                }
                // Sign
                self.sign();
            }
            this.$scope.nextTick = function() {
				if( self.$scope.redirectRequested ) {
					return;
				}
                // Decrease redirect timeout
                self.$scope.redirectTimeoutSec--;
                if (self.$scope.redirectTimeoutSec <= 0) {
                    window.location.href = self.$scope.redirectURL;
                } else {
                    self.$timeout(self.$scope.nextTick, 1000);
                }
            }
        }

        private getDocumentUrl(documentUID: string): string {
            return this.baseUrl + "document/" + encodeURI(documentUID) + "/download";
        }

        private refreshUI(): void {
            let self = this;
            this.$timeout(
                function () {
                    // Get state
                    let state: SignWorkflowState = self.workflow.getState();
                    // Configure panels
                    switch (+state) {
                        case SignWorkflowState.CONFIGURING:
                        case SignWorkflowState.CREATING_SESSION:
                        case SignWorkflowState.RETRIEVING_SESSION:
                            self.$scope.panels.initialization.status = PanelStatus.ENABLED;
                            self.$scope.panels.files.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signChannels.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signMethods.status = PanelStatus.HIDDEN;
                            self.$scope.panels.arssCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN
                            self.$scope.panels.completedSignExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.FILE_SELECTION:
                        case SignWorkflowState.ASKING_FOR_MORE_FILES:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.ENABLED;
                            self.$scope.panels.signMethods.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signChannels.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.arssCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN
                            self.$scope.panels.completedSignExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.UPLOADING_FILE:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.LOADING;
                            self.$scope.panels.signMethods.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signChannels.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.arssCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN
                            self.$scope.panels.completedSignExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.SIGN_CHANNEL_SELECTION:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.DISABLED;
                            self.$scope.panels.signMethods.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signChannels.status = PanelStatus.ENABLED;
                            self.$scope.panels.signExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.arssCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN
                            self.$scope.panels.completedSignExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.CONFIGURE_EXSYST_CHANNEL:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.DISABLED;
                            self.$scope.panels.signMethods.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signChannels.status = PanelStatus.DISABLED;
                            self.$scope.panels.signExt.status = PanelStatus.ENABLED;
                            self.$scope.panels.arssCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN
                            self.$scope.panels.completedSignExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.SIGN_METHOD_SELECTION:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.DISABLED;
                            self.$scope.panels.signChannels.status = PanelStatus.DISABLED;
                            self.$scope.panels.signMethods.status = PanelStatus.ENABLED;
                            self.$scope.panels.signExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.arssCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN
                            self.$scope.panels.completedSignExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.INITIALIZING_ASOL:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.DISABLED;
                            self.$scope.panels.signChannels.status = PanelStatus.DISABLED;
                            self.$scope.panels.signMethods.status = PanelStatus.LOADING;
                            self.$scope.panels.signExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.arssCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completedSignExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.CONFIGURE_ARSS:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.DISABLED;
                            self.$scope.panels.signChannels.status = PanelStatus.DISABLED;
                            self.$scope.panels.signMethods.status = PanelStatus.DISABLED;
                            self.$scope.panels.signExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.arssCredentials.status = PanelStatus.ENABLED;
                            self.$scope.panels.asolCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completedSignExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.CONFIGURE_ASOL:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.DISABLED;
                            self.$scope.panels.signChannels.status = PanelStatus.DISABLED;
                            self.$scope.panels.signMethods.status = PanelStatus.DISABLED;
                            self.$scope.panels.signExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.arssCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = PanelStatus.ENABLED;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completedSignExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.SIGNING:
                        case SignWorkflowState.ASOL_PREPARING_FILES:
                        case SignWorkflowState.ASOL_SIGNING:
                        case SignWorkflowState.ASOL_FINALIZING_SIGNATURE:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.DISABLED;
                            self.$scope.panels.signChannels.status = PanelStatus.DISABLED;
                            self.$scope.panels.signMethods.status = PanelStatus.DISABLED;
                            self.$scope.panels.signExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.arssCredentials.status = self.session.signMethod == SignMethod.ARSS ? PanelStatus.LOADING : PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = self.session.signMethod == SignMethod.ASOL ? PanelStatus.LOADING : PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN
                            self.$scope.panels.completedSignExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.EXSYST_TYPOLOGY_SELECTION:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.DISABLED;
                            self.$scope.panels.signMethods.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signChannels.status = PanelStatus.DISABLED;
                            self.$scope.panels.signExt.status = PanelStatus.ENABLED;
                            self.$scope.panels.arssCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.ENABLED
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN
                            self.$scope.panels.completedSignExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.EXSYST_FINALIZING_SIGNATURE:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.DISABLED;
                            self.$scope.panels.signMethods.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signChannels.status = PanelStatus.DISABLED;
                            self.$scope.panels.signExt.status = PanelStatus.DISABLED;
                            self.$scope.panels.arssCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN
                            self.$scope.panels.completedSignExt.status = PanelStatus.LOADING;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.COMPLETED_EXSYST:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.DISABLED;
                            self.$scope.panels.signMethods.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signChannels.status = PanelStatus.DISABLED;
                            self.$scope.panels.signExt.status = PanelStatus.DISABLED;
                            self.$scope.panels.arssCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN
                            self.$scope.panels.completedSignExt.status = PanelStatus.ENABLED;
                            self.$scope.panels.completed.status = PanelStatus.HIDDEN;
                            break;
                        case SignWorkflowState.COMPLETED:
                            self.$scope.panels.initialization.status = PanelStatus.HIDDEN;
                            self.$scope.panels.files.status = PanelStatus.DISABLED;
                            self.$scope.panels.signMethods.status = PanelStatus.DISABLED;
                            self.$scope.panels.signChannels.status = PanelStatus.DISABLED;
                            self.$scope.panels.signExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.arssCredentials.status = self.session.signMethod == SignMethod.ARSS ? PanelStatus.DISABLED : PanelStatus.HIDDEN;
                            self.$scope.panels.asolCredentials.status = self.session.signMethod == SignMethod.ASOL ? PanelStatus.DISABLED : PanelStatus.HIDDEN;
                            self.$scope.panels.signTypologies.status = PanelStatus.HIDDEN
                            self.$scope.panels.signExtsysResult.status = PanelStatus.HIDDEN
                            self.$scope.panels.completedSignExt.status = PanelStatus.HIDDEN;
                            self.$scope.panels.completed.status = PanelStatus.ENABLED;
                            break;
                    }
                },
                1);

        }

        private retrieveServerConfigurations(): void {
            let self = this;
            // Set state
            this.workflow.setState(SignWorkflowState.CONFIGURING);
            // Request
            APIService.getServerConfiguration(
                this.baseUrl,
                this.$http,
                {
                    success(config: ServerConfigurationAPIBean) {
                        //
                        console.debug("Server configuration:", config);
                        // Set configurations
                        self.asolUrl = config.asolURL;
                        self.asolClientCode = config.asolClientCode;
                        // Create session
                        self.onConfigurationCompleted();
                    },
                    error(message) {
                        self.$scope.panels.initialization.errorMessage = "Error retrieving configurations: " + message;
                    }
                });
        }

        private onConfigurationCompleted(): void {
            // Set session
            if (this.session.uid) {
                this.retrieveSession(this.session.uid);
            } else {
                this.createSession();
                this.session.isStandalone = true;
                this.$scope.isStandalone = true;
            }
        }

        private createSession(): void {
            let self = this;
            // Set state
            this.workflow.setState(SignWorkflowState.CREATING_SESSION);
            // Request
            APIService.createSession(
                this.baseUrl,
                this.$http,
                {
                    success(sessionId: string) {
                        console.debug("Created session: " + sessionId);
                        self.setSessionId(sessionId);
                        self.workflow.setState(SignWorkflowState.FILE_SELECTION);
                    },
                    error(message: string) {
                        self.$scope.panels.initialization.errorMessage = "Error creating session: " + message;
                    }
                });
        }

        private retrieveSession(sessionUID: string): void {
            let self = this;
            // Request
            APIService.getSessionInfo(
                this.baseUrl,
                sessionUID,
                this.$http,
                {
                    success(data: SessionInfoAPIBean) {
                        self.onSessionInfoRetrieved(data);
                    },
                    error(message: string) {
                        self.$scope.panels.initialization.errorMessage = "Error retrieving session data: " + message;
                    }
                });
        }

        private onSessionInfoRetrieved(session: SessionInfoAPIBean): void {
            // Log
            console.log("Session informations", session);
            //
            if (session) {
                // Set session
                this.setSessionId(session.uid);
                // Add files allowed
                if (typeof session.addFilesAllowed != 'undefined' && session.addFilesAllowed !== null) {
                    this.session.addFilesAllowed = session.addFilesAllowed;
                }
                // Signed files downloading allowed
                if (typeof session.signedFilesDownloadAllowed != 'undefined' && session.signedFilesDownloadAllowed !== null) {
                    this.session.signedFilesDownloadAllowed = session.signedFilesDownloadAllowed;
                }
                // Allowed sign methods
                if (typeof session.signMethods != 'undefined' && session.signMethods !== null) {
                    // Remove actual methods
                    this.clearAvailableSignMethods();
                    // Add methods
                    for (let method of session.signMethods) {
                        switch (EnumUtils.numericKey(SignMethodAPIEnum, method)) {
                            case SignMethodAPIEnum.REMOTE:
                                this.addAvailableSignMethod(SignMethod.ARSS);
                                break;
                            case SignMethodAPIEnum.LOCAL:
                                this.addAvailableSignMethod(SignMethod.ASOL);
                                break;
                        }
                    }
                }
                // Allowed sign types
                if (typeof session.signTypes != 'undefined' && session.signTypes !== null) {
                    // Remove actual methods
                    this.clearAvailableSignTypes();
                    // Add methods
                    for (let type of session.signTypes) {
                        this.addAvailableSignType(type);
                    }
                }
                
                // Redirect URL
                if (typeof session.redirectURL != 'undefined' && session.redirectURL !== null) {
                    this.session.redirectURL = session.redirectURL;
                }
                // Add session documents
                if (session.documents) {
                    for (let file of session.documents) {
                        this.addFile(file.uid, file.name);
                    }
                }
                //
                this.workflow.setState(this.session.files.length == 0 ? SignWorkflowState.FILE_SELECTION : SignWorkflowState.ASKING_FOR_MORE_FILES);
            }
        }

        public deleteSignedDocument(originalFileUID: string, signedFileUID: string, index:number): void {
            var self = this;
            if(!signedFileUID){
                self.session.files[index].fileUpload = null;
                self.$scope.files[index].fileUpload = null;
                self.$scope.countFilesUploaded--;
                self.$scope.panels.signExt.errorMessage = null;
                self.$scope.isDisableBtnDone = true;
                self.$scope.$applyAsync();
                return;
            }
            APIService.deleteSignedDocument(
                this.baseUrl,
                this.session.uid,
                originalFileUID,
                signedFileUID,
                this.$http,
                {
                    success: function (response: void) {
                        self.session.files[index].fileUpload = null;
                        self.$scope.files[index].fileUpload = null;
                        self.$scope.countFilesUploaded--;
                        self.$scope.panels.signExt.errorMessage = null;
                        self.$scope.isDisableBtnDone = true;
                        self.$scope.$applyAsync();
                    },
                    error: function (message) {
                        console.log("erroreDelete")
                    }
                });
        }

        public setSessionId(sessionUID: string) {
            // Check argument
            if (!sessionUID) {
                throw "Invalid session id";
            }
            // Set session
            this.session.uid = sessionUID;
        }

        private setWarningChangeTypology(): void {
            var self = this;

            if(self.$scope.countFilesUploaded > 0){
                self.$scope.panels.signExt.errorMessage = 'SIGN.SET_EXSYST_FILE_PANEL.TABLE.WARNING.CLICK_TYPOLOGY';
            }

        }

        private setErrorSignTypology(): void {
            var self = this;
            if(!self.$scope.signTypology){
                self.$scope.panels.signExt.errorMessage = 'SIGN.SET_EXSYST_FILE_PANEL.TABLE.ERROR.SELECT_TYPOLOGY';
            } else{
                self.$scope.panels.signExt.errorMessage = null;
            }
        }

        public addFileUploaded(file: File, index: number): void {
            var self = this;
            // Reset
            this.$scope.panels.signExt.errorMessage = null;
            // Check file is selected
            if (!file) {
                this.$scope.panels.signExt.errorMessage = "No file passed";
                return;
            }
            // Check state
            if (this.workflow.getState() != SignWorkflowState.CONFIGURE_EXSYST_CHANNEL) {
                throw "Illegal state: not in " + SignWorkflowState.CONFIGURE_EXSYST_CHANNEL + " state";
            }
            if(file.type != 'application/pdf' && file.type != 'application/pkcs7-mime') {
                    this.$scope.panels.signExt.errorMessage = 'SIGN.SET_EXSYST_FILE_PANEL.TABLE.ERROR.UPLOAD';
                    this.session.files[index].fileUpload = {
                        uid: null,
                        filename: file.name,
                        url: null,
                        fileUpload: null,
                        esito: false,
                    }
                    this.$scope.$applyAsync();
                return;
            }
 
            // Add signed file
            APIService.addSignedDocument(
                this.baseUrl,
                this.session.uid,
                this.$scope.files[index].uid,
                file,
                this.$http,
                {
                    success: function (signedDoc: FileAPIBean) {
                        self.onDocumentSigned(signedDoc, index);
                    },
                    error: function (message: string) {
                        self.errorSaveDocument()
                        throw "errore add file: " + message;
                    }
                });
        }



        public uploadAndAddFile(file: File): void {
            var self = this;
            // Reset
            this.$scope.panels.files.errorMessage = null;
            // Check file is selected
            if (!file) {
                this.$scope.panels.files.errorMessage = "No file passed";
                return;
            }
            // Check state
            if (this.workflow.getState() != SignWorkflowState.FILE_SELECTION) {
                throw "Illegal state: not in " + SignWorkflowState.FILE_SELECTION + " state";
            }
            // Set upload status
            this.workflow.setState(SignWorkflowState.UPLOADING_FILE);
            // Add file
            APIService.addSessionFile(
                this.baseUrl,
                this.session.uid,
                file,
                this.$http,
                {
                    success: function (fileId: string) {
                        self.addFile(fileId, file.name)
                    },
                    error: function (message: string) {
                        self.workflow.setState(SignWorkflowState.FILE_SELECTION);
                        self.$scope.panels.files.errorMessage = "Error: " + message;
                    }
                });
        }

        public addFile(fileUID: string, fileName: string): void {
            // Check arguments
            if (!(fileUID && fileName)) {
                return;
            }
            // Set data
            this.session.files.push({
                uid: fileUID,
                filename: fileName,
                url: this.getDocumentUrl(fileUID),
                fileUpload: null,
                esito: false,
            });
            // Set state
            this.workflow.setState(SignWorkflowState.ASKING_FOR_MORE_FILES);
        }

        public moreFilesRequired(required: boolean): void {
            if (!required) {
                if (this.session.files.length == 0) {
                    this.$scope.panels.files.errorMessage = "No files added";
                } else {
                    if(this.session.isStandalone){
                        this.workflow.setState(SignWorkflowState.SIGN_METHOD_SELECTION);
                    } else{
                        this.workflow.setState(SignWorkflowState.SIGN_CHANNEL_SELECTION);
                    }
                }
            } else {
                this.workflow.setState(SignWorkflowState.FILE_SELECTION);
            }
        }

        private initializeTable(): void{
            var self = this;
            self.$scope.countFilesUploaded = 0;
            self.$scope.panels.signExt.errorMessage = null;
            self.$scope.$applyAsync();
            angular.forEach(self.session.files, function(elem, index){
                if(elem.fileUpload){
                    elem.fileUpload = null;
                    self.$scope.deleteSignedDocument(elem, elem.fileUpload, index);
                    this.$scope.isDisableBtnDone = true;
                }
            })
        }

        private clearAvailableSignMethods(): void {
            this.session.availableSignMethods.splice(0, this.session.availableSignMethods.length);
            this.$scope.availableSignMethods.splice(0, this.$scope.availableSignMethods.length);
        }

        private addAvailableSignMethod(method: SignMethod): void {
            let methodKey = EnumUtils.numericKey(SignMethod, method);
            if (typeof methodKey != 'undefined') {
                this.session.availableSignMethods.push(methodKey);
                this.$scope.availableSignMethods.push(EnumUtils.stringKey(SignMethod, methodKey));
            }
        }

        private clearAvailableSignTypes(): void {
            this.session.availableSignTypes.splice(0, this.session.availableSignTypes.length);
            this.$scope.availableSignTypes.splice(0, this.$scope.availableSignTypes.length);
        }

        private addAvailableSignType(type: SignType): void {
            let typeKey = EnumUtils.numericKey(SignType, type);
            if (typeof typeKey != 'undefined') {
                this.session.availableSignTypes.push(typeKey);
                this.$scope.availableSignTypes.push(EnumUtils.stringKey(SignType, typeKey));
            }
        }

        setSignTypology(typology: SignTypology): void {
            throw new Error("Method not implemented.");
        }

        public getSignChannel(): SignChannel {
            return this.session.signChannel;
        }

        public setSignChannel(signChannel: SignChannel): void {
            // Check arguments
            if (!EnumUtils.exists(SignChannel, signChannel)) {
                this.$scope.panels.signChannels.errorMessage = "Invalid sign channel";
                return;
            }
            // Check state
            if (this.workflow.getState() != SignWorkflowState.SIGN_CHANNEL_SELECTION) {
                throw "Illegal state: not in " + SignWorkflowState.SIGN_CHANNEL_SELECTION + " state";
            }
            // Normalize values (numeric keys)
            signChannel = EnumUtils.numericKey(SignChannel, signChannel);
            // Configure method
            switch (signChannel) {
                case SignChannel.SIST:
                    this.$scope.signChannel = EnumUtils.stringKey(SignChannel, signChannel);
                    this.session.signChannel = signChannel;
                    this.workflow.setState(SignWorkflowState.SIGN_METHOD_SELECTION);
                    break;
                case SignChannel.EXSYST:
                    this.$scope.signChannel = EnumUtils.stringKey(SignChannel, signChannel);
                    this.session.signChannel = signChannel;
                    this.$scope.filesToSignZipURL = this.baseUrl + "session/" + encodeURI(this.session.uid) + "/documents/tosign/download";
                    this.$scope.downloadFile = [];
                    let boolean = false;
                    for (let index = 0; index < this.$scope.files.length; index++) {
                        this.$scope.downloadFile.push(boolean);
                    }
                    this.workflow.setState(SignWorkflowState.CONFIGURE_EXSYST_CHANNEL)
                    break;
                default:
                    throw "Invalid sign method";
            }
        }

        public getSignMethod(): SignMethod {
            return this.session.signMethod;
        }

        public setSignMethod(signMethod: SignMethod, signType: SignType): void {
            // Check arguments
            if (!EnumUtils.exists(SignMethod, signMethod)) {
                this.$scope.panels.signMethods.errorMessage = "Invalid sign method";
                return;
            }
            if (!EnumUtils.exists(SignType, signType)) {
                this.$scope.panels.signMethods.errorMessage = "Invalid sign type";
                return;
            }
            // Check state
            if (this.workflow.getState() != SignWorkflowState.SIGN_METHOD_SELECTION) {
                throw "Illegal state: not in " + SignWorkflowState.SIGN_METHOD_SELECTION + " state";
            }
            // Normalize values (numeric keys)
            signMethod = EnumUtils.numericKey(SignMethod, signMethod);
            signType = EnumUtils.numericKey(SignType, signType);
            // Configure type
            this.session.signType = signType;
            this.$scope.signType = EnumUtils.stringKey(SignType, signType);
            // Configure method
            switch (signMethod) {
                case SignMethod.ARSS:
                    this.$scope.signMethod = EnumUtils.stringKey(SignMethod, signMethod);
                    this.session.signMethod = signMethod;
                    this.workflow.setState(SignWorkflowState.CONFIGURE_ARSS);
                    break;
                case SignMethod.ASOL:
                    this.$scope.signMethod = EnumUtils.stringKey(SignMethod, signMethod);
                    this.session.signMethod = signMethod;
                    this.showErrorMessageRedirect();
                    this.initializeASOL();
                    break;
                default:
                    throw "Invalid sign method";
            }
        }

        private initializeASOL(): void {
            // Check state
            if (this.workflow.getState() != SignWorkflowState.SIGN_METHOD_SELECTION) {
                throw "Illegal state: not in " + SignWorkflowState.SIGN_METHOD_SELECTION + " state";
            }
            // Set init status
            this.workflow.setState(SignWorkflowState.INITIALIZING_ASOL);
            // Initialize client if required
            if ((!this.asolSigner) || this.asolSigner.getStatus() != ASOL.ASOLSignerStatus.READY) {
                // TODO Parametric signature context
                this.asolSigner = new ASOL.ASOLSigner(
                    this.asolUrl + "/scripts/webkitligth.js",
                    this.asolClientCode);
            }
            // Wait for ASOL client to be ready
            this.waitASOLReady();
        }

        private waitASOLReady() {
            let self = this;
            switch (this.asolSigner.getStatus()) {
                case ASOL.ASOLSignerStatus.INITIALIZING:
                    self.$timeout(
                        function () {
                            self.waitASOLReady();
                        },
                        500);
                    break;
                case ASOL.ASOLSignerStatus.READY:
                    // Check ASOL certificates list
                    if ((!self.asolSigner.getCertificates()) || self.asolSigner.getCertificates().length == 0) {
                        self.workflow.setState(SignWorkflowState.SIGN_METHOD_SELECTION);
                        self.$scope.panels.signMethods.errorMessage = "USB token not found or certificates retrieving failed";
                        return;
                    }
                    // Get certificates for frontend uses
                    self._asolCertificates = self.asolSigner.getCertificates();
                    // Set state
                    self.workflow.setState(SignWorkflowState.CONFIGURE_ASOL);
                    break;
                case ASOL.ASOLSignerStatus.INIT_FAILURE:
                    self.workflow.setState(SignWorkflowState.SIGN_METHOD_SELECTION);
                    self.$scope.panels.signMethods.errorMessage = self.asolSigner.getStatusMessage();
                    break;
                default:
                    self.workflow.setState(SignWorkflowState.SIGN_METHOD_SELECTION);
                    self.$scope.panels.signMethods.errorMessage = "Unexpected ASOL signer status: " + self.asolSigner.getStatus();
                    break;
            }
        }

        public setARSSCredentials(username: string, password: string, otp: string): void {
            this.signUsername = username;
            this.signPassword = password;
            this.signOtp = otp;
        }

        public setASOLCredentials(pin: string, certificateId: number): void {
            this.signPin = pin;
            this.signCertificateId = certificateId;
        }

        public sign(): void {
            // TODO To be implemented
            switch (this.session.signMethod) {
                case SignMethod.ARSS:
                    this.signARSS();
                    break;
                case SignMethod.ASOL:
                    this.showErrorMessageRedirect();
                    this.prepareASOLFiles();
                    break;
                default:
                    throw "No sign method set";
            }
        }

        private signARSS() {
            let self = this;
            // Check arguments
            if (!(this.signUsername && this.signPassword && this.signOtp)) {
                throw "Missing credentials";
            }
            if (this.session.signType === undefined || this.session.signType === null) {
                throw "Missing signature type";
            }
            // Set status
            this.workflow.setState(SignWorkflowState.SIGNING);
            //
            APIService.signByARSS(
                this.baseUrl,
                this.session.uid,
                this.signUsername,
                this.signPassword,
                this.signOtp,
                this.session.signType,
                this.$http,
                {
                    success: function (signedDocs: FileAPIBean[]) {
                        self.onDocumentsSigned(signedDocs);
                    },
                    error: function (message) {
                        self.onSignError(message);
                    }
                });
        }

        private prepareASOLFiles() {
            let self = this;
            // Check arguments
            if ((!this.signPin) || this.signCertificateId === null || isNaN(this.signCertificateId)) {
                this.onSignError("Missing parameters");
                return;
            }
            // Get ASOL session id
            if (!currentSession) {
                this.onSignError("ASOL misconfiguration (no session)");
                return;
            }
            // Set state
            this.workflow.setState(SignWorkflowState.ASOL_PREPARING_FILES);
            // Request files preparing
            this.$http({
                "method": "POST",
                "url": this.baseUrl + "api/session/" + encodeURI(this.session.uid) + "/prepareASOLFiles",
                "headers": {
                    "Content-Type": "application/json",
                },
                "data": {
                    "asolSession": currentSession,
                },
            })
                .then(
                    function (response: angular.IHttpResponse<any>) {
                        var json = response.data;
                        if (json && json.success) {
                            self.signASOL();
                        } else {
                            self.onSignError(json.message);
                        }
                    },
                    function (e) {
                        self.onSignError(e.status + " " + e.statusText);
                    });
        }

        private signASOL(): void {
            let self = this;
            // Set state
            self.workflow.setState(SignWorkflowState.ASOL_SIGNING);
            // Build filenames list
            let filenames: string[] = [];
            for (let file of this.session.files) {
                filenames.push(file.filename);
            }
            // Build callbacks
            let callbacks: ASOL.SignCallback = {
                success: function () {
                    self.$scope.$apply(() => {
                        self.finalizeASOLSignature();
                    });
                },
                fail: function (errorMessage: string) {
                    self.onSignError("Sign error: " + errorMessage);
                },
            };
            // Calculate the sign type
            let signType: ASOL.SignType;
            switch (+self.session.signType) {
                case SignType.CADES:
                    signType = ASOL.SignType.CADES;
                    break;
                case SignType.PADES:
                    signType = ASOL.SignType.PADES;
                    break;
                default:
                    self.onSignError("Unsupported sign type");
                    return;
            }
            // Sign
            this.asolSigner.sign(
                this._asolCertificates[this.signCertificateId],
                this.signPin,
                filenames,
                signType,
                callbacks);
        }

        private finalizeASOLSignature(): void {
            let self = this;
            // Check arguments
            if (!currentSession) {
                this.onSignError("ASOL misconfiguration (no session)");
                return;
            }
            // Set state
            this.workflow.setState(SignWorkflowState.ASOL_FINALIZING_SIGNATURE);
            // Request files preparing
            this.$http({
                "method": "POST",
                "url": this.baseUrl + "api/session/" + encodeURI(this.session.uid) + "/finalizeASOLSignature",
                "headers": {
                    "Content-Type": "application/json",
                },
                "data": {
                    "asolSession": currentSession,
                },
            })
                .then(
                    function (response: angular.IHttpResponse<any>) {
                        var json = response.data;
                        self.handleSignedDocumentsApiResponse(json);
                    },
                    function (e) {
                        self.onSignError(e.status + " " + e.statusText);
                    });
        }

        private handleSignedDocumentsApiResponse(json: any): void {
            if (json && json.success && json.data) {
                this.onDocumentsSigned(json.data);
            } else {
                this.onSignError(json.message);
            }
        }

        private errorSaveDocument(){

        }

        private onDocumentSigned(signedDoc: FileAPIBean, index) {
            /*             // Reset session data
                        this.session.signedFiles.splice(0, this.session.signedFiles.length);
                        // Reset scope data
                        this.$scope.signedFiles.splice(0, this.$scope.signedFiles.length);
             */
            // Set signed documents
            if (signedDoc) {
                this.session.files[index].fileUpload = {
                    uid: signedDoc.uid,
                    filename: signedDoc.name,
                    url: this.getDocumentUrl(signedDoc.uid),
                    fileUpload: null,
                    esito: true,
                }
                this.$scope.countFilesUploaded++

                const listPositiveSign = this.session.files.filter(elem => elem.fileUpload ? elem.fileUpload.esito : null)
                if (listPositiveSign.length == this.session.files.length) {
                    this.$scope.isDisableBtnDone = false;
                }
            }
        }

        private onClickBtnDone(): void{
            /* VERIFICA VOL */
            var self = this;
            /* self.workflow.setState(SignWorkflowState.EXSYST_FINALIZING_SIGNATURE); */
            APIService.volValidation(
                this.baseUrl,
                this.session.uid,
                this.$http,
                {
                    success: function (volFiles: VolFileAPIBean[]) {
                        var resultFilter = volFiles.filter(function(elem){
                            return !elem.esitoVol;
                        })
                        if(resultFilter && resultFilter.length > 0){
                            self.$scope.resultVol = false;
                        }

                        self.$scope.volFiles = volFiles;
                        self.workflow.setState(SignWorkflowState.COMPLETED_EXSYST);
                        // Initialize redirect if has any and signed files cannot be downloaded
                        self.$scope.redirectURL = self.getFullRedirectURL();
                        if (self.session.redirectURL) {
                            self.startAutomaticRedirectExsyst();
                        }
                    },
                    error: function (message: string) {
                        throw "errore add file: " + message;
                    }
                });
            
        }

        private onDocumentsSigned(signedDocs: FileAPIBean[]) {
            // Reset session data
            this.session.signedFiles.splice(0, this.session.signedFiles.length);
            // Reset scope data
            this.$scope.signedFiles.splice(0, this.$scope.signedFiles.length);
            this.$scope.signedFilesZipURL = null;
            // Set signed documents
            if (signedDocs) {
                for (let i = 0; i < signedDocs.length; i++) {
                    let signedDoc = signedDocs[i];
                    this.session.signedFiles.push({
                        uid: signedDoc.uid,
                        filename: signedDoc.name,
                        url: this.getDocumentUrl(signedDoc.uid),
                        fileUpload: null,
                        esito: null
                    });
                }
            }
            // If download is allowed, set the scope variables
            if (this.session.signedFilesDownloadAllowed) {
                // Set ZIP file URL
                this.$scope.signedFilesZipURL = this.baseUrl + "session/" + encodeURI(this.session.uid) + "/documents/signed/download";
                // Add signed files
                for (let file of this.session.signedFiles) {
                    this.$scope.signedFiles.push(file);
                }
            }
            // Set state
            this.workflow.setState(SignWorkflowState.COMPLETED);
            // Initialize redirect if has any and signed files cannot be downloaded
            this.$scope.redirectURL = this.getFullRedirectURL();
            if (this.session.redirectURL && !this.session.signedFilesDownloadAllowed) {
                this.startAutomaticRedirect();
            }
        }

        private getFullRedirectURL(): string {
            // Check redirect is configured
            if (!(this.session && this.session.redirectURL)) {
                return null;
            }
            // Calculate status
            let redirectStatus: string;
            switch (+this.workflow.getState()) {
                case SignWorkflowState.COMPLETED:
                case SignWorkflowState.COMPLETED_EXSYST:
                    redirectStatus = "OK";
                    break;
                default:
                    redirectStatus = "KO";
                    break;
            }
            // Build and return URL
            return this.session.redirectURL
                + (this.session.redirectURL.indexOf("?") < 0 ? "?" : "&")
                + "sessionId="
                + encodeURIComponent(this.session.uid ? this.session.uid : "")
                + "&status="
                + encodeURIComponent(redirectStatus);
        }

        private showErrorMessageRedirect(): void {
            let self = this;
            // Initialize
            this.$scope.redirectTimeoutSec = 600;
            //
            function nextTick() {
                 if(self.workflow.getState() == SignWorkflowState.CONFIGURE_ASOL || self.workflow.getState() == SignWorkflowState.COMPLETED){
                    return;
                } 
                // Decrease redirect timeout
                self.$scope.redirectTimeoutSec--;
                if (self.$scope.redirectTimeoutSec <= 60) {
                    if(!self.$scope.panels.signMethods.errorMessage){
                        self.$scope.panels.signMethods.errorMessage = "L'operazione sta impiegando troppo tempo. Tra " + self.$scope.redirectTimeoutSec + " secondi la pagina si ricaricherà"
                    }
                    if(self.$scope.redirectTimeoutSec <= 0){
                        window.location.reload();
                    } else{
                        self.$timeout(nextTick, 1000);    
                    }
                } else {
                    self.$timeout(nextTick, 1000);
                }
            }
            //
            nextTick();
        }

        private startAutomaticRedirectExsyst(): void {
            let self = this;
            // Check redirect URL
            if (!this.$scope.redirectURL) {
                return;
            }
            // Initialize
            this.$scope.redirectTimeoutSec = 60;
            //
            //
            self.$scope.nextTick();
        }

        private startAutomaticRedirect(): void {
            let self = this;
            // Check redirect URL
            if (!this.$scope.redirectURL) {
                return;
            }
            // Initialize
            this.$scope.redirectTimeoutSec = 6;
            //
            //
            self.$scope.nextTick();
        }

        private onSignError(errorMessage) {
            let self = this;
            this.$timeout(function () {
                switch (self.session.signMethod) {
                    case SignMethod.ARSS:
                        self.workflow.setState(SignWorkflowState.CONFIGURE_ARSS);
                        self.$scope.panels.arssCredentials.errorMessage = "Error: " + errorMessage;
                        break;
                    case SignMethod.ASOL:
                        self.workflow.setState(SignWorkflowState.CONFIGURE_ASOL);
                        self.$scope.panels.asolCredentials.errorMessage = "Error: " + errorMessage;
                        break;
                }
            }, 1);
        }

    }

}
