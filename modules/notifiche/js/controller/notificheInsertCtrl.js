(function() {

  'use strict';

  angular
    .module('notificheApp')
    .controller('notificheInsertCtrl', notificheInsertCtrl)
    .$inject = ['$scope', '$timeout', 'PortalService', 'NotificheResource', 'PropertiesService'];

  function notificheInsertCtrl($scope, $timeout, PortalService, NotificheResource, PropertiesService) {
    PortalService.getNotificheLivello().$promise.then(function(response) {
      $scope.livelloNotifica = response;
      $scope.notifica.notifica.livello = response[0].idTipologica
    });

    PortalService.getNotificheTipoCriterio().$promise.then(function(response) {
      $scope.listaCriteri = response;
    });

    $scope.listeValori = [];

    $scope.notifica = {
      notifica: {},
      listaDistribuzione: [{
        listaCriteri: [{
          idCriterio: '',
          valoreCriterio: ''
        }]
      }],
      listaCanaliDiTrasporto: [1]
    };

    $scope.addCriterio = function(indexLista) {
      var indiceSelect = $scope.notifica.listaDistribuzione[indexLista].listaCriteri.length;
      $scope.notifica.listaDistribuzione[indexLista].listaCriteri.push({
        idCriterio: '',
        valoreCriterio: ''
      });
    };

    $scope.removeCriterio = function(indexLista, index) {
      $scope.notifica.listaDistribuzione[indexLista].listaCriteri.splice(index, 1);
    };

    $scope.addListaDistribuzione = function() {
      $scope.notifica.listaDistribuzione.push({
        listaCriteri: [{
          idCriterio: '',
          valoreCriterio: ''
        }]
      });
    };

    $scope.removeListaDistribuzione = function(indexLista) {
      $scope.notifica.listaDistribuzione.splice(indexLista, 1);
    };

    $scope.inserisciNotifica = function() {

      for(var id in $scope.notifica.listaDistribuzione){

          for(var id2 in $scope.notifica.listaDistribuzione[id].listaCriteri){
              if($scope.notifica.listaDistribuzione[id].listaCriteri[id2].idCriterio=='1'){

                var a = PropertiesService.get('notifica.'+$scope.notifica.listaDistribuzione[id].listaCriteri[id2].valoreCriterio)
                  if(a){
                    $scope.notifica.listaDistribuzione[id].listaCriteri.splice(id2, 1);
                    var array = a.split(',');

                      for(var index in array){

                        var valCrit =array[index].replace(/^\s+|\s+$/g, '');
                        $scope.notifica.listaDistribuzione[id].listaCriteri.push({
                          idCriterio: '1',
                          valoreCriterio: valCrit
                        });
                      }

                  }
              }
          }
      }

      if ($scope.nuovaNotifica.$valid) {
        NotificheResource.inserisciNotifica($scope.notifica).$promise.then(function(response) {
          $scope.success = true;
          $scope.message = {
            header: "Operazione avvenuta con successo",
            body: "Notifica inserita correttamente"
          };
        });
      }
    };
 
    $scope.change = function(val, parentIndex, index) {
        if (!$scope.listeValori[parentIndex])
            $scope.listeValori[parentIndex]=[];
        PortalService.getNotificheRuoloCriterio().$promise.then(function(response) {
          $scope.listeValori[parentIndex][index] = response;
        });
       
    }; 

  };
})();
