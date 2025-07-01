(function() {

  'use strict';

  angular
    .module('notificheApp', ['ui.router'], configNotificheApp)
    .$inject = ['$stateProvider'];

  function configNotificheApp($stateProvider) {

    $stateProvider
      .state('notifiche.list', {
        url: '/',
        ncyBreadcrumb: {
          label: '{{"NOTIFICHE" | translate}}',
          parent: 'dashboard.home'
        },
        views: {
          'content': {
            templateUrl: './modules/notifiche/html/notificheList.html',
            controller: 'notificheListCtrl'
          },
          'menu': {
            templateUrl: './modules/menu/html/menu.html',
            controller: 'menuCtrl'
          }
        },
        resolve: {
          '': function($ocLazyLoad) {
            return $ocLazyLoad.load('modules/notifiche/js/controller/notificheListCtrl.js');
          }
        }
      })
      .state('notifiche.insert', {
        url: '/inserisci',
        ncyBreadcrumb: {
          label: '{{"NUOVA_NOTIFICA" | translate}}',
          parent: 'notifiche.list'
        },
        views: {
          'content': {
            templateUrl: './modules/notifiche/html/notificheInsert.html',
            controller: 'notificheInsertCtrl'
          },
          'menu': {
            templateUrl: './modules/menu/html/menu.html',
            controller: 'menuCtrl'
          }
        },
        resolve: {
          '': function($ocLazyLoad) {
            return $ocLazyLoad.load(['modules/notifiche/js/controller/notificheInsertCtrl.js']);
          }
        }
      })
      .state('notifiche.read', {
        url: '/:idNotifica',
        ncyBreadcrumb: {
          label: '{{"LEGGI" | translate}}',
          parent: 'notifiche.list'
        },
        views: {
          'content': {
            templateUrl: './modules/notifiche/html/notificheRead.html',
            controller: 'notificheReadCtrl'
          },
          'menu': {
            templateUrl: './modules/menu/html/menu.html',
            controller: 'menuCtrl'
          }
        },
        resolve: {
          '': function($ocLazyLoad) {
            return $ocLazyLoad.load('modules/notifiche/js/controller/notificheReadCtrl.js');
          }
        }
      });
  };



})();
