(function () {
  'use strict';

  angular.module('portalApp')
    .directive('ngExportExcel', function () {
      return {
        restrict: 'A',
        template: '<i class="fa fa-download" aria-hidden="true"></i>&nbsp;&nbsp;<span translate>EXCEL</span>',
        link:     function (scope, element, attr) {
        	
        	$(element).addClass('btn purple text-uppercase');
          $(element).click(function () {
        	  var uri = 'data:application/vnd.ms-excel;base64,';
              var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><?xml version="1.0" encoding="UTF-8" standalone="yes"?><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
              var base64 = function(s) {
                return window.btoa(unescape(encodeURIComponent(s)))
              }
              var format = function(s, c) {
                return s.replace(/{(\w+)}/g, function(m, p) {
                  return c[p];
                })
              }

              var table = $('#' + attr.ngExportExcel).clone(true);
              $(table).find('.ignorePdf, .dropdown').remove();

              var ctx = {
                worksheet: "",
                table: $(table).html()
              };

              window.location.href = uri + base64(format(template, ctx))
          });
        }
      }
    });
})();
