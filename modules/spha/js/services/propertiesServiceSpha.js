(function() {
	'use strict';
	angular
        .module('sphaApp')
        .factory( 'PropertiesServiceSpha', PropertiesServiceSpha ).$inject = ['PropertiesService'];

		function PropertiesServiceSpha( PropertiesService ){
            var properties = JSON.parse(loadTextFileAjaxSync("modules/spha/propertiesSpha.json", "application/json"));

            // Load text with Ajax synchronously: takes path to file and optional MIME type
            function loadTextFileAjaxSync(filePath, mimeType) {
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

			return {
                get : function (key){
                    return properties[key];
                },
                getUrl : function ( baseUrl, key ){
                	return properties[baseUrl] + properties[key];
                }
            };
	    };

})();
