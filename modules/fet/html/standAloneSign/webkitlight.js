/*
 * Copyright (c) 2016  Aruba S.p.A.
 */

var websocket = null;
var current_web_kit = null;
var currentSession = "7078433079EEE434D549F8F185FF045F";
var dialogDiv = null;
var reconnect=true;
var enableLog="true";

logInfo("currentSession " + currentSession);

function logInfo(stringToLog){
    if(enableLog==="true"){
        console.log(stringToLog);
    }
}
function initWebSocket(web_kit)
{
    current_web_kit = web_kit;
    websocket = new WebSocket("ws://100.64.153.39:8080/asonline-wsserver/asonline/" + "_" + currentSession);
    websocket.onopen = function (evt) {
        onOpen(evt);
    };
    websocket.onclose = function (evt) {
        onClose(evt);
    };
    websocket.onmessage = function (evt) {
        onMessage(evt);
    };
    websocket.onerror = function (evt) {
        onError(evt);
    };
}

function onOpen(evt)
{
    logInfo("CONNECTED");
    sessionStorage.isConnectionOpened = true;
}

function onClose(evt)
{
    logInfo("DISCONNECTED");
    sessionStorage.isConnectionOpened = false;
    //closeP2PConnection();
    if(reconnect)initWebSocket(current_web_kit);
}

function onError(evt)
{
    logInfo("ERROR");
}

function p2pOpenConnectionCallBack(data) {
    logInfo("p2pOpenConnectionCallBack RESPONSE: " + JSON.stringify(data));
}

function p2pCommunicationErrorCallback(data){
    logInfo("p2pCommunicationErrorCallback RESPONSE: " + JSON.stringify(data));
}

function p2pCommunicationRejectedCallback(data){
    logInfo("p2pCommunicationRejectedCallback RESPONSE: " + JSON.stringify(data));
}

