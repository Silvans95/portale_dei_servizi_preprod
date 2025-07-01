/// <reference path="../libs/angular/index.d.ts"/>
/// <reference path="../libs/aifa/PropertiesService.d.ts"/>
/// <reference path="AbstractSignCtrl.ts"/>

namespace FET {

    export class SessionSignCtrl extends AbstractSignCtrl {

        constructor(
            $scope: angular.IScope,
            $stateParams: { [key: string]: string },
            $http: angular.IHttpService,
            $timeout: angular.ITimeoutService,
            PropertiesService: PropertiesService ) {
            // Super initialization
            super(
                {
                    sessionUID: SessionSignCtrl.readSessionId( $stateParams )
                },
                $scope,
                $http,
                $timeout,
                PropertiesService );
        }

        private static readSessionId( $stateParams: { [key: string]: string } ): string {
            let sessionUID: string = $stateParams["sessionId"];
            if ( !sessionUID ) {
                throw "No session id";
            }
            return sessionUID;
        }

    }

}
