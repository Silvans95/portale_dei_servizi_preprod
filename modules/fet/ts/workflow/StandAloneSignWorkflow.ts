/// <reference path="../libs/angular/index.d.ts"/>
/// <reference path="../bean/SignFile.d.ts"/>
/// <reference path="../bean/SignedFile.d.ts"/>
/// <reference path="../asol/ASOLSigner.ts"/>
/// <reference path="SignWorkflow.ts"/>

namespace FET {

    export class StandAloneSignWorfklow implements SignWorkflow {

        public _state: SignWorkflowState;
        public _sessionUID: string;
        public _files: SignFile[];
        public _signMethod: SignMethod;
        public _signType: SignType;
        public _asolCertificates: ASOL.Certificate[];

        public _signedFiles: SignedFile[];
        public _signedFilesZipURL: string;

        public _panelInitializing: Panel;
        public _panelLoadFile: Panel;
        public _panelSetSignMethod: Panel;
        public _panelSetARSSCredentials: Panel;
        public _panelSetASOLCredentials: Panel;
        public _panelSigned: Panel;

        private $scope: angular.IScope;
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
            baseUrl: string,
            $scope: angular.IScope,
            $http: angular.IHttpService,
            $timeout: angular.ITimeoutService ) {
            // Initialize context
            this.$scope = $scope;
            this.baseUrl = baseUrl;
            this.$http = $http;
            this.$timeout = $timeout;
            // Initialize status
            this._files = [];
            this._signedFiles = [];
            this._signedFilesZipURL = null;
            // Initialize panels
            this._panelInitializing = {
                status: PanelStatus.HIDDEN,
            };
            this._panelLoadFile = {
                status: PanelStatus.HIDDEN,
            };
            this._panelSetSignMethod = {
                status: PanelStatus.HIDDEN,
            };
            this._panelSetARSSCredentials = {
                status: PanelStatus.HIDDEN,
            };
            this._panelSetASOLCredentials = {
                status: PanelStatus.HIDDEN,
            };
            this._panelSigned = {
                status: PanelStatus.HIDDEN,
            };
            // Initialize state
            this.retrieveServerConfigurations();
        }

        private getDocumentUrl( documentUID: string ): string {
            return this.baseUrl + "document/" + encodeURI( documentUID ) + "/download";
        }

