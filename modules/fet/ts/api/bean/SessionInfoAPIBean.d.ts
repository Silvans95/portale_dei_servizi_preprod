/// <reference path="FileAPIBean.d.ts"/>
/// <reference path="../enums/SignMethodAPIEnum.ts"/>
/// <reference path="../../enums/SessionStatus.d.ts"/>

declare namespace FET {

    export interface SessionInfoAPIBean {

        addFilesAllowed: boolean;
        documents: FileAPIBean[];
        metadata: { [key: string]: string };
        redirectURL: string;
        signMethods: SignMethodAPIEnum[];
        signTypes: SignType[];
        signedFilesDownloadAllowed: boolean;
        status: SessionStatus;
        uid: string;
        unsignedFilesDownloadAllowed: boolean;

    }

}
