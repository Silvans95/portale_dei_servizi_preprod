(function () {
  'use strict';

  angular.module('portalApp')
    .directive('userInfo', function () {
      return {
        restrict: 'C',
        link:     function (scope, element) {
          $(element).click(function () {
            $(element).children('.fa').toggleClass('fa-angle-down fa-angle-up');
          });
        }
      }
    });
})();