function onMessage(evt)
{
    var data = $.parseJSON(evt.data);
    var data_string = $.parseJSON(JSON.stringify(evt.data));
    logInfo("RESPONSE: " + JSON.stringify(evt.data));

    if (data.header.type === "p2pOpenConnection") {
        sessionStorage.isP2PConnectionOpened = true;
        ping();
        current_web_kit.isCardServiceActive = true;
        dialogDiv.dialog('close');
        if (typeof p2pOpenConnectionCallBack !== 'undefined') {
            p2pOpenConnectionCallBack(data);
        }
    }

    if (data.header.type === "p2pCloseConnection" || data.header.type === "errorSend" ) {
        sessionStorage.isP2PConnectionOpened = false;
        if (typeof p2pCommunicationErrorCallback == 'function' ) {
            p2pCommunicationErrorCallback(data);
        }
    }
    
    if (data.header.type === "errorReject") {
        sessionStorage.isP2PConnectionOpened = false;
        reconnect=false;
        if (typeof p2pCommunicationRejectedCallback == 'function' ) {
            p2pCommunicationRejectedCallback(data);
        }
    }

    if (data.header.type === "pong") {
        pingJnlpCallBack(data);
    }

    if (data.header.type === "ResponseListLectors") {
        lectorsListCallBack(data);
    }

    if (data.header.type === "ResponseListCards") {
        listCardsCallBack(data);
    }

    if (data.header.type === "ResponseListCerts") {
        certsListCallBack(data);
    }

    if (data.header.type === "ResponseValidateCert") {
        validateCertCallBack(data);
    }
        
    if (data.header.type === "ResponseValidateCertEmittingIssuer") {
        validateCertEmittingIssuerCallBack(data);
    }

    if (data.header.type === "ResponseSendCredential") {
        sendCredentialCallBack(data);
    }

    if (data.header.type === "ResponseCreateSignatureV2") {
        createSignatureCallBackV2(data);
    }

    if (data.header.type === "ResponseCreateSignature") {
        createSignatureCallBack(data);
    }

    if (data.header.type === "ResponseAddSignature") {
        addSignatureCallBack(data);
    }

    if (data.header.type === "ResponseCounterSignature") {
        counterSignatureCallBack(data);
    }

    if (data.header.type === "ResponseVerifySignature") {
        verifySignatureCallBack(data);
    }

    if (data.header.type === "ResponseDoMark") {
        doMarkCallBack(data);
    }

    if (data.header.type === "ResponseDoStamp") {
        doStampCallBack(data);
    }

    if (data.header.type === "ResponsePrintVerifyReport") {
        printVerifyReportCallBack(data);
    }

    if (data.header.type === "ResponseBuildTreeSignature") {
        buildTreeSignatureCallBack(data);
    }
    
    // FIRMA GRAFOMETRICA
    if (data.header.type === "ResponseGetConnectedTabletModel") {
        getConnectedTabletModelCallBack(data);
    }

    if (data.header.type === "ResponseTabletConnected") {
        tabletConnectedCallBack(data);
    }

    if (data.header.type === "ResponseStartPrivacy") {
        startPrivacyCallBack(data);
    }

    if (data.header.type === "ResponseStartSign") {
        responseSignDataCallBack(data);
    }

    if (data.header.type === "ResponseSignData") {
        responseSignDataCallBack(data);
    }

    if (data.header.type === "ResponseDoGraphometricSign") {
        responseDoGraphometricSignCallBack(data);
    }

    if (data.header.type === "ResponseCheckPDFA") {
        responseCheckPDFACallBack(data);
    }
    
    if (data.header.type === "ResponseConvertToPDFA") {
        responseConvertToPDFACallBack(data);
    }
    
    if (data.header.type === "ResponseGetGraphometricSignBox") {
        responseGetGraphometricSignBoxCallBack(data);
    }
    
    if (data.header.type === "ResponseCheckPinNotaio") {
        responseCheckPinNotaioCallBack(data);
    }
    
    if (data.header.type === "ResponseFingerPrintJNLP") {
        responseFingerPrintJNLPCallBack(data);
    }
    
    if (data.header.type === "ResponseGetVoucher") {
        responseGetVoucherCallBack(data);
    }
    
    if (data.header.type === "ResponseCreateSignatureBase64") {
        responseCreateSignatureBase64CallBack(data);
    }    

    if (data.header.type === "ResponseVerifyPIN") {
        responseVerifyPINCallBack(data);
    }

    // CONSERVAZIONE
    if (data.header.type === "ResponseSendInConservation") {
        responseSendInConservationCallBack(data);
    }   
    
    // NOTARIATO
    if (data.header.type === "ResponseCreateSignatureNotariato") {
        createSignatureV2NotariatoCallBack(data);
    }
    
    if (data.header.type === "ResponseLocalClientSign") {
        responseLocalSignClientCallBack(data);
    }
    
    if (data.header.type === "ResponseLocalClientTimeStamp") {
        responseLocalTimestampClientCallBack(data);
    }
    
    if (data.header.type === "ResponseLocalClientVerify") {
        responseLocalVerifyClientCallBack(data);
    }

    if (data.header.type === "ResponseSetSignatureCredential") {
        responseSetSignatureCredentialCallBack(data);
    }
    
    // INFOCAMERE
    if (data.header.type === "ResponseInfoCamereVerifyService") {
        responseInfoCamereVerifyServiceCallBack(data);
    }    
}

function onError(evt)
{
    var data = $.parseJSON(JSON.stringify(evt.data));
    logInfo("ERROR: " + data);
}

function ping() {
    if (websocket !== null) {
        var msg = {header: {
                type: "ping",
                from: "_" + currentSession,
                to: currentSession},
            text: "ping"

        };
        logInfo("SENT: " + JSON.stringify(msg));
        websocket.send(JSON.stringify(msg));
    } else
        logInfo("Failed to send command ping: connection is closed.");
}

