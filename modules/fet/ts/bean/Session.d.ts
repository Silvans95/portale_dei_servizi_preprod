/// <reference path="../bean/SignFile.d.ts"/>
/// <reference path="../enums/SignMethod.ts"/>
/// <reference path="../enums/SignType.ts"/>

declare namespace FET {

    export interface Session {

        uid: string;

        availableSignMethods: SignMethod[];
        availableSignTypes: SignType[];
        availableSignChannels: SignChannel[];
        availableSignTypologies: SignTypology[];

        signMethod: SignMethod;
        signType: SignType;
        signChannel: SignChannel;
        signTypology: SignTypology;

        addFilesAllowed: boolean;
        signedFilesDownloadAllowed: boolean;

        redirectURL: string;

        files: SignFile[];
        signedFiles: SignedFile[];

        isStandalone: boolean;

    }

}
