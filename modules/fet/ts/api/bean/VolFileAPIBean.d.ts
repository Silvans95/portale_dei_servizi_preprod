/// <reference path="FileAPIBean.d.ts"/>

declare namespace FET {

    export interface VolFileAPIBean {

        uid: string;
        name: string;
        esitoVol: boolean;
        errorMessageVol: string;
        signedDocument: FileAPIBean;
    }

}