        private setState( state: SignWorkflowState ): void {
            // Reset panel errors
            this._panelInitializing.errorMessage = null;
            this._panelLoadFile.errorMessage = null;
            this._panelSetSignMethod.errorMessage = null;
            this._panelSetARSSCredentials.errorMessage = null;
            this._panelSetASOLCredentials.errorMessage = null;
            this._panelSigned.errorMessage = null;
            // Configure panels
            switch ( +state ) {
                case SignWorkflowState.CONFIGURING:
                case SignWorkflowState.CREATING_SESSION:
                    this._panelInitializing.status = PanelStatus.ENABLED;
                    this._panelLoadFile.status = PanelStatus.HIDDEN;
                    this._panelSetSignMethod.status = PanelStatus.HIDDEN;
                    this._panelSetARSSCredentials.status = PanelStatus.HIDDEN;
                    this._panelSetASOLCredentials.status = PanelStatus.HIDDEN;
                    this._panelSigned.status = PanelStatus.HIDDEN;
                    break;
                case SignWorkflowState.FILE_SELECTION:
                case SignWorkflowState.ASKING_FOR_MORE_FILES:
                    this._panelInitializing.status = PanelStatus.HIDDEN;
                    this._panelLoadFile.status = PanelStatus.ENABLED;
                    this._panelSetSignMethod.status = PanelStatus.HIDDEN;
                    this._panelSetARSSCredentials.status = PanelStatus.HIDDEN;
                    this._panelSetASOLCredentials.status = PanelStatus.HIDDEN;
                    this._panelSigned.status = PanelStatus.HIDDEN;
                    break;
                case SignWorkflowState.UPLOADING_FILE:
                    this._panelInitializing.status = PanelStatus.HIDDEN;
                    this._panelLoadFile.status = PanelStatus.LOADING;
                    this._panelSetSignMethod.status = PanelStatus.HIDDEN;
                    this._panelSetARSSCredentials.status = PanelStatus.HIDDEN;
                    this._panelSetASOLCredentials.status = PanelStatus.HIDDEN;
                    this._panelSigned.status = PanelStatus.HIDDEN;
                    break;
                case SignWorkflowState.SIGN_METHOD_SELECTION:
                    this._panelInitializing.status = PanelStatus.HIDDEN;
                    this._panelLoadFile.status = PanelStatus.DISABLED;
                    this._panelSetSignMethod.status = PanelStatus.ENABLED;
                    this._panelSetARSSCredentials.status = PanelStatus.HIDDEN;
                    this._panelSetASOLCredentials.status = PanelStatus.HIDDEN;
                    this._panelSigned.status = PanelStatus.HIDDEN;
                    break;
                case SignWorkflowState.INITIALIZING_ASOL:
                    this._panelInitializing.status = PanelStatus.HIDDEN;
                    this._panelLoadFile.status = PanelStatus.DISABLED;
                    this._panelSetSignMethod.status = PanelStatus.LOADING;
                    this._panelSetARSSCredentials.status = PanelStatus.HIDDEN;
                    this._panelSetASOLCredentials.status = PanelStatus.HIDDEN;
                    this._panelSigned.status = PanelStatus.HIDDEN;
                    break;
                case SignWorkflowState.CONFIGURE_ARSS:
                    this._panelInitializing.status = PanelStatus.HIDDEN;
                    this._panelLoadFile.status = PanelStatus.DISABLED;
                    this._panelSetSignMethod.status = PanelStatus.DISABLED;
                    this._panelSetARSSCredentials.status = PanelStatus.ENABLED;
                    this._panelSetASOLCredentials.status = PanelStatus.HIDDEN;
                    this._panelSigned.status = PanelStatus.HIDDEN;
                    break;
                case SignWorkflowState.CONFIGURE_ASOL:
                    this._panelInitializing.status = PanelStatus.HIDDEN;
                    this._panelLoadFile.status = PanelStatus.DISABLED;
                    this._panelSetSignMethod.status = PanelStatus.DISABLED;
                    this._panelSetARSSCredentials.status = PanelStatus.HIDDEN;
                    this._panelSetASOLCredentials.status = PanelStatus.ENABLED;
                    this._panelSigned.status = PanelStatus.HIDDEN;
                    break;
                case SignWorkflowState.SIGNING:
                case SignWorkflowState.ASOL_PREPARING_FILES:
                case SignWorkflowState.ASOL_SIGNING:
                case SignWorkflowState.ASOL_FINALIZING_SIGNATURE:
                    this._panelInitializing.status = PanelStatus.HIDDEN;
                    this._panelLoadFile.status = PanelStatus.DISABLED;
                    this._panelSetSignMethod.status = PanelStatus.DISABLED;
                    this._panelSetARSSCredentials.status = this._signMethod == SignMethod.ARSS ? PanelStatus.LOADING : PanelStatus.HIDDEN;
                    this._panelSetASOLCredentials.status = this._signMethod == SignMethod.ASOL ? PanelStatus.LOADING : PanelStatus.HIDDEN;
                    this._panelSigned.status = PanelStatus.HIDDEN;
                    break;
                case SignWorkflowState.COMPLETED:
                    this._panelInitializing.status = PanelStatus.HIDDEN;
                    this._panelLoadFile.status = PanelStatus.DISABLED;
                    this._panelSetSignMethod.status = PanelStatus.DISABLED;
                    this._panelSetARSSCredentials.status = this._signMethod == SignMethod.ARSS ? PanelStatus.DISABLED : PanelStatus.HIDDEN;
                    this._panelSetASOLCredentials.status = this._signMethod == SignMethod.ASOL ? PanelStatus.DISABLED : PanelStatus.HIDDEN;
                    this._panelSigned.status = PanelStatus.DISABLED;
                    break;
            }
            // Set state
            this._state = +state;
        }

        private retrieveServerConfigurations(): void {
            let self = this;
            // Set state
            this.setState( SignWorkflowState.CONFIGURING );
            // Request
            this.$http( {
                "method": "GET",
                "url": this.baseUrl + "api/config",
                "headers": {
                    "Content-Type": undefined,
                },
                "transformRequest": angular.identity,
            } )
                .then(
                    function( response: angular.IHttpResponse<any> ) {
                        var json = response.data;
                        if ( json && json.success && json.data ) {
                            // Set configurations
                            self.asolUrl = json.data.asolURL;
                            self.asolClientCode = json.data.asolClientCode;
                            // Create session
                            self.createSession();
                        } else {
                            self._panelInitializing.errorMessage = "Error retrieving configurations: " + json.message;
                        }
                    },
                    function( e ) {
                        self._panelInitializing.errorMessage = "Error retrieving configurations: " + e.status + " " + e.statusText;
                    } );
        }

