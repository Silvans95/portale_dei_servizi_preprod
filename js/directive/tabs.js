(function() {
  'use strict';

angular.module('portalApp').
  directive('ngTabs', function() {
    return {
      restrict: 'A',
      transclude: true,
      scope: {ngModel:'='},
      controller: [ "$scope", function($scope) {
        var panes = $scope.panes = [];

        $scope.select = function(pane) {
          angular.forEach(panes, function(paneItem) {
            paneItem.selected = false;
          });
          pane.selected = true;
          $scope.ngModel=pane.id;
        }

        this.addPane = function(pane) {
          if (panes.length == 0) $scope.select(pane);
          panes.push(pane);
        }
      }],
      template:
        '<div class="tabbable">' +
          '<ul class="nav nav-tabs">' +
            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
              '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
            '</li>' +
          '</ul>' +
          '<div class="tab-content" ng-transclude></div>' +
        '</div>',
      replace: true
    };
  }).
  directive('ngPane', function() {
    return {
      require: '^ngTabs',
      restrict: 'A',
      transclude: true,
      scope: { title: '@', id:'@' },
      link: function(scope, element, attrs, tabsCtrl) {
        tabsCtrl.addPane(scope);
      },
      template:
        '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
        '</div>',
      replace: true
    };
  })

})();
