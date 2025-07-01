(function() {

	'use strict';

	angular
		.module('portalApp')
		.factory('PropertiesService', PropertiesService)
		.$inject = [];

		function PropertiesService(){
            var properties = JSON.parse(loadTextFileAjaxSync("properties.json", "application/json"));

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

			return {
                get : function (key){
                    return properties[key];
                },

                getComposed : function (key){
                  const myArray = key.split(".");
                  let props = { ...properties }
                  for (let item in myArray) {
                    props = props[myArray[item]];
                  }
                  return props;
                }
            };
	    };

})();
