/// <reference path="../libs/angular/index.d.ts"/>
/// <reference path="../libs/aifa/PropertiesService.d.ts"/>
/// <reference path="AbstractSignCtrl.ts"/>

namespace FET {

    export class StandAloneSignCtrl extends AbstractSignCtrl {

        constructor(
            $scope: angular.IScope,
            $http: angular.IHttpService,
            $timeout: angular.ITimeoutService,
            PropertiesService: PropertiesService ) {
            // Super initialization
            super( null, $scope, $http, $timeout, PropertiesService );
        }

    }

}
