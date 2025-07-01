declare namespace ASOL {

    export class WebKitOnLineClass {

        constructor( clientCode: string );

        init_card_service_no_popup( callback: () => void );

        certsListP11( callback: ( data: any ) => void );

        createSignatureV2(
            tipoFirma: number,
            pin: string,
            cert: Certificate,
            targets: any[],
            callback: ( data: any ) => void );

        closeClient(): any;

    }

    export interface Certificate {

        id: number;

        common_name: string;

    }

}

declare class WebKitOnLine extends ASOL.WebKitOnLineClass {
}

declare var currentSession: string;
declare var dialogDiv: any;
