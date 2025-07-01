/**
 * @ngdoc function
 * @name sphaSummaryDataCtrl
 * @description controller for search summary data
 * # sphaSummaryDataCtrl Controller of the sphaApp
 */
(function () {
    'use strict';
    angular.module('sphaApp')
        .controller('sphaSummaryDataCtrl', sphaSummaryDataCtrl);
        
    sphaSummaryDataCtrl.$inject = ['$timeout', '$controller', '$scope', '$extend', '$q', '$translate', 'sphaPaybackServices'];

    function sphaSummaryDataCtrl ($timeout, $controller, $scope, $extend, $q, $translate, sphaPaybackServices) {
        
        var vm = $extend ? $extend : this;
        
        vm.queryTypeLabel = 'SUMMARY_DATA_LABEL';

        vm.tables = null;

        vm.findData = function (filters, table) {
            var deferred = $q.defer();
                getDatiRiepilogativiPayback(filters, table).then(function (datiRiepilogativiPayback) {
                    deferred.resolve(setDatiRiepilogativi(datiRiepilogativiPayback));
                });
            return deferred.promise;
        };

        function getDatiRiepilogativiPayback(filters, table) {
            var defferd = $q.defer();
            sphaPaybackServices.getQueryTypeData(
                filters,
                vm.queryType,
                vm.procedureDTO,
                table,
                function (data, error) {
                    if (error && error.message) {
                        vm.message = error.message;
                        vm.alertClass = error.alertClass;
                        defferd.resolve();
                    } else {
                        defferd.resolve(data);
                    }
                });
            return defferd.promise;
        }

        
        function setDatiRiepilogativi(datiRiepilogativiPayback) {
            if(vm.procedureDTO.type === 'PB183') {
                return setDatiRiepilogativiPayback183(datiRiepilogativiPayback);
            }
            if(vm.procedureDTO.type === 'PB5') {
                return setDatiRiepilogativiPayback5(datiRiepilogativiPayback);
            }
        }


        /**
         * 
         * @param datiRiepilogativiPayback
         */
        function setDatiRiepilogativiPayback183(datiRiepilogativiPayback) {
            vm.tables.spesa.items = [{
                spesaLorda: datiRiepilogativiPayback && formatFloat(datiRiepilogativiPayback.spesaLorda),
                importoDovuto: datiRiepilogativiPayback && formatFloat(datiRiepilogativiPayback.importoDovuto),
                numAziendePaganti: datiRiepilogativiPayback && datiRiepilogativiPayback.numAziendePaganti,
                importoVersato: datiRiepilogativiPayback && formatFloat(datiRiepilogativiPayback.importoVersato)
            }];
            vm.tables.summary.items = [{
                numAic: datiRiepilogativiPayback && datiRiepilogativiPayback.numAic,
                numSpecialita: datiRiepilogativiPayback && datiRiepilogativiPayback.numSpecialita,
                numAziende: datiRiepilogativiPayback && datiRiepilogativiPayback.numAziende
            }];
        }

        /**
         *
         * @param datiRiepilogativiPayback
         */
        function setDatiRiepilogativiPayback5(datiRiepilogativiPayback) {
            vm.tables.summary.items = [{
                numAic: datiRiepilogativiPayback && datiRiepilogativiPayback.numAic,
                numSpecialita: datiRiepilogativiPayback && datiRiepilogativiPayback.numSpecialita,
                numAziende: datiRiepilogativiPayback && datiRiepilogativiPayback.numAziende
            }];
            var object = {
                convClasseA: datiRiepilogativiPayback && formatFloat(datiRiepilogativiPayback.convClasseA),
                nonConvClasseA: datiRiepilogativiPayback && formatFloat(datiRiepilogativiPayback.nonConvClasseA),
                nonConvClasseH: datiRiepilogativiPayback && formatFloat(datiRiepilogativiPayback.nonConvClasseH),
                totale: datiRiepilogativiPayback && formatFloat(datiRiepilogativiPayback.totale),
                numAziendePaganti: datiRiepilogativiPayback && datiRiepilogativiPayback.numAziendePaganti,
                importoVersato: datiRiepilogativiPayback && formatFloat(datiRiepilogativiPayback.importoVersato),
            };
            if(datiRiepilogativiPayback) {
                for(let i = 1; i <= vm.procedureDTO.feeNumber; i++) {
                    object['numAziendePagantiRata' + i] = datiRiepilogativiPayback['numAziendePagantiRata' + i];
                    object['importoVersatoRata' + i] = datiRiepilogativiPayback['importoVersatoRata' + i];
                }
            }
            return {
                total: 1,
                data: [object]
            };
        }

        function formatFloat(value) {
            if (value) {

                const options = {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                };

                if (!isNaN(value)) {
                    //parseFloat(payment.totaleImportAccettazione.replaceAll('.','').replaceAll(',','.')).toFixed(2)
                    const formatted = Number(value).toLocaleString('it-IT', options);
                    return formatted;
                }
            }

            return value;
        }
        
        // instantiate parent controller
        var parent = $controller('sphaSecondPhaseProcedureController', {$scope: $scope, $extend:this});
        
        angular.extend(vm, parent);
        
        // initializing parent controller
        vm.initController(sphaPaybackServices).then();
    }
})();