function closeP2PConnection() {
    if (websocket !== null && websocket.readyState === websocket.OPEN) {
        var msg = {header: {
                type: "p2pCloseConnection",
                from: "_" + currentSession,
                to: currentSession},
            text: "p2pCloseConnection"
        };
        logInfo("SENT: " + JSON.stringify(msg));
        websocket.send(JSON.stringify(msg));

        //sessionStorage.clear();
    } else
        logInfo("Failed to send command p2pCloseConnection: connection is closed.");
}

function pingJnlpCallBack(data) {
    logInfo("pingJnlpCallBack RESPONSE: " + JSON.stringify(data));
}

function lectorsListCallBack(data) {
    logInfo("LectorsListCallBack RESPONSE: " + JSON.stringify(data));
}

function listCardsCallBack(data) {
    logInfo("ListCardsCallBack RESPONSE: " + JSON.stringify(data));
}

function certsListCallBack(data) {
    logInfo("CertsListCallBack RESPONSE: " + JSON.stringify(data));
}

function validateCertCallBack(data) {
    logInfo("ValidateCertCallBack RESPONSE: " + JSON.stringify(data));
}

function validateCertEmittingIssuerCallBack(data) {
    logInfo("ValidateCertEmittingIssuerCallBack RESPONSE: " + JSON.stringify(data));
}

function sendCredentialCallBack(data) {
    logInfo("SendCredentialCallBack RESPONSE: " + JSON.stringify(data));
}

function createSignatureCallBack(data) {
    logInfo("CreateSignatureCallBack RESPONSE: " + JSON.stringify(data));
}

function createSignatureCallBackV2(data) {
    logInfo("CreateSignatureCallBackV2 RESPONSE: " + JSON.stringify(data));
}

function addSignatureCallBack(data) {
    logInfo("AddSignatureCallBack RESPONSE: " + JSON.stringify(data));
}

function counterSignatureCallBack(data) {
    logInfo("CounterSignatureCallBack RESPONSE: " + JSON.stringify(data));
}

function verifySignatureCallBack(data) {
    logInfo("VerifySignatureCallBack RESPONSE: " + JSON.stringify(data));
}

function doMarkCallBack(data) {
    logInfo("DoMarkCallBack RESPONSE: " + JSON.stringify(data));
}

function doStampCallBack(data) {
    logInfo("DoStampCallBack RESPONSE: " + JSON.stringify(data));
}

function printVerifyReportCallBack(data) {
    logInfo("PrintVerifyReport RESPONSE: " + JSON.stringify(data));
}

function buildTreeSignatureCallBack(data) {
    logInfo("BuildTreeSignatureCallBack RESPONSE: " + JSON.stringify(data));
}

function responseFingerPrintJNLPCallBack(data) {
    logInfo("ResponseFingerPrintJNLPCallBack RESPONSE: " + JSON.stringify(data.fingerPrint));
}

function responseGetVoucherCallBack(data) {
    logInfo("ResponseGetVoucherCallBack RESPONSE: " + JSON.stringify(data.voucher));
}

function responseCreateSignatureBase64CallBack(data) {
    logInfo("responseCreateSignatureBase64CallBack RESPONSE: " + JSON.stringify(data));
}

function responseVerifyPINCallBack(data) {
    logInfo("responseVerifyPINCallBack RESPONSE: " + JSON.stringify(data));
}


//WEBKIT Object
function WebKitOnLine() {
    //this.isCardServiceActive = false;
    if (websocket === null || !sessionStorage.isConnectionOpened) {
        logInfo('sessionStorage.isConnectionOpened ' + sessionStorage.isConnectionOpened);
        initWebSocket(this);
    }
}

// Inizializza la libreria
WebKitOnLine.prototype.init_card_service = function (callback) {
    if (!sessionStorage.isP2PConnectionOpened || sessionStorage.isP2PConnectionOpened === "false") {
        if (typeof callback !== 'undefined') {
            p2pOpenConnectionCallBack = callback;
        }
        var $newdiv1 = $("<div id='web_kit_dialog' title='Connessione Device'></div>");
        $($newdiv1).load("http://100.64.153.39:8080/asonline-wsserver/dialog.jsp");
        dialogDiv = $($newdiv1).dialog({modal: true, width: "80%", top: "0px"});
        $("body").delegate('#makeJnlp', 'click', (function (e) {
            e.preventDefault();
            window.location = "jnlp://localhost:8080/portale-aifa-fet/modules/fet/html/standAloneSign/" + currentSession + ".jnlp";
        }));
        setTimeout(function() {
            window.location = "jnlp://localhost:8080/portale-aifa-fet/modules/fet/html/standAloneSign/" + currentSession + ".jnlp";
        }, 1500);
    }
};

