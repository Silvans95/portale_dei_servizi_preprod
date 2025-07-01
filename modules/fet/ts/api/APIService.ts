/// <reference path="../libs/angular/index.d.ts"/>
/// <reference path="bean/APICallback.d.ts"/>
/// <reference path="bean/ServerConfigurationAPIBean.d.ts"/>
/// <reference path="bean/SessionInfoAPIBean.d.ts"/>
/// <reference path="bean/VolFileAPIBean.d.ts"/>


namespace FET {

    export class APIService {

        /**
         * Executes an API request.
         * @param url API absolute URL.
         * @param $http HTTP service.
         * @param method Method (GET, POST, etc.)
         * @param callback Callback. May be undefined.
         */
        private static execute<T>(
            $http: angular.IHttpService,
            url: string,
            method: string,
            contentType: string,
            data: any,
            params: any,
            transformRequest: ( x: any ) => any,
            callback: APICallback<T> ): void {
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
            if ( transformRequest ) {
                config["transformRequest"] = transformRequest;
            }
            // Execute
            $http( config )
                .then(
                    function( response: angular.IHttpResponse<any> ) {
                        var json = response.data;
                        if ( json && json.success ) {
                            try {
                                if ( callback && callback.success ) {
                                    APIService.raiseSuccess( callback, <T>json.data );
                                }
                            } catch ( e ) {
                                console.error( e );
                            }
                        } else {
                            APIService.raiseError( callback, json.message );
                        }
                    },
                    function( e ) {
                        APIService.raiseError( callback, e.status + " " + e.statusText );
                    } );
        }

        /**
         * Raises success callback.
         * @param callback Callback. May be undefined.
         * @param data API returned data.
         */
        private static raiseSuccess<T>( callback: APICallback<T>, data: T ): void {
            try {
                if ( callback && callback.success ) {
                    callback.success( data );
                }
            } catch ( e ) {
                console.error( e );
            }
        }

        /**
         * Raises error callback.
         * @param callback Callback. May be undefined.
         * @param message Error message.
         */
        private static raiseError( callback: APICallback<any>, message: string ): void {
            try {
                if ( callback && callback.error ) {
                    callback.error( message );
                }
            } catch ( e ) {
                console.error( e );
            }
        }

        public static getServerConfiguration(
            baseUrl: string,
            $http: angular.IHttpService,
            callback: APICallback<ServerConfigurationAPIBean> ): void {
            //
            APIService.execute(
                $http,
                baseUrl + "/api/config",
                "GET",
                undefined,
                null,
                undefined,
                angular.identity,
                callback );
        }

        public static createSession(
            baseUrl: string,
            $http: angular.IHttpService,
            callback: APICallback<string> ): void {
            //
            APIService.execute(
                $http,
                baseUrl + "/api/session/create",
                "POST",
                undefined,
                null,
                undefined,
                angular.identity,
                callback );
        }

        public static getSessionInfo(
            baseUrl: string,
            sessionUID: string,
            $http: angular.IHttpService,
            callback: APICallback<SessionInfoAPIBean> ): void {
            //
            APIService.execute(
                $http,
                baseUrl + "/api/session/" + encodeURI( sessionUID ),
                "GET",
                undefined,
                null,
                undefined,
                angular.identity,
                callback );
        }

        public static addSessionFile(
            baseUrl: string,
            sessionUID: string,
            file: File,
            $http: angular.IHttpService,
            callback: APICallback<string> ): void {
            // Initialize
            var fileName = file.name;
            // Build form data
            var formData = new FormData();
            formData.append( "document", file );
            // Execute
            APIService.execute(
                $http,
                baseUrl + "/api/session/" + encodeURI( sessionUID ) + "/documents/add",
                "POST",
                undefined,
                formData,
                undefined,
                angular.identity,
                callback );
        }

        public static addSignedDocument(
            baseUrl: string,
            sessionUID: string,
            documentUID: string,
            file: File,
            $http: angular.IHttpService,
            callback: APICallback<FileAPIBean> ): void {
            // Initialize
            var fileName = file.name;
            // Build form data
            var formData = new FormData();
            formData.append("documentUID", documentUID);
            formData.append( "document", file );
            // Execute
            APIService.execute(
                $http,
                baseUrl + "/api/session/" + encodeURI( sessionUID ) + "/documents/addSignedDocument",
                "POST",
                undefined,
                formData,
                undefined,
                angular.identity,
                callback );
        }

        public static volValidation(
            baseUrl: string,
            sessionUID: string,
            $http: angular.IHttpService,
            callback: APICallback<VolFileAPIBean[]>): void {
            // Execute
            APIService.execute(
                $http,
                baseUrl + "/api/session/" + encodeURI( sessionUID ) + "/documents/volValidation",
                "POST",
                undefined,
                undefined,
                undefined,
                angular.identity,
                callback );
        }


        public static deleteSignedDocument(
            baseUrl: string,
            sessionUID: string,
            documentToSignUID: string,
            documentSignedUID: string,
            $http: angular.IHttpService,
            callback: APICallback<void>): void {
            // Build form data
            var obj={
                "documentToSignUID": documentToSignUID,
                "documentSignedUID": documentSignedUID
            }

            // Execute
            APIService.execute(
                $http,
                baseUrl + "/api/session/" + encodeURI( sessionUID ) + "/deleteSignedDocument",
                "DELETE",
                "application/json",
                undefined,
                obj,
                undefined,
                callback );
        }

        public static signByARSS(
            baseUrl: string,
            sessionUID: string,
            username: string,
            password: string,
            otp: string,
            signType: SignType,
            $http: angular.IHttpService,
            callback: APICallback<FileAPIBean[]> ): void {
            // Get sign type as expected by the API
            let signTypeStr;
            switch ( +signType ) {
                case SignType.CADES:
                    signTypeStr = "CADES";
                    break;
                case SignType.PADES:
                    signTypeStr = "PADES";
                    break;
                default:
                    APIService.raiseError( callback, "Invalid signature type" );
                    return;
            }
            //
            APIService.execute(
                $http,
                baseUrl + "/api/session/" + encodeURI( sessionUID ) + "/signByARSS",
                "POST",
                "application/json",
                {
                    "username": username,
                    "password": password,
                    "otp": otp,
                    "signType": signTypeStr,
                },
                undefined,
                undefined,
                callback );
        }

    }

}