(function () {
  'use strict';

  angular.module('portalApp').
    directive('ngHasNotProfile', ['UserProfile', function (UserProfile) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs, ngModelCtrl) {
          $(element).hide();

          UserProfile.then(function (user) {
            if (!user.$hasProfile(attrs.ngHasNotProfile))
              $(element).show();
            else
              $(element).remove();
          })
        }

      };
    }])

})();