WebKitOnLine.prototype.init_client = function (callback) {
    if (!sessionStorage.isP2PConnectionOpened || sessionStorage.isP2PConnectionOpened === "false") {
        if (typeof callback !== 'undefined') {
            p2pOpenConnectionCallBack = callback;
        }
        var $newdiv1 = $("<div id='web_kit_dialog' title='Connessione Device'></div>");
        $($newdiv1).load("http://100.64.153.39:8080/asonline-wsserver/dialog2.jsp");
        dialogDiv = $($newdiv1).dialog({modal: true, width: "80%", top: "0px"});
        $("body").delegate('#makeJnlp', 'click', (function (e) {
            e.preventDefault();
            window.location = "asol://http://100.64.153.39:8080/asonline-wsserver/makeUrlScheme?currentSession=7078433079EEE434D549F8F185FF045F";
        }));
        setTimeout(function() {
            window.location = "asol://http://100.64.153.39:8080/asonline-wsserver/makeUrlScheme?currentSession=7078433079EEE434D549F8F185FF045F";
        }, 1500);
    }
};

// Registra il lister per gli errori di comunicazione con il jnlp
WebKitOnLine.prototype.onJnlpCommunicationError = function (callback) {
    if (typeof callback !== 'undefined') {
        p2pCommunicationErrorCallback = callback;
    }
};

// Registra il lister per gli errori dovuti al rifiuto della connessione
WebKitOnLine.prototype.onCommunicationRejectedError = function (callback) {
    if (typeof callback !== 'undefined') {
        p2pCommunicationRejectedCallback = callback;
    }
};
 
// Esegue il ping della jnlp
WebKitOnLine.prototype.pingJnlp = function pingJnlp(callback) {
    if (websocket !== null) {
        if (callback !== 'undefined') {
            pingJnlpCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ping",
                from: "_" + currentSession,
                to: currentSession},
            text: "ping"

        };
        logInfo("SENT: " + JSON.stringify(msg));
        websocket.send(JSON.stringify(msg));
    } else
        logInfo("Failed to send command ping: connection is closed.");
};

WebKitOnLine.prototype.pingClient = function pingClient(callback) {
    pingJnlp(callback);
};

// Invia il comando di chiusura alla jnlp
WebKitOnLine.prototype.closeJnlp = function closeJnlp() {
    if (websocket !== null) {
        var msg = {header: {
                type: "p2pCloseConnection",
                from: "_" + currentSession,
                to: currentSession},
            text: "p2pCloseConnection"
        };
        logInfo("SENT: " + JSON.stringify(msg));
        websocket.send(JSON.stringify(msg));

        sessionStorage.isConnectionOpened=false;
		sessionStorage.isP2PConnectionOpened = false;
    } else
        logInfo("Failed to send command p2pCloseConnection: connection is closed.");
};

WebKitOnLine.prototype.closeClient = function closeClient() {
    if (websocket !== null) {
        var msg = {header: {
                type: "p2pCloseConnection",
                from: "_" + currentSession,
                to: currentSession},
            text: "p2pCloseConnection"
        };
        logInfo("SENT: " + JSON.stringify(msg));
        websocket.send(JSON.stringify(msg));

        sessionStorage.isConnectionOpened=false;
		sessionStorage.isP2PConnectionOpened = false;
    } else
        logInfo("Failed to send command p2pCloseConnection: connection is closed.");
};

