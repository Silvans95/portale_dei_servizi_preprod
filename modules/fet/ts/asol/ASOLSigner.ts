/// <reference path="ASOL.d.ts"/>
/// <reference path="ASOLSignerStatus.ts"/>
/// <reference path="SignType.ts"/>
/// <reference path="SignCallback.d.ts"/>
/// <reference path="../bean/SignFile.d.ts"/>

namespace ASOL {

    export class ASOLSigner {

        private static importedJsList: string[] = [];
        private static webkit: WebKitOnLine;
        private static certificates: Certificate[];

        private asolJsURL: string;

        private clientCode: string;

        private status: ASOLSignerStatus;
        private statusMessage: string;

        public constructor(
            asolJsURL: string,
            clientCode: string ) {
            // Initiaize class
            this.asolJsURL = asolJsURL;
            this.clientCode = clientCode;
            // Initialize engine
            this.initialize();
        }

        public setStatus( status: ASOLSignerStatus, statusMessage: string ) {
            this.status = status;
            this.statusMessage = statusMessage;
        }

        public getStatus(): ASOLSignerStatus {
            return this.status;
        }

        public getStatusMessage(): string {
            return this.statusMessage;
        }

        private importJS() {
            // Check JS URL
            if ( !this.asolJsURL ) {
                return;
            }
            // Check if the JS has already been imported
            for ( let url of ASOLSigner.importedJsList ) {
                if ( url == this.asolJsURL ) {
                    return;
                }
            }
            // Create script tag
            let script: HTMLScriptElement = document.createElement( "script" );
            script.src = this.asolJsURL;
            // Append to document head
            document.body.appendChild( script );
            // Flag as imported
            ASOLSigner.importedJsList.push( this.asolJsURL );
        }

        private notifyFailure( errorMsg: string ) {
            // TODO Implement notification
        }

        private initialize(): void {
            // Set status
            this.setStatus( ASOLSignerStatus.INITIALIZING, "Initializing" );
            // Import ASOL JS if required
            this.importJS();
            // Use a timer to force the JavaScript script to be executed before proceeding
            this.waitJsToBeImported();
        }

        private waitJsToBeImported(): void {
            var self = this;
            if ( typeof WebKitOnLine === "undefined" ) {
                setTimeout( function() {
                    self.waitJsToBeImported();
                }, 100 );
            } else {
                // Notify ready
                self.onJsImported();
            }
        }

        private onJsImported(): void {
            // WORKAROUND for the ASOL dialog('close') bug
            if ( !dialogDiv ) {
                dialogDiv = function() { };
                dialogDiv.dialog = function() {
                };
            }
            // Initialize WebKit
            this.initWebkit();
        }

        private initWebkit(): void {
            let self = this;
            // Check that ASOL is correctly imported
            if ( typeof WebKitOnLine === "undefined" ) {
                self.setStatus( ASOLSignerStatus.INIT_FAILURE, "ASOL libraries import failure" );
                self.notifyFailure( "ASOL is not correctly imported" );
                return;
            }
            // Initialize WebKit
            if ( !ASOLSigner.webkit ) {
                try {
                    // Initialize
                    ASOLSigner.webkit = new WebKitOnLine( this.clientCode );
                    // Add an handler to close the webkit on page exiting
                    window.addEventListener( 'beforeunload', () => {
                        try {
                            ASOLSigner.webkit.closeClient();
                        } catch ( e ) {
                            console.error( "Error closing webkit client", e );
                        }
                    } );
                    // 
                    ASOLSigner.webkit.init_card_service_no_popup( function() {
                        self.onWebkitInitialized();
                    } );
                } catch ( e ) {
                    self.setStatus( ASOLSignerStatus.INIT_FAILURE, "ASOL libraries initialization failure" );
                    self.notifyFailure( "Error initializing ASOL WebKit" );
                    return;
                }
            } else {
                self.onWebkitInitialized();
            }
        }

        private onWebkitInitialized(): void {
            // Initialize certs
            this.initCerts();
        }

