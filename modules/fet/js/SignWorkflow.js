var FET;
(function (FET) {
    let SignMethod;
    (function (SignMethod) {
        SignMethod[SignMethod["ASOL"] = 0] = "ASOL";
        SignMethod[SignMethod["ARSS"] = 1] = "ARSS";
    })(SignMethod = FET.SignMethod || (FET.SignMethod = {}));
})(FET || (FET = {}));
/// <reference path="../enums/SignMethod.ts"/>
var FET;
(function (FET) {
    class EnumUtils {
        static values(enumeration) {
            let values = [];
            for (let value in enumeration) {
                if (Number.isNaN(Number(value))) {
                    values.push(value);
                }
            }
            return values;
        }
        static numericKey(enumeration, key) {
            let actualKey = key;
            // Get the numeric enumeration value
            if (Number.isNaN(Number(actualKey))) {
                actualKey = enumeration[key];
            }
            //
            return Number.isNaN(Number(actualKey))
                ? undefined
                : parseInt(actualKey);
        }
        static stringKey(enumeration, key) {
            let actualKey = key;
            // Get the numeric enumeration value
            if (!Number.isNaN(Number(actualKey))) {
                actualKey = enumeration[key];
            }
            //
            return actualKey;
        }
        static exists(enumeration, key) {
            return EnumUtils.numericKey(enumeration, key) !== undefined;
        }
    }
    FET.EnumUtils = EnumUtils;
})(FET || (FET = {}));
var FET;
(function (FET) {
    let SignType;
    (function (SignType) {
        SignType[SignType["CADES"] = 0] = "CADES";
        SignType[SignType["PADES"] = 1] = "PADES";
    })(SignType = FET.SignType || (FET.SignType = {}));
})(FET || (FET = {}));
var ASOL;
(function (ASOL) {
    let ASOLSignerStatus;
    (function (ASOLSignerStatus) {
        ASOLSignerStatus[ASOLSignerStatus["INITIALIZING"] = 0] = "INITIALIZING";
        ASOLSignerStatus[ASOLSignerStatus["INIT_FAILURE"] = 1] = "INIT_FAILURE";
        ASOLSignerStatus[ASOLSignerStatus["READY"] = 2] = "READY";
    })(ASOLSignerStatus = ASOL.ASOLSignerStatus || (ASOL.ASOLSignerStatus = {}));
})(ASOL || (ASOL = {}));
var ASOL;
(function (ASOL) {
    let SignType;
    (function (SignType) {
        SignType[SignType["CADES"] = 0] = "CADES";
        SignType[SignType["PADES"] = 1] = "PADES";
    })(SignType = ASOL.SignType || (ASOL.SignType = {}));
})(ASOL || (ASOL = {}));
/// <reference path="ASOL.d.ts"/>
/// <reference path="ASOLSignerStatus.ts"/>
/// <reference path="SignType.ts"/>
/// <reference path="SignCallback.d.ts"/>
/// <reference path="../bean/SignFile.d.ts"/>
var ASOL;
(function (ASOL) {
    class ASOLSigner {
        constructor(asolJsURL, clientCode) {
            // Initiaize class
            this.asolJsURL = asolJsURL;
            this.clientCode = clientCode;
            // Initialize engine
            this.initialize();
        }
        setStatus(status, statusMessage) {
            this.status = status;
            this.statusMessage = statusMessage;
        }
        getStatus() {
            return this.status;
        }
        getStatusMessage() {
            return this.statusMessage;
        }
        importJS() {
            // Check JS URL
            if (!this.asolJsURL) {
                return;
            }
            // Check if the JS has already been imported
            for (let url of ASOLSigner.importedJsList) {
                if (url == this.asolJsURL) {
                    return;
                }
            }
            // Create script tag
            let script = document.createElement("script");
            script.src = this.asolJsURL;
            // Append to document head
            document.body.appendChild(script);
            // Flag as imported
            ASOLSigner.importedJsList.push(this.asolJsURL);
        }
        notifyFailure(errorMsg) {
            // TODO Implement notification
        }
        initialize() {
            // Set status
            this.setStatus(ASOL.ASOLSignerStatus.INITIALIZING, "Initializing");
            // Import ASOL JS if required
            this.importJS();
            // Use a timer to force the JavaScript script to be executed before proceeding
            this.waitJsToBeImported();
        }
        waitJsToBeImported() {
            var self = this;
            if (typeof WebKitOnLine === "undefined") {
                setTimeout(function () {
                    self.waitJsToBeImported();
                }, 100);
            }
            else {
                // Notify ready
                self.onJsImported();
            }
        }
        onJsImported() {
            // WORKAROUND for the ASOL dialog('close') bug
            if (!dialogDiv) {
                dialogDiv = function () { };
                dialogDiv.dialog = function () {
                };
            }
            // Initialize WebKit
            this.initWebkit();
        }
        initWebkit() {
            let self = this;
            // Check that ASOL is correctly imported
            if (typeof WebKitOnLine === "undefined") {
                self.setStatus(ASOL.ASOLSignerStatus.INIT_FAILURE, "ASOL libraries import failure");
                self.notifyFailure("ASOL is not correctly imported");
                return;
            }
            // Initialize WebKit
            if (!ASOLSigner.webkit) {
                try {
                    // Initialize
                    ASOLSigner.webkit = new WebKitOnLine(this.clientCode);
                    // Add an handler to close the webkit on page exiting
                    window.addEventListener('beforeunload', () => {
                        try {
                            ASOLSigner.webkit.closeClient();
                        }
                        catch (e) {
                            console.error("Error closing webkit client", e);
                        }
                    });
                    // 
                    ASOLSigner.webkit.init_card_service_no_popup(function () {
                        self.onWebkitInitialized();
                    });
                }
                catch (e) {
                    self.setStatus(ASOL.ASOLSignerStatus.INIT_FAILURE, "ASOL libraries initialization failure");
                    self.notifyFailure("Error initializing ASOL WebKit");
                    return;
                }
            }
            else {
                self.onWebkitInitialized();
            }
        }
        onWebkitInitialized() {
            // Initialize certs
            this.initCerts();
        }
        initCerts() {
            let self = this;
            // Check if certificates already got and request them if required
            if (!ASOLSigner.certificates) {
                // Request certificates
                ASOLSigner.webkit.certsListP11(function (data) {
                    if (data.header.type === "ResponseListCerts") {
                        if (data.status !== "OK") {
                            self.setStatus(ASOL.ASOLSignerStatus.INIT_FAILURE, "Sign certificates retrieving failed");
                            self.notifyFailure("Could not retrieve certificates: status " + data.status);
                        }
                        else if (data.list === undefined || data.list.length === 0) {
                            self.setStatus(ASOL.ASOLSignerStatus.INIT_FAILURE, "Missing USB token or no sign certificate found");
                            self.notifyFailure("Could not retrieve certificates: no certificate found");
                        }
                        else {
                            // Get available certificates
                            let certs = [];
                            for (let i = 0; i < data.list.length; i++) {
                                // Get the next certificate
                                let cert = data.list[i];
                                // Check validity
                                if (cert && cert.common_name) {
                                    // Set the id
                                    cert.id = i;
                                    // Add to certificates
                                    certs.push(cert);
                                }
                            }
                            // Set certificates
                            ASOLSigner.certificates = certs;
                            //
                            self.onCertsInitialized();
                        }
                    }
                    else {
                        self.setStatus(ASOL.ASOLSignerStatus.INIT_FAILURE, "Sign certificates retrieving failed (unsupported response)");
                        self.notifyFailure("Could not retrieve certificates: unsupported response");
                    }
                });
            }
            else {
                // Certificates already initialized, go on
                self.onCertsInitialized();
            }
        }
        onCertsInitialized() {
            this.setStatus(ASOL.ASOLSignerStatus.READY, "Ready");
        }
        getCertificates() {
            return ASOLSigner.certificates;
        }
        sign(certificate, pin, filenames, signType, callbacks) {
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
            switch (signType) {
                case ASOL.SignType.CADES:
                    dstFilePostfix = ".p7m";
                    tipoBusta = 1;
                    break;
                case ASOL.SignType.PADES:
                    dstFilePostfix = "";
                    tipoBusta = 2;
                    break;
                default:
                    throw "Invalid signature type";
            }
            // Clean up certificate
            let normalizedCertificate = JSON.parse(JSON.stringify(certificate));
            delete normalizedCertificate.id;
            delete normalizedCertificate.$$hashKey;
            // Initialize targets
            let targets = [];
            for (let i = 0; i < filenames.length; i++) {
                let filename = filenames[i];
                let srcFile = currentSession + "/" + filename;
                let dstFile = currentSession + "/signed/" + filename + dstFilePostfix;
                targets.push({
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
                });
            }
            // Sign
            ASOLSigner.webkit.createSignatureV2(tipoFirma, "" + pin, normalizedCertificate, targets, function (data) {
                if (typeof data == "object" && "status" in data) {
                    if (data.status == "OK") {
                        self.notifySignOk(callbacks);
                    }
                    else {
                        self.notifySignError(data.text, callbacks);
                    }
                }
                else {
                    self.notifySignError("Invalid response", callbacks);
                }
            });
        }
        notifySignOk(callbacks) {
            if (callbacks) {
                try {
                    if (typeof callbacks.success() === "function") {
                        callbacks.success();
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        notifySignError(message, callbacks) {
            if (callbacks) {
                try {
                    if (typeof callbacks.fail === "function") {
                        callbacks.fail(message);
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    }
    ASOLSigner.importedJsList = [];
    ASOL.ASOLSigner = ASOLSigner;
})(ASOL || (ASOL = {}));
var FET;
(function (FET) {
    let SignMethodAPIEnum;
    (function (SignMethodAPIEnum) {
        SignMethodAPIEnum[SignMethodAPIEnum["REMOTE"] = 0] = "REMOTE";
        SignMethodAPIEnum[SignMethodAPIEnum["LOCAL"] = 1] = "LOCAL";
    })(SignMethodAPIEnum = FET.SignMethodAPIEnum || (FET.SignMethodAPIEnum = {}));
})(FET || (FET = {}));
/// <reference path="../libs/angular/index.d.ts"/>
/// <reference path="bean/APICallback.d.ts"/>
/// <reference path="bean/ServerConfigurationAPIBean.d.ts"/>
/// <reference path="bean/SessionInfoAPIBean.d.ts"/>
/// <reference path="bean/VolFileAPIBean.d.ts"/>
var FET;
(function (FET) {
    class APIService {
        /**
         * Executes an API request.
         * @param url API absolute URL.
         * @param $http HTTP service.
         * @param method Method (GET, POST, etc.)
         * @param callback Callback. May be undefined.
         */
        static execute($http, url, method, contentType, data, params, transformRequest, callback) {
            // Configure HTTP
            let config = {
                "method": method,
                "url": url,
                "headers": {
                    "Content-Type": contentType,
                },
                "data": typeof data == 'undefined' ? null : data,
                "params": typeof params == 'undefined' ? null : params,
            };
            if (transformRequest) {
                config["transformRequest"] = transformRequest;
            }
            // Execute
            $http(config)
                .then(function (response) {
                var json = response.data;
                if (json && json.success) {
                    try {
                        if (callback && callback.success) {
                            APIService.raiseSuccess(callback, json.data);
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                else {
                    APIService.raiseError(callback, json.message);
                }
            }, function (e) {
                APIService.raiseError(callback, e.status + " " + e.statusText);
            });
        }
        /**
         * Raises success callback.
         * @param callback Callback. May be undefined.
         * @param data API returned data.
         */
        static raiseSuccess(callback, data) {
            try {
                if (callback && callback.success) {
                    callback.success(data);
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        /**
         * Raises error callback.
         * @param callback Callback. May be undefined.
         * @param message Error message.
         */
        static raiseError(callback, message) {
            try {
                if (callback && callback.error) {
                    callback.error(message);
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        static getServerConfiguration(baseUrl, $http, callback) {
            //
            APIService.execute($http, baseUrl + "/api/config", "GET", undefined, null, undefined, angular.identity, callback);
        }
        static createSession(baseUrl, $http, callback) {
            //
            APIService.execute($http, baseUrl + "/api/session/create", "POST", undefined, null, undefined, angular.identity, callback);
        }
        static getSessionInfo(baseUrl, sessionUID, $http, callback) {
            //
            APIService.execute($http, baseUrl + "/api/session/" + encodeURI(sessionUID), "GET", undefined, null, undefined, angular.identity, callback);
        }
        static addSessionFile(baseUrl, sessionUID, file, $http, callback) {
            // Initialize
            var fileName = file.name;
            // Build form data
            var formData = new FormData();
            formData.append("document", file);
            // Execute
            APIService.execute($http, baseUrl + "/api/session/" + encodeURI(sessionUID) + "/documents/add", "POST", undefined, formData, undefined, angular.identity, callback);
        }
        static addSignedDocument(baseUrl, sessionUID, documentUID, file, $http, callback) {
            // Initialize
            var fileName = file.name;
            // Build form data
            var formData = new FormData();
            formData.append("documentUID", documentUID);
            formData.append("document", file);
            // Execute
            APIService.execute($http, baseUrl + "/api/session/" + encodeURI(sessionUID) + "/documents/addSignedDocument", "POST", undefined, formData, undefined, angular.identity, callback);
        }
        static volValidation(baseUrl, sessionUID, $http, callback) {
            // Execute
            APIService.execute($http, baseUrl + "/api/session/" + encodeURI(sessionUID) + "/documents/volValidation", "POST", undefined, undefined, undefined, angular.identity, callback);
        }
        static deleteSignedDocument(baseUrl, sessionUID, documentToSignUID, documentSignedUID, $http, callback) {
            // Build form data
            var obj = {
                "documentToSignUID": documentToSignUID,
                "documentSignedUID": documentSignedUID
            };
            // Execute
            APIService.execute($http, baseUrl + "/api/session/" + encodeURI(sessionUID) + "/deleteSignedDocument", "DELETE", "application/json", undefined, obj, undefined, callback);
        }
        static signByARSS(baseUrl, sessionUID, username, password, otp, signType, $http, callback) {
            // Get sign type as expected by the API
            let signTypeStr;
            switch (+signType) {
                case FET.SignType.CADES:
                    signTypeStr = "CADES";
                    break;
                case FET.SignType.PADES:
                    signTypeStr = "PADES";
                    break;
                default:
                    APIService.raiseError(callback, "Invalid signature type");
                    return;
            }
            //
            APIService.execute($http, baseUrl + "/api/session/" + encodeURI(sessionUID) + "/signByARSS", "POST", "application/json", {
                "username": username,
                "password": password,
                "otp": otp,
                "signType": signTypeStr,
            }, undefined, undefined, callback);
        }
    }
    FET.APIService = APIService;
})(FET || (FET = {}));
var FET;
(function (FET) {
    let SignWorkflowState;
    (function (SignWorkflowState) {
        SignWorkflowState[SignWorkflowState["CONFIGURING"] = 0] = "CONFIGURING";
        SignWorkflowState[SignWorkflowState["CREATING_SESSION"] = 1] = "CREATING_SESSION";
        SignWorkflowState[SignWorkflowState["RETRIEVING_SESSION"] = 2] = "RETRIEVING_SESSION";
        SignWorkflowState[SignWorkflowState["FILE_SELECTION"] = 3] = "FILE_SELECTION";
        SignWorkflowState[SignWorkflowState["UPLOADING_FILE"] = 4] = "UPLOADING_FILE";
        SignWorkflowState[SignWorkflowState["ASKING_FOR_MORE_FILES"] = 5] = "ASKING_FOR_MORE_FILES";
        SignWorkflowState[SignWorkflowState["SIGN_METHOD_SELECTION"] = 6] = "SIGN_METHOD_SELECTION";
        SignWorkflowState[SignWorkflowState["INITIALIZING_ASOL"] = 7] = "INITIALIZING_ASOL";
        SignWorkflowState[SignWorkflowState["CONFIGURE_ARSS"] = 8] = "CONFIGURE_ARSS";
        SignWorkflowState[SignWorkflowState["SIGNING"] = 9] = "SIGNING";
        SignWorkflowState[SignWorkflowState["CONFIGURE_ASOL"] = 10] = "CONFIGURE_ASOL";
        SignWorkflowState[SignWorkflowState["ASOL_PREPARING_FILES"] = 11] = "ASOL_PREPARING_FILES";
        SignWorkflowState[SignWorkflowState["ASOL_SIGNING"] = 12] = "ASOL_SIGNING";
        SignWorkflowState[SignWorkflowState["ASOL_FINALIZING_SIGNATURE"] = 13] = "ASOL_FINALIZING_SIGNATURE";
        SignWorkflowState[SignWorkflowState["SIGN_CHANNEL_SELECTION"] = 14] = "SIGN_CHANNEL_SELECTION";
        SignWorkflowState[SignWorkflowState["CONFIGURE_EXSYST_CHANNEL"] = 15] = "CONFIGURE_EXSYST_CHANNEL";
        SignWorkflowState[SignWorkflowState["EXSYST_PREPARING_FILES"] = 16] = "EXSYST_PREPARING_FILES";
        SignWorkflowState[SignWorkflowState["EXSYST_UPLODAD_FILES"] = 17] = "EXSYST_UPLODAD_FILES";
        SignWorkflowState[SignWorkflowState["EXSYST_TYPOLOGY_SELECTION"] = 18] = "EXSYST_TYPOLOGY_SELECTION";
        SignWorkflowState[SignWorkflowState["EXSYST_FINALIZING_SIGNATURE"] = 19] = "EXSYST_FINALIZING_SIGNATURE";
        SignWorkflowState[SignWorkflowState["COMPLETED_EXSYST"] = 20] = "COMPLETED_EXSYST";
        SignWorkflowState[SignWorkflowState["COMPLETED"] = 21] = "COMPLETED";
    })(SignWorkflowState = FET.SignWorkflowState || (FET.SignWorkflowState = {}));
})(FET || (FET = {}));
var FET;
(function (FET) {
    let SignChannel;
    (function (SignChannel) {
        SignChannel[SignChannel["SIST"] = 0] = "SIST";
        SignChannel[SignChannel["EXSYST"] = 1] = "EXSYST";
    })(SignChannel = FET.SignChannel || (FET.SignChannel = {}));
})(FET || (FET = {}));
var FET;
(function (FET) {
    let SignTypology;
    (function (SignTypology) {
        SignTypology[SignTypology["OLOG"] = 0] = "OLOG";
        SignTypology[SignTypology["DIGT"] = 1] = "DIGT";
    })(SignTypology = FET.SignTypology || (FET.SignTypology = {}));
})(FET || (FET = {}));
var FET;
(function (FET) {
    let PanelStatus;
    (function (PanelStatus) {
        PanelStatus[PanelStatus["HIDDEN"] = 0] = "HIDDEN";
        PanelStatus[PanelStatus["ENABLED"] = 1] = "ENABLED";
        PanelStatus[PanelStatus["DISABLED"] = 2] = "DISABLED";
        PanelStatus[PanelStatus["LOADING"] = 3] = "LOADING";
    })(PanelStatus = FET.PanelStatus || (FET.PanelStatus = {}));
})(FET || (FET = {}));
/// <reference path="PanelStatus.ts"/>
/// <reference path="../enums/SignWorkflowState.ts"/>
/// <reference path="../enums/SignMethod.ts"/>
/// <reference path="../enums/SignChannel.ts"/>
/// <reference path="../enums/SignTypology.ts"/>
/// <reference path="../enums/SignType.ts"/>
/// <reference path="../bean/SignFile.d.ts"/>
/// <reference path="../bean/SignedFile.d.ts"/>
/// <reference path="../panel/Panel.ts"/>
/// <reference path="../../enums/SignWorkflowState.ts" />
/// <reference path="SignWorklowListener.d.ts" />
/// <reference path="../../bean/Session.d.ts" />
var FET;
(function (FET) {
    class SignWorkflow {
        constructor(session, listener) {
            this.state = FET.SignWorkflowState.CONFIGURING;
            this.session = session;
            this.listeners = [];
            // Add listener if any
            if (listener) {
                this.addListener(listener);
            }
        }
        addListener(listener) {
            if (listener) {
                this.listeners.push(listener);
            }
        }
        getState() {
            return this.state;
        }
        setState(state) {
            if (this.state != state) {
                // Store old state
                let oldState = this.state;
                // Implement workflow
                switch (+state) {
                    case FET.SignWorkflowState.FILE_SELECTION:
                    case FET.SignWorkflowState.UPLOADING_FILE:
                    case FET.SignWorkflowState.ASKING_FOR_MORE_FILES:
                        // If cannot add files, go to sign channel state
                        if (!this.session.addFilesAllowed) {
                            if (this.session.isStandalone) {
                                this.setState(FET.SignWorkflowState.SIGN_METHOD_SELECTION);
                            }
                            else {
                                this.setState(FET.SignWorkflowState.SIGN_CHANNEL_SELECTION);
                            }
                            return;
                        }
                        break;
                    case FET.SignWorkflowState.CONFIGURING:
                    case FET.SignWorkflowState.CREATING_SESSION:
                    case FET.SignWorkflowState.RETRIEVING_SESSION:
                    case FET.SignWorkflowState.SIGN_METHOD_SELECTION:
                    case FET.SignWorkflowState.INITIALIZING_ASOL:
                    case FET.SignWorkflowState.CONFIGURE_ARSS:
                    case FET.SignWorkflowState.SIGNING:
                    case FET.SignWorkflowState.CONFIGURE_ASOL:
                    case FET.SignWorkflowState.ASOL_PREPARING_FILES:
                    case FET.SignWorkflowState.ASOL_SIGNING:
                    case FET.SignWorkflowState.ASOL_FINALIZING_SIGNATURE:
                    case FET.SignWorkflowState.SIGN_CHANNEL_SELECTION:
                    case FET.SignWorkflowState.CONFIGURE_EXSYST_CHANNEL:
                    case FET.SignWorkflowState.EXSYST_TYPOLOGY_SELECTION:
                    case FET.SignWorkflowState.EXSYST_FINALIZING_SIGNATURE:
                    case FET.SignWorkflowState.COMPLETED_EXSYST:
                    case FET.SignWorkflowState.COMPLETED:
                }
                // Fallback is to set the state
                this.state = state;
                this.raiseStateChanged(oldState, state);
            }
        }
        raiseStateChanged(oldState, newState) {
            for (let listener of this.listeners) {
                try {
                    if (typeof listener == "object" && typeof listener.stateChanged == "function") {
                        listener.stateChanged(this, oldState, newState);
                    }
                }
                catch (e) {
                    console.error("Error notifying state change", e);
                }
            }
        }
    }
    FET.SignWorkflow = SignWorkflow;
})(FET || (FET = {}));
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
var FET;
(function (FET) {
    class AbstractSignCtrl {
        constructor(config, $scope, $http, $timeout, PropertiesService) {
            // Initialize context
            this.$scope = $scope;
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
        initSession(config) {
            this.session = {
                uid: config ? config.sessionUID : null,
                availableSignMethods: FET.EnumUtils.values(FET.SignMethod),
                availableSignTypes: FET.EnumUtils.values(FET.SignType),
                availableSignChannels: FET.EnumUtils.values(FET.SignChannel),
                availableSignTypologies: FET.EnumUtils.values(FET.SignTypology),
                addFilesAllowed: true,
                signedFilesDownloadAllowed: true,
                files: [],
                signedFiles: [],
                redirectURL: null,
                signMethod: null,
                signType: null,
                signChannel: null,
                signTypology: null,
                isStandalone: false,
            };
        }
        initWorkflow() {
            let self = this;
            this.workflow = new FET.SignWorkflow(this.session, {
                stateChanged: function (workflow, oldState, newState) {
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
        initScope() {
            let self = this;
            // Initialize globals
            this.$scope.FET = FET;
            // Initialize configurations
            this.$scope.workflow = this;
            this.$scope.state = this.workflow.getState();
            this.$scope.availableSignMethods = FET.EnumUtils.values(FET.SignMethod);
            this.$scope.availableSignTypes = FET.EnumUtils.values(FET.SignType);
            this.$scope.availableSignChannels = FET.EnumUtils.values(FET.SignChannel);
            this.$scope.availableSignTypologies = FET.EnumUtils.values(FET.SignTypology);
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
                initialization: { status: FET.PanelStatus.ENABLED },
                files: { status: FET.PanelStatus.HIDDEN },
                signMethods: { status: FET.PanelStatus.HIDDEN },
                signChannels: { status: FET.PanelStatus.HIDDEN },
                signExt: { status: FET.PanelStatus.HIDDEN },
                arssCredentials: { status: FET.PanelStatus.HIDDEN },
                asolCredentials: { status: FET.PanelStatus.HIDDEN },
                signTypologies: { status: FET.PanelStatus.HIDDEN },
                signExtsysResult: { status: FET.PanelStatus.HIDDEN },
                completedSignExt: { status: FET.PanelStatus.HIDDEN },
                completed: { status: FET.PanelStatus.HIDDEN },
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
            };
            // fn: setSignMethod
            this.$scope.setSignMethod = function () {
                // Check method is selected
                if (!self.$scope.signMethod) {
                    alert("Select a method");
                    return;
                }
                // Upload file
                self.setSignMethod(self.$scope.signMethod, self.$scope.signType);
            };
            this.$scope.onClickDownloadFile = function (index) {
                self.$scope.downloadFile[index] = true;
                self.setErrorSignTypology();
            };
            this.$scope.onChangeSelectTypology = function () {
                self.initializeTable();
                self.setErrorSignTypology();
            };
            this.$scope.onClickSelectbox = function () {
                self.setWarningChangeTypology();
            };
            this.$scope.onClickDownloadZip = function () {
                self.$scope.downloadZip = true;
            };
            this.$scope.setRedirectRequested = function () {
                self.$scope.redirectRequested = true;
            };
            this.$scope.deleteSignedDocument = function (originalFile, signedFile, index) {
                self.deleteSignedDocument(originalFile.uid, signedFile.uid, index);
            };
            this.$scope.onClickBtnDone = function () {
                self.onClickBtnDone();
            };
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
            };
            this.$scope.nextTick = function () {
                if (self.$scope.redirectRequested) {
                    return;
                }
                // Decrease redirect timeout
                self.$scope.redirectTimeoutSec--;
                if (self.$scope.redirectTimeoutSec <= 0) {
                    window.location.href = self.$scope.redirectURL;
                }
                else {
                    self.$timeout(self.$scope.nextTick, 1000);
                }
            };
        }
        getDocumentUrl(documentUID) {
            return this.baseUrl + "document/" + encodeURI(documentUID) + "/download";
        }
        refreshUI() {
            let self = this;
            this.$timeout(function () {
                // Get state
                let state = self.workflow.getState();
                // Configure panels
                switch (+state) {
                    case FET.SignWorkflowState.CONFIGURING:
                    case FET.SignWorkflowState.CREATING_SESSION:
                    case FET.SignWorkflowState.RETRIEVING_SESSION:
                        self.$scope.panels.initialization.status = FET.PanelStatus.ENABLED;
                        self.$scope.panels.files.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.arssCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.FILE_SELECTION:
                    case FET.SignWorkflowState.ASKING_FOR_MORE_FILES:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.ENABLED;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.arssCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.UPLOADING_FILE:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.LOADING;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.arssCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.SIGN_CHANNEL_SELECTION:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.ENABLED;
                        self.$scope.panels.signExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.arssCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.CONFIGURE_EXSYST_CHANNEL:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signExt.status = FET.PanelStatus.ENABLED;
                        self.$scope.panels.arssCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.SIGN_METHOD_SELECTION:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.ENABLED;
                        self.$scope.panels.signExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.arssCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.INITIALIZING_ASOL:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.LOADING;
                        self.$scope.panels.signExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.arssCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.CONFIGURE_ARSS:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.arssCredentials.status = FET.PanelStatus.ENABLED;
                        self.$scope.panels.asolCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.CONFIGURE_ASOL:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.arssCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = FET.PanelStatus.ENABLED;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.SIGNING:
                    case FET.SignWorkflowState.ASOL_PREPARING_FILES:
                    case FET.SignWorkflowState.ASOL_SIGNING:
                    case FET.SignWorkflowState.ASOL_FINALIZING_SIGNATURE:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.arssCredentials.status = self.session.signMethod == FET.SignMethod.ARSS ? FET.PanelStatus.LOADING : FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = self.session.signMethod == FET.SignMethod.ASOL ? FET.PanelStatus.LOADING : FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.EXSYST_TYPOLOGY_SELECTION:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signExt.status = FET.PanelStatus.ENABLED;
                        self.$scope.panels.arssCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.ENABLED;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.EXSYST_FINALIZING_SIGNATURE:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signExt.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.arssCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.LOADING;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.COMPLETED_EXSYST:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signExt.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.arssCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.ENABLED;
                        self.$scope.panels.completed.status = FET.PanelStatus.HIDDEN;
                        break;
                    case FET.SignWorkflowState.COMPLETED:
                        self.$scope.panels.initialization.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.files.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signMethods.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signChannels.status = FET.PanelStatus.DISABLED;
                        self.$scope.panels.signExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.arssCredentials.status = self.session.signMethod == FET.SignMethod.ARSS ? FET.PanelStatus.DISABLED : FET.PanelStatus.HIDDEN;
                        self.$scope.panels.asolCredentials.status = self.session.signMethod == FET.SignMethod.ASOL ? FET.PanelStatus.DISABLED : FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signTypologies.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.signExtsysResult.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completedSignExt.status = FET.PanelStatus.HIDDEN;
                        self.$scope.panels.completed.status = FET.PanelStatus.ENABLED;
                        break;
                }
            }, 1);
        }
        retrieveServerConfigurations() {
            let self = this;
            // Set state
            this.workflow.setState(FET.SignWorkflowState.CONFIGURING);
            // Request
            FET.APIService.getServerConfiguration(this.baseUrl, this.$http, {
                success(config) {
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
        onConfigurationCompleted() {
            // Set session
            if (this.session.uid) {
                this.retrieveSession(this.session.uid);
            }
            else {
                this.createSession();
                this.session.isStandalone = true;
                this.$scope.isStandalone = true;
            }
        }
        createSession() {
            let self = this;
            // Set state
            this.workflow.setState(FET.SignWorkflowState.CREATING_SESSION);
            // Request
            FET.APIService.createSession(this.baseUrl, this.$http, {
                success(sessionId) {
                    console.debug("Created session: " + sessionId);
                    self.setSessionId(sessionId);
                    self.workflow.setState(FET.SignWorkflowState.FILE_SELECTION);
                },
                error(message) {
                    self.$scope.panels.initialization.errorMessage = "Error creating session: " + message;
                }
            });
        }
        retrieveSession(sessionUID) {
            let self = this;
            // Request
            FET.APIService.getSessionInfo(this.baseUrl, sessionUID, this.$http, {
                success(data) {
                    self.onSessionInfoRetrieved(data);
                },
                error(message) {
                    self.$scope.panels.initialization.errorMessage = "Error retrieving session data: " + message;
                }
            });
        }
        onSessionInfoRetrieved(session) {
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
                        switch (FET.EnumUtils.numericKey(FET.SignMethodAPIEnum, method)) {
                            case FET.SignMethodAPIEnum.REMOTE:
                                this.addAvailableSignMethod(FET.SignMethod.ARSS);
                                break;
                            case FET.SignMethodAPIEnum.LOCAL:
                                this.addAvailableSignMethod(FET.SignMethod.ASOL);
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
                this.workflow.setState(this.session.files.length == 0 ? FET.SignWorkflowState.FILE_SELECTION : FET.SignWorkflowState.ASKING_FOR_MORE_FILES);
            }
        }
        deleteSignedDocument(originalFileUID, signedFileUID, index) {
            var self = this;
            if (!signedFileUID) {
                self.session.files[index].fileUpload = null;
                self.$scope.files[index].fileUpload = null;
                self.$scope.countFilesUploaded--;
                self.$scope.panels.signExt.errorMessage = null;
                self.$scope.isDisableBtnDone = true;
                self.$scope.$applyAsync();
                return;
            }
            FET.APIService.deleteSignedDocument(this.baseUrl, this.session.uid, originalFileUID, signedFileUID, this.$http, {
                success: function (response) {
                    self.session.files[index].fileUpload = null;
                    self.$scope.files[index].fileUpload = null;
                    self.$scope.countFilesUploaded--;
                    self.$scope.panels.signExt.errorMessage = null;
                    self.$scope.isDisableBtnDone = true;
                    self.$scope.$applyAsync();
                },
                error: function (message) {
                    console.log("erroreDelete");
                }
            });
        }
        setSessionId(sessionUID) {
            // Check argument
            if (!sessionUID) {
                throw "Invalid session id";
            }
            // Set session
            this.session.uid = sessionUID;
        }
        setWarningChangeTypology() {
            var self = this;
            if (self.$scope.countFilesUploaded > 0) {
                self.$scope.panels.signExt.errorMessage = 'SIGN.SET_EXSYST_FILE_PANEL.TABLE.WARNING.CLICK_TYPOLOGY';
            }
        }
        setErrorSignTypology() {
            var self = this;
            if (!self.$scope.signTypology) {
                self.$scope.panels.signExt.errorMessage = 'SIGN.SET_EXSYST_FILE_PANEL.TABLE.ERROR.SELECT_TYPOLOGY';
            }
            else {
                self.$scope.panels.signExt.errorMessage = null;
            }
        }
        addFileUploaded(file, index) {
            var self = this;
            // Reset
            this.$scope.panels.signExt.errorMessage = null;
            // Check file is selected
            if (!file) {
                this.$scope.panels.signExt.errorMessage = "No file passed";
                return;
            }
            // Check state
            if (this.workflow.getState() != FET.SignWorkflowState.CONFIGURE_EXSYST_CHANNEL) {
                throw "Illegal state: not in " + FET.SignWorkflowState.CONFIGURE_EXSYST_CHANNEL + " state";
            }
            if (file.type != 'application/pdf' && file.type != 'application/pkcs7-mime') {
                this.$scope.panels.signExt.errorMessage = 'SIGN.SET_EXSYST_FILE_PANEL.TABLE.ERROR.UPLOAD';
                this.session.files[index].fileUpload = {
                    uid: null,
                    filename: file.name,
                    url: null,
                    fileUpload: null,
                    esito: false,
                };
                this.$scope.$applyAsync();
                return;
            }
            // Add signed file
            FET.APIService.addSignedDocument(this.baseUrl, this.session.uid, this.$scope.files[index].uid, file, this.$http, {
                success: function (signedDoc) {
                    self.onDocumentSigned(signedDoc, index);
                },
                error: function (message) {
                    self.errorSaveDocument();
                    throw "errore add file: " + message;
                }
            });
        }
        uploadAndAddFile(file) {
            var self = this;
            // Reset
            this.$scope.panels.files.errorMessage = null;
            // Check file is selected
            if (!file) {
                this.$scope.panels.files.errorMessage = "No file passed";
                return;
            }
            // Check state
            if (this.workflow.getState() != FET.SignWorkflowState.FILE_SELECTION) {
                throw "Illegal state: not in " + FET.SignWorkflowState.FILE_SELECTION + " state";
            }
            // Set upload status
            this.workflow.setState(FET.SignWorkflowState.UPLOADING_FILE);
            // Add file
            FET.APIService.addSessionFile(this.baseUrl, this.session.uid, file, this.$http, {
                success: function (fileId) {
                    self.addFile(fileId, file.name);
                },
                error: function (message) {
                    self.workflow.setState(FET.SignWorkflowState.FILE_SELECTION);
                    self.$scope.panels.files.errorMessage = "Error: " + message;
                }
            });
        }
        addFile(fileUID, fileName) {
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
            this.workflow.setState(FET.SignWorkflowState.ASKING_FOR_MORE_FILES);
        }
        moreFilesRequired(required) {
            if (!required) {
                if (this.session.files.length == 0) {
                    this.$scope.panels.files.errorMessage = "No files added";
                }
                else {
                    if (this.session.isStandalone) {
                        this.workflow.setState(FET.SignWorkflowState.SIGN_METHOD_SELECTION);
                    }
                    else {
                        this.workflow.setState(FET.SignWorkflowState.SIGN_CHANNEL_SELECTION);
                    }
                }
            }
            else {
                this.workflow.setState(FET.SignWorkflowState.FILE_SELECTION);
            }
        }
        initializeTable() {
            var self = this;
            self.$scope.countFilesUploaded = 0;
            self.$scope.panels.signExt.errorMessage = null;
            self.$scope.$applyAsync();
            angular.forEach(self.session.files, function (elem, index) {
                if (elem.fileUpload) {
                    elem.fileUpload = null;
                    self.$scope.deleteSignedDocument(elem, elem.fileUpload, index);
                    this.$scope.isDisableBtnDone = true;
                }
            });
        }
        clearAvailableSignMethods() {
            this.session.availableSignMethods.splice(0, this.session.availableSignMethods.length);
            this.$scope.availableSignMethods.splice(0, this.$scope.availableSignMethods.length);
        }
        addAvailableSignMethod(method) {
            let methodKey = FET.EnumUtils.numericKey(FET.SignMethod, method);
            if (typeof methodKey != 'undefined') {
                this.session.availableSignMethods.push(methodKey);
                this.$scope.availableSignMethods.push(FET.EnumUtils.stringKey(FET.SignMethod, methodKey));
            }
        }
        clearAvailableSignTypes() {
            this.session.availableSignTypes.splice(0, this.session.availableSignTypes.length);
            this.$scope.availableSignTypes.splice(0, this.$scope.availableSignTypes.length);
        }
        addAvailableSignType(type) {
            let typeKey = FET.EnumUtils.numericKey(FET.SignType, type);
            if (typeof typeKey != 'undefined') {
                this.session.availableSignTypes.push(typeKey);
                this.$scope.availableSignTypes.push(FET.EnumUtils.stringKey(FET.SignType, typeKey));
            }
        }
        setSignTypology(typology) {
            throw new Error("Method not implemented.");
        }
        getSignChannel() {
            return this.session.signChannel;
        }
        setSignChannel(signChannel) {
            // Check arguments
            if (!FET.EnumUtils.exists(FET.SignChannel, signChannel)) {
                this.$scope.panels.signChannels.errorMessage = "Invalid sign channel";
                return;
            }
            // Check state
            if (this.workflow.getState() != FET.SignWorkflowState.SIGN_CHANNEL_SELECTION) {
                throw "Illegal state: not in " + FET.SignWorkflowState.SIGN_CHANNEL_SELECTION + " state";
            }
            // Normalize values (numeric keys)
            signChannel = FET.EnumUtils.numericKey(FET.SignChannel, signChannel);
            // Configure method
            switch (signChannel) {
                case FET.SignChannel.SIST:
                    this.$scope.signChannel = FET.EnumUtils.stringKey(FET.SignChannel, signChannel);
                    this.session.signChannel = signChannel;
                    this.workflow.setState(FET.SignWorkflowState.SIGN_METHOD_SELECTION);
                    break;
                case FET.SignChannel.EXSYST:
                    this.$scope.signChannel = FET.EnumUtils.stringKey(FET.SignChannel, signChannel);
                    this.session.signChannel = signChannel;
                    this.$scope.filesToSignZipURL = this.baseUrl + "session/" + encodeURI(this.session.uid) + "/documents/tosign/download";
                    this.$scope.downloadFile = [];
                    let boolean = false;
                    for (let index = 0; index < this.$scope.files.length; index++) {
                        this.$scope.downloadFile.push(boolean);
                    }
                    this.workflow.setState(FET.SignWorkflowState.CONFIGURE_EXSYST_CHANNEL);
                    break;
                default:
                    throw "Invalid sign method";
            }
        }
        getSignMethod() {
            return this.session.signMethod;
        }
        setSignMethod(signMethod, signType) {
            // Check arguments
            if (!FET.EnumUtils.exists(FET.SignMethod, signMethod)) {
                this.$scope.panels.signMethods.errorMessage = "Invalid sign method";
                return;
            }
            if (!FET.EnumUtils.exists(FET.SignType, signType)) {
                this.$scope.panels.signMethods.errorMessage = "Invalid sign type";
                return;
            }
            // Check state
            if (this.workflow.getState() != FET.SignWorkflowState.SIGN_METHOD_SELECTION) {
                throw "Illegal state: not in " + FET.SignWorkflowState.SIGN_METHOD_SELECTION + " state";
            }
            // Normalize values (numeric keys)
            signMethod = FET.EnumUtils.numericKey(FET.SignMethod, signMethod);
            signType = FET.EnumUtils.numericKey(FET.SignType, signType);
            // Configure type
            this.session.signType = signType;
            this.$scope.signType = FET.EnumUtils.stringKey(FET.SignType, signType);
            // Configure method
            switch (signMethod) {
                case FET.SignMethod.ARSS:
                    this.$scope.signMethod = FET.EnumUtils.stringKey(FET.SignMethod, signMethod);
                    this.session.signMethod = signMethod;
                    this.workflow.setState(FET.SignWorkflowState.CONFIGURE_ARSS);
                    break;
                case FET.SignMethod.ASOL:
                    this.$scope.signMethod = FET.EnumUtils.stringKey(FET.SignMethod, signMethod);
                    this.session.signMethod = signMethod;
                    this.showErrorMessageRedirect();
                    this.initializeASOL();
                    break;
                default:
                    throw "Invalid sign method";
            }
        }
        initializeASOL() {
            // Check state
            if (this.workflow.getState() != FET.SignWorkflowState.SIGN_METHOD_SELECTION) {
                throw "Illegal state: not in " + FET.SignWorkflowState.SIGN_METHOD_SELECTION + " state";
            }
            // Set init status
            this.workflow.setState(FET.SignWorkflowState.INITIALIZING_ASOL);
            // Initialize client if required
            if ((!this.asolSigner) || this.asolSigner.getStatus() != ASOL.ASOLSignerStatus.READY) {
                // TODO Parametric signature context
                this.asolSigner = new ASOL.ASOLSigner(this.asolUrl + "/scripts/webkitligth.js", this.asolClientCode);
            }
            // Wait for ASOL client to be ready
            this.waitASOLReady();
        }
        waitASOLReady() {
            let self = this;
            switch (this.asolSigner.getStatus()) {
                case ASOL.ASOLSignerStatus.INITIALIZING:
                    self.$timeout(function () {
                        self.waitASOLReady();
                    }, 500);
                    break;
                case ASOL.ASOLSignerStatus.READY:
                    // Check ASOL certificates list
                    if ((!self.asolSigner.getCertificates()) || self.asolSigner.getCertificates().length == 0) {
                        self.workflow.setState(FET.SignWorkflowState.SIGN_METHOD_SELECTION);
                        self.$scope.panels.signMethods.errorMessage = "USB token not found or certificates retrieving failed";
                        return;
                    }
                    // Get certificates for frontend uses
                    self._asolCertificates = self.asolSigner.getCertificates();
                    // Set state
                    self.workflow.setState(FET.SignWorkflowState.CONFIGURE_ASOL);
                    break;
                case ASOL.ASOLSignerStatus.INIT_FAILURE:
                    self.workflow.setState(FET.SignWorkflowState.SIGN_METHOD_SELECTION);
                    self.$scope.panels.signMethods.errorMessage = self.asolSigner.getStatusMessage();
                    break;
                default:
                    self.workflow.setState(FET.SignWorkflowState.SIGN_METHOD_SELECTION);
                    self.$scope.panels.signMethods.errorMessage = "Unexpected ASOL signer status: " + self.asolSigner.getStatus();
                    break;
            }
        }
        setARSSCredentials(username, password, otp) {
            this.signUsername = username;
            this.signPassword = password;
            this.signOtp = otp;
        }
        setASOLCredentials(pin, certificateId) {
            this.signPin = pin;
            this.signCertificateId = certificateId;
        }
        sign() {
            // TODO To be implemented
            switch (this.session.signMethod) {
                case FET.SignMethod.ARSS:
                    this.signARSS();
                    break;
                case FET.SignMethod.ASOL:
                    this.showErrorMessageRedirect();
                    this.prepareASOLFiles();
                    break;
                default:
                    throw "No sign method set";
            }
        }
        signARSS() {
            let self = this;
            // Check arguments
            if (!(this.signUsername && this.signPassword && this.signOtp)) {
                throw "Missing credentials";
            }
            if (this.session.signType === undefined || this.session.signType === null) {
                throw "Missing signature type";
            }
            // Set status
            this.workflow.setState(FET.SignWorkflowState.SIGNING);
            //
            FET.APIService.signByARSS(this.baseUrl, this.session.uid, this.signUsername, this.signPassword, this.signOtp, this.session.signType, this.$http, {
                success: function (signedDocs) {
                    self.onDocumentsSigned(signedDocs);
                },
                error: function (message) {
                    self.onSignError(message);
                }
            });
        }
        prepareASOLFiles() {
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
            this.workflow.setState(FET.SignWorkflowState.ASOL_PREPARING_FILES);
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
                .then(function (response) {
                var json = response.data;
                if (json && json.success) {
                    self.signASOL();
                }
                else {
                    self.onSignError(json.message);
                }
            }, function (e) {
                self.onSignError(e.status + " " + e.statusText);
            });
        }
        signASOL() {
            let self = this;
            // Set state
            self.workflow.setState(FET.SignWorkflowState.ASOL_SIGNING);
            // Build filenames list
            let filenames = [];
            for (let file of this.session.files) {
                filenames.push(file.filename);
            }
            // Build callbacks
            let callbacks = {
                success: function () {
                    self.$scope.$apply(() => {
                        self.finalizeASOLSignature();
                    });
                },
                fail: function (errorMessage) {
                    self.onSignError("Sign error: " + errorMessage);
                },
            };
            // Calculate the sign type
            let signType;
            switch (+self.session.signType) {
                case FET.SignType.CADES:
                    signType = ASOL.SignType.CADES;
                    break;
                case FET.SignType.PADES:
                    signType = ASOL.SignType.PADES;
                    break;
                default:
                    self.onSignError("Unsupported sign type");
                    return;
            }
            // Sign
            this.asolSigner.sign(this._asolCertificates[this.signCertificateId], this.signPin, filenames, signType, callbacks);
        }
        finalizeASOLSignature() {
            let self = this;
            // Check arguments
            if (!currentSession) {
                this.onSignError("ASOL misconfiguration (no session)");
                return;
            }
            // Set state
            this.workflow.setState(FET.SignWorkflowState.ASOL_FINALIZING_SIGNATURE);
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
                .then(function (response) {
                var json = response.data;
                self.handleSignedDocumentsApiResponse(json);
            }, function (e) {
                self.onSignError(e.status + " " + e.statusText);
            });
        }
        handleSignedDocumentsApiResponse(json) {
            if (json && json.success && json.data) {
                this.onDocumentsSigned(json.data);
            }
            else {
                this.onSignError(json.message);
            }
        }
        errorSaveDocument() {
        }
        onDocumentSigned(signedDoc, index) {
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
                };
                this.$scope.countFilesUploaded++;
                const listPositiveSign = this.session.files.filter(elem => elem.fileUpload ? elem.fileUpload.esito : null);
                if (listPositiveSign.length == this.session.files.length) {
                    this.$scope.isDisableBtnDone = false;
                }
            }
        }
        onClickBtnDone() {
            /* VERIFICA VOL */
            var self = this;
            /* self.workflow.setState(SignWorkflowState.EXSYST_FINALIZING_SIGNATURE); */
            FET.APIService.volValidation(this.baseUrl, this.session.uid, this.$http, {
                success: function (volFiles) {
                    var resultFilter = volFiles.filter(function (elem) {
                        return !elem.esitoVol;
                    });
                    if (resultFilter && resultFilter.length > 0) {
                        self.$scope.resultVol = false;
                    }
                    self.$scope.volFiles = volFiles;
                    self.workflow.setState(FET.SignWorkflowState.COMPLETED_EXSYST);
                    // Initialize redirect if has any and signed files cannot be downloaded
                    self.$scope.redirectURL = self.getFullRedirectURL();
                    if (self.session.redirectURL) {
                        self.startAutomaticRedirectExsyst();
                    }
                },
                error: function (message) {
                    throw "errore add file: " + message;
                }
            });
        }
        onDocumentsSigned(signedDocs) {
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
            this.workflow.setState(FET.SignWorkflowState.COMPLETED);
            // Initialize redirect if has any and signed files cannot be downloaded
            this.$scope.redirectURL = this.getFullRedirectURL();
            if (this.session.redirectURL && !this.session.signedFilesDownloadAllowed) {
                this.startAutomaticRedirect();
            }
        }
        getFullRedirectURL() {
            // Check redirect is configured
            if (!(this.session && this.session.redirectURL)) {
                return null;
            }
            // Calculate status
            let redirectStatus;
            switch (+this.workflow.getState()) {
                case FET.SignWorkflowState.COMPLETED:
                case FET.SignWorkflowState.COMPLETED_EXSYST:
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
        showErrorMessageRedirect() {
            let self = this;
            // Initialize
            this.$scope.redirectTimeoutSec = 600;
            //
            function nextTick() {
                if (self.workflow.getState() == FET.SignWorkflowState.CONFIGURE_ASOL || self.workflow.getState() == FET.SignWorkflowState.COMPLETED) {
                    return;
                }
                // Decrease redirect timeout
                self.$scope.redirectTimeoutSec--;
                if (self.$scope.redirectTimeoutSec <= 60) {
                    if (!self.$scope.panels.signMethods.errorMessage) {
                        self.$scope.panels.signMethods.errorMessage = "L'operazione sta impiegando troppo tempo. Tra " + self.$scope.redirectTimeoutSec + " secondi la pagina si ricaricherà";
                    }
                    if (self.$scope.redirectTimeoutSec <= 0) {
                        window.location.reload();
                    }
                    else {
                        self.$timeout(nextTick, 1000);
                    }
                }
                else {
                    self.$timeout(nextTick, 1000);
                }
            }
            //
            nextTick();
        }
        startAutomaticRedirectExsyst() {
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
        startAutomaticRedirect() {
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
        onSignError(errorMessage) {
            let self = this;
            this.$timeout(function () {
                switch (self.session.signMethod) {
                    case FET.SignMethod.ARSS:
                        self.workflow.setState(FET.SignWorkflowState.CONFIGURE_ARSS);
                        self.$scope.panels.arssCredentials.errorMessage = "Error: " + errorMessage;
                        break;
                    case FET.SignMethod.ASOL:
                        self.workflow.setState(FET.SignWorkflowState.CONFIGURE_ASOL);
                        self.$scope.panels.asolCredentials.errorMessage = "Error: " + errorMessage;
                        break;
                }
            }, 1);
        }
    }
    FET.AbstractSignCtrl = AbstractSignCtrl;
})(FET || (FET = {}));
/// <reference path="../libs/angular/index.d.ts"/>
/// <reference path="../libs/aifa/PropertiesService.d.ts"/>
/// <reference path="AbstractSignCtrl.ts"/>
var FET;
(function (FET) {
    class StandAloneSignCtrl extends FET.AbstractSignCtrl {
        constructor($scope, $http, $timeout, PropertiesService) {
            // Super initialization
            super(null, $scope, $http, $timeout, PropertiesService);
        }
    }
    FET.StandAloneSignCtrl = StandAloneSignCtrl;
})(FET || (FET = {}));
/// <reference path="../libs/angular/index.d.ts"/>
/// <reference path="../libs/aifa/PropertiesService.d.ts"/>
/// <reference path="AbstractSignCtrl.ts"/>
var FET;
(function (FET) {
    class SessionSignCtrl extends FET.AbstractSignCtrl {
        constructor($scope, $stateParams, $http, $timeout, PropertiesService) {
            // Super initialization
            super({
                sessionUID: SessionSignCtrl.readSessionId($stateParams)
            }, $scope, $http, $timeout, PropertiesService);
        }
        static readSessionId($stateParams) {
            let sessionUID = $stateParams["sessionId"];
            if (!sessionUID) {
                throw "No session id";
            }
            return sessionUID;
        }
    }
    FET.SessionSignCtrl = SessionSignCtrl;
})(FET || (FET = {}));
