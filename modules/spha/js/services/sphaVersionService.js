(function() {

	'use strict';

	angular
		.module('sphaApp')
    .factory( 'sphaVersionService', [ 'httpServices', '$q' ,
    function ( httpServices, $q ){

            var properties = JSON.parse(loadTextFileAjaxSync("modules/spha/versions.json", "application/json"));
            var propertiesUrl = JSON.parse(loadTextFileAjaxSync("modules/spha/propertiesSpha.json", "application/json"));
            var abilitationMicroserviceVersionUrl = propertiesUrl['baseUrlProfile'] + "api/debug/spha-profile-version";
            var procedureMicroserviceVersionUrl = propertiesUrl['baseUrlProcedure'] + "api/debug/spha-procedure-version";
            var anagraphicMicroserviceVersionUrl = propertiesUrl['baseUrlAnagraphic'] + "api/debug/version";
            
            //version.profiliSpha e version.procedimentiSpha sono gli url dell'endpoint di debug per le versioni. DA MODIFICARE DOPO IL TESTING
            //ATTENTION SPHA: Abilitare CORS nei microservizi da contattare all'interno dei loro file application-dev.yml decommentando le apposite righe

            // Load text with Ajax synchronously: takes path to file and optional MIME type
            function loadTextFileAjaxSync(filePath, mimeType)
            {
              var xmlhttp=new XMLHttpRequest();
              xmlhttp.open("GET",filePath,false);
              if (mimeType != null) {
                if (xmlhttp.overrideMimeType) {
                  xmlhttp.overrideMimeType(mimeType);
                }
              }
              xmlhttp.send();
              if (xmlhttp.status==200)
              {
                return xmlhttp.responseText;
              }
              else {
                return null;
              }
            }

            function getPromiseData(url) {
              var deferred = $q.defer();
              httpServices.get(url, function (data, success, error) {
                if (success) {
                  deferred.resolve(data);
                }
                else {
                  deferred.reject(error);
                }
              });
              return deferred.promise;
            }

            var service = {
                get : function (key){
                    return properties[key];
                },
                getVersion: function( ){
                	return properties['version.spha'];
                },
                getAbilitationMicroserviceVersion: function ( callback ) {
                  return getPromiseData(abilitationMicroserviceVersionUrl);
                },
                getProcedureMicroserviceVersion: function () {
                  return getPromiseData(procedureMicroserviceVersionUrl);
                },
                getAnagraphicMicroserviceVersion: function () {
                  return getPromiseData(anagraphicMicroserviceVersionUrl);
                }
            };
            return service;
    }]);

})();