        private initCerts(): void {
            let self = this;
            // Check if certificates already got and request them if required
            if ( !ASOLSigner.certificates ) {
                // Request certificates
                ASOLSigner.webkit.certsListP11(
                    function( data ) {
                        if ( data.header.type === "ResponseListCerts" ) {
                            if ( data.status !== "OK" ) {
                                self.setStatus( ASOLSignerStatus.INIT_FAILURE, "Sign certificates retrieving failed" );
                                self.notifyFailure( "Could not retrieve certificates: status " + data.status );
                            } else if ( data.list === undefined || data.list.length === 0 ) {
                                self.setStatus( ASOLSignerStatus.INIT_FAILURE, "Missing USB token or no sign certificate found" );
                                self.notifyFailure( "Could not retrieve certificates: no certificate found" );
                            } else {
                                // Get available certificates
                                let certs: Certificate[] = [];
                                for ( let i = 0; i < data.list.length; i++ ) {
                                    // Get the next certificate
                                    let cert: Certificate = data.list[i];
                                    // Check validity
                                    if ( cert && cert.common_name ) {
                                        // Set the id
                                        cert.id = i;
                                        // Add to certificates
                                        certs.push( cert );
                                    }
                                }
                                // Set certificates
                                ASOLSigner.certificates = certs;
                                //
                                self.onCertsInitialized();
                            }
                        } else {
                            self.setStatus( ASOLSignerStatus.INIT_FAILURE, "Sign certificates retrieving failed (unsupported response)" );
                            self.notifyFailure( "Could not retrieve certificates: unsupported response" );
                        }
                    } );
            } else {
                // Certificates already initialized, go on
                self.onCertsInitialized();
            }
        }

        private onCertsInitialized(): void {
            this.setStatus( ASOLSignerStatus.READY, "Ready" );
        }

        public getCertificates(): Certificate[] {
            return ASOLSigner.certificates;
        }

        public sign( certificate: Certificate, pin: string, filenames: string[], signType: SignType, callbacks?: SignCallback ): void {
            let self = this;
            // Initialize common parameters
            let tipoFirma = 2;
            let marcatura = false;
            let timestamp = 0;
            let tsa_user = "";
            let tsa_passw = "";
            let tsa_policy = "";
            let page = 1;
            let x1 = 200;
            let x2 = 200;
            let y1 = 200;
            let y2 = 200;
            let opzione = 1;
            // Signature related parameters
            let dstFilePostfix;
            let tipoBusta;
            switch ( signType ) {
                case SignType.CADES:
                    dstFilePostfix = ".p7m";
                    tipoBusta = 1;
                    break;
                case SignType.PADES:
                    dstFilePostfix = "";
                    tipoBusta = 2;
                    break;
                default:
                    throw "Invalid signature type";
            }
            // Clean up certificate
            let normalizedCertificate: any = JSON.parse( JSON.stringify( certificate ) );
            delete normalizedCertificate.id;
            delete normalizedCertificate.$$hashKey;
            // Initialize targets
            let targets: any[] = [];
            for ( let i = 0; i < filenames.length; i++ ) {
                let filename = filenames[i];
                let srcFile = currentSession + "/" + filename;
                let dstFile = currentSession + "/signed/" + filename + dstFilePostfix;
                targets.push( {
                    src: srcFile,
                    dst: dstFile,
                    tipoFirma: tipoFirma,
                    tipoBusta: tipoBusta,
                    tipoMarcatura: timestamp,
                    tipoOperazione: 1,
                    timestamp: marcatura,
                    tsaUser: tsa_user,
                    tsaPolicy: tsa_policy,
                    tsaPassword: tsa_passw,
                    tipoOpzione: opzione,
                    x1: x1,
                    x2: x2,
                    y1: y1,
                    y2: y2,
                    page: page,
                } );
            }
            // Sign
            ASOLSigner.webkit.createSignatureV2(
                tipoFirma,
                "" + pin,
                normalizedCertificate,
                targets,
                function( data ) {
                    if ( typeof data == "object" && "status" in data ) {
                        if ( data.status == "OK" ) {
                            self.notifySignOk( callbacks );
                        } else {
                            self.notifySignError( data.text, callbacks );
                        }
                    } else {
                        self.notifySignError( "Invalid response", callbacks );
                    }
                } );

        }

        private notifySignOk( callbacks: SignCallback ): void {
            if ( callbacks ) {
                try {
                    if ( typeof callbacks.success() === "function" ) {
                        callbacks.success();
                    }
                } catch ( e ) {
                    console.error( e );
                }
            }
        }

        private notifySignError( message: string, callbacks: SignCallback ): void {
            if ( callbacks ) {
                try {
                    if ( typeof callbacks.fail === "function" ) {
                        callbacks.fail( message );
                    }
                } catch ( e ) {
                    console.error( e );
                }
            }
        }

    }

}
