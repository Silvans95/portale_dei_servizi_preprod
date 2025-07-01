/// <reference path="../libs/angular/index.d.ts"/>
/// <reference path="SignCtrl.ts"/>

declare namespace FET {

    export interface SignScope extends angular.IScope {

        FET: any;
        workflow: SignCtrl;

        state: SignWorkflowState;

        availableSignMethods: SignMethod[];
        availableSignTypes: SignType[];
        availableSignChannels: SignChannel[];
        availableSignTypologies: SignTypology[];

        panels: SignPanels;

        file: File;

        files: SignFile[];
        signedFiles: SignedFile[];
        signedFilesZipURL: string;
        filesToSignZipURL: string;

        signMethod: SignMethod;
        signType: SignType;
        signChannel: SignChannel;
        signTypology: SignTypology;

        arssUsername: string;
        arssPassword: string;
        arssOtp: string;

        asolPin: string;
        asolCertificateId: number;

        redirectURL: string;
        redirectTimeoutSec: number;
        redirectRequested: boolean;

        downloadFile: boolean[];
        downloadZip: boolean;
        countFilesUploaded: number;
        isDisableBtnDone : boolean;
        isStandalone : boolean;

        volFiles: VolFileAPIBean[];
        resultVol: boolean;
        nextTick;

        sendFile();
        addFileUploaded(file: File, index: number);
        addAnotherFile();
        filesAddingCompleted();
        setSignChannel();
        setSignMethod();
        sign();
        onClickDownloadFile(index:number);
        deleteSignedDocument(originalFile:SignFile, signedFile:SignFile, index:number);
        onChangeSelectTypology();
        onClickDownloadZip();
        setErrorSignTypology();
        onClickSelectbox();
        onClickBtnDone();
        setRedirectRequested();
    }

    export interface SignPanels {
        initialization: Panel;
        files: Panel;
        signChannels: Panel;
        signExt: Panel;
        signMethods: Panel;
        arssCredentials: Panel;
        asolCredentials: Panel;
        signTypologies: Panel;
        signExtsysResult: Panel;
        completedSignExt: Panel;
        completed: Panel;
    }

}