// Recupera la lista dei lettori smartcard
WebKitOnLine.prototype.lectorsList = function (callback)
{
    if (websocket !== null) {
        if (callback !== 'undefined') {
            lectorsListCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionListLectors",
                from: "_" + currentSession,
                to: currentSession}
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command actionListLectors: connection is closed.");
    }
};

// Recupera la lista delle smartcard inserite
WebKitOnLine.prototype.cardsList = function (callback)
{
    if (websocket !== null) {
        if (callback !== 'undefined') {
            listCardsCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionListCards",
                from: "_" + currentSession,
                to: currentSession}
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command actionListCards: connection is closed.");
    }
};

// Recupera la lista dei certificati presenti sulla smartcard
WebKitOnLine.prototype.certsListP11 = function (callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            certsListCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionListCerts",
                from: "_" + currentSession,
                to: currentSession}
        };
        logInfo("SENT: " + JSON.stringify(msg));


        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command actionListCertsP11 connection is closed.");
    }
};

// Recupera la lista dei certificati remoti
WebKitOnLine.prototype.certsListRemote = function (rem_username, rem_password, rem_domain, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            certsListCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionListRemoteCerts",
                from: "_" + currentSession,
                to: "wsserver"},
            remoteUser: rem_username,
            remotePassword: rem_password,
            remoteDomain: rem_domain
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command actionListCertsRemote: connection is closed.");
    }
};

// Valida un certificato
WebKitOnLine.prototype.validateCert = function (cert, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            validateCertCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionValidateCert",
                from: "_" + currentSession,
                to: "wsserver"},
            cert: cert
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command actionValidateCert: connection is closed.");
    }
};

// Valida un certificato
WebKitOnLine.prototype.validateCertEmmittingIssuer = function (cert, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            validateCertEmittingIssuerCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionValidateCertEmittingIssuer",
                from: "_" + currentSession,
                to: "wsserver"},
            cert: cert
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command actionValidateCertEmittingIssuer: connection is closed.");
    }
};

WebKitOnLine.prototype.sendCredential = function (typeCredential, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            sendCredentialCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionSendCredential",
                from: "_" + currentSession,
                to: "wsserver"},
            typeCredential: typeCredential
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command sendCredential: connection is closed.");
    }
};

// Esegue la firma digitale su di un file
WebKitOnLine.prototype.createSignature = function (tipoFirma, pin, tipoBusta, cert, timestamp, tipoMarcatura, tsa_user, tsa_passw, tsa_policy, page, x1, y1, x2, y2, tipoOpzione, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            createSignatureCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var to;
        if (tipoFirma === 1)
            to = "wsserver";
        else
            to = currentSession;

        var msg = {header: {
                type: "ActionCreateSignature",
                from: "_" + currentSession,
                to: to},
            tipoFirma: tipoFirma,
            tipoBusta: tipoBusta,
            timestamp: timestamp,
            tsaUser: tsa_user,
            tsaPassword: tsa_passw,
            tsaPolicy: tsa_policy,
            tipoMarcatura: tipoMarcatura,
            tipoOperazione: 1, // create
            pin: pin,
            cert: cert,
            tipoOpzione: tipoOpzione,
            page: page,
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command createSignature: connection is closed.");
    }
};

// Esegue la firma digitale su di un file
WebKitOnLine.prototype.createSignatureV2 = function (tipoFirma, pin, cert, targets, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            createSignatureCallBackV2 = callback;
        } else {
            throw "undefined callback";
        }

        var to;
        if (tipoFirma === 1)
            to = "wsserver";
        else
            to = currentSession;

        var msg = {header: {
                type: "ActionCreateSignatureV2",
                from: "_" + currentSession,
                to: to},
            targets: targets,
            pin: pin,
            cert: cert
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command createSignatureV2: connection is closed.");
    }
};