        private createSession(): void {
            let self = this;
            // Set state
            this.setState( SignWorkflowState.CREATING_SESSION );
            // Request
            this.$http( {
                "method": "POST",
                "url": this.baseUrl + "api/session/create",
                "headers": {
                    "Content-Type": undefined,
                },
                "transformRequest": angular.identity,
            } )
                .then(
                    function( response: angular.IHttpResponse<any> ) {
                        var json = response.data;
                        if ( json && json.success && json.data ) {
                            self.setSessionId( json.data );
                        } else {
                            self._panelInitializing.errorMessage = "Error creating session: " + json.message;
                        }
                    },
                    function( e ) {
                        self._panelInitializing.errorMessage = "Error creating session: " + e.status + " " + e.statusText;
                    } );
        }

        public setSessionId( sessionUID: string ) {
            // Check state
            if ( this._state != SignWorkflowState.CREATING_SESSION ) {
                throw "Illegal state";
            }
            // Check argument
            if ( !sessionUID ) {
                throw "Invalid session id";
            }
            // Set session
            this._sessionUID = sessionUID;
            this._signedFilesZipURL = this.baseUrl + "session/" + encodeURI( this._sessionUID ) + "/documents/signed/download";
            this.setState( SignWorkflowState.FILE_SELECTION );
        }

        public uploadAndAddFile( file: File ): void {
            var self = this;
            // Reset
            this._panelLoadFile.errorMessage = null;
            // Check file is selected
            if ( !file ) {
                this._panelLoadFile.errorMessage = "No file passed";
                return;
            }
            // Check state
            if ( this._state != SignWorkflowState.FILE_SELECTION ) {
                throw "Illegal state: not in " + SignWorkflowState.FILE_SELECTION + " state";
            }
            // Initialize
            var fileName = file.name;
            // Build form data
            var formData = new FormData();
            formData.append( "document", file );
            // Set state
            this.setState( SignWorkflowState.UPLOADING_FILE );
            // Send file
            this.$http( {
                "method": "POST",
                "url": this.baseUrl + "api/session/" + encodeURI( this._sessionUID ) + "/documents/add",
                "headers": {
                    "Content-Type": undefined,
                },
                "data": formData,
                "transformRequest": angular.identity,
            } )
                .then(
                    function( response: angular.IHttpResponse<any> ) {
                        var json = response.data;
                        if ( json && json.success && json.data ) {
                            self.addFile( json.data, fileName )
                        } else {
                            self.setState( SignWorkflowState.FILE_SELECTION );
                            self._panelLoadFile.errorMessage = json.message;
                        }
                    },
                    function( e ) {
                        self.setState( SignWorkflowState.FILE_SELECTION );
                        self._panelLoadFile.errorMessage = "Error: " + e.status + " " + e.statusText;
                    } );
        }

        public addFile( fileUID: string, fileName: string ): void {
            // Check arguments
            if ( !( fileUID && fileName ) ) {
                throw "Illegal arguments: fileUID and fileName cannot be blank";
            }
            // Check state
            if ( this._state != SignWorkflowState.FILE_SELECTION && this._state != SignWorkflowState.UPLOADING_FILE ) {
                throw "Illegal state: not in " + SignWorkflowState.FILE_SELECTION + " state";
            }
            // Set data
            this._files.push( {
                uid: fileUID,
                filename: fileName,
                url: this.getDocumentUrl( fileUID ),
            } );
            // Set state
            this.setState( SignWorkflowState.ASKING_FOR_MORE_FILES );
        }

        public moreFilesRequired( required: boolean ): void {
            if ( !required ) {
                if ( this._files.length == 0 ) {
                    this._panelLoadFile.errorMessage = "No files added";
                } else {
                    this.setState( SignWorkflowState.SIGN_METHOD_SELECTION );
                }
            } else {
                this.setState( SignWorkflowState.FILE_SELECTION );
            }
        }

        public getSignMethod(): SignMethod {
            return this._signMethod;
        }

        public setSignMethod( signMethod: SignMethod, signType: SignType ): void {
            // Check arguments
            if ( !signMethod ) {
                throw "Illegal arguments: method cannot be blank";
            }
            if ( !signType ) {
                throw "Illegal arguments: sign type cannot be blank";
            }
            // Check state
            if ( this._state != SignWorkflowState.SIGN_METHOD_SELECTION ) {
                throw "Illegal state: not in " + SignWorkflowState.SIGN_METHOD_SELECTION + " state";
            }
            // Confgigure type
            this._signType = signType;
            // Configure method
            switch ( +signMethod ) {
                case SignMethod.ARSS:
                    this._signMethod = +signMethod;
                    this.setState( SignWorkflowState.CONFIGURE_ARSS );
                    break;
                case SignMethod.ASOL:
                    this._signMethod = +signMethod;
                    this.initializeASOL();
                    break;
                default:
                    throw "Invalid sign method";
            }
        }

