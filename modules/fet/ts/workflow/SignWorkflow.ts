/// <reference path="../enums/SignWorkflowState.ts"/>
/// <reference path="../enums/SignMethod.ts"/>
/// <reference path="../enums/SignType.ts"/>
/// <reference path="../bean/SignFile.d.ts"/>
/// <reference path="../bean/SignedFile.d.ts"/>
/// <reference path="../panel/Panel.ts"/>

namespace FET {

    export interface SignWorkflow {

        _state: SignWorkflowState;
        _files : SignFile[]
        _signedFiles : SignedFile[];
        _signMethod: SignMethod;
        _signType: SignType;
        _signedFilesZipURL: string;

        _panelLoadFile: Panel;
        _panelSetSignMethod: Panel;
        _panelSetARSSCredentials: Panel;
        _panelSigned: Panel;

        uploadAndAddFile( file: File ): void;
        addFile( fileUID: string, fileName: string ): void;
        moreFilesRequired( required : boolean ) : void;

        setSignMethod( method: SignMethod, type: SignType ): void;

        setARSSCredentials( username: string, password: string, otp: string ): void;
        setASOLCredentials( pin: string, certificateId: number ): void;
        sign(): void;

    }

}