// Esegue la firma digitale su di un file con l'appearence personalizzata
WebKitOnLine.prototype.createSignatureV2CustomAppearence = function (tipoFirma, pin, cert, targets, customLabel, customImagePath, showImage, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            createSignatureCallBackV2 = callback;
        } else {
            throw "undefined callback";
        }

        var to;
        if (tipoFirma === 1)
            to = "wsserver";
        else
            to = currentSession;

        var msg = {header: {
                type: "ActionCreateSignatureV2",
                from: "_" + currentSession,
                to: to},
            targets: targets,
            pin: pin,
            cert: cert,
            customLabel: customLabel,
            customImagePath: customImagePath,
            showImage: showImage
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command createSignatureV2Custom: connection is closed.");
    }
};


// Aggiunge un altra firma al file 
WebKitOnLine.prototype.addSignature = function (tipoFirma, pin, tipoBusta, cert, timestamp, tipoMarcatura, tsa_user, tsa_passw, tsa_policy, page, x1, y1, x2, y2, tipoOpzione, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            addSignatureCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var to;
        if (tipoFirma === 1)
            to = "wsserver";
        else
            to = currentSession;

        var msg = {header: {
                type: "ActionAddSignature",
                from: "_" + currentSession,
                to: to},
            tipoFirma: tipoFirma,
            tipoBusta: tipoBusta,
            timestamp: timestamp,
            tsaUser: tsa_user,
            tsaPassword: tsa_passw,
            tsaPolicy: tsa_policy,
            tipoMarcatura: tipoMarcatura,
            tipoOperazione: 2, // add
            pin: pin,
            cert: cert,
            tipoOpzione: tipoOpzione,
            page: page,
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command addSignature: connection is closed.");
    }
};

// Contro firma
WebKitOnLine.prototype.counterSignature = function (tipoFirma, pin, tipoBusta, cert, timestamp, tipoMarcatura, tsa_user, tsa_passw, tsa_policy, page, x1, y1, x2, y2, tipoOpzione, nodepath, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            counterSignatureCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var to;
        if (tipoFirma === 1)
            to = "wsserver";
        else
            to = currentSession;

        var msg = {header: {
                type: "ActionCounterSignature",
                from: "_" + currentSession,
                to: to},
            tipoFirma: tipoFirma,
            tipoBusta: tipoBusta,
            timestamp: timestamp,
            tsaUser: tsa_user,
            tsaPassword: tsa_passw,
            tsaPolicy: tsa_policy,
            tipoMarcatura: tipoMarcatura,
            tipoOperazione: 3, // counter 
            pin: pin,
            cert: cert,
            tipoOpzione: tipoOpzione,
            page: page,
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2,
            nodepath: nodepath
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command counterSignature: connection is closed.");
    }
};

// Verifica una firma presente su un file
WebKitOnLine.prototype.verifySignature = function (filename, filenameAss, cert, currentdate, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            verifySignatureCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionVerifySignature",
                from: "_" + currentSession,
                to: "wsserver"},
            filename: filename,
            filenameAss: filenameAss,
            currentDate: currentdate,
            certName: cert
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command verifySignature: connection is closed.");
    }
};

// Costruisce l'albero html della verifica di un file
WebKitOnLine.prototype.buildTreeSignature = function (filename, filenameAss, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            buildTreeSignatureCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionBuildTreeSignature",
                from: "_" + currentSession,
                to: "wsserver"},
            filename: filename,
            filenameAss: filenameAss
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command buildTreeSignature: connection is closed.");
    }
};

// Esegue la marca temporale
WebKitOnLine.prototype.doMark = function (tsa_user, tsa_passw, tsa_policy, tipoMarcatura, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            doMarkCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionDoMark",
                from: "_" + currentSession,
                to: "wsserver"},
            tsaUser: tsa_user,
            tsaPassword: tsa_passw,
            tsaPolicy: tsa_policy,
            tipoMarcatura: tipoMarcatura
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command doMark: connection is closed.");
    }
};

// Esegue la marca temporale
WebKitOnLine.prototype.doMarkWithCustomUrl = function (tsa_url, tsa_user, tsa_passw, tsa_policy, tipoMarcatura, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            doMarkCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionDoMarkWithCustomUrl",
                from: "_" + currentSession,
                to: "wsserver"},
            tsa_url: tsa_url,
            tsaUser: tsa_user,
            tsaPassword: tsa_passw,
            tsaPolicy: tsa_policy,
            tipoMarcatura: tipoMarcatura
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command doMarkWithCustomUrl: connection is closed.");
    }
};