        private initializeASOL(): void {
            // Check state
            if ( this._state != SignWorkflowState.SIGN_METHOD_SELECTION ) {
                throw "Illegal state: not in " + SignWorkflowState.SIGN_METHOD_SELECTION + " state";
            }
            // Set init status
            this.setState( SignWorkflowState.INITIALIZING_ASOL );
            // Initialize client if required
            if ( ( !this.asolSigner ) || this.asolSigner.getStatus() != ASOL.ASOLSignerStatus.READY ) {
                // TODO Parametric signature context
                this.asolSigner = new ASOL.ASOLSigner(
                    this.asolUrl + "/scripts/webkitligth.js",
                    this.asolClientCode );
            }
            // Wait for ASOL client to be ready
            this.waitASOLReady();
        }

        private waitASOLReady() {
            let self = this;
            switch ( this.asolSigner.getStatus() ) {
                case ASOL.ASOLSignerStatus.INITIALIZING:
                    self.$timeout(
                        function() {
                            self.waitASOLReady();
                        },
                        500 );
                    break;
                case ASOL.ASOLSignerStatus.READY:
                    // Check ASOL certificates list
                    if ( ( !self.asolSigner.getCertificates() ) || self.asolSigner.getCertificates().length == 0 ) {
                        self.setState( SignWorkflowState.SIGN_METHOD_SELECTION );
                        self._panelSetSignMethod.errorMessage = "USB token not found or certificates retrieving failed";
                        return;
                    }
                    // Get certificates for frontend uses
                    self._asolCertificates = self.asolSigner.getCertificates();
                    // Set state
                    self.setState( SignWorkflowState.CONFIGURE_ASOL );
                    break;
                case ASOL.ASOLSignerStatus.INIT_FAILURE:
                    self.setState( SignWorkflowState.SIGN_METHOD_SELECTION );
                    self._panelSetSignMethod.errorMessage = self.asolSigner.getStatusMessage();
                    break;
                default:
                    self.setState( SignWorkflowState.SIGN_METHOD_SELECTION );
                    self._panelSetSignMethod.errorMessage = "Unexpected ASOL signer status: " + self.asolSigner.getStatus();
                    break;
            }
        }

        public setARSSCredentials( username: string, password: string, otp: string ): void {
            this.signUsername = username;
            this.signPassword = password;
            this.signOtp = otp;
        }

        public setASOLCredentials( pin: string, certificateId: number ): void {
            this.signPin = pin;
            this.signCertificateId = certificateId;
        }

        public sign(): void {
            // TODO To be implemented
            switch ( this._signMethod ) {
                case SignMethod.ARSS:
                    this.signARSS();
                    break;
                case SignMethod.ASOL:
                    this.prepareASOLFiles();
                    break;
                default:
                    throw "No sign method set";
            }
        }

        private signARSS() {
            let self = this;
            // Check arguments
            if ( !( this.signUsername && this.signPassword && this.signOtp ) ) {
                throw "Missing credentials";
            }
            if ( !this._signType ) {
                throw "Missing signature type";
            }
            // Get sign type as expected by the API
            let signType;
            switch ( +this._signType ) {
                case SignType.CADES:
                    signType = "CADES";
                    break;
                case SignType.PADES:
                    signType = "PADES";
                    break;
                default:
                    throw "Invalid signature type";
            }
            // Set status
            this.setState( SignWorkflowState.SIGNING );
            //
            this.$http( {
                "method": "POST",
                "url": this.baseUrl + "api/session/" + encodeURI( this._sessionUID ) + "/signByARSS",
                "headers": {
                    "Content-Type": "application/json",
                },
                "data": {
                    "username": this.signUsername,
                    "password": this.signPassword,
                    "otp": this.signOtp,
                    "signType": signType,
                },
            } )
                .then(
                    function( response: angular.IHttpResponse<any> ) {
                        var json = response.data;
                        self.handleSignedDocumentsApiResponse( response.data );
                    },
                    function( e ) {
                        self.onSignError( e.status + " " + e.statusText );
                    } );
        }

