/// <reference path="../enums/SignWorkflowState.ts"/>
/// <reference path="../enums/SignMethod.ts"/>
/// <reference path="../enums/SignChannel.ts"/>
/// <reference path="../enums/SignTypology.ts"/>
/// <reference path="../enums/SignType.ts"/>
/// <reference path="../bean/SignFile.d.ts"/>
/// <reference path="../bean/SignedFile.d.ts"/>
/// <reference path="../panel/Panel.ts"/>

namespace FET {

    export interface SignCtrl {

        uploadAndAddFile( file: File ): void;
        addFile( fileUID: string, fileName: string ): void;
        moreFilesRequired( required : boolean ) : void;

        setSignMethod( method: SignMethod, type: SignType ): void;
        setSignChannel( channel: SignChannel): void;
        setSignTypology( typology: SignTypology): void;

        setARSSCredentials( username: string, password: string, otp: string ): void;
        setASOLCredentials( pin: string, certificateId: number ): void;
        sign(): void;

    }

}