// Esegue un timbro su di un file
WebKitOnLine.prototype.doStamp = function (callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            doStampCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionDoStamp",
                from: "_" + currentSession,
                to: "wsserver"}
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command doStamp: connection is closed.");
    }
};

// Esegue il report di un file
WebKitOnLine.prototype.printVerifyReport = function (filename, callback)
{
    if (websocket !== null) {
        if (typeof callback !== 'undefined') {
            printVerifyReportCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionPrintVerifyReport",
                from: "_" + currentSession,
                to: "wsserver"},
            filename: filename
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command printVerifyReport: connection is closed.");
    }
};

// Imposta la sessione 
WebKitOnLine.prototype.setCurrentSession = function (myCurrentSession)
{
    if (websocket !== null) {

        $.ajax({
            url: 'http://100.64.153.39:8080/asonline-wsserver/setCurrentSession',
            type: "POST",
            dataType: 'json',
            async: false,
            data: {
                currentSession: myCurrentSession
            },
            success: function (data) {
            },
            error: function (xhr, status, error) {
            }
        });

        currentSession = myCurrentSession;

        setTimeout(
            function ()
            {
                initWebSocket(current_web_kit);
            }, 2000);
    } else {
        logInfo("Failed to send command setCurrentSession: connection is closed.");
    }
};

// Recupera il fingerprint della macchina su cui e' in esecuzione la jnlp
WebKitOnLine.prototype.fingerPrintJnlp = function (callback)
{
    if (websocket !== null) {
        if (callback !== 'undefined') {
            responseFingerPrintJNLPCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionFingerPrintJNLP",
                from: "_" + currentSession,
                to: currentSession}
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command ActionFingerPrintJNLP: connection is closed.");
    }
};

// crea una firma nel file codificato in stringa base64
WebKitOnLine.prototype.createSignatureBase64 = function (file, fileName, tipoFirma, tipoBusta, tipoMarcatura, tipoOperazione, timestamp, tsaUser, tsaPassword, tsaPolicy, tipoOpzione, pin, cert, x1, x2, y1, y2, page, location, reason, nodepath, callback)
{
    if (websocket !== null) {
        if (callback !== 'undefined') {
            responseCreateSignatureBase64CallBack = callback;
        } else {
            throw "undefined callback";
        }
        var to;
        if (tipoFirma === 1)
            to = "wsserver";
        else
            to = currentSession;        
        var msg = {
            header: {
                type: "ActionCreateSignatureBase64",
                from: "_" + currentSession,
                to: to},
            fileData:file,
            fileName:fileName,
            tipoFirma: tipoFirma,
            tipoBusta: tipoBusta,
            timestamp: timestamp,
            tsaUser: tsaUser,
            tsaPassword: tsaPassword,
            tsaPolicy: tsaPolicy,
            tipoMarcatura: tipoMarcatura,
            tipoOperazione: tipoOperazione,
            pin: pin,
            cert: cert,
            tipoOpzione: tipoOpzione,
            page: page,
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2,
            nodepath: nodepath,
            location:location,
            reason:reason
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command ActionCreateSignatureBase64: connection is closed.");
    }
};

// Verifica il pin di una smartcard 
WebKitOnLine.prototype.verifyPIN = function (pin, callback)
{
    if (websocket !== null) {
        if (callback !== 'undefined') {
            responseVerifyPINCallBack = callback;
        } else {
            throw "undefined callback";
        }

        var msg = {header: {
                type: "ActionVerifyPIN",
                from: "_" + currentSession,
                to: currentSession},
            pin: pin
        };
        logInfo("SENT: " + JSON.stringify(msg));

        websocket.send(JSON.stringify(msg));

    } else {
        logInfo("Failed to send command ActionVerifyPIN: connection is closed.");
    }
};