        private handleSignedDocumentsApiResponse( json: any ): void {
            if ( json && json.success && json.data ) {
                let signedDocs = json.data;
                // TODO Handle multiple files
                this._signedFiles.splice( 0, this._signedFiles.length );
                for ( let i = 0; i < json.data.length; i++ ) {
                    let signedDoc = json.data[i];
                    this._signedFiles.push( {
                        uid: signedDoc.uid,
                        filename: signedDoc.name,
                        url: this.getDocumentUrl( signedDoc.uid ),

                    } );
                }
                this.setState( SignWorkflowState.COMPLETED );
            } else {
                this.onSignError( json.message );
            }
        }

        private prepareASOLFiles() {
            let self = this;
            // Check arguments
            if ( ( !this.signPin ) || this.signCertificateId === null || isNaN( this.signCertificateId ) ) {
                this.onSignError( "Missing parameters" );
                return;
            }
            // Get ASOL session id
            if ( !currentSession ) {
                this.onSignError( "ASOL misconfiguration (no session)" );
                return;
            }
            // Set state
            this.setState( SignWorkflowState.ASOL_PREPARING_FILES );
            // Request files preparing
            this.$http( {
                "method": "POST",
                "url": this.baseUrl + "api/session/" + encodeURI( this._sessionUID ) + "/prepareASOLFiles",
                "headers": {
                    "Content-Type": "application/json",
                },
                "data": {
                    "asolSession": currentSession,
                },
            } )
                .then(
                    function( response: angular.IHttpResponse<any> ) {
                        var json = response.data;
                        if ( json && json.success ) {
                            self.signASOL();
                        } else {
                            self.onSignError( json.message );
                        }
                    },
                    function( e ) {
                        self.onSignError( e.status + " " + e.statusText );
                    } );
        }

        private signASOL(): void {
            let self = this;
            // Set state
            self.setState( SignWorkflowState.ASOL_SIGNING );
            // Build filenames list
            let filenames: string[] = [];
            for ( let file of this._files ) {
                filenames.push( file.filename );
            }
            // Build callbacks
            let callbacks: ASOL.SignCallback = {
                success: function() {
                    self.$scope.$apply( () => {
                        self.finalizeASOLSignature();
                    } );
                },
                fail: function( errorMessage: string ) {
                    self.onSignError( "Sign error: " + errorMessage );
                },
            };
            // Calculate the sign type
            let signType: ASOL.SignType;
            switch ( +self._signType ) {
                case SignType.CADES:
                    signType = ASOL.SignType.CADES;
                    break;
                case SignType.PADES:
                    signType = ASOL.SignType.PADES;
                    break;
                default:
                    self.onSignError( "Unsupported sign type" );
                    return;
            }
            // Sign
            this.asolSigner.sign(
                this._asolCertificates[this.signCertificateId],
                this.signPin,
                filenames,
                signType,
                callbacks );
        }

        private finalizeASOLSignature(): void {
            let self = this;
            // Check arguments
            if ( !currentSession ) {
                this.onSignError( "ASOL misconfiguration (no session)" );
                return;
            }
            // Set state
            this.setState( SignWorkflowState.ASOL_FINALIZING_SIGNATURE );
            // Request files preparing
            this.$http( {
                "method": "POST",
                "url": this.baseUrl + "api/session/" + encodeURI( this._sessionUID ) + "/finalizeASOLSignature",
                "headers": {
                    "Content-Type": "application/json",
                },
                "data": {
                    "asolSession": currentSession,
                },
            } )
                .then(
                    function( response: angular.IHttpResponse<any> ) {
                        var json = response.data;
                        self.handleSignedDocumentsApiResponse( json );
                    },
                    function( e ) {
                        self.onSignError( e.status + " " + e.statusText );
                    } );
        }

        private onASOLSignDone(): void {
            this.onSignError( "Signature completed. Unimplemented completion workflow." );
        }

        private onSignError( errorMessage ) {
            let self = this;
            this.$timeout( function() {
                switch ( self._signMethod ) {
                    case SignMethod.ARSS:
                        self.setState( SignWorkflowState.CONFIGURE_ARSS );
                        self._panelSetARSSCredentials.errorMessage = "Error: " + errorMessage;
                        break;
                    case SignMethod.ASOL:
                        self.setState( SignWorkflowState.CONFIGURE_ASOL );
                        self._panelSetASOLCredentials.errorMessage = "Error: " + errorMessage;
                        break;
                }
            }, 1 );
        }

    }

